---
name: skill-proxy-singbox-macos
description: Настройка sing-box VT на macOS с WireGuard endpoint и split tunneling
---

# Настройка sing-box VT на macOS (WireGuard + split tunneling)

## Назначение

Процедура настройки VPN-клиента sing-box VT на macOS с WireGuard-сервером и раздельной маршрутизацией (split tunneling): выбранные домены идут напрямую, весь остальной трафик — через VPN-туннель.

---

## Самопроверка при подключении (ОБЯЗАТЕЛЬНО)

### Вариант B: Статичная проверка

```
При подключении вывести:

**sing-box macOS proxy подключён**
Ключевые принципы:
- sing-box VT 1.11+ на macOS: WireGuard только через userspace endpoint (system: true НЕ работает)
- Endpoint — НЕ outbound: route.final может ссылаться на endpoint tag напрямую
- DNS: plain UDP (1.1.1.1) без DoH, чтобы избежать проблемы address_resolver
- route_exclude_address: IP WireGuard сервера ОБЯЗАТЕЛЬНО исключить из TUN
```

---

## Алгоритм

### Шаг 1: Установка sing-box VT

1. Скачать **sing-box VT** из Mac App Store (поиск: "sing-box VT")
2. Открыть → нажать **Install Network Extension** → разрешить в системных настройках
3. Проверить: System Settings → General → Login Items & Extensions → Network Extension — должен появиться sing-box

### Шаг 2: Подготовка WireGuard конфига

Из `.conf` файла WireGuard извлечь:

| Поле .conf | Поле sing-box JSON |
|---|---|
| `[Interface] PrivateKey` | `endpoints[0].private_key` |
| `[Interface] Address` | `endpoints[0].address` (формат: `"10.8.0.19/32"` — именно /32, не /24) |
| `[Peer] PublicKey` | `endpoints[0].peers[0].public_key` |
| `[Peer] PresharedKey` | `endpoints[0].peers[0].pre_shared_key` |
| `[Peer] Endpoint` (host) | `endpoints[0].peers[0].address` |
| `[Peer] Endpoint` (port) | `endpoints[0].peers[0].port` |

### Шаг 3: Создание JSON-конфига

