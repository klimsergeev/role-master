# Протокол WireGuard

В sing-box 1.11+ WireGuard описывается в секции `endpoints`, НЕ в `outbounds`. `route.final` указывает на tag эндпоинта (например `wg-ep`).

## Перенос .conf в JSON

Из файла `.conf` WireGuard:

| Поле .conf | Поле sing-box JSON |
|---|---|
| `[Interface] PrivateKey` | `endpoints[0].private_key` |
| `[Interface] Address` | `endpoints[0].address` — формат `"10.8.0.19/32"`, именно `/32`, не `/24` |
| `[Peer] PublicKey` | `endpoints[0].peers[0].public_key` |
| `[Peer] PresharedKey` | `endpoints[0].peers[0].pre_shared_key` |
| `[Peer] Endpoint` (host) | `endpoints[0].peers[0].address` |
| `[Peer] Endpoint` (port) | `endpoints[0].peers[0].port` |

`AllowedIPs` из `.conf` соответствует `allowed_ips` в peer — в шаблонах `["0.0.0.0/0", "::/0"]` (весь трафик в туннель).

## Блок endpoint

```json
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
```

## Правила

- `address` эндпоинта — с маской `/32`, а не `/24` из `.conf`.
- `persistent_keepalive_interval: 25` — ВСЕГДА. Без него соединение может отваливаться.
- `mtu: 1420` — задаётся и в эндпоинте, и в TUN inbound.
- `route.final` → tag эндпоинта, а не аутбаунда.
- `system: true` в эндпоинте НЕ работает на macOS — ошибка `bad tun name: singbox-wg0`. Только userspace.
- НИКОГДА не использовать `bind_interface` без `system: true`.

## Известные ограничения

**WireGuard отваливается после сна на macOS.** UDP-сокет закрывается при hibernate и не переоткрывается. Переподключить вручную: stop → start в Dashboard. Автоматического решения нет.

**DPI-блокировки.** По источнику, некоторые операторы (упомянут Yota) блокируют WireGuard/AWG по DPI. При стабильных таймаутах — проверить через другую сеть.

## Серверная сторона

Настройка WireGuard-сервера на VPS и генерация ключей — вне scope скилла.
