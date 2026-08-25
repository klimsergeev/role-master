# Python-сниппеты: прямые HTTP-вызовы

## Назначение

Шаблоны на `requests`, из которых собирается скрипт под конкретную выгрузку Wordstat: загрузка учётных данных, клиент, разбор ошибок по ступеням, обёртки четырёх методов, локальная проверка периода, кэш дерева регионов, прогон по списку фраз с соблюдением квоты и расчёт стоимости.

Готовых `.py`-файлов скилл не содержит: каждая выгрузка своя по фразам, регионам, периоду и методу — берите отсюда куски и собирайте скрипт под задачу. Работа через Yandex AI Studio SDK — [sdk.md](sdk.md).

## 0. Проверка зависимостей

```bash
python3 -c "import requests; from dotenv import load_dotenv; print('OK')"
```

Для варианта через SDK (нужен Python 3.10 или выше):

```bash
python3 -c "import yandex_ai_studio_sdk; print('OK')"
```

## 1. Загрузка учётных данных

```python
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

# .env лежит в корне проекта, скрипт — в scripts-wordstat/
ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(ENV_PATH)

API_KEY = os.getenv("YC_API_KEY")
FOLDER_ID = os.getenv("YC_FOLDER_ID")

if not API_KEY:
    sys.exit(
        "[FAIL] YC_API_KEY не задан.\n"
        "Добавьте в .env проекта две строки:\n"
        "  YC_API_KEY=\n"
        "  YC_FOLDER_ID=\n"
        "Где взять ключ и идентификатор каталога — auth-and-setup.md"
    )

HOST = "https://searchapi.api.cloud.yandex.net"
HEADERS = {
    "Authorization": f"Api-Key {API_KEY}",
    "Content-Type": "application/json",
}
```

`FOLDER_ID` может быть пустым — при аутентификации сервисным аккаунтом в его собственном каталоге поле не обязательно ([auth-and-setup.md](auth-and-setup.md)). Если работа идёт под IAM-токеном пользователя, пустой `FOLDER_ID` — ошибка, и проверять его надо так же жёстко, как ключ.

**Файл `.env` не создавать за пользователя молча.** Нет файла — сказать об этом и показать две строки шаблона.

## 2. Клиент

```python
import json
import requests

ENDPOINTS = {
    "top":      "/v2/wordstat/topRequests",
    "dynamics": "/v2/wordstat/dynamics",
    "regions":  "/v2/wordstat/regions",
    "tree":     "/v2/wordstat/getRegionsTree",
}


def call(method_key: str, body: dict, timeout: tuple[int, int] = (10, 60)) -> dict:
    """Один вызов Wordstat. Возвращает разобранный JSON или бросает WordstatError."""
    if FOLDER_ID:
        body = {**body, "folderId": FOLDER_ID}

    r = requests.post(
        f"{HOST}{ENDPOINTS[method_key]}",
        headers=HEADERS,
        data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
        timeout=timeout,
    )

    # Идентификаторы вызова — без них поддержка его не найдёт
    trace = {
        "x-request-id": r.headers.get("x-request-id"),
        "x-server-trace-id": r.headers.get("x-server-trace-id"),
    }

    if r.status_code != 200:
        raise WordstatError(r.status_code, r.headers.get("content-type", ""), r.text, trace)

    return r.json()
```

Правила, которые нельзя терять при переписывании:

- **Тело ответа 401 не печатать в общий лог.** Сообщение `Unknown api key '<маска>'` содержит первые и последние четыре символа ключа ([errors.md](errors.md)).
- `x-request-id` и `x-server-trace-id` логировать всегда — они нужны технической поддержке.
- Таймаут кортежем `(connect, read)`: скалярное значение не ловит вовремя ситуацию «соединение живо, данные не идут».

## 3. Разбор ошибок по ступеням

По HTTP-коду и формату тела сразу видно, какая из четырёх ступеней отвергла запрос ([errors.md](errors.md)).

