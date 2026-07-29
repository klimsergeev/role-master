# Протокол TUIC

TUIC описывается в секции `outbounds` (`"type": "tuic"`), НЕ в `endpoints`. `route.final` указывает на tag аутбаунда.

## Входные параметры

| Параметр | Откуда взять |
|---|---|
| `server` | IP-адрес TUIC-сервера |
| `server_port` | Порт (обычно 443) |
| `uuid` | UUID пользователя из sing-box config на сервере |
| `password` | Пароль пользователя из sing-box config на сервере |
| `congestion_control` | `bbr` (рекомендуется) |
| `udp_relay_mode` | `native` |
| `server_name` (SNI) | Домен для TLS (например `www.bing.com`) |
| `insecure` | `true`, если сертификат self-signed |
| `alpn` | `["h3"]` для QUIC |

ЕСЛИ каких-то значений нет → запросить у пользователя. Не подставлять примерные UUID, пароли и IP.

## Блок outbound

```json
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
}
```

## Правила

- `congestion_control: "bbr"` — стабильнее на мобильных сетях.
- `udp_relay_mode: "native"` — лучшая производительность.
- `zero_rtt_handshake: false` — безопаснее; `true` ускоряет reconnect.
- `insecure: true` — только для self-signed сертификатов.
- `alpn: ["h3"]` — обязательно для QUIC/TUIC.
- `stack: "mixed"` в TUN inbound важен на Android: UDP идёт через gVisor, критично для TUIC/QUIC.
- TUIC работает поверх QUIC (UDP) — некоторые операторы его блокируют. При таймаутах проверить через Wi-Fi.

## Share link (для Hiddify)

Формат:

```
tuic://UUID:PASSWORD@HOST:PORT?congestion_control=bbr&udp_relay_mode=native&alpn=h3&allow_insecure=1&sni=DOMAIN#NAME
```

| Элемент | Правило |
|---|---|
| `PASSWORD` | Спецсимволы URL-encode обязательно: `+` → `%2B`, `/` → `%2F` |
| `allow_insecure=1` | Для self-signed сертификатов |
| `#NAME` | Отображаемое имя профиля в клиенте |

ЕСЛИ Hiddify выдаёт «unable to determine config format» → почти всегда спецсимволы в пароле не закодированы.

## Генерация QR-кода

```
qrencode -o name.png -s 10 -l M "$LINK"
```

Где `$LINK` — share link выше (для Hiddify) либо `sing-box://import-remote-profile?url=...` (для SFA, см. [platform-android.md](platform-android.md)).

## Серверная сторона

Настройка TUIC-сервера, генерация UUID и паролей, управление пользователями — вне scope скилла. Из серверных параметров здесь важен только `auth_timeout`: при таймаутах подключения рекомендуется 15s+.
