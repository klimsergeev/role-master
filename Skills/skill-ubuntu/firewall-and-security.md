# Firewall and Security

## Назначение

Настройка файрвола ufw и автообновлений безопасности (unattended-upgrades) в Ubuntu.

## ufw -- Uncomplicated Firewall

### Включение

```bash
# ВАЖНО: сначала разрешить SSH, чтобы не залочиться!
sudo ufw allow 22/tcp
sudo ufw enable

# Проверить статус
sudo ufw status verbose
```

### Основные команды

```bash
# Разрешить порт
sudo ufw allow <port>/<proto>
# Примеры:
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp

# Разрешить с конкретного IP
sudo ufw allow from 192.168.1.100

# Разрешить с подсети на конкретный порт
sudo ufw allow from 10.0.0.0/24 to any port 5432

# Запретить порт
sudo ufw deny 3306/tcp

# Удалить правило по номеру
sudo ufw status numbered
sudo ufw delete <rule-number>

# Сбросить все правила
sudo ufw reset

# Включить/выключить логирование
sudo ufw logging on
sudo ufw logging off
```

### Порядок правил

ufw обрабатывает правила сверху вниз. Для whitelist-подхода:

```bash
# 1. Политика по умолчанию -- запретить входящие
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 2. Разрешить только нужное
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Файлы конфигурации

| Файл | Описание |
|---|---|
| `/etc/default/ufw` | Глобальные настройки (IPv6, политика по умолчанию) |
| `/etc/ufw/before.rules` | Правила до пользовательских (loopback, ICMP) |
| `/etc/ufw/after.rules` | Правила после пользовательских |
| `/etc/ufw/user.rules` | Пользовательские правила (генерируются ufw) |

### ufw и iptables/nftables

ufw -- фронтенд. Под капотом:
- Ubuntu 20.04 и ранее -- iptables
- Ubuntu 22.04+ -- nftables (через iptables-nft)

Если нужны сложные правила (NAT, port forwarding) -- редактировать `/etc/ufw/before.rules` или использовать iptables/nftables напрямую.

## unattended-upgrades

### Установка и включение

```bash
# Установить (обычно уже есть)
sudo apt install unattended-upgrades

# Включить интерактивно
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### Конфигурация

**Файл `/etc/apt/apt.conf.d/50unattended-upgrades`:**

```
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}";
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};

// Email-уведомления
Unattended-Upgrade::Mail "admin@example.com";
Unattended-Upgrade::MailReport "on-change";

// Автоматическая перезагрузка (если требуется ядром)
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "03:00";

// Удалять неиспользуемые зависимости
Unattended-Upgrade::Remove-Unused-Dependencies "true";
```

**Файл `/etc/apt/apt.conf.d/20auto-upgrades`:**

```
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
```

### Проверка

```bash
# Тестовый запуск (ничего не устанавливает)
sudo unattended-upgrade --dry-run --debug

# Логи
cat /var/log/unattended-upgrades/unattended-upgrades.log

# Статус таймера
systemctl status apt-daily-upgrade.timer
```

## Что НЕ входит в этот файл

- **SSH hardening** (sshd_config) -- универсален для всех дистрибутивов, остаётся в роли devops
- **fail2ban** -- устанавливается через apt, но настройка не Ubuntu-специфична
- **iptables/nftables напрямую** -- универсальные инструменты, не Ubuntu-специфичные

## Примеры

### Пример 1: Базовая настройка файрвола на новом сервере

**Вход:** Новый Ubuntu-сервер, нужно настроить файрвол

**Результат:**

```bash
# 1. Разрешить SSH
sudo ufw allow 22/tcp

# 2. Включить ufw
sudo ufw enable

# 3. Разрешить нужные порты (пример для веб-сервера)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 4. Проверить
sudo ufw status numbered
```

### Пример 2: unattended-upgrades не работает

**Вход:** Автообновления включены, но пакеты не обновляются

**Результат:**

```bash
# 1. Проверить конфиг
cat /etc/apt/apt.conf.d/20auto-upgrades

# 2. Проверить что разрешено обновлять
grep -v "^//" /etc/apt/apt.conf.d/50unattended-upgrades | grep -v "^$"

# 3. Тестовый запуск
sudo unattended-upgrade --dry-run --debug 2>&1 | tail -20

# 4. Проверить таймер
systemctl status apt-daily-upgrade.timer
```
