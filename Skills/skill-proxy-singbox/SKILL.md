---
name: skill-proxy-singbox
description: >
  Настройка VPN-клиента sing-box на macOS, Android и iOS: сборка JSON-конфига под
  протоколы TUIC и WireGuard, split tunneling по доменам и приложениям, импорт профиля
  (локальный файл, QR-код, share link), проверка и отладка подключения. Учитывает
  различия формата конфига между версиями ядра 1.11.x и 1.12+ и платформенные
  ограничения (stack, strict_route, route_exclude_address, per-app фильтрация).
  Клиенты: sing-box VT (SFM/SFI) в App Store, SFA в Google Play, альтернативы
  Hiddify и NekoBox.
when_to_use: >
  Когда нужно настроить sing-box или подключить VPN на маке, телефоне, планшете;
  собрать JSON-конфиг для TUIC или WireGuard; перенести WireGuard .conf в sing-box;
  пустить часть сайтов мимо VPN (split tunneling, bypass-домены); исключить приложение
  из туннеля; импортировать профиль или сгенерировать QR. Также при ошибках:
  «подключён, но нет интернета», unknown field type, bad tun name, missing
  address_resolver, detour to an empty direct outbound, missing
  route.default_domain_resolver, missing selected profile, DeadSystemException,
  split tunneling не работает, WireGuard отваливается после сна. Примеры: «настрой
  sing-box на macOS», «конфиг TUIC для Android», «почему .ru идёт через VPN»,
  «перенеси мой WireGuard на iPhone».
version: 1.1.0
created: 2026-07-29
---

# Proxy: sing-box

## Назначение

Процедура настройки клиента sing-box на macOS, Android и iOS: подготовка JSON-конфига под TUIC или WireGuard, раздельная маршрутизация (split tunneling), импорт профиля, проверка и отладка. Общая часть (структура конфига, протоколы, версии формата) отделена от платформенной — платформа выбирается на шаге 1.

## Принципы

1. **Сначала платформа, потом конфиг.** Формат конфига и набор рабочих полей зависят от платформы и версии ядра. Определи платформу и версию до того, как писать JSON.
2. **Версия ядра — блокирующий фактор.** Конфиг 1.12+ на клиенте 1.11.x падает с `unknown field type`, и наоборот — 1.11.x-формат на 1.12+ даёт deprecation warnings. См. [config-format-versions.md](config-format-versions.md).
3. **Платформенные ограничения важнее «правильности».** `strict_route`, `route_exclude_address`, `stack` ведут себя на macOS, Android и iOS по-разному вплоть до полной неработоспособности. Не переносить конфиг между платформами без адаптации.
4. **Не выдумывать значения.** UUID, пароли, ключи, IP берутся у пользователя или из его файлов. Плейсхолдеры в шаблонах (`<SERVER_IP>`, `<UUID>`) заполняет пользователь.
5. **Проверять результат фактически.** Подключение считается рабочим только после проверки внешнего IP и (при split tunneling) проверки bypass-домена.

## Таблица маршрутизации

> Читай файлы под задачу, а не скилл целиком. Колонка «Обязательно» — открыть до начала работы. Колонка «Читать, если» — открыть, когда условие выполнено; условие проверяется по задаче, а не по желанию. Файлы с пометкой `(справочник)` устроены как таблицы для точечного поиска — в них допустим поиск нужной строки вместо чтения целиком.

