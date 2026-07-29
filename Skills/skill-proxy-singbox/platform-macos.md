# Платформа: macOS (sing-box VT / SFM)

По источникам — версия ядра 1.11.x из Mac App Store. Формат конфига — 1.11.x, см. [config-format-versions.md](config-format-versions.md).

## Самопроверка при подключении (ОБЯЗАТЕЛЬНО)

При подключении вывести:

```
**sing-box macOS proxy подключён**
Ключевые принципы:
- sing-box VT на macOS = версия 1.11.x (App Store). НЕ 1.12+
- DNS формат: "address": "1.1.1.1" (НЕ "type": "udp", "server": "1.1.1.1" — это 1.12+)
- stack: "mixed" ОБЯЗАТЕЛЬНО (system НЕ работает — ошибка bad tun name)
- strict_route: false ОБЯЗАТЕЛЬНО (true ломает маршрутизацию)
- route_exclude_address: IP сервера ОБЯЗАТЕЛЬНО (иначе петля маршрутизации)
- block/dns outbounds: УБРАТЬ (deprecated с 1.11, вызывают warnings)
- Вместо dns outbound: action: sniff + action: hijack-dns в route.rules
- default_domain_resolver: НЕ ДОБАВЛЯТЬ (это 1.12+, вызовет ошибку)
- Plain UDP DNS надёжнее DoH на macOS (DoH требует address_resolver)
```

## Блокирующие правила macOS

- `stack: "mixed"` ОБЯЗАТЕЛЬНО — `system` вызывает ошибку `bad tun name`.
- `strict_route: false` ОБЯЗАТЕЛЬНО — `true` ломает маршрутизацию на macOS.
- `route_exclude_address` с IP сервера ОБЯЗАТЕЛЬНО — без него петля маршрутизации и нет интернета.
- DNS — plain UDP (`1.1.1.1`), а не DoH: DoH на macOS требует `address_resolver`.
- `system: true` в WireGuard-эндпоинте НЕ работает — только userspace.

## Шаг 1: Установка

1. Mac App Store → поиск **sing-box VT** (издатель nekohasekai).
2. Установить (бесплатно).
3. Открыть → **Install Network Extension** → разрешить в System Settings.
4. Проверить: System Settings → General → Login Items & Extensions → Network Extension — sing-box в списке.

## Шаг 2: Параметры подключения

TUIC — [protocol-tuic.md](protocol-tuic.md). WireGuard — [protocol-wireguard.md](protocol-wireguard.md).

## Шаг 3: Конфиг

### Шаблон TUIC + split tunneling (формат 1.11.x, по источнику протестирован, без warnings)

```json
{
  "log": {
    "level": "info",
    "timestamp": true
  },
  "dns": {
    "servers": [
      {
        "tag": "dns-main",
        "address": "1.1.1.1",
        "detour": "tuic-out"
      },
      {
        "tag": "dns-direct",
        "address": "8.8.8.8"
      }
    ],
    "rules": [
      {
        "domain_suffix": ["<BYPASS_DOMAINS>"],
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
      "strict_route": false,
      "stack": "mixed",
      "route_exclude_address": ["<SERVER_IP>/32"]
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
    "auto_detect_interface": true
  }
}
```

**TUIC без split tunneling:** убрать правило с `domain_suffix` из `dns.rules` и из `route.rules`. Остальное без изменений.

### Шаблон WireGuard (sing-box 1.11+)

```json
{
  "log": {
    "level": "warn"
  },
  "dns": {
    "servers": [
      {
        "tag": "dns-main",
        "address": "1.1.1.1",
        "detour": "direct"
      },
      {
        "tag": "dns-direct",
        "address": "1.1.1.1",
        "detour": "direct"
      }
    ],
    "rules": [
      {
        "domain_suffix": ["<BYPASS_DOMAINS>"],
        "server": "dns-direct"
      }
    ]
  },
  "endpoints": [
    {
      "type": "wireguard",
      "tag": "wg-ep",
      "mtu": 1420,
      "address": ["<LOCAL_ADDRESS>/32"],
      "private_key": "<PRIVATE_KEY>",
      "peers": [
        {
          "address": "<SERVER_IP>",
          "port": <SERVER_PORT>,
          "public_key": "<SERVER_PUBLIC_KEY>",
          "pre_shared_key": "<PRESHARED_KEY>",
          "allowed_ips": ["0.0.0.0/0", "::/0"],
          "persistent_keepalive_interval": 25
        }
      ]
    }
  ],
  "inbounds": [
    {
      "type": "tun",
      "tag": "tun-in",
      "address": ["172.19.0.1/30"],
      "mtu": 1420,
      "auto_route": true,
      "strict_route": false,
      "stack": "mixed",
      "route_exclude_address": ["<SERVER_IP>/32"]
    }
  ],
  "outbounds": [
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
    "final": "wg-ep",
    "auto_detect_interface": true
  }
}
```

## Шаг 4: Импорт профиля

1. sing-box VT → **Profiles** → **New Profile**.
2. Тип: **Local**.
3. Выбрать JSON-файл.
4. Вернуться на **Dashboard** → нажать play.

## Шаг 5: Проверка

1. Dashboard → play.
2. whatismyip.com — должен показать IP VPN-сервера.
3. ЕСЛИ split tunneling → bypass-домен (например yandex.ru) открывается напрямую.
4. dnsleaktest.com — проверка утечки DNS.

## Отладка

Порядок проверки при «подключён, но нет интернета» на macOS:

1. `"level": "debug"` в log, смотреть sing-box VT → Logs.
2. **Первым делом** — есть ли `route_exclude_address` с IP сервера. Без него петля маршрутизации.
3. Затем — `stack` = `mixed`, `strict_route` = `false`.
4. Куда идёт трафик: `outbound/tuic-out` или всё в `outbound/direct`.
5. ЕСЛИ всё в direct → проверить, что `route.final` указывает на правильный tag.

Ошибки и их расшифровка — [troubleshooting.md](troubleshooting.md).

## Вне scope

Настройка сервера на VPS, генерация UUID/ключей, управление пользователями, настройка на роутере (Keenetic, OpenWrt).
