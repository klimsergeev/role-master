# Отладка

Универсальный первый шаг: поставить `"level": "debug"` в секции `log` и открыть логи в клиенте (sing-box VT → Logs, SFA → Logs).

## Подключён, но нет интернета

Общий алгоритм:

1. Включить debug-лог.
2. Посмотреть, куда идёт трафик: в `outbound/tuic-out` (или в эндпоинт) или всё в `outbound/direct`.
3. ЕСЛИ всё в direct → проверить, что `route.final` указывает на существующий tag: аутбаунда для TUIC, эндпоинта для WireGuard.
4. Применить платформенную проверку:

| Платформа | Что проверять в первую очередь |
|---|---|
| macOS | Есть ли `route_exclude_address` с IP сервера (без него петля маршрутизации). Затем `stack` = `mixed`, `strict_route` = `false` |
| Android | НЕТ ли `route_exclude_address` — на Android он ломает маршрутизацию |
| iOS | Ошибки TLS: `insecure: true` и правильность `server_name` |

## Ошибки конфига

| Симптом | Причина | Исправление |
|---|---|---|
| `unknown field type` в DNS | Формат 1.12+ (`"type": "udp", "server": "..."`) на клиенте 1.11.x | Использовать `"address": "1.1.1.1"` без поля `type` |
| `detour to an empty direct outbound makes no sense` | У DNS-сервера стоит `"detour": "direct"`, а `direct` аутбаунд пустой (1.12+) | Убрать `detour` у DNS-сервера, который резолвит напрямую — это дефолтное поведение |
| `missing route.default_domain_resolver` | 1.12+ требует поле в секции `route` | Добавить `"default_domain_resolver": "dns-direct"` |
| `legacy DNS servers is deprecated` | Старый формат `"address": "1.1.1.1"` на клиенте 1.12+ | Перевести в `"type": "udp", "server": "1.1.1.1"` |
| `missing address_resolver` | DoH-DNS (`https://1.1.1.1/dns-query`) требует plain DNS для резолва самого DoH-сервера | Использовать plain UDP DNS (`1.1.1.1`) вместо DoH, либо добавить plain DNS как `address_resolver` |
| `bad tun name: singbox-wg0` | WireGuard-эндпоинт с `system: true` на macOS | Убрать `system: true` и `name` из эндпоинта — на macOS только userspace |
| Warning `legacy special outbounds` | В конфиге есть `block` или `dns` outbound | Убрать их; использовать `action: reject` и `action: hijack-dns` в `route.rules` |
| Warning `legacy inbound fields` | `sniff: true` указан в inbound | Убрать `sniff` из inbound, добавить `{"action": "sniff"}` в `route.rules` |
| DeadSystemException (Android) | `route_exclude_address` при большом количестве маршрутов | Убрать `route_exclude_address`; для исключений использовать `exclude_package` |

Полные таблицы форматов — [config-format-versions.md](config-format-versions.md).

## Timeout при подключении

1. Проверить доступность сервера (порт 443/udp).
2. `auth_timeout` на сервере — рекомендуется 15s+.
3. `zero_rtt_handshake: true` ускоряет reconnect.
4. QUIC может быть заблокирован оператором — попробовать через Wi-Fi.
5. По источнику, некоторые операторы (упомянут Yota) блокируют WireGuard/AWG по DPI.

## Split tunneling не работает (bypass-домены идут через VPN)

1. `{"action": "sniff"}` — первое правило в `route.rules`. Без sniff домены не определяются.
2. `{"protocol": "dns", "action": "hijack-dns"}` — DNS-запросы должны перехватываться.
3. `domain_suffix` указан и в `dns.rules`, и в `route.rules`.
4. На 1.12+ в DNS-правиле обязателен `"action": "route"`.

Подробнее — [split-tunneling.md](split-tunneling.md).

## Проблемы клиентов

| Симптом | Решение |
|---|---|
| sing-box VT / SFA: `missing selected profile` | Удалить профиль, пересоздать, перезапустить приложение |
| Hiddify: `unable to determine config format` | Спецсимволы в пароле share link не URL-encoded: `+` → `%2B`, `/` → `%2F` |
| Hiddify работает как прокси, а не как VPN | На iPhone обычно не проблема (Network Extension перехватывает весь трафик). На Windows — запустить от администратора. На macOS — использовать sing-box VT вместо Hiddify |
| WireGuard отваливается после сна macOS | UDP-сокет закрывается при hibernate и не переоткрывается. Переподключить вручную: stop → start в Dashboard. Автоматического решения нет |

## Что проверять на успешном подключении

1. Внешний IP: whatismyip.com или 2ip.ru — должен быть IP VPN-сервера.
2. Bypass-домен открывается напрямую (если настроен split tunneling).
3. dnsleaktest.com — нет утечки DNS.

Не объявлять настройку успешной без фактической проверки внешнего IP.
