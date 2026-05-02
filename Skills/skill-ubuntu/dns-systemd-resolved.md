# DNS -- systemd-resolved

## Назначение

Диагностика и настройка DNS через systemd-resolved в Ubuntu -- stub-resolver, resolvectl, конфигурация.

## Как работает systemd-resolved

systemd-resolved -- DNS-резолвер, включённый по умолчанию в Ubuntu (с 16.10).

### Архитектура

```
Приложение → /etc/resolv.conf → 127.0.0.53 (stub-resolver) → systemd-resolved → внешний DNS
```

- Stub-resolver слушает на `127.0.0.53:53`
- `/etc/resolv.conf` -- симлинк на `/run/systemd/resolve/stub-resolv.conf`
- Кэширует DNS-ответы локально

### Три режима resolv.conf

| Режим | Симлинк | Описание |
|---|---|---|
| **stub** (по умолчанию) | → `/run/systemd/resolve/stub-resolv.conf` | Через stub-resolver 127.0.0.53 |
| **direct** | → `/run/systemd/resolve/resolv.conf` | Напрямую к upstream DNS, без кэша |
| **foreign** | Ручной файл, не симлинк | systemd-resolved не управляет resolv.conf |

Проверить текущий режим:

```bash
ls -la /etc/resolv.conf
```

## Диагностика

```bash
# Текущие DNS-серверы по интерфейсам
resolvectl status

# Проверить резолвинг конкретного домена
resolvectl query example.com

# Статистика кэша
resolvectl statistics

# Очистить DNS-кэш
resolvectl flush-caches

# Старый синтаксис (deprecated, но работает)
systemd-resolve --status
```

## Настройка DNS

### Через Netplan (рекомендуется)

```yaml
# /etc/netplan/01-netcfg.yaml
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: true
      nameservers:
        addresses:
          - 8.8.8.8
          - 1.1.1.1
        search:
          - example.com
```

```bash
sudo netplan apply
```

### Через resolved.conf (глобально)

```bash
# /etc/systemd/resolved.conf
[Resolve]
DNS=8.8.8.8 1.1.1.1
FallbackDNS=8.8.4.4
Domains=~.

# Применить
sudo systemctl restart systemd-resolved
```

| Параметр | Описание |
|---|---|
| `DNS=` | Основные DNS-серверы |
| `FallbackDNS=` | Резервные (если основные недоступны) |
| `Domains=` | Домены для поиска. `~.` = использовать как default route |
| `DNSSEC=` | `allow-downgrade` (по умолчанию), `true`, `false` |
| `DNSOverTLS=` | `opportunistic`, `true`, `false` |

## Типичные проблемы

### DNS не работает после reboot

```bash
# 1. Проверить что resolv.conf -- правильный симлинк
ls -la /etc/resolv.conf
# Должен быть: → /run/systemd/resolve/stub-resolv.conf

# 2. Если симлинк сломан -- восстановить
sudo ln -sf /run/systemd/resolve/stub-resolv.conf /etc/resolv.conf

# 3. Проверить статус resolved
systemctl status systemd-resolved

# 4. Перезапустить
sudo systemctl restart systemd-resolved

# 5. Проверить DNS-серверы
resolvectl status
```

### Конфликт с NetworkManager / dnsmasq

На десктопных Ubuntu NetworkManager может использовать dnsmasq:

```bash
# Проверить кто слушает на 53 порту
sudo ss -tulnp | grep ':53'

# Если dnsmasq -- отключить его использование в NetworkManager
# /etc/NetworkManager/NetworkManager.conf
# [main]
# dns=systemd-resolved
```

### Отключение systemd-resolved

Иногда нужно (например, свой DNS-сервер на этой машине):

```bash
# 1. Остановить и отключить
sudo systemctl disable --now systemd-resolved

# 2. Удалить симлинк
sudo rm /etc/resolv.conf

# 3. Создать статический resolv.conf
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf
echo "nameserver 1.1.1.1" | sudo tee -a /etc/resolv.conf

# 4. Защитить от перезаписи
sudo chattr +i /etc/resolv.conf
```

## Примеры

### Пример 1: Сервер не резолвит домены

**Вход:** `curl: Could not resolve host: example.com`

**Результат:**

```bash
# Диагностика
resolvectl status
resolvectl query example.com
ls -la /etc/resolv.conf
systemctl status systemd-resolved

# Если resolved не работает
sudo systemctl restart systemd-resolved

# Если resolv.conf сломан
sudo ln -sf /run/systemd/resolve/stub-resolv.conf /etc/resolv.conf
```

### Пример 2: Нужно использовать корпоративный DNS для внутренних доменов

**Вход:** Резолвить `*.corp.example.com` через 10.0.0.53, остальное -- через 8.8.8.8

**Результат:**

```bash
# /etc/systemd/resolved.conf
[Resolve]
DNS=8.8.8.8
Domains=~.

# Для конкретного интерфейса (VPN)
resolvectl dns tun0 10.0.0.53
resolvectl domain tun0 corp.example.com

# Проверить
resolvectl status
resolvectl query internal.corp.example.com
```
