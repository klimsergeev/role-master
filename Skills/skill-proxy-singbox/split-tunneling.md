# Split tunneling (раздельная маршрутизация)

Выбранные домены идут напрямую, весь остальной трафик — через туннель. Опционально на всех платформах; на Android дополнительно доступна фильтрация по приложениям.

## Главное правило: два места

Правило bypass добавляется в **два места одновременно**. Пропуск одного — самая частая причина «split tunneling не работает».

### 1. В `dns.rules` — чтобы домен резолвился напрямую

Формат 1.11.x (macOS, iOS):
```json
{
  "domain_suffix": ["<BYPASS_DOMAINS>"],
  "server": "dns-direct"
}
```

Формат 1.12+ (Android):
```json
{
  "domain_suffix": ["<BYPASS_DOMAINS>"],
  "action": "route",
  "server": "dns-direct"
}
```

### 2. В `route.rules` — чтобы трафик шёл напрямую

Ставится ПЕРЕД правилом `ip_is_private`:
```json
{
  "domain_suffix": ["<BYPASS_DOMAINS>"],
  "outbound": "direct"
}
```

## Задание доменов

- `domain_suffix` — суффикс, точка в начале включает поддомены: `".ru"` покрывает `sberbank.ru` и `www.sberbank.ru`.
- Несколько доменов — массивом: `[".ru", ".su", "vk.com", "yandex.com"]`.
- Добавляя домен, добавляй его в **оба** списка — `dns.rules` и `route.rules`.

## Отключить split tunneling

Убрать правило с `domain_suffix` из `dns.rules` и из `route.rules`. Остальное без изменений — весь трафик пойдёт через туннель.

## Per-app фильтрация (только Android)

Задаётся в TUN inbound по имени пакета.

Исключить приложение из VPN:
```json
{
  "type": "tun",
  "exclude_package": ["com.android.captiveportallogin"]
}
```

Пустить через VPN только выбранные приложения:
```json
{
  "type": "tun",
  "include_package": ["com.android.chrome", "org.mozilla.firefox"]
}
```

Правила:
- Использовать `package_name`, а не `process_name` / `process_path` — на Android у SFA нет прав на определение процессов.
- `include_android_user` — нет прав в SFA.
- `include_package` и `exclude_package` взаимоисключающие по смыслу: либо белый список, либо чёрный.

На macOS и iOS per-app фильтрации нет. На macOS в route rules работают `process_name` / `process_path`.

## Если не работает

1. Проверить, что `{"action": "sniff"}` — **первое** правило в `route.rules`. Без sniff домены не определяются и `domain_suffix` не срабатывает.
2. Проверить `{"protocol": "dns", "action": "hijack-dns"}` — DNS-запросы должны перехватываться.
3. Проверить, что `domain_suffix` указан и в `dns.rules`, и в `route.rules`.
4. Проверить порядок: правило bypass должно стоять выше `ip_is_private` и не перекрываться более ранним правилом.
5. Проверить формат DNS-правила под версию ядра — на 1.12+ без `"action": "route"` правило игнорируется.

Остальная диагностика — в [troubleshooting.md](troubleshooting.md).