```python
class WordstatError(RuntimeError):
    def __init__(self, status: int, content_type: str, text: str, trace: dict):
        self.status = status
        self.content_type = content_type
        self.text = text
        self.trace = trace
        self.stage, self.detail = classify(status, content_type, text)
        super().__init__(f"[{status}] {self.stage}: {self.detail}")

    def safe_str(self) -> str:
        """Версия для общего лога: тело 401 скрыто — оно содержит края ключа."""
        if self.status == 401:
            return f"[401] {self.stage}: тело скрыто (содержит фрагмент ключа)"
        return str(self)


def classify(status: int, content_type: str, text: str) -> tuple[str, str]:
    if status == 404:
        return "путь", "неверный путь или HTTP-метод — проверьте URL метода"

    if status == 401:
        return "аутентификация", "ключ или IAM-токен не принят"

    if status == 400:
        if "text/plain" in content_type:
            return "транскодирование", text.strip()
        try:
            message = json.loads(text).get("message", text)
        except json.JSONDecodeError:
            message = text
        if "Validation error:" in message:
            return "валидация полей", message
        return "семантика дат", message

    return "неизвестно", text[:500]
```

**Незнакомый код — остановка, а не догадка.** Что отвечает сервис при исчерпании квоты, не наблюдалось (без ключа квота не расходуется, см. [limits-quotas-pricing.md](limits-quotas-pricing.md)). Не считайте `429` признаком квоты: логируйте код и тело, останавливайтесь и отдавайте их пользователю.

## 4. Обёртки четырёх методов

```python
def get_top(phrase: str, num_phrases: int, regions: list[str] | None = None,
            devices: list[str] | None = None) -> dict:
    """numPhrases передаём ВСЕГДА: умолчания у поля нет, без него будет 400."""
    body: dict = {"phrase": phrase, "numPhrases": num_phrases}
    if regions:
        body["regions"] = [str(r) for r in regions]   # только строки
    if devices:
        body["devices"] = devices                      # DEVICE_ALL | DESKTOP | PHONE | TABLET
    return call("top", body)


def get_dynamics(phrase: str, period: str, from_date: str, to_date: str | None = None,
                 regions: list[str] | None = None, devices: list[str] | None = None) -> dict:
    body: dict = {"phrase": phrase, "period": period, "fromDate": from_date}
    if to_date:
        body["toDate"] = to_date
    if regions:
        body["regions"] = [str(r) for r in regions]
    if devices:
        body["devices"] = devices
    return call("dynamics", body)


def get_regions_distribution(phrase: str, region: str | None = None,
                             devices: list[str] | None = None) -> dict:
    """Поля regions[] у метода НЕТ — фильтровать по конкретным регионам нельзя."""
    body: dict = {"phrase": phrase}
    if region:
        body["region"] = region                        # REGION_ALL | REGION_CITIES | REGION_REGIONS
    if devices:
        body["devices"] = devices
    return call("regions", body)


def get_regions_tree() -> dict:
    return call("tree", {})
```

Имена членов перечислений — строго заглавными, как в [methods.md](methods.md): строчные псевдонимы (`"daily"`) протокол не принимает, их понимает только SDK.

## 5. Локальная проверка периода до отправки

Дешевле проверить локально, чем получить `400`. Все вычисления в UTC — сервис считает границы недели и месяца по UTC.

```python
from calendar import monthrange
from datetime import datetime, timedelta, timezone

UTC = timezone.utc
HISTORY_START = datetime(2018, 1, 1, tzinfo=UTC)


def iso_z(dt: datetime) -> str:
    """RFC3339 с суффиксом Z — смещения вроде +03:00 сервис считает по UTC."""
    return dt.astimezone(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")


def check_period(period: str, from_dt: datetime, to_dt: datetime | None) -> None:
    """Бросает ValueError с тем же смыслом, что и отказ сервиса."""
    from_dt = from_dt.astimezone(UTC)
    to_dt = to_dt.astimezone(UTC) if to_dt else None

    if from_dt < HISTORY_START:
        raise ValueError("fromDate раньше 2018-01-01 — сервис ответит "
                         "'The from field value should be after 2018-01-01'")

    if period == "PERIOD_DAILY":
        # Окно скользящее и отсчитывается от момента вызова, а не от начала суток.
        # Берём запас: не раньше чем «сейчас минус 59 суток».
        if from_dt < datetime.now(UTC) - timedelta(days=59):
            raise ValueError("PERIOD_DAILY смотрит не глубже 60 суток — "
                             "за год берите PERIOD_WEEKLY или PERIOD_MONTHLY")

    elif period == "PERIOD_WEEKLY":
        if from_dt.weekday() != 0:
            raise ValueError("fromDate при PERIOD_WEEKLY должен быть понедельником (по UTC)")
        if to_dt and to_dt.weekday() != 6:
            raise ValueError("toDate при PERIOD_WEEKLY должен быть воскресеньем (по UTC)")

    elif period == "PERIOD_MONTHLY":
        if from_dt.day != 1:
            raise ValueError("fromDate при PERIOD_MONTHLY должен быть первым днём месяца")
        if to_dt and to_dt.day != monthrange(to_dt.year, to_dt.month)[1]:
            raise ValueError("toDate при PERIOD_MONTHLY должен быть последним днём месяца")

    else:
        raise ValueError(f"Неизвестная детализация: {period}")

    if to_dt and to_dt <= from_dt:
        raise ValueError("toDate должен быть строго больше fromDate")
```