| Задача | Обязательно | Читать, если |
|---|---|---|
| Выбрать платформу, понять различия, выбрать клиент | [platforms-overview.md](platforms-overview.md) (справочник) | если версия ядра в самом клиенте отличается от указанной в таблице: [config-format-versions.md](config-format-versions.md) |
| Настроить с нуля на macOS | [platforms-overview.md](platforms-overview.md) (справочник), [platform-macos.md](platform-macos.md), файл выбранного протокола — [protocol-tuic.md](protocol-tuic.md) или [protocol-wireguard.md](protocol-wireguard.md) | если часть доменов должна идти мимо туннеля: [split-tunneling.md](split-tunneling.md)<br>если версия ядра в клиенте не 1.11.x или конфиг даёт ошибку формата: [config-format-versions.md](config-format-versions.md)<br>если конфиг собирается не по готовому шаблону, а с нуля: [config-basics.md](config-basics.md) (справочник)<br>если профиль запущен, но интернета нет: [troubleshooting.md](troubleshooting.md) (справочник) |
| Настроить с нуля на Android | [platforms-overview.md](platforms-overview.md) (справочник), [platform-android.md](platform-android.md), файл выбранного протокола — [protocol-tuic.md](protocol-tuic.md) или [protocol-wireguard.md](protocol-wireguard.md) | если протокол WireGuard — готового Android-шаблона нет, конфиг собирается вручную: [config-basics.md](config-basics.md) (справочник), [config-format-versions.md](config-format-versions.md)<br>если часть доменов идёт мимо туннеля или нужна фильтрация по приложениям: [split-tunneling.md](split-tunneling.md)<br>если версия ядра в клиенте не 1.12+: [config-format-versions.md](config-format-versions.md)<br>если профиль запущен, но интернета нет: [troubleshooting.md](troubleshooting.md) (справочник) |
| Настроить с нуля на iOS / iPadOS | [platforms-overview.md](platforms-overview.md) (справочник), [platform-ios.md](platform-ios.md), файл выбранного протокола — [protocol-tuic.md](protocol-tuic.md) или [protocol-wireguard.md](protocol-wireguard.md) | если часть доменов должна идти мимо туннеля: [split-tunneling.md](split-tunneling.md)<br>если появились deprecation warnings или шаблон нужно привести к формату 1.11.x: [config-format-versions.md](config-format-versions.md)<br>если туннель не поднимается или маршрутизация ведёт себя странно (расхождение источников по `stack` и `strict_route`): [troubleshooting.md](troubleshooting.md) (справочник) |
| Понять структуру конфига, что обязательно | [config-basics.md](config-basics.md) (справочник) | если версия ядра известна и нужен точный формат DNS-секции: [config-format-versions.md](config-format-versions.md)<br>если конфиг пишется под конкретную платформу: [platform-macos.md](platform-macos.md), [platform-android.md](platform-android.md) или [platform-ios.md](platform-ios.md) |
| Ошибка формата, deprecation warning, миграция версии | [config-format-versions.md](config-format-versions.md) | если дословного текста ошибки нет в таблицах форматов: [troubleshooting.md](troubleshooting.md) (справочник)<br>если конфиг переносится на другую платформу: [platform-macos.md](platform-macos.md), [platform-android.md](platform-android.md) или [platform-ios.md](platform-ios.md) |
| Собрать TUIC-подключение, share link, QR | [protocol-tuic.md](protocol-tuic.md) | если нужен полный конфиг, а не только outbound-блок: [config-basics.md](config-basics.md) (справочник) и файл целевой платформы — [platform-macos.md](platform-macos.md), [platform-android.md](platform-android.md) или [platform-ios.md](platform-ios.md)<br>если QR импортируется в SFA, а не в Hiddify: [platform-android.md](platform-android.md)<br>если Hiddify отвечает «unable to determine config format»: [troubleshooting.md](troubleshooting.md) (справочник) |
| Перенести WireGuard `.conf` в sing-box | [protocol-wireguard.md](protocol-wireguard.md), файл целевой платформы — [platform-macos.md](platform-macos.md), [platform-android.md](platform-android.md) или [platform-ios.md](platform-ios.md) | если целевая платформа Android — готового шаблона нет, конфиг собирается вручную: [config-basics.md](config-basics.md) (справочник), [config-format-versions.md](config-format-versions.md)<br>если часть доменов должна идти мимо туннеля: [split-tunneling.md](split-tunneling.md)<br>если соединение отваливается после сна или таймауты при подключении: [troubleshooting.md](troubleshooting.md) (справочник) |
| Часть доменов мимо VPN / исключить приложение | [split-tunneling.md](split-tunneling.md) | если конфига ещё нет и его нужно собрать целиком: [platform-macos.md](platform-macos.md), [platform-android.md](platform-android.md) или [platform-ios.md](platform-ios.md)<br>если версия ядра клиента не совпадает с указанной для этой платформы: [config-format-versions.md](config-format-versions.md)<br>если правило добавлено, а bypass-домены всё равно идут через VPN: [troubleshooting.md](troubleshooting.md) (справочник) |
| Подключён, но не работает; ошибка в логах | [troubleshooting.md](troubleshooting.md) (справочник) | если симптом упирается в платформенные правила (`stack`, `strict_route`, `route_exclude_address`, per-app): [platform-macos.md](platform-macos.md), [platform-android.md](platform-android.md) или [platform-ios.md](platform-ios.md)<br>если в логах ошибка формата или deprecation warning: [config-format-versions.md](config-format-versions.md)<br>если не работает именно bypass: [split-tunneling.md](split-tunneling.md) |
| Выбрать альтернативный клиент (Hiddify, NekoBox, Shadowrocket) | [platforms-overview.md](platforms-overview.md) (справочник) | если профиль передаётся в Hiddify через share link или QR: [protocol-tuic.md](protocol-tuic.md)<br>если Hiddify не принимает ссылку или работает как прокси, а не VPN: [troubleshooting.md](troubleshooting.md) (справочник) |

