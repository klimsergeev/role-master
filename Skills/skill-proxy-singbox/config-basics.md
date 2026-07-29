# Структура конфига sing-box

Общая анатомия JSON-конфига, одинаковая для всех платформ. Платформенные поправки — в `platform-*.md`, различия версий формата — в [config-format-versions.md](config-format-versions.md).

## Секции конфига

| Секция | Назначение | Обязательные поля |
|---|---|---|
| `log` | Уровень логирования | `level` — `warn` или `info` для обычной работы, `debug` для отладки |
| `dns` | DNS-серверы и правила их выбора | `servers[]` (минимум 1), `rules[]` (если нужен split tunneling) |
| `endpoints` | WireGuard-эндпоинт (sing-box 1.11+) | `type`, `tag`, `address`, `private_key`, `peers[]` |
| `inbounds` | TUN-интерфейс | `type: tun`, `tag`, `address`, `auto_route` |
| `outbounds` | Исходящие подключения: TUIC, `direct` | `type`, `tag` |
| `route` | Правила маршрутизации | `rules[]`, `final`, `auto_detect_interface` |

## Outbounds против endpoints — ключевое различие

| Протокол | Где описывается | На что указывает `route.final` |
|---|---|---|
| TUIC | `outbounds` (`"type": "tuic"`) | tag аутбаунда, например `tuic-out` |
| WireGuard (1.11+) | `endpoints` (`"type": "wireguard"`) | tag эндпоинта, например `wg-ep` |

Путать нельзя: `route.final` к эндпоинту и к аутбаунду работают по-разному.

## TUN inbound

```json
{
  "type": "tun",
  "tag": "tun-in",
  "address": ["172.19.0.1/30"],
  "auto_route": true,
  "stack": "mixed"
}
```

| Поле | Правило |
|---|---|
| `address` | Массив, а не строка — миграция с `inet4_address` произошла в 1.10 |
| `auto_route` | ВСЕГДА `true` |
| `stack` | Платформозависимо — см. [platforms-overview.md](platforms-overview.md) |
| `strict_route` | Платформозависимо, на Android не включать вовсе |
| `route_exclude_address` | Обязателен на macOS, не работает на Android, не нужен на iOS |
| `mtu` | Задаётся для WireGuard (обычно `1420`), совпадает с MTU эндпоинта |
| `sniff` | НЕ добавлять — deprecated с 1.11, заменён на `{"action": "sniff"}` в `route.rules` |

## Порядок правил в route.rules

Правила применяются сверху вниз, первое совпавшее выигрывает. Базовый порядок:

```json
"rules": [
  { "action": "sniff" },
  { "protocol": "dns", "action": "hijack-dns" },
  { "domain_suffix": ["<BYPASS_DOMAINS>"], "outbound": "direct" },
  { "ip_is_private": true, "outbound": "direct" }
]
```

| Правило | Зачем |
|---|---|
| `action: sniff` | Первым. Без него домены не определяются и правила по `domain_suffix` не срабатывают |
| `protocol: dns` → `action: hijack-dns` | Перехват DNS-запросов внутрь sing-box |
| `domain_suffix` → `direct` | Split tunneling, см. [split-tunneling.md](split-tunneling.md). Опционально |
| `ip_is_private: true` → `direct` | ВСЕГДА. Локальная сеть мимо туннеля |

## DNS-секция

Обычно два сервера:

| Tag | Роль | Куда ходит |
|---|---|---|
| `dns-main` | Основной резолвер для проксируемого трафика | Через туннель (`detour` на tag аутбаунда) |
| `dns-direct` | Резолвер для bypass-доменов | Напрямую |

`"strategy": "ipv4_only"` — используется в шаблонах TUIC.

Формат записи сервера и правил различается между 1.11.x и 1.12+ — см. [config-format-versions.md](config-format-versions.md).

## Обязательные правила (для всех платформ)

- ВСЕГДА `auto_route: true` в TUN inbound.
- ВСЕГДА `auto_detect_interface: true` в `route`.
- ВСЕГДА `{"action": "sniff"}` и `{"protocol": "dns", "action": "hijack-dns"}` в `route.rules`.
- ВСЕГДА `{"ip_is_private": true, "outbound": "direct"}` в `route.rules`.
- ВСЕГДА `address` в TUN inbound — массив.
- ВСЕГДА `route.final` указывает на существующий tag: аутбаунда для TUIC, эндпоинта для WireGuard.
- НИКОГДА не использовать `bind_interface` без `system: true` — такого интерфейса не существует.

## Формат выдачи

Результат — JSON-файл конфигурации sing-box, готовый к импорту через Profiles → New Profile → Local (или платформенный аналог).

```
{
  "log": { ... },
  "dns": { "servers": [ dns-main, dns-direct ], "rules": [ bypass → dns-direct ] },
  "endpoints": [ wireguard endpoint ],        // только для WireGuard
  "inbounds": [ tun ],
  "outbounds": [ tuic-out, direct ],           // tuic-out только для TUIC
  "route": {
    "rules": [ sniff, hijack-dns, bypass → direct, private IP → direct ],
    "final": "<tag аутбаунда или эндпоинта>",
    "auto_detect_interface": true
  }
}
```