## 6. Приведение типов в ответе

```python
def parse_top(payload: dict) -> tuple[int, list[tuple[str, int]], list[tuple[str, int]]]:
    total = int(payload["totalCount"])                       # приходит СТРОКОЙ
    results = [(x["phrase"], int(x["count"])) for x in payload.get("results", [])]
    # associations может не прийти вовсе — читаем через .get, не по индексу
    assoc = [(x["phrase"], int(x["count"])) for x in payload.get("associations", [])]
    return total, results, assoc


def parse_dynamics(payload: dict) -> list[tuple[str, int, float]]:
    return [(x["date"], int(x["count"]), float(x["share"])) for x in payload.get("results", [])]


def parse_regions(payload: dict) -> list[tuple[str, int, float, float]]:
    # affinityIndex — шкала около 100, не доля: 109.33 значит «выше среднего по стране на ~9 %»
    return [
        (x["region"], int(x["count"]), float(x["share"]), float(x["affinityIndex"]))
        for x in payload.get("results", [])
    ]
```

**Длину `results` читать фактическую**, а не подставлять запрошенное `numPhrases`: соответствие не проверялось ([methods.md](methods.md)).

## 7. Кэш дерева регионов

Дерево бесплатное, но это 1103 узла и около 57 КБ — качать один раз и держать локально.

```python
import json
from pathlib import Path

TREE_CACHE = Path(__file__).resolve().parent / "regions_tree.json"


def load_tree() -> dict:
    if TREE_CACHE.exists():
        return json.loads(TREE_CACHE.read_text(encoding="utf-8"))
    tree = get_regions_tree()
    TREE_CACHE.parent.mkdir(parents=True, exist_ok=True)
    TREE_CACHE.write_text(json.dumps(tree, ensure_ascii=False), encoding="utf-8")
    return tree


def build_indexes(tree: dict) -> tuple[dict[str, str], dict[str, list[str]]]:
    """id -> label и label -> [id, ...]. Второй словарь именно списком:
    пять названий в дереве неуникальны («Пушкинский район», «Троицк»,
    «Ленинский район», «Железногорск», «Алжир»)."""
    by_id: dict[str, str] = {}
    by_label: dict[str, list[str]] = {}

    def walk(nodes: list[dict]) -> None:
        for node in nodes:
            by_id[node["id"]] = node["label"]
            by_label.setdefault(node["label"], []).append(node["id"])
            walk(node.get("children", []))

    walk(tree.get("regions", []))
    return by_id, by_label
```

Расшифровка ответа `GetRegionsDistribution` — по `by_id`; поиск по названию всегда возвращает список, а не одно значение ([regions.md](regions.md)).

## 8. Прогон по списку фраз с соблюдением квоты

