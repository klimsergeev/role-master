# Package Management

## Назначение

Справочник управления пакетами в Ubuntu/Debian: apt, dpkg, snap, PPA, типичные проблемы.

## apt -- основные команды

### Обновление и установка

```bash
# Обновить индекс пакетов
sudo apt update

# Обновить все пакеты (безопасное, не удаляет)
sudo apt upgrade

# Полное обновление (может удалять/добавлять пакеты)
sudo apt full-upgrade

# Установить пакет
sudo apt install <pkg>

# Установить конкретную версию
sudo apt install <pkg>=<version>

# Удалить пакет (оставить конфиги)
sudo apt remove <pkg>

# Удалить пакет с конфигами
sudo apt purge <pkg>

# Удалить неиспользуемые зависимости
sudo apt autoremove
```

### Поиск и информация

```bash
# Поиск пакета
apt search <keyword>

# Информация о пакете
apt show <pkg>

# Список установленных пакетов
apt list --installed

# Проверка версий и источников
apt-cache policy <pkg>
```

### Заморозка версий

```bash
# Заморозить версию (не обновлять)
sudo apt-mark hold <pkg>

# Разморозить
sudo apt-mark unhold <pkg>

# Список замороженных
apt-mark showhold
```

### Работа с зависимостями

```bash
# Починить сломанные зависимости
sudo apt --fix-broken install

# Починить прерванную установку dpkg
sudo dpkg --configure -a

# Затем повторить
sudo apt --fix-broken install
```

## dpkg -- низкоуровневое управление

```bash
# Установить .deb файл
sudo dpkg -i <file.deb>

# Удалить пакет
sudo dpkg -r <pkg>

# Удалить с конфигами
sudo dpkg --purge <pkg>

# Список всех установленных
dpkg -l

# Список файлов пакета
dpkg -L <pkg>

# Какому пакету принадлежит файл
dpkg -S <file>

# Починить прерванную установку
sudo dpkg --configure -a
```

## snap

### Основные команды

```bash
# Установить
sudo snap install <pkg>

# Удалить
sudo snap remove <pkg>

# Обновить все snap-пакеты
sudo snap refresh

# Обновить конкретный
sudo snap refresh <pkg>

# Список установленных
snap list

# Информация о пакете
snap info <pkg>
```

### Каналы

```bash
# Установить из конкретного канала
sudo snap install <pkg> --channel=edge
sudo snap install <pkg> --channel=beta
sudo snap install <pkg> --channel=candidate

# Переключить канал
sudo snap refresh <pkg> --channel=stable
```

### snap vs apt -- когда что

| Критерий | apt | snap |
|---|---|---|
| Обновления | Вручную / unattended-upgrades | Автоматические |
| Изоляция | Нет (системные библиотеки) | Да (песочница) |
| Размер | Меньше | Больше (bundled deps) |
| Скорость запуска | Быстрее | Медленнее (первый запуск) |
| Серверы (прод) | Предпочтительно | Для специфичных пакетов |
| Десктоп | Зависит от пакета | Часто удобнее |

## PPA (Personal Package Archive)

```bash
# Добавить PPA
sudo add-apt-repository ppa:user/ppa-name
sudo apt update

# Удалить PPA
sudo add-apt-repository --remove ppa:user/ppa-name
sudo apt update

# Файлы PPA хранятся в
ls /etc/apt/sources.list.d/
```

**Безопасность PPA:**
- ВСЕГДА проверяй PPA перед добавлением (кто автор, сколько пользователей)
- PPA -- сторонний источник, пакеты не проверены Canonical
- Перед обновлением релиза Ubuntu -- отключить/удалить сторонние PPA

## Типичные проблемы

### Lock-файл занят

```bash
# Ошибка: Could not get lock /var/lib/dpkg/lock-frontend

# 1. Проверить, не работает ли apt/dpkg
ps aux | grep -E 'apt|dpkg'

# 2. Если процесс есть -- подождать
# 3. Если процесса нет -- удалить lock-файл
sudo rm /var/lib/dpkg/lock-frontend
sudo rm /var/lib/dpkg/lock
sudo dpkg --configure -a
```

**НИКОГДА** не удаляй lock-файл, если apt/dpkg ещё работает.

### Hash Sum mismatch

```bash
# Ошибка: Hash Sum mismatch
sudo apt clean
sudo apt update
```

Если повторяется -- проблема с зеркалом или прокси.

### Broken packages

```bash
# Ошибка: You have held broken packages
sudo apt --fix-broken install
sudo dpkg --configure -a
sudo apt update
sudo apt upgrade
```
