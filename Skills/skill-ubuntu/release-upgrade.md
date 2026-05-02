# Release Upgrade

## Назначение

Обновление Ubuntu до новой версии через do-release-upgrade -- подготовка, выполнение, типичные проблемы.

## Подготовка

### Чеклист перед обновлением

```bash
# 1. Бэкап!
tar -czvf /root/backup-$(date +%Y%m%d).tar.gz /etc /var/lib
# Или снапшот VM/облачного инстанса (лучший вариант)

# 2. Проверить место на дисках
df -h /
df -h /boot

# 3. Проверить и убрать held packages
apt-mark showhold
# Если есть -- разморозить:
sudo apt-mark unhold <pkg>

# 4. Отключить/удалить сторонние PPA
ls /etc/apt/sources.list.d/
# Удалить или закомментировать сторонние PPA

# 5. Обновить текущую систему полностью
sudo apt update
sudo apt upgrade
sudo apt dist-upgrade

# 6. Удалить старые ядра (освободить /boot)
sudo apt autoremove --purge
```

### Требования к /boot

Для обновления нужно минимум 500MB свободного места на `/boot`. Если меньше -- почистить ядра. Подробнее -- в [kernel-management.md](kernel-management.md).

## Выполнение

### Стандартное обновление (LTS -> LTS)

```bash
# ВАЖНО: запускать в screen/tmux на случай обрыва SSH!
screen -S upgrade

# Обновление
sudo do-release-upgrade
```

`do-release-upgrade` автоматически:
- Обновляет sources.list на новый релиз
- Скачивает и устанавливает пакеты
- Спрашивает о конфигах (сохранить свой / заменить на новый)
- Предлагает перезагрузку

### Обновление на development-версию

```bash
# Только для тестирования! Не для прода!
sudo do-release-upgrade -d
```

### Зачем screen/tmux

Если SSH-сессия оборвётся во время обновления:

```bash
# Подключиться заново и восстановить сессию
screen -r upgrade
```

Без screen/tmux обрыв SSH = прерванное обновление = сломанная система.

## После обновления

```bash
# 1. Проверить версию
lsb_release -a

# 2. Проверить сервисы
systemctl --failed

# 3. Вернуть PPA (проверить совместимость с новой версией!)
# Старые PPA могут не поддерживать новый релиз

# 4. Проверить конфиги
# Файлы *.dpkg-dist -- новые конфиги, которые не заменили ваши
find /etc -name "*.dpkg-dist" 2>/dev/null

# 5. Перезагрузка
sudo reboot
```

## Типичные проблемы

### Held packages блокируют обновление

```bash
# Симптом: do-release-upgrade отказывается запускаться
# Решение:
apt-mark showhold
sudo apt-mark unhold <pkg>

# Повторить обновление
sudo do-release-upgrade
```

### Сторонние PPA с конфликтующими пакетами

```bash
# Симптом: ошибки зависимостей при обновлении
# Решение: удалить PPA и установить пакет из официальных репозиториев

# 1. Удалить PPA
sudo add-apt-repository --remove ppa:user/ppa-name

# 2. Переустановить пакет из официального репо
sudo apt install --reinstall <pkg>
```

### Обрыв SSH во время обновления

Если обновление запущено без screen/tmux:

```bash
# 1. Подключиться снова
# 2. Проверить, идёт ли ещё процесс
ps aux | grep do-release-upgrade

# 3. Если процесс завершился с ошибкой
sudo dpkg --configure -a
sudo apt --fix-broken install
sudo apt dist-upgrade
```

### Конфиги перезаписаны

```bash
# Найти все файлы .dpkg-dist (новые конфиги, которые не были применены)
find /etc -name "*.dpkg-dist" 2>/dev/null

# Найти все файлы .dpkg-old (ваши старые конфиги, которые были заменены)
find /etc -name "*.dpkg-old" 2>/dev/null

# Сравнить и решить
diff /etc/nginx/nginx.conf /etc/nginx/nginx.conf.dpkg-dist
```

## Примеры

### Пример 1: Обновление Ubuntu 22.04 -> 24.04

**Вход:** Прод-сервер на 22.04 LTS, нужно обновить до 24.04 LTS

**Результат:**

```bash
# 1. Бэкап (снапшот VM)
# 2. Подготовка
sudo apt update && sudo apt upgrade && sudo apt dist-upgrade
sudo apt autoremove --purge
apt-mark showhold
ls /etc/apt/sources.list.d/  # удалить PPA
df -h /boot                  # проверить место

# 3. Обновление
screen -S upgrade
sudo do-release-upgrade

# 4. После
lsb_release -a
systemctl --failed
sudo reboot
```

### Пример 2: /boot заполнен перед обновлением

**Вход:** `do-release-upgrade` не запускается, `/boot` заполнен

**Результат:**

```bash
# 1. Проверить место
df -h /boot

# 2. Удалить старые ядра
uname -r  # текущее -- не удалять!
dpkg --list | grep linux-image
sudo apt autoremove --purge

# 3. Если apt не работает из-за /boot
sudo dpkg --purge linux-image-<old-version>-generic
sudo apt -f install
sudo apt autoremove --purge
sudo update-grub

# 4. Повторить обновление
sudo do-release-upgrade
```

Подробнее о чистке ядер -- в [kernel-management.md](kernel-management.md).
