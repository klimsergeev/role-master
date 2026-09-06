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
version: 2.1.1
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

> Читай файлы под задачу, а не скилл целиком. Колонка «Обязательно» — открыть до начала работы. Колонка «Читать, если» — открыть, когда условие выполнено; условие проверяется по задаче, а не по желанию. Файлы с пометкой `(справочник)` устроены как таблицы для точечного поиска — в них допустим поиск нужной строки вместо чтения целиком.

| Задача | Обязательно | Читать, если |
|---|---|---|
| Установить/удалить пакет, PPA, snap | [package-management.md](package-management.md) (справочник) | если ставится пакет ядра (`linux-image-*`, `linux-generic-hwe-*`): [kernel-management.md](kernel-management.md) |
| Настроить файрвол (ufw) | [firewall-and-security.md](firewall-and-security.md) | — |
| Автообновления безопасности | [firewall-and-security.md](firewall-and-security.md) | если `apt-mark showhold` непуст или в `/etc/apt/sources.list.d/` есть сторонние PPA: [package-management.md](package-management.md) (справочник); если включён `Automatic-Reboot` и автообновления ядра заполняют `/boot`: [kernel-management.md](kernel-management.md) |
| Удалить старые ядра | [kernel-management.md](kernel-management.md) | если apt сломан — «No space left on device», прерванная установка dpkg, занятый lock-файл: [package-management.md](package-management.md) (справочник) |
| Настроить сеть (Netplan) | [networking-netplan.md](networking-netplan.md) | если в `/etc/netplan/` есть `50-cloud-init.yaml`: [cloud-init.md](cloud-init.md); если в конфиге задаются `nameservers`: [dns-systemd-resolved.md](dns-systemd-resolved.md) (справочник) |
| DNS не работает / systemd-resolved | [dns-systemd-resolved.md](dns-systemd-resolved.md) (справочник) | если `resolvectl status` не показывает DNS-серверов на интерфейсе: [networking-netplan.md](networking-netplan.md) |
| AppArmor блокирует сервис | [apparmor.md](apparmor.md) (справочник) | — |
| Отключить/настроить cloud-init | [cloud-init.md](cloud-init.md) | если отключается сетевая часть cloud-init или сеть после этого поднимается вручную: [networking-netplan.md](networking-netplan.md) |
| Обновить Ubuntu до новой версии | [release-upgrade.md](release-upgrade.md) | если на `/boot` свободно меньше 500 МБ (`df -h /boot`): [kernel-management.md](kernel-management.md); если `apt-mark showhold` непуст или подключены сторонние PPA: [package-management.md](package-management.md) (справочник) |
| Hardening Ubuntu-сервера | [firewall-and-security.md](firewall-and-security.md), [apparmor.md](apparmor.md) (справочник) | если в системе есть сторонние PPA или требуется заморозить версии пакетов: [package-management.md](package-management.md) (справочник) |

## Рабочий процесс

### Шаг 1: Определить тип задачи

По запросу пользователя определи категорию: пакеты, сеть, безопасность, ядра, обновление релиза. Используй таблицу маршрутизации для выбора файлов.

### Шаг 2: Загрузить нужные файлы

Открой всё, что стоит в колонке «Обязательно» для твоей строки таблицы, -- до первой команды. Затем пройди колонку «Читать, если»: условие там проверяется по фактам задачи и системы -- что лежит в `/etc/netplan/`, сколько свободно на `/boot`, непуст ли `apt-mark showhold`. Условие выполнено -- файл открывается, даже если задача выглядит односоставной. Так задача про сеть, у которой в `/etc/netplan/` есть `50-cloud-init.yaml`, тянет за собой [cloud-init.md](cloud-init.md). Файлы с пометкой `(справочник)` смотри точечным поиском подходящей строки, а не целиком.

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