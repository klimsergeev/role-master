---
name: skill-ubuntu
description: >
  Справочник Ubuntu/Debian-специфичных процедур — apt, dpkg, snap, PPA, ufw,
  unattended-upgrades, управление ядрами, Netplan, systemd-resolved, AppArmor,
  cloud-init, do-release-upgrade. Не покрывает SSH (он универсален) и не покрывает
  деплой приложений (это задача роли).
when_to_use: >
  Когда задача связана с Ubuntu или Debian — установка/удаление пакетов через apt,
  настройка ufw, удаление старых ядер, PPA, snap, автообновления, Netplan, DNS через
  systemd-resolved, профили AppArmor, cloud-init, обновление релиза Ubuntu.
version: 1.0.0
created: 2026-05-02
---

# Ubuntu Reference

## Назначение

Справочный скилл с Ubuntu/Debian-специфичными процедурами: управление пакетами, файрвол, ядра, сеть, DNS, AppArmor, cloud-init, обновление релиза. Подключается к агенту для решения задач, требующих знания Ubuntu-специфики.

## Принципы

1. **Сначала диагностика** — не применяй исправления, пока не собрал информацию о системе (версия Ubuntu, текущие настройки).
2. **Бэкап перед изменением** — при редактировании конфигов (Netplan, resolved, AppArmor) сначала `cp file file.bak`.
3. **Минимальные изменения** — не перестраивай всю подсистему, если можно поправить один конфиг.

## Таблица маршрутизации

> Читай только те файлы, которые нужны под задачу. Не загружай все сразу.

| Задача | Минимум | Добавить при необходимости |
|---|---|---|
| Установить/удалить пакет, PPA, snap | [package-management.md](package-management.md) | -- |
| Настроить файрвол (ufw) | [firewall-and-security.md](firewall-and-security.md) | -- |
| Автообновления безопасности | [firewall-and-security.md](firewall-and-security.md) | [package-management.md](package-management.md) |
| Удалить старые ядра | [kernel-management.md](kernel-management.md) | -- |
| Настроить сеть (Netplan) | [networking-netplan.md](networking-netplan.md) | [cloud-init.md](cloud-init.md) |
| DNS не работает / systemd-resolved | [dns-systemd-resolved.md](dns-systemd-resolved.md) | [networking-netplan.md](networking-netplan.md) |
| AppArmor блокирует сервис | [apparmor.md](apparmor.md) | -- |
| Отключить/настроить cloud-init | [cloud-init.md](cloud-init.md) | [networking-netplan.md](networking-netplan.md) |
| Обновить Ubuntu до новой версии | [release-upgrade.md](release-upgrade.md) | [kernel-management.md](kernel-management.md), [package-management.md](package-management.md) |
| Hardening Ubuntu-сервера | [firewall-and-security.md](firewall-and-security.md) | [apparmor.md](apparmor.md), [package-management.md](package-management.md) |

## Рабочий процесс

### Шаг 1: Определить тип задачи

По запросу пользователя определи категорию: пакеты, сеть, безопасность, ядра, обновление релиза. Используй таблицу маршрутизации для выбора файлов.

### Шаг 2: Загрузить нужные файлы

Загрузи минимально необходимые файлы из таблицы. Если задача затрагивает несколько подсистем (например, сеть + cloud-init) -- загрузи дополнительные.

### Шаг 3: Уточнить контекст

Перед выполнением проверь:
- Версия Ubuntu (`lsb_release -a`)
- Среда: bare metal / VM / cloud (влияет на cloud-init, Netplan)
- Прод или тест (влияет на осторожность)

### Шаг 4: Применить процедуру

Используй загруженные справочники. Давай команды с комментариями. Предупреждай о рисках.

## Что НЕ делать

- Не загружать все файлы сразу -- только те, что нужны под задачу
- Не настраивать SSH hardening (sshd_config) -- это универсальная задача, не Ubuntu-специфичная
- Не деплоить приложения -- это задача роли разработчика, не справочника Ubuntu
- Не давать команды без проверки версии Ubuntu -- между 22.04 и 24.04 есть различия
- Не удалять текущее ядро (`uname -r`) при чистке старых ядер

## Примеры

### Пример 1: Установка пакета из PPA

**Запрос:** Установи последнюю версию nginx из официального PPA

**Маршрут:** [package-management.md](package-management.md)

**Результат:** Команды добавления PPA, обновления индекса, установки пакета. Предупреждение о проверке PPA перед добавлением.

### Пример 2: DNS не работает после перезагрузки

**Запрос:** После ребута сервер не резолвит домены

**Маршрут:** [dns-systemd-resolved.md](dns-systemd-resolved.md), затем [networking-netplan.md](networking-netplan.md)

**Результат:** Диагностика через `resolvectl status`, проверка симлинка `/etc/resolv.conf`, проверка Netplan-конфига на наличие DNS-серверов.