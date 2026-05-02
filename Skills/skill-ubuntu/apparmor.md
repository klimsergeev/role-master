# AppArmor

## Назначение

Управление профилями AppArmor в Ubuntu -- диагностика блокировок, переключение режимов, создание профилей.

## Основы

AppArmor -- система мандатного контроля доступа (MAC), включённая по умолчанию в Ubuntu. Ограничивает программы набором разрешённых действий через профили.

### Ключевые концепции

| Понятие | Описание |
|---|---|
| **Профиль** | Набор правил для конкретной программы |
| **enforce** | Блокирует запрещённые действия |
| **complain** | Логирует, но не блокирует (для отладки) |
| **unconfined** | Профиль отключён, программа работает без ограничений |

### Расположение файлов

```
/etc/apparmor.d/              -- профили
/etc/apparmor.d/tunables/     -- переменные (пути, алиасы)
/etc/apparmor.d/abstractions/ -- общие правила (файлы, сеть)
```

## Диагностика

```bash
# Статус всех профилей
sudo aa-status

# Логи блокировок AppArmor
journalctl | grep apparmor

# Ядерные сообщения (альтернатива)
dmesg | grep apparmor

# Логи аудита (если auditd установлен)
grep apparmor /var/log/audit/audit.log
```

### Чтение логов блокировок

```
apparmor="DENIED" operation="open" profile="usr.sbin.mysqld" name="/data/mysql/" ...
```

| Поле | Значение |
|---|---|
| `apparmor="DENIED"` | Действие заблокировано |
| `operation` | Какое действие (open, read, write, exec) |
| `profile` | Какой профиль заблокировал |
| `name` | Какой путь был запрошен |

## Управление профилями

### Переключение режимов

```bash
# Переключить в enforce (блокирует)
sudo aa-enforce /etc/apparmor.d/<profile>

# Переключить в complain (только логирует)
sudo aa-complain /etc/apparmor.d/<profile>

# Отключить профиль
sudo aa-disable /etc/apparmor.d/<profile>

# Перезагрузить профиль после редактирования
sudo apparmor_parser -r /etc/apparmor.d/<profile>
```

### Установка утилит (если не установлены)

```bash
sudo apt install apparmor-utils
```

Пакет `apparmor-utils` предоставляет: `aa-status`, `aa-enforce`, `aa-complain`, `aa-disable`, `aa-genprof`, `aa-logprof`.

## Создание профилей

### Автоматическая генерация

```bash
# 1. Запустить генератор профиля
sudo aa-genprof /usr/bin/myapp

# 2. В другом терминале -- запустить приложение и выполнить типичные операции

# 3. Вернуться в aa-genprof, нажать S (scan) для анализа логов
# 4. Для каждого запроса: Allow / Deny / Glob / ...
# 5. Нажать F (finish) для сохранения
```

### Обновление профиля по логам

```bash
# После работы приложения в режиме complain
sudo aa-logprof
# Интерактивно одобрить/отклонить новые правила
```

## Типичные кейсы

### MySQL/MariaDB не может читать файлы

```bash
# Симптом: ошибка при LOAD DATA INFILE или доступе к /data
# Причина: профиль usr.sbin.mysqld ограничивает пути

# 1. Проверить что блокирует
dmesg | grep apparmor | grep mysql

# 2. Вариант A: добавить путь в профиль
# Отредактировать /etc/apparmor.d/usr.sbin.mysqld
# Добавить: /data/mysql/ r,
#           /data/mysql/** rwk,

# 3. Перезагрузить профиль
sudo apparmor_parser -r /etc/apparmor.d/usr.sbin.mysqld
```

### nginx не может писать логи в нестандартный путь

```bash
# 1. Перевести в complain для диагностики
sudo aa-complain /etc/apparmor.d/usr.sbin.nginx

# 2. Перезапустить nginx, проверить что заработало
sudo systemctl restart nginx

# 3. Обновить профиль по логам
sudo aa-logprof

# 4. Вернуть в enforce
sudo aa-enforce /etc/apparmor.d/usr.sbin.nginx
```

### Snap-пакеты и AppArmor

Snap автоматически создаёт и управляет профилями AppArmor для своих пакетов. Профили хранятся в `/var/lib/snapd/apparmor/profiles/`. Не редактировать вручную -- snap перезапишет при обновлении.

```bash
# Посмотреть snap-профили
sudo aa-status | grep snap
```

## Примеры

### Пример 1: Сервис не запускается из-за AppArmor

**Вход:** `systemctl start myservice` падает, в логах `apparmor="DENIED"`

**Результат:**

```bash
# 1. Узнать что блокирует
dmesg | grep apparmor | grep myservice

# 2. Временно переключить в complain
sudo aa-complain /etc/apparmor.d/usr.sbin.myservice

# 3. Перезапустить сервис -- должен заработать
sudo systemctl restart myservice

# 4. Обновить профиль по логам
sudo aa-logprof

# 5. Вернуть в enforce
sudo aa-enforce /etc/apparmor.d/usr.sbin.myservice
```

### Пример 2: Нужно полностью отключить AppArmor (не рекомендуется)

**Вход:** Для отладки нужно временно отключить AppArmor

**Результат:**

```bash
# Отключить AppArmor (до ребута)
sudo systemctl stop apparmor

# Отключить AppArmor (навсегда)
sudo systemctl disable apparmor

# Через параметры ядра (GRUB)
# В /etc/default/grub добавить в GRUB_CMDLINE_LINUX:
# apparmor=0
# Затем: sudo update-grub && sudo reboot
```

Не рекомендуется на проде. Лучше отключить конкретный профиль через `aa-disable`.