## Рабочий процесс

### Шаг 1: Определить платформу и версию ядра

Спроси платформу, если она не названа. Загрузи [platforms-overview.md](platforms-overview.md) и определи:
- какой клиент ставить (sing-box VT / SFA / альтернатива);
- какая версия ядра у клиента — от неё зависит формат DNS-секции и обязательность `default_domain_resolver`.

Версия видна в самом приложении (About / Settings). ЕСЛИ версию узнать нельзя → исходить из значений по умолчанию для платформы из [platforms-overview.md](platforms-overview.md) и предупредить пользователя.

### Шаг 2: Определить протокол

- TUIC → [protocol-tuic.md](protocol-tuic.md)
- WireGuard → [protocol-wireguard.md](protocol-wireguard.md)

ЕСЛИ у пользователя есть готовый `.conf` WireGuard → взять параметры оттуда, ничего не спрашивая дополнительно.
ЕСЛИ протокол не назван и нет исходных данных → спросить, какие данные подключения есть на руках.

### Шаг 3: Собрать конфиг

Взять шаблон из соответствующего `platform-*.md` — там лежат готовые JSON под платформу и протокол. Общие правила структуры — в [config-basics.md](config-basics.md), правила формата версии — в [config-format-versions.md](config-format-versions.md).

Подставить реальные значения вместо плейсхолдеров. Значения, которых нет, — запросить у пользователя.

### Шаг 4: Добавить split tunneling (если нужен)

Загрузить [split-tunneling.md](split-tunneling.md). Правило bypass добавляется в **два места** — `dns.rules` и `route.rules`. Пропуск одного из них — самая частая причина «split tunneling не работает».

### Шаг 5: Импортировать профиль

Способ импорта платформозависим (Local-файл, AirDrop, QR-код, share link) — см. соответствующий `platform-*.md`.

### Шаг 6: Проверить

1. Запустить профиль в клиенте.
2. Проверить внешний IP (whatismyip.com или 2ip.ru) — должен показать IP VPN-сервера.
3. ЕСЛИ настроен split tunneling → открыть bypass-домен, он должен идти напрямую.
4. Проверить DNS: dnsleaktest.com.

ЕСЛИ проверка не прошла → [troubleshooting.md](troubleshooting.md).

## Что НЕ делать

- Не загружать все файлы скилла сразу — только нужные под задачу и платформу.
- Не переносить конфиг с одной платформы на другую без адаптации — `stack`, `strict_route`, `route_exclude_address` ведут себя по-разному.
- Не смешивать форматы 1.11.x и 1.12+ в одном конфиге.
- Не выдумывать UUID, пароли, ключи, IP-адреса и SNI-домены — только из данных пользователя.
- Не настраивать сервер (VPS): генерация ключей, UUID, управление пользователями, установка TUIC/WireGuard на сервере — вне scope.
- Не настраивать VPN на роутере (Keenetic, OpenWrt) — вне scope.
- Не объявлять настройку успешной без фактической проверки внешнего IP.

## Примеры

### Пример 1: Типовой сценарий — WireGuard на macOS с bypass-доменами

**Запрос:** «У меня есть `.conf` от WireGuard, хочу настроить на маке, но чтобы российские сайты шли напрямую»

**Маршрут:** [platform-macos.md](platform-macos.md) → [protocol-wireguard.md](protocol-wireguard.md) → [split-tunneling.md](split-tunneling.md)

**Результат:** JSON-конфиг с секцией `endpoints` (WireGuard), TUN-инбаундом с `stack: "mixed"`, `strict_route: false` и `route_exclude_address` с IP сервера, правилами bypass в `dns.rules` и `route.rules`, `route.final` → tag эндпоинта. Плюс шаги импорта через Profiles → New Profile → Local и проверка внешнего IP.

### Пример 2: Edge-case — конфиг с макбука не запускается на телефоне

**Запрос:** «На маке этот же конфиг работает, а в sing-box на Android — ошибки в логах и нет интернета»

**Маршрут:** [config-format-versions.md](config-format-versions.md) → [platform-android.md](platform-android.md) → [troubleshooting.md](troubleshooting.md)

**Результат:** Диагноз: конфиг в формате 1.11.x, а SFA работает на 1.12+; плюс в конфиге остались `route_exclude_address` и `strict_route`, которые на Android не работают (вплоть до DeadSystemException). Исправление: перевести DNS-секцию в формат `"type": "udp", "server": "..."`, добавить `"action": "route"` в DNS-правила и `route.default_domain_resolver`, убрать `route_exclude_address` и `strict_route`, для исключения приложений использовать `exclude_package`.