Рабочий шаблон для sing-box VT 1.11.x на macOS:

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
    },
    {
      "type": "block",
      "tag": "block"
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

### Шаг 4: Импорт профиля

1. В sing-box VT → **Profiles** → **New Profile**
2. Тип: **Local**
3. Выбрать созданный JSON-файл
4. Вернуться на **Dashboard** → нажать ▶ (play)

### Шаг 5: Проверка

1. Открыть сайт, который должен идти через VPN — проверить доступность
2. Открыть сайт из списка bypass-доменов — должен работать напрямую
3. Проверить IP: зайти на whatismyip.com — должен показать IP VPN-сервера

---

## Правила

- ЕСЛИ sing-box версии 1.11+ → WireGuard описывается в секции `endpoints`, НЕ в `outbounds`
- ЕСЛИ macOS → `system: true` в endpoint НЕ работает (ошибка `bad tun name`). Только userspace
- ЕСЛИ DNS через DoH (https://...) → ОБЯЗАТЕЛЬНО нужен `address_resolver` с plain DNS сервером. Проще использовать plain UDP DNS `1.1.1.1`
- ЕСЛИ route.final ссылается на endpoint tag → трафик пойдёт через WireGuard туннель (но ТОЛЬКО если нет `system: true`)
- ВСЕГДА добавлять `route_exclude_address` с IP WireGuard сервера в inbound TUN — иначе петля маршрутизации
- ВСЕГДА добавлять правила `action: sniff` и `protocol: dns → action: hijack-dns` в route.rules
- ВСЕГДА добавлять `auto_detect_interface: true` в route
- ВСЕГДА добавлять `persistent_keepalive_interval: 25` в peers — без этого соединение может отваливаться
- НИКОГДА не использовать `bind_interface` без `system: true` — интерфейса не существует
- НИКОГДА не путать endpoint и outbound — route.final к endpoint и route.final к outbound работают по-разному
- ЕСЛИ ошибка `missing address_resolver` -> использовать plain UDP DNS (1.1.1.1) вместо DoH, либо добавить plain DNS сервер как address_resolver
- ЕСЛИ ошибка `bad tun name: singbox-wg0` -> убрать `system: true` и `name` из endpoint; на macOS только userspace WireGuard
- ЕСЛИ весь трафик идёт в direct, VPN не работает -> проверить что `route.final` указывает на tag endpoint'а, `route_exclude_address` содержит IP сервера, есть правила `action: sniff` и `hijack-dns`
- ЕСЛИ ошибка `missing selected profile` при запуске -> удалить и пересоздать профиль, перезапустить приложение

---

## Формат выдачи

JSON-файл конфигурации sing-box, готовый к импорту в sing-box VT через Profiles → New Profile → Local.

### Обязательные секции JSON

| Секция | Назначение | Обязательные поля |
|--------|-----------|-------------------|
| `log` | Уровень логирования | `level` (`warn` для продакшена, `debug` для отладки) |
| `dns` | DNS-серверы и правила маршрутизации DNS | `servers[]` (минимум 1), `rules[]` (bypass-домены) |
| `endpoints` | WireGuard endpoint (sing-box 1.11+) | `type`, `tag`, `address`, `private_key`, `peers[]` |
| `inbounds` | TUN-интерфейс | `type: tun`, `address`, `route_exclude_address` с IP сервера |
| `outbounds` | Direct и block | `direct`, `block` |
| `route` | Правила маршрутизации | `rules[]` (sniff, hijack-dns, bypass-домены), `final` -> endpoint tag |

### Структура результата

```
{
  "log": { ... },
  "dns": {
    "servers": [ dns-main, dns-direct ],
    "rules": [ bypass-домены -> dns-direct ]
  },
  "endpoints": [ wireguard endpoint с ключами и peers ],
  "inbounds": [ tun с route_exclude_address ],
  "outbounds": [ direct, block ],
  "route": {
    "rules": [ sniff, hijack-dns, bypass-домены -> direct, private IP -> direct ],
    "final": "<endpoint-tag>",
    "auto_detect_interface": true
  }
}
```

---

## Примеры

### Пример 1: Базовая настройка (VPN для всего, bypass-домены напрямую)

**Вход:** WireGuard `.conf` файл с сервером 88.210.20.207:51820, bypass-домены: `.example.com`, `.local.net`

**Выход:** JSON-конфиг по шаблону из Шага 3, с подставленными ключами, адресами и bypass-доменами в `dns.rules` и `route.rules`.

### Пример 2: Добавление дополнительных доменов в bypass

**Вход:** Нужно добавить `extra-site.com` и `another.org` в прямой доступ

**Выход:** Добавить домены в два места:
1. `dns.rules[0].domain_suffix`: `[".example.com", ".local.net", "extra-site.com", "another.org"]`
2. `route.rules` (правило с domain_suffix): `[".example.com", ".local.net", "extra-site.com", "another.org"]`

### Пример 3: Отладка — сайты не открываются

**Вход:** VPN подключён, но сайты не открываются

**Выход:**
1. Поставить `"level": "debug"` в log
2. Проверить логи: если `outbound/direct[direct]` для всех запросов — endpoint не маршрутизирует
3. Проверить `route_exclude_address` содержит IP сервера
4. Проверить что `route.final` совпадает с `tag` endpoint'а

---

## Справочная информация

### WireGuard отваливается после сна macOS

UDP-сокет закрывается при hibernate и не переоткрывается. Переподключить вручную (стоп -> старт в Dashboard). Автоматического решения нет.

### Альтернативные клиенты

| Приложение | Плюсы | Минусы |
|---|---|---|
| **sing-box VT** (рекомендован) | Официальный клиент, стабильный, JSON-конфиг | Нет GUI для маршрутов |
| **Karing** | GUI, удобные Diversion Rules | Нестабильный после обновлений |
| **WireGuard.app** | Максимально стабильный | Нет split tunneling по доменам |

---

## Что НЕ входит в scope

- Настройка WireGuard сервера на VPS
- Генерация ключей WireGuard
- Настройка VPN на роутере (OpenWrt/Keenetic)
