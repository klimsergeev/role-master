# Версии формата конфига: 1.11.x против 1.12+

Формат конфига менялся между версиями ядра. Конфиг «не той» версии либо падает с ошибкой, либо сыплет deprecation warnings. По источникам: macOS и iOS — 1.11.x, Android — 1.12+ (см. оговорку про актуальность в [platforms-overview.md](platforms-overview.md)).

## Как определить версию

Версия ядра показана в самом приложении (About / Settings). ЕСЛИ версию узнать нельзя → взять значение по умолчанию для платформы и предупредить пользователя, что при ошибках формата конфиг придётся переводить.

## Таблица различий

| Что | 1.11.x | 1.12+ |
|---|---|---|
| DNS server | `{"tag": "dns-main", "address": "1.1.1.1"}` | `{"type": "udp", "tag": "dns-main", "server": "1.1.1.1"}` |
| DNS rule | `{"domain_suffix": [...], "server": "dns-direct"}` | `{"domain_suffix": [...], "action": "route", "server": "dns-direct"}` |
| `route.default_domain_resolver` | НЕ добавлять — вызовет ошибку | ОБЯЗАТЕЛЕН, иначе deprecation warning |
| DNS-сервер для прямого резолва | `detour` допустим | БЕЗ `detour` — `detour` к пустому `direct` аутбаунду вызывает ошибку |
| `"outbound": "any"` в DNS rules | Встречается в старых конфигах | Deprecated, не включать |

## Deprecated: что убрать из любого конфига

| Поле / конструкция | С какой версии | Чем заменено |
|---|---|---|
| `inet4_address` в TUN inbound | Deprecated с 1.10 | `address: ["172.19.0.1/30"]` (массив) |
| `sniff: true` в inbound | Deprecated с 1.11 | `{"action": "sniff"}` в `route.rules` |
| `block` outbound | Deprecated с 1.11 | `{"action": "reject"}` в `route.rules` |
| `dns` outbound + правило `"outbound": "dns-out"` | Deprecated с 1.11 | `{"protocol": "dns", "action": "hijack-dns"}` в `route.rules` |
| `"outbound": "any"` в `dns.rules` | Deprecated с 1.12 | Убрать |

## Блокирующие правила формата 1.11.x

- DNS servers — только `"address": "1.1.1.1"`. Формат `"type": "udp", "server": "..."` даст `unknown field type`.
- DNS rules — только `"server": "dns-direct"`, без `"action": "route"`.
- `default_domain_resolver` НЕ добавлять — это поле 1.12+, вызовет ошибку.
- `block` и `dns` outbounds НЕ включать — deprecation warnings.
- `sniff: true` в inbound НЕ включать.
- `inet4_address` НЕ использовать.

## Блокирующие правила формата 1.12+

- DNS servers — только `"type": "udp", "server": "IP"`. Старый `"address": "IP"` даёт warning «legacy DNS servers is deprecated».
- DNS-сервер, который резолвит напрямую, — БЕЗ `detour`. Это дефолтное поведение; `"detour": "direct"` к пустому `direct` аутбаунду вызывает ошибку «detour to an empty direct outbound makes no sense».
- DNS rules — `"action": "route"` обязателен.
- `route.default_domain_resolver` обязателен: указывает, каким DNS-сервером резолвить домены в адресах аутбаундов. В шаблонах — `"default_domain_resolver": "dns-direct"`.
- `block` outbound и `"outbound": "any"` в DNS rules НЕ включать.

## Перевод конфига 1.11.x → 1.12+

1. В каждом DNS-сервере: `"address": "X"` → `"type": "udp", "server": "X"`.
2. У DNS-сервера для прямого резолва убрать `detour`.
3. В каждое DNS-правило добавить `"action": "route"`.
4. В `route` добавить `"default_domain_resolver": "<tag прямого DNS>"`.
5. Убрать `block` outbound и правила с `"outbound": "any"`.
6. Применить платформенные поправки целевой платформы (для Android — убрать `strict_route` и `route_exclude_address`).

Обратный перевод 1.12+ → 1.11.x — те же шаги в обратную сторону, плюс обязательно убрать `default_domain_resolver`.

## Ограничение

Источники описывают только 1.11.x и 1.12+. Правил формата для 1.13.x в них нет — не достраивай их по аналогии. ЕСЛИ клиент оказался новее и конфиг даёт незнакомые ошибки → сверять с официальной документацией sing-box, а не догадываться.
