# API Link Manager

## Назначение

Описание API Link Manager МТС Аналитики для создания и управления универсальными короткими ссылками с перенаправлением.

## Авторизация

Отдельная заявка на `analytics.support@mts.ru` с темой "Доступ к API Link Manager".

Спецификация API предоставляется в виде загружаемого JSON-файла (Swagger/OpenAPI не опубликован).

## CRUD-операции

| Метод | Назначение |
|-------|-----------|
| `GET` | Аналитика потока, список шаблонов/ссылок |
| `POST` | Создание шаблонов и ссылок |
| `PUT` | Обновление шаблонов и ссылок |
| `DELETE` | Удаление шаблонов и ссылок |

## Объекты API

### Шаблон (Template)

Шаблон определяет базовую конфигурацию для группы ссылок.

| Поле | Обязателен | Описание |
|------|------------|----------|
| `flowId` | Да | UUID потока данных |
| `name` | Да | Название шаблона |
| `alias` | Нет | Псевдоним (автогенерация если не указан) |
| `subdomain` | Да | Поддомен для коротких ссылок |
| `noAppLongLinks` | Нет | Ссылка для пользователей без приложения |
| `appLongLinks` | Нет | Ссылка для пользователей с приложением |
| `apps` | Нет | Данные подписи для iOS/Android |

### Ссылка (Link)

Ссылка создаётся на основе шаблона.

| Поле | Обязателен | Описание |
|------|------------|----------|
| `flowId` | Да | UUID потока данных |
| `templateId` | Да | ID шаблона |
| `name` | Да | Название ссылки |
| `alias` | Нет | Псевдоним (автогенерация если не указан) |
| `mediaSource` | Да | Источник трафика (для атрибуции) |

## Формат URL

Готовая короткая ссылка:

```
https://<subdomain>.<domain>/<alias>
```

## Событие при открытии

При переходе по короткой ссылке и открытии приложения отправляется событие `shortlink` с параметрами:

| Параметр | Описание |
|----------|----------|
| `maClickId` | ID клика |
| `maLinkId` | ID ссылки |

## Пример: создание шаблона и ссылки

### Шаг 1: Создать шаблон

```bash
curl --request POST \
  --url <link-manager-api-url>/templates \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer {{TOKEN}}' \
  --data '{
    "flowId": "{{FLOW_ID}}",
    "name": "Campaign Q4",
    "subdomain": "go",
    "noAppLongLinks": "https://example.com/promo",
    "appLongLinks": "https://example.com/app-promo"
  }'
```

### Шаг 2: Создать ссылку

```bash
curl --request POST \
  --url <link-manager-api-url>/links \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer {{TOKEN}}' \
  --data '{
    "flowId": "{{FLOW_ID}}",
    "templateId": "<template-id-from-step-1>",
    "name": "Email campaign October",
    "mediaSource": "email"
  }'
```

**Результат:** ссылка вида `https://go.<domain>/<auto-alias>`.

## Документация

Полная спецификация API доступна по ссылке из официальной документации:
https://a.mts.ru/support/flow-management/API/link/
