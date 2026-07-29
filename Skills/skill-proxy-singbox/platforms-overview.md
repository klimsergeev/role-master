# Платформы: клиенты, версии, различия

Файл отвечает на вопрос «какой клиент ставить и чем платформа отличается от других». Готовые конфиги — в `platform-macos.md`, `platform-android.md`, `platform-ios.md`.

## Клиент и версия ядра по платформам

| Платформа | Клиент | Источник | Версия ядра по источникам (дата черновиков — 2026-06-08) |
|---|---|---|---|
| macOS | sing-box VT (SFM), издатель nekohasekai | Mac App Store | 1.11.x |
| Android | sing-box (SFA), издатель nekohasekai, package `io.nekohasekai.sfa` | Google Play, либо APK `github.com/SagerNet/sing-box/releases` → `SFA-*.apk` | 1.12+ |
| iOS / iPadOS | sing-box VT (SFI) | App Store (доступен в российском App Store) | 1.11.x |

**Версии ядра в таблице — из черновиков-источников (июнь 2026), а не из сторов на текущий момент.** Проверено 2026-07-29: последний стабильный релиз ядра `SagerNet/sing-box` — **v1.13.14** от 2026-06-25 (GitHub Releases API, `prerelease: false`). Версии сборок в App Store и Google Play через веб проверить не удалось: страница App Store отдаёт 404 на fetch, Google Play — только шапку без блока «Версия».

Практический вывод: **не полагайся на «macOS = 1.11.x» как на вечную истину — сверяй версию в самом приложении** (About / Settings). Правила формата для 1.11.x и 1.12+ — в [config-format-versions.md](config-format-versions.md); правил для 1.13.x в источниках нет, и выдумывать их нельзя.

## Матрица различий

Сведена из трёх черновиков. Строки с пометкой **[конфликт]** — источники расходятся, см. раздел «Расхождения в источниках».

| Параметр | macOS (SFM) | Android (SFA) | iOS (SFI) |
|---|---|---|---|
| Формат DNS servers | `"address": "1.1.1.1"` | `"type": "udp", "server": "1.1.1.1"` | `"address": "1.1.1.1"` |
| Формат DNS rules | `"server": "dns-direct"` | `"action": "route", "server": "dns-direct"` | `"server": "dns-direct"` |
| `route.default_domain_resolver` | Не добавлять (1.11.x) | Обязателен (1.12+) | Не добавлять (1.11.x) |
| `stack` | `mixed` — `system` вызывает `bad tun name` | `mixed` (рекомендуется, UDP через gVisor) | **[конфликт]** `system` / `mixed` |
| `strict_route` | `false` — `true` ломает маршрутизацию | Не реализован, не включать | **[конфликт]** `true` работает / не реализован |
| `route_exclude_address` | **Обязателен** (IP сервера), иначе петля маршрутизации | **Не работает** — DeadSystemException | Не нужен, Network Extension исключает IP сервера сам |
| Per-app фильтрация | Нет | `include_package` / `exclude_package` в TUN | Нет |
| `process_name` / `process_path` в route rules | Работает | Нет прав — использовать `package_name` | Работает |
| DNS через DoH | Проблемы: требует `address_resolver`, надёжнее plain UDP | Работает, но plain UDP надёжнее | Работает |
| sudo / root | Нужен для TUN (через Network Extension) | Не нужен (VpnService) | Не нужен |
| `block` / `dns` outbounds | Убрать — deprecated с 1.11, дают warnings | Убрать — deprecated | **[конфликт]** «работает, warnings допустимы» |
| QR-импорт | Нет | `sing-box://` URL-схема | Нет (только share link через Hiddify) |
| Импорт конфига | Files / GUI | Local-файл / QR | Files / AirDrop |

## Альтернативные клиенты

### macOS

| Приложение | TUIC | Цена | Примечание |
|---|---|---|---|
| **sing-box VT** (рекомендован) | Да | Бесплатно | Официальный клиент, JSON-конфиг, стабильный. Нет GUI для маршрутов |
| Hiddify | Да | Бесплатно | GUI, но на macOS работает как прокси, не TUN — whatismyip.com показывает реальный IP |
| WireGuard.app | Нет | Бесплатно | Только WireGuard, максимально стабильный, но нет split tunneling по доменам |
| Karing | Да | Бесплатно | GUI, удобные Diversion Rules, нестабильный после обновлений |

**Важно:** Hiddify на macOS использует прокси-режим, а не TUN — системные приложения и часть трафика идут мимо VPN. Использовать sing-box VT.

### Android

| Приложение | TUIC | Цена | Примечание |
|---|---|---|---|
| **SFA** (рекомендован) | Да | Бесплатно | Официальный клиент, JSON-конфиг, стабильный |
| Hiddify | Да | Бесплатно | QR / share link, удобный GUI, больше протоколов. APK: `github.com/hiddify/hiddify-app/releases` |
| NekoBox | Да | Бесплатно | Форк sing-box, GUI для правил |
| Shadowrocket | — | — | Только iOS |

### iOS

| Приложение | TUIC | Цена | В РФ App Store | Примечание |
|---|---|---|---|---|
| **sing-box VT** (рекомендован) | Да | Бесплатно | Да | JSON-конфиг, стабильный |
| Hiddify | Да | Бесплатно | Нет (нужен иностранный Apple ID или TestFlight) | QR / share link, удобный GUI |
| Shadowrocket | Да | $2.99 | Да (по источнику — оплата невозможна с 01.04.2026) | Если уже куплен |

**Не проверено:** статус и цена Shadowrocket, а также доступность оплаты с 01.04.2026 — перенесено дословно из черновика от 2026-06-08, самостоятельно не сверялось.

## Расхождения в источниках

Черновики противоречат друг другу по трём пунктам. Ни один не разрешён «по усмотрению» — при работе с iOS проверяй фактически и сообщай пользователю.

| Пункт | Черновики macOS и iOS утверждают | Черновик Android утверждает |
|---|---|---|
| `stack` на iOS | `system` работает нативно, в отличие от macOS | iOS — `mixed` (рекомендуется) |
| `strict_route` на iOS | `true` работает | На iOS **не реализован** |

Третье расхождение — внутри самих черновиков: iOS-шаблоны используют конструкции, которые черновик macOS для той же версии 1.11.x прямо запрещает:
- iOS TUIC-шаблон содержит `dns` outbound и правило `"protocol": "dns", "outbound": "dns-out"`, а также DNS-правило `"outbound": "any"`;
- iOS WireGuard-шаблон содержит `block` outbound;
- iOS TUIC-шаблон задаёт TUN-адрес строкой `"address": "172.19.0.1/30"`, тогда как остальные шаблоны (включая iOS WireGuard) используют массив `["172.19.0.1/30"]`, а черновик macOS называет массив обязательным с 1.10.

Практика: iOS-шаблоны в [platform-ios.md](platform-ios.md) перенесены как есть (они описаны в источнике как рабочие для iOS), но помечены. При ошибках или deprecation warnings — приводить к формату 1.11.x из [config-format-versions.md](config-format-versions.md).
