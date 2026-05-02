# Cloud-init

## Назначение

Управление cloud-init в Ubuntu -- конфигурация, диагностика, отключение, взаимодействие с Netplan.

## Что делает cloud-init

cloud-init -- стандартная утилита инициализации облачных экземпляров. При первом запуске:

- Устанавливает hostname
- Настраивает SSH-ключи
- Создаёт пользователей
- Конфигурирует сеть (через Netplan)
- Выполняет user-data скрипты

Работает на AWS, GCP, Azure, Hetzner, DigitalOcean, Vultr, и др.

## Диагностика

```bash
# Статус cloud-init
cloud-init status
cloud-init status --long

# Результат последнего запуска
cat /run/cloud-init/result.json

# Логи
cat /var/log/cloud-init.log          # подробный лог
cat /var/log/cloud-init-output.log   # stdout/stderr скриптов

# Какой datasource используется
cloud-init query ds.meta_data
```

### Стадии cloud-init

| Стадия | Что делает |
|---|---|
| **local** | Сеть до DHCP, идентификация datasource |
| **network** | Сеть, hostname, SSH-ключи |
| **config** | Пакеты, пользователи, файлы |
| **final** | User-data скрипты, финальные задачи |

## Конфигурация

### Файлы

| Файл | Описание |
|---|---|
| `/etc/cloud/cloud.cfg` | Основной конфиг (модули, пользователь по умолчанию) |
| `/etc/cloud/cloud.cfg.d/*.cfg` | Дополнительные конфиги (приоритет по алфавиту) |
| `/var/lib/cloud/` | Данные экземпляра (кэш, скрипты) |

### Пример user-data (cloud-config)

```yaml
#cloud-config
package_update: true
packages:
  - nginx
  - certbot

users:
  - name: deploy
    groups: sudo
    shell: /bin/bash
    ssh_authorized_keys:
      - ssh-rsa AAAA...

runcmd:
  - systemctl enable nginx
  - systemctl start nginx
```

## Отключение cloud-init

### Полное отключение

```bash
# Создать маркер-файл
sudo touch /etc/cloud/cloud-init.disabled

# Проверить
cloud-init status
# status: disabled
```

### Только сетевая часть

```bash
# Создать конфиг для отключения networking
sudo mkdir -p /etc/cloud/cloud.cfg.d
echo "network: {config: disabled}" | sudo tee /etc/cloud/cloud.cfg.d/99-disable-network-config.cfg
```

После этого cloud-init не будет перезаписывать Netplan-конфиги.

### Отключение конкретных модулей

```bash
# В /etc/cloud/cloud.cfg закомментировать ненужные модули:
# cloud_init_modules:
#  - disk_setup
#  - ...
```

## Взаимодействие с Netplan

cloud-init генерирует Netplan-конфиг при первом запуске:

```
/etc/netplan/50-cloud-init.yaml
```

**Проблема:** Если вы вручную создали свой Netplan-конфиг, cloud-init может перезаписать его при следующей инициализации.

**Решение:**

```bash
# Вариант 1: Отключить cloud-init networking
echo "network: {config: disabled}" | sudo tee /etc/cloud/cloud.cfg.d/99-disable-network-config.cfg

# Вариант 2: Создать конфиг с более высоким приоритетом
# /etc/netplan/99-manual.yaml (будет применён после 50-cloud-init.yaml)
```

Подробнее о Netplan -- в [networking-netplan.md](networking-netplan.md).

## Повторный запуск cloud-init

```bash
# Очистить данные предыдущего запуска
sudo cloud-init clean

# Повторная инициализация
sudo cloud-init init

# Полный перезапуск (включая user-data)
sudo cloud-init clean
sudo cloud-init init
sudo cloud-init modules --mode=config
sudo cloud-init modules --mode=final
```

**Когда нужно:**
- Смена cloud-провайдера
- Пересоздание экземпляра из того же образа
- Отладка user-data скриптов

## Примеры

### Пример 1: Ручная настройка сети на облачном сервере

**Вход:** Нужно сменить IP на облачном сервере, но cloud-init сбрасывает настройки после ребута

**Результат:**

```bash
# 1. Отключить cloud-init networking
echo "network: {config: disabled}" | sudo tee /etc/cloud/cloud.cfg.d/99-disable-network-config.cfg

# 2. Создать свой Netplan-конфиг
sudo nano /etc/netplan/99-manual.yaml

# 3. Применить
sudo netplan try
```

### Пример 2: cloud-init зависает при загрузке

**Вход:** Сервер долго загружается, cloud-init status показывает running

**Результат:**

```bash
# 1. Проверить на чём застрял
cloud-init status --long
cat /var/log/cloud-init.log | tail -50

# 2. Частая причина -- datasource недоступен
# (например, metadata-сервер облака не отвечает)

# 3. Если cloud-init больше не нужен
sudo touch /etc/cloud/cloud-init.disabled
sudo reboot
```
