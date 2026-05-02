# Kernel Management

## Назначение

Управление ядрами Linux в Ubuntu -- просмотр установленных, удаление старых, обновление загрузчика, HWE-ядра.

## Просмотр установленных ядер

```bash
# Все установленные ядра
dpkg --list | grep linux-image

# Текущее ядро (его НЕ удалять!)
uname -r

# Файлы ядер в /boot
ls -lh /boot/vmlinuz-*

# Место на /boot
df -h /boot
```

## Удаление старых ядер

### Автоматическое (рекомендуется)

```bash
# Удалить неиспользуемые ядра и заголовки
sudo apt autoremove --purge

# После удаления -- обновить GRUB
sudo update-grub
```

### Ручное

```bash
# 1. Определить текущее ядро
uname -r
# Пример вывода: 6.8.0-45-generic

# 2. Посмотреть все установленные
dpkg --list | grep linux-image

# 3. Удалить конкретную старую версию
sudo apt remove linux-image-6.8.0-40-generic
sudo apt purge linux-headers-6.8.0-40-generic

# 4. Обновить GRUB
sudo update-grub
```

**НИКОГДА** не удаляй ядро, которое показывает `uname -r`.

## Проблема: /boot заполнен

Если `/boot` заполнен и `apt` не работает:

```bash
# 1. Проверить место
df -h /boot

# 2. Определить текущее ядро
uname -r

# 3. Посмотреть что занимает место
ls -lh /boot/

# 4. Ручное удаление через dpkg (когда apt сломан)
sudo dpkg --purge linux-image-<old-version>-generic

# 5. После освобождения места -- починить apt
sudo apt -f install

# 6. Удалить оставшиеся старые ядра
sudo apt autoremove --purge

# 7. Обновить GRUB
sudo update-grub
```

## HWE-ядра (Hardware Enablement)

HWE-ядра -- бэкпортированные новые ядра для LTS-релизов. Нужны для поддержки нового оборудования.

```bash
# Установить HWE-ядро для Ubuntu 22.04
sudo apt install linux-generic-hwe-22.04

# Для Ubuntu 24.04
sudo apt install linux-generic-hwe-24.04
```

### GA vs HWE

| Тип | Описание | Когда использовать |
|---|---|---|
| GA (General Availability) | Ядро, с которым вышел релиз | Стабильность важнее нового оборудования |
| HWE | Более новое ядро из следующего релиза | Новое оборудование, свежие драйверы |

HWE-ядро автоматически обновляется до следующей HWE-версии в рамках LTS.

## Примеры

### Пример 1: Штатная чистка ядер

**Вход:** Сервер работает полгода, накопились старые ядра

**Результат:**

```bash
# 1. Текущее ядро
uname -r
# 6.8.0-45-generic

# 2. Список ядер
dpkg --list | grep linux-image
# ii  linux-image-6.8.0-40-generic  ...
# ii  linux-image-6.8.0-42-generic  ...
# ii  linux-image-6.8.0-45-generic  ...  <-- текущее

# 3. Автоудаление
sudo apt autoremove --purge

# 4. GRUB
sudo update-grub
```

### Пример 2: /boot заполнен на 100%, apt не работает

**Вход:** `apt upgrade` падает с ошибкой "No space left on device" в /boot

**Результат:**

```bash
# 1. Определить текущее ядро
uname -r

# 2. Удалить самое старое через dpkg напрямую
sudo dpkg --purge linux-image-6.8.0-35-generic

# 3. Проверить место
df -h /boot

# 4. Починить apt
sudo apt -f install
sudo apt autoremove --purge
sudo update-grub
```
