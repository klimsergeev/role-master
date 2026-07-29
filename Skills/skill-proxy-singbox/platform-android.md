# Платформа: Android (SFA)

По источникам — SFA версии 1.12+. Формат конфига — 1.12+, см. [config-format-versions.md](config-format-versions.md).

## Самопроверка при подключении (ОБЯЗАТЕЛЬНО)

При подключении вывести:

```
**sing-box Android proxy подключён**
Ключевые принципы:
- SFA 1.12+ — формат конфига отличается от 1.11 (iOS App Store)
- DNS servers: формат "type": "udp", "server": "IP" (НЕ "address": "IP")
- DNS direct server: БЕЗ detour (detour к пустому direct = ошибка в 1.12+)
- DNS rules: "action": "route" обязателен
- route.default_domain_resolver: ОБЯЗАТЕЛЕН в 1.12+ (иначе deprecation warning)
- strict_route: НЕ РЕАЛИЗОВАН на Android — не включать
- route_exclude_address: НЕ РАБОТАЕТ на Android (DeadSystemException) — не включать
- stack: "mixed" рекомендуется (UDP через gVisor — важно для TUIC)
- block outbound: DEPRECATED — не включать
- Per-app фильтрация: include_package / exclude_package вместо route_exclude_address
- QR-импорт в SFA: sing-box://import-remote-profile?url=URL#NAME (нужен URL с JSON)
- QR-импорт в Hiddify: tuic:// share link (спецсимволы URL-encoded)
```

## Блокирующие правила Android

- НИКОГДА не включать `strict_route` — не реализован на Android, игнорируется.
- НИКОГДА не включать `route_exclude_address` — не работает, при большом количестве маршрутов даёт DeadSystemException.
- `stack: "mixed"` рекомендуется — UDP идёт через gVisor, критично для TUIC/QUIC.
- Per-app фильтрация — `include_package` / `exclude_package` в TUN inbound, по `package_name`.
- `process_name` / `process_path` в route rules — нет прав, использовать `package_name`.
- `include_android_user` — нет прав в SFA.

## Шаг 1: Установка

**SFA (sing-box for Android):**
1. Google Play → поиск **sing-box** (издатель nekohasekai).
2. Или APK с GitHub: `github.com/SagerNet/sing-box/releases` → `SFA-*.apk`.
3. Package name: `io.nekohasekai.sfa`.

**Альтернатива — Hiddify:**
1. Google Play или APK: `github.com/hiddify/hiddify-app/releases`.
2. Поддерживает TUIC share links и QR-коды напрямую.
3. Удобнее для конечных пользователей.

## Шаг 2: Параметры подключения

TUIC — [protocol-tuic.md](protocol-tuic.md). WireGuard — [protocol-wireguard.md](protocol-wireguard.md).

## Шаг 3: Конфиг

### Шаблон TUIC + split tunneling (формат 1.12+)

```json
{
  "log": {
    "level": "info",
    "timestamp": true
  },
  "dns": {
    "servers": [
      {
        "type": "udp",
        "tag": "dns-main",
        "server": "1.1.1.1",
        "detour": "tuic-out"
      },
      {
        "type": "udp",
        "tag": "dns-direct",
        "server": "8.8.8.8"
      }
    ],
    "rules": [
      {
        "domain_suffix": ["<BYPASS_DOMAINS>"],
        "action": "route",
        "server": "dns-direct"
      }
    ],
    "strategy": "ipv4_only"
  },
  "inbounds": [
    {
      "type": "tun",
      "tag": "tun-in",
      "address": ["172.19.0.1/30"],
      "auto_route": true,
      "stack": "mixed"
    }
  ],
  "outbounds": [
    {
      "type": "tuic",
      "tag": "tuic-out",
      "server": "<SERVER_IP>",
      "server_port": <SERVER_PORT>,
      "uuid": "<UUID>",
      "password": "<PASSWORD>",
      "congestion_control": "bbr",
      "udp_relay_mode": "native",
      "zero_rtt_handshake": false,
      "tls": {
        "enabled": true,
        "server_name": "<SNI_DOMAIN>",
        "insecure": true,
        "alpn": ["h3"]
      }
    },
    {
      "type": "direct",
      "tag": "direct"
    }
  ],
  "route": {
    "rules": [
      {
        "action": "sniff"
      },
      {
        "protocol": "dns",
        "action": "hijack-dns"
      },
      {
        "domain_suffix": ["<BYPASS_DOMAINS>"],
        "outbound": "direct"
      },
      {
        "ip_is_private": true,
        "outbound": "direct"
      }
    ],
    "final": "tuic-out",
    "auto_detect_interface": true,
    "default_domain_resolver": "dns-direct"
  }
}
```

**TUIC без split tunneling:** убрать правило с `domain_suffix` из `dns.rules` и из `route.rules`. Остальное без изменений.

### WireGuard на Android

Готового Android-шаблона WireGuard в источниках нет — есть только общее правило: WireGuard 1.11+ описывается в секции `endpoints`, `route.final` → tag эндпоинта. Собирать так: блок `endpoints` из [protocol-wireguard.md](protocol-wireguard.md) + DNS-секция в формате 1.12+ + TUN inbound без `strict_route` и `route_exclude_address` + `route.default_domain_resolver`.

## Шаг 4: Импорт профиля

**Способ 1: Локальный файл (рекомендуется)**
1. Скопировать JSON на телефон (USB, облако, мессенджер).
2. SFA → Profile → **+** → **Local** → выбрать JSON-файл.
3. Dashboard → нажать play.

**Способ 2: QR-код с URL (для SFA)**
1. Выложить JSON-конфиг на доступный URL (GitHub Gist, свой сервер).
2. Сгенерировать QR с содержимым:
   ```
   sing-box://import-remote-profile?url=<URL_ENCODED_CONFIG_URL>#<URL_ENCODED_NAME>
   ```
3. SFA → Profile → **+** → сканировать QR.

**Способ 3: Share link QR (для Hiddify)**
Формат ссылки и правила кодирования — в [protocol-tuic.md](protocol-tuic.md). Сгенерировать QR через `qrencode` и отсканировать в Hiddify.

## Шаг 5: Проверка

1. Dashboard → play.
2. Разрешить VPN-подключение, если система спросит.
3. whatismyip.com — должен показать IP VPN-сервера.
4. ЕСЛИ split tunneling → bypass-домен (например yandex.ru) открывается напрямую.
5. dnsleaktest.com — проверка утечки DNS.

## Per-app фильтрация

Исключить приложение из VPN или пустить только выбранные — см. [split-tunneling.md](split-tunneling.md).

## Отладка

Порядок проверки при «подключён, но нет интернета» на Android:

1. `"level": "debug"` в log, смотреть SFA → Logs.
2. Куда идёт трафик: `outbound/tuic-out` или всё в `outbound/direct`.
3. ЕСЛИ всё в direct → проверить, что `route.final` указывает на правильный tag.
4. Убедиться, что в конфиге НЕТ `route_exclude_address` — на Android он ломает маршрутизацию.

Ошибки и их расшифровка — [troubleshooting.md](troubleshooting.md).

## Вне scope

Настройка сервера на VPS, генерация UUID/ключей, управление пользователями, настройка на роутере (Keenetic, OpenWrt).