```python
import time

PRICE_PER_1000 = {"top": 20.0, "dynamics": 20.0, "regions": 50.0, "tree": 0.0}

# Квота — 100 запросов в час, отсюда 3600 / 100 = 36 секунд между вызовами.
# Число выведено из квоты, в документации его нет. Квота увеличивается
# по запросу в поддержку — поэтому интервал параметр, а не константа в цикле.
THROTTLE_SEC = 36.0


def run_batch(phrases: list[str], out_path: Path, method_key: str = "top",
              throttle_sec: float = THROTTLE_SEC, max_retries: int = 5, **kwargs) -> None:
    """Прогон по списку фраз. Пишет результат после каждой фразы
    и продолжает с места остановки, если файл уже частично заполнен."""
    done: set[str] = set()
    if out_path.exists():
        with out_path.open(encoding="utf-8") as f:
            done = {json.loads(line)["phrase"] for line in f if line.strip()}
        print(f"Продолжаю: уже сделано {len(done)} из {len(phrases)}")

    calls = 0
    out_path.parent.mkdir(parents=True, exist_ok=True)

    with out_path.open("a", encoding="utf-8") as out:
        for i, phrase in enumerate(phrases, 1):
            if phrase in done:
                continue

            payload = _call_with_retry(method_key, phrase, max_retries, throttle_sec, **kwargs)
            calls += 1

            out.write(json.dumps({"phrase": phrase, "payload": payload}, ensure_ascii=False) + "\n")
            out.flush()   # промежуточное сохранение: обрыв не должен стоить суток работы

            spent = calls * PRICE_PER_1000[method_key] / 1000
            print(f"[{i}/{len(phrases)}] {phrase} — вызовов {calls}, потрачено {spent:.2f} ₽")

            time.sleep(throttle_sec)


def _call_with_retry(method_key: str, phrase: str, max_retries: int,
                     throttle_sec: float, **kwargs) -> dict:
    for attempt in range(max_retries):
        try:
            if method_key == "top":
                return get_top(phrase, **kwargs)
            if method_key == "dynamics":
                return get_dynamics(phrase, **kwargs)
            if method_key == "regions":
                return get_regions_distribution(phrase, **kwargs)
            raise ValueError(f"Неподходящий метод для прогона по фразам: {method_key}")

        except (requests.exceptions.Timeout, requests.exceptions.ConnectionError) as e:
            wait = throttle_sec * (2 ** attempt)
            print(f"  сетевая ошибка ({e.__class__.__name__}), повтор через {wait:.0f}с")
            time.sleep(wait)

        except WordstatError as e:
            # 400 повтором не исправится — тело неверно. 401 повтором не станет верным.
            if e.status in (400, 401, 404):
                sys.exit(f"[STOP] {e.safe_str()} | trace={e.trace}")
            # 5xx — повторяем. Всё остальное — незнакомый код: не гадаем, останавливаемся.
            if e.status >= 500:
                wait = throttle_sec * (2 ** attempt)
                print(f"  {e.status}, повтор через {wait:.0f}с")
                time.sleep(wait)
                continue
            sys.exit(
                f"[STOP] Незнакомый код {e.status}. Тело и заголовки ниже — "
                f"это может быть исчерпание квоты, но её ответ мы не наблюдали, "
                f"поэтому не гадаем.\n{e.safe_str()}\ntrace={e.trace}"
            )

    raise RuntimeError(f"Не удалось выполнить вызов после {max_retries} попыток: {phrase}")
```

Правила прогона:

| Ситуация | Что делать |
|---|---|
| Сетевой сбой, таймаут, `5xx` | повторять, экспоненциальный backoff от интервала троттлинга |
| `400` любой из трёх ступеней | остановка с внятным сообщением — тело повтором не исправится |
| `401` | остановка — ключ повтором не станет верным |
| Незнакомый код, в том числе `429` | логировать код и тело, останавливаться, отдать пользователю |

**Срок жизни IAM-токена.** Если работа идёт под IAM-токеном, а не под API-ключом, прогон длиннее 12 часов переживёт протухание токена: либо перевыпуск в цикле, либо API-ключ, у которого срока жизни нет ([auth-and-setup.md](auth-and-setup.md)).

## 9. Предварительный расчёт стоимости и времени

Печатается до старта и показывается пользователю; прогон не запускается без подтверждения.

```python
def estimate(n_phrases: int, method_key: str = "top",
             throttle_sec: float = THROTTLE_SEC) -> tuple[float, float]:
    cost = n_phrases * PRICE_PER_1000[method_key] / 1000
    hours = n_phrases * throttle_sec / 3600
    print(f"{n_phrases} фраз через {method_key}: {cost:.2f} ₽, "
          f"{hours:.1f} ч при квоте {3600 / throttle_sec:.0f} запросов в час")
    return cost, hours
```

Узкое место — время, а не деньги: 1 000 фраз стоят 20 ₽, но занимают 10 часов ([limits-quotas-pricing.md](limits-quotas-pricing.md)).

## 10. Именование результатов

```python
from datetime import datetime

OUTPUT_DIR = Path(__file__).resolve().parent / "result"

timestamp = datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
out_path = OUTPUT_DIR / f"{timestamp}-wordstat_top.csv"
```

Шаблон имени: `YYYY-MM-DD-HH-MM-SS-wordstat_<метод>.csv`, директория `scripts-wordstat/result/`. Директорию создавать в момент, когда скрипт впервые пишет результат (`mkdir(parents=True, exist_ok=True)` перед записью), а не заранее «на всякий случай».

**Зависимости:** `pip install requests python-dotenv`.
