# Networking -- Netplan

## Назначение

Настройка сети через Netplan в Ubuntu -- YAML-конфиги, рендереры, типовые конфигурации, взаимодействие с cloud-init.

## Основы Netplan

Netplan -- декларативная настройка сети в Ubuntu (с 17.10). Конфиги в YAML, применяются через бэкенд (renderer).

### Файлы конфигурации

```
/etc/netplan/*.yaml
```

Файлы применяются в алфавитном порядке. Более поздний файл перезаписывает настройки более раннего.

### Основные команды

```bash
# Применить конфигурацию
sudo netplan apply

# Применить с откатом через 120 сек (безопасно для удалённых серверов)
sudo netplan try

# Генерация конфигов бэкенда без применения
sudo netplan generate

# Получить текущую конфигурацию
sudo netplan get
```

**ВСЕГДА** используй `netplan try` на удалённых серверах -- если конфиг неверный, откатится автоматически.

## Рендереры

| Рендерер | Назначение | Когда используется |
|---|---|---|
| `networkd` (systemd-networkd) | Серверы | По умолчанию на серверных установках |
| `NetworkManager` | Десктоп | По умолчанию на десктопных установках |

Указание в YAML:

```yaml
network:
  version: 2
  renderer: networkd
```

## Типовые конфигурации

### Статический IP

```yaml
# /etc/netplan/01-static.yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    eth0:
      addresses:
        - 192.168.1.100/24
      routes:
        - to: default
          via: 192.168.1.1
      nameservers:
        addresses:
          - 8.8.8.8
          - 1.1.1.1
```

### DHCP

```yaml
# /etc/netplan/01-dhcp.yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    eth0:
      dhcp4: true
```

### VLAN

```yaml
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: false
  vlans:
    vlan100:
      id: 100
      link: eth0
      addresses:
        - 10.10.100.10/24
```

### Bonding

```yaml
network:
  version: 2
  bonds:
    bond0:
      interfaces:
        - eth0
        - eth1
      parameters:
        mode: active-backup
        primary: eth0
      addresses:
        - 192.168.1.100/24
      routes:
        - to: default
          via: 192.168.1.1
```

### Bridge

```yaml
network:
  version: 2
  bridges:
    br0:
      interfaces:
        - eth0
      addresses:
        - 192.168.1.100/24
      routes:
        - to: default
          via: 192.168.1.1
      parameters:
        stp: false
```

## Взаимодействие с cloud-init

cloud-init генерирует Netplan-конфиг при первом запуске:

```
/etc/netplan/50-cloud-init.yaml
```

Чтобы ручной конфиг не перезаписывался cloud-init:
1. Отключить cloud-init networking (см. [cloud-init.md](cloud-init.md))
2. Или создать конфиг с более высоким приоритетом (например, `99-manual.yaml`)

## Типичные ошибки

### Отступы YAML

```yaml
# НЕПРАВИЛЬНО (табы)
network:
	version: 2

# ПРАВИЛЬНО (пробелы, 2 или 4)
network:
  version: 2
```

Netplan использует YAML -- только пробелы, не табы.

### Забытый netplan apply

После редактирования YAML файл нужно применить:

```bash
sudo netplan apply
# или безопасно:
sudo netplan try
```

### Конфликт cloud-init и ручного конфига

Если после reboot сетевые настройки сбрасываются -- cloud-init перезаписывает конфиг. Решение:

```bash
# Создать файл для отключения cloud-init networking
sudo mkdir -p /etc/cloud/cloud.cfg.d
echo "network: {config: disabled}" | sudo tee /etc/cloud/cloud.cfg.d/99-disable-network-config.cfg
```

Подробнее -- в [cloud-init.md](cloud-init.md).

## Примеры

### Пример 1: Переключить сервер с DHCP на статический IP

**Вход:** Сервер получает IP по DHCP, нужно зафиксировать адрес

**Результат:**

```bash
# 1. Посмотреть текущий конфиг
cat /etc/netplan/*.yaml

# 2. Бэкап
sudo cp /etc/netplan/01-netcfg.yaml /etc/netplan/01-netcfg.yaml.bak

# 3. Отредактировать -- заменить dhcp4: true на статику
sudo nano /etc/netplan/01-netcfg.yaml

# 4. Применить с откатом
sudo netplan try
```

### Пример 2: После ребута пропала сеть на облачном сервере

**Вход:** После ручной правки Netplan и перезагрузки сеть не работает

**Результат:** Вероятно, cloud-init перезаписал конфиг. Проверить:

```bash
# Через VNC/консоль провайдера:
cat /etc/netplan/50-cloud-init.yaml
ls /etc/cloud/cloud.cfg.d/

# Если cloud-init перезаписывает -- отключить его networking
echo "network: {config: disabled}" | sudo tee /etc/cloud/cloud.cfg.d/99-disable-network-config.cfg
sudo netplan apply
```
