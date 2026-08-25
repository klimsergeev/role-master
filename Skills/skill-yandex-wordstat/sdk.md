# Yandex AI Studio SDK

## Назначение

Работа с Wordstat через Python-пакет `yandex-ai-studio-sdk`: установка, точка входа и сигнатуры четырёх методов, что SDK добавляет сверх протокола и что теряет, когда его брать вместо прямых вызовов.

## Установка и требования

```bash
python3 --version        # нужен 3.10 или выше
pip install yandex-ai-studio-sdk
```

Версия на 24.08.2026 — **0.22.1**. Предшественник `yandex-cloud-ml-sdk` (0.19.1) остаётся как слой совместимости, но **поддержки Wordstat в нём нет**.

Аутентификация через переменные окружения: `YC_API_KEY`, `YC_IAM_TOKEN`, `YC_TOKEN`, `YC_OAUTH_TOKEN` (любая одна) и `YC_FOLDER_ID` ([auth-and-setup.md](auth-and-setup.md)).

## Точка входа и методы

```python
sdk.search_api.wordstat()   # -> Wordstat (синхронный) / AsyncWordstat
```

| Сигнатура | Возвращает |
|---|---|
| `get_top(phrase, num_phrases, *, regions=Undefined, devices=Undefined, timeout=60)` | `Top` |
| `get_dynamics(phrase, period, from_date, to_date, *, regions=Undefined, devices=Undefined, timeout=60)` | `Dynamics` |
| `get_regions_distribution(phrase, *, distribution_type=Undefined, devices=Undefined, resolve_regions=False, timeout=60)` | `RegionsDistribution` |
| `get_regions_tree(timeout=60)` | `RegionsTree` |

Таймаут по умолчанию у всех четырёх — 60 секунд.

Вложенные перечисления: `DeviceType` (`ALL`, `DESKTOP`, `PHONE`, `TABLET`), `PeriodType` (`MONTHLY`, `WEEKLY`, `DAILY`), `RegionsDistributionType` (`ALL`, `CITIES`, `REGIONS`).

## Что SDK делает сверх протокола — и что теряет

Это главная причина, по которой файл отдельный: у SDK собственная семантика, которой нет ни в одном транспорте.

- **`folder_id` подставляется автоматически** во все четыре запроса из настроек SDK. Передавать его руками не нужно.
- **`resolve_regions=True` делает дополнительный вызов** `GetRegionsTree`, чтобы подставить названия регионов вместо идентификаторов. Дополнительный вызов виден в записанной кассете: на два вызова `GetRegionsDistribution` там приходится один `GetRegionsTree`. Он бесплатный, но это ещё 57 КБ трафика. Без флага поле `region` в результате пустое.
- **`Top` теряет `total_count`.** Результаты упаковываются в словарь `{phrase: count}` — значит, `total_count` в объект не переносится вовсе, а **дубликаты фраз схлопываются**. Нужна полная картина — идти прямыми HTTP-вызовами ([python-reference.md](python-reference.md)).
- **Мягкая типизация аргументов** (видно по тестам SDK): `regions` принимает смесь строк и объектов `Region`; `devices` — смесь строк и элементов перечисления (`['phone', DeviceType.DESKTOP]`); `period` принимает строку (`'daily'`). Это преобразование делает сам SDK — протокол строчных написаний не принимает ([methods.md](methods.md)).
- **`RegionsTree`** поддерживает `dfs()` и `search_by_label(label, first=False)`. Поиск идёт обходом в глубину и **не делает нормализации** названий; возвращает кортеж, потому что названия не уникальны ([regions.md](regions.md)).
- **`configure()`** для Wordstat документирован как «Returns the new object, but actually do nothing.» — не рассчитывать на него.
- **Логирование данных.** Параметр `AIStudio(..., enable_server_data_logging=...)` по умолчанию не задан, и тогда SDK заголовок `x-data-logging-enabled` не отправляет вовсе — действует серверное умолчание. Явное `False` добавляет заголовок со значением `false` в каждый gRPC-вызов. (Проверено по исходникам `_sdk.py` и `_client.py`, 25.08.2026; про само умолчание — [auth-and-setup.md](auth-and-setup.md).)

## Типы результатов

- `Top` — два `MappingProxyType[str, int]`: `results` и `associations`.
- `Dynamics` — кортеж `DynamicsItem(date: datetime.date, share: float, count: int)`.
- `RegionsDistribution` — кортеж `RegionItem(region, region_id, count, share, affinity_index)`.
- `RegionsTree` — дерево с `dfs()` и `search_by_label()`.

## Когда брать SDK, а когда прямые вызовы

| Задача | Чем делать |
|---|---|
| Разовый запрос, интерактивная работа | SDK — короче |
| Нужен `total_count` или дубликаты фраз в `results` | прямые вызовы — SDK их теряет |
| Прогон на тысячи фраз с троттлингом, ретраями и промежуточным сохранением | прямые вызовы — контроль над циклом |
| Нужны названия регионов | SDK с `resolve_regions=True` либо свой кэш дерева |

## Готового MCP-инструмента для Wordstat не существует

Проверено 25.08.2026:

- В каталоге «Шаблоны MCP-серверов» AI Studio пять шаблонов — Контур.Фокус, amoCRM, Яндекс Трекер, Яндекс Поиск, SourceCraft. Wordstat среди них нет.
- В официальном `yandex/yandex-search-mcp-server` ровно два инструмента, оба по текстовому и генеративному поиску; обращений к Wordstat нет.
- В публичной спецификации `searchapi.mcp.yaml` весь `WordstatService` помечен `disabled: true`.

Работать с Wordstat — прямыми вызовами (REST или gRPC) либо через Python SDK.
