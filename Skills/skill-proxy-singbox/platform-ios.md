# Платформа: iOS / iPadOS (sing-box VT / SFI)

По источникам — версия ядра 1.11.x из App Store, TUN работает нативно через Network Extension.

> **Внимание: по iOS источники расходятся.** Черновики macOS и iOS утверждают, что на iOS работают `stack: "system"` и `strict_route: true`; черновик Android утверждает, что на iOS рекомендуется `stack: "mixed"`, а `strict_route` не реализован. Расхождение не разрешено — см. [platforms-overview.md](platforms-overview.md). Шаблоны ниже перенесены в виде из iOS-черновика (`system` + `strict_route: true`). ЕСЛИ туннель не поднимается или маршрутизация ведёт себя странно → попробовать `stack: "mixed"` и убрать `strict_route`, и сообщить пользователю о расхождении.

## Самопроверка при подключении (ОБЯЗАТЕЛЬНО)

При подключении вывести:

```
**sing-box iOS proxy подключён**
Ключевые принципы:
- sing-box VT 1.11+ на iOS: TUN работает нативно через Network Extension
- stack: "system" — работает (в отличие от macOS)
- strict_route: true — работает (в отличие от macOS)
- DNS: DoH допустим (https://1.1.1.1/dns-query), plain UDP тоже
- route_exclude_address НЕ нужен — iOS Network Extension автоматически исключает IP сервера
- TUIC outbound — в секции outbounds (НЕ endpoints). Endpoints — только для WireGuard 1.11+
```

## Правила iOS

- `stack: "system"` — работает на iOS (в отличие от macOS, где нужен `mixed`).
- `strict_route: true` — работает на iOS.
- `route_exclude_address` НЕ нужен — Network Extension исключает IP сервера автоматически.
- DNS через DoH (`https://1.1.1.1/dns-query`) работает без проблем; plain UDP тоже.
- sudo не нужен — TUN через Network Extension.

## Шаг 1: Установка

1. App Store → поиск **sing-box VT**.
2. Установить (бесплатно, по источнику доступен в российском App Store).
3. При первом запуске разрешить добавление VPN-конфигурации.

ЕСЛИ sing-box VT недоступен → альтернативы: Hiddify (иностранный Apple ID или TestFlight), Shadowrocket. Подробности и оговорки — [platforms-overview.md](platforms-overview.md).

## Шаг 2: Параметры подключения

TUIC — [protocol-tuic.md](protocol-tuic.md). WireGuard — [protocol-wireguard.md](protocol-wireguard.md).

## Шаг 3: Конфиг

### Шаблон TUIC

> Шаблон перенесён из источника как есть. Он использует конструкции, которые черновик macOS для 1.11.x называет deprecated: `dns` outbound с правилом `"outbound": "dns-out"`, DNS-правило `"outbound": "any"`, TUN-адрес строкой вместо массива. ЕСЛИ появятся deprecation warnings или ошибки → привести к формату 1.11.x по [config-format-versions.md](config-format-versions.md): убрать `dns` outbound, заменить правило на `{"protocol": "dns", "action": "hijack-dns"}`, добавить `{"action": "sniff"}`, обернуть адрес TUN в массив.

```json
{
  "log": {
    "level": "info",
    "timestamp": true
  },
  "dns": {
    "servers": [
      {
        "tag": "remote-dns",
        "address": "https://1.1.1.1/dns-query",
        "detour": "tuic-out"
      },
      {
        "tag": "direct-dns",
        "address": "https://8.8.8.8/dns-query",
        "detour": "direct"
      }
    ],
    "rules": [
      {
        "outbound": "any",
        "server": "direct-dns"
      }
    ],
    "strategy": "ipv4_only"
  },
  "inbounds": [
    {
      "type": "tun",
      "tag": "tun-in",
      "address": "172.19.0.1/30",
      "auto_route": true,
      "strict_route": true,
      "stack": "system"
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
    },
    {
      "type": "dns",
      "tag": "dns-out"
    }
  ],
  "route": {
    "rules": [
      {
        "protocol": "dns",
        "outbound": "dns-out"
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

### TUIC + split tunneling

Добавить в `dns.rules`:
```json
{
  "domain_suffix": ["<BYPASS_DOMAINS>"],
  "server": "direct-dns"
}
```

Добавить в `route.rules` перед правилом `ip_is_private`:
```json
{
  "domain_suffix": ["<BYPASS_DOMAINS>"],
  "outbound": "direct"
}
```

Общие правила split tunneling — [split-tunneling.md](split-tunneling.md).

### Шаблон WireGuard (sing-box 1.11+)

> Шаблон перенесён из источника как есть, включая `block` outbound, который черновик macOS для 1.11.x называет deprecated.

```json
{
  "log": {
    "level": "info"
  },
  "dns": {
    "servers": [
      {
        "tag": "dns-main",
        "address": "1.1.1.1",
        "detour": "direct"
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
      "strict_route": true,
      "stack": "system"
    }
  ],
  "outbounds": [
    {
      "type": "direct",
      "tag": "direct"
    },
    {
      "type": "block",
      "tag": "block"
    }
  ],
  "route": {
    "rules": [
      {
        "protocol": "dns",
        "action": "hijack-dns"
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

**Способ 1: AirDrop (рекомендуется)**
1. На маке: правый клик на JSON-файл → Share → AirDrop → выбрать iPhone.
2. На iPhone: открыть файл через sing-box VT или сохранить в Files.
3. sing-box VT → Profiles → New Profile → Local → выбрать файл.

**Способ 2: Files (iCloud или локально)**
1. Скопировать JSON в iCloud Drive или на устройство.
2. sing-box VT → Profiles → New Profile → Local → выбрать файл из Files.

**Способ 3: Через Hiddify (только TUIC)**
Share link и QR — см. [protocol-tuic.md](protocol-tuic.md). Отсканировать в Hiddify.

## Шаг 5: Проверка

1. sing-box VT → Dashboard → нажать play.
2. Разрешить VPN-конфигурацию, если система спросит.
3. Открыть 2ip.ru в Safari — должен показать IP VPN-сервера.
4. dnsleaktest.com — DNS-запросы должны идти через VPN.

## Отладка

Порядок проверки при «подключён, но нет интернета» на iOS:

1. `"level": "debug"` в log, смотреть sing-box VT → Logs.
2. Есть ли в логах `outbound/tuic-out` или всё идёт в `outbound/direct`.
3. ЕСЛИ всё в direct → проверить, что `route.final` указывает на правильный tag.
4. ЕСЛИ ошибки TLS → проверить `insecure: true` и правильность `server_name`.

Ошибки и их расшифровка — [troubleshooting.md](troubleshooting.md).

## Вне scope

Настройка сервера на VPS, генерация UUID/ключей, управление пользователями, настройка на роутере (Keenetic, OpenWrt).
