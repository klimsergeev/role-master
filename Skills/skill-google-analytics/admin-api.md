# Admin API

## Назначение

Справочник GA4 Admin API -- ресурсы, методы, управление accounts, properties, dataStreams, customDimensions, keyEvents, интеграции.

## Сервисный endpoint

```
https://analyticsadmin.googleapis.com
```

## Ресурсы v1beta (стабильные)

### Аккаунты и сводки

| Ресурс | Методы |
|---|---|
| `accountSummaries` | list |
| `accounts` | list, get, delete, patch, provisionAccountTicket, searchChangeHistoryEvents, runAccessReport, getDataSharingSettings |

### Properties

| Метод | Описание |
|---|---|
| `list` | Список свойств аккаунта |
| `get` | Получить свойство |
| `create` | Создать свойство |
| `delete` | Удалить свойство (перемещается в корзину на 35 дней) |
| `patch` | Обновить свойство |
| `acknowledgeUserDataCollection` | Подтвердить сбор данных пользователей |
| `getDataRetentionSettings` | Получить настройки хранения данных |
| `updateDataRetentionSettings` | Обновить настройки хранения |
| `runAccessReport` | Отчёт о доступе к данным |

### Data Streams

| Ресурс | Методы |
|---|---|
| `properties.dataStreams` | list, get, create, delete, patch |
| `properties.dataStreams.measurementProtocolSecrets` | list, get, create, delete, patch |

`measurementProtocolSecrets` -- API-секреты, необходимые для Measurement Protocol. Получать через `list` для конкретного dataStream.

### Custom Definitions

| Ресурс | Методы |
|---|---|
| `properties.customDimensions` | list, get, create, patch, archive |
| `properties.customMetrics` | list, get, create, patch, archive |

Примечание: `archive` вместо `delete` -- заархивированное определение нельзя восстановить, но имя освобождается.

### Key Events

| Ресурс | Методы |
|---|---|
| `properties.keyEvents` | list, get, create, delete, patch |
| `properties.conversionEvents` | list, get, create, delete, patch |

**conversionEvents -- deprecated.** Используй `keyEvents`.

### Интеграции

| Ресурс | Методы |
|---|---|
| `properties.firebaseLinks` | list, create, delete |
| `properties.googleAdsLinks` | list, create, delete, patch |

## Ключевые ресурсы v1alpha

### Аудитории

| Ресурс | Методы |
|---|---|
| `properties.audiences` | list, get, create, patch, archive |

Аудитории -- группы пользователей по условиям (поведение, атрибуты). Используются для таргетинга и аналитики.

### BigQuery Links

| Ресурс | Методы |
|---|---|
| `properties.bigQueryLinks` | list, get, create, delete, patch |

Управление связью GA4 property с BigQuery проектом. Альтернатива настройке через GA4 Admin UI.

### Channel Groups

| Ресурс | Методы |
|---|---|
| `properties.channelGroups` | list, get, create, delete, patch |

Пользовательские группы каналов трафика (дополнение к defaultChannelGroup).

### Access Bindings

| Ресурс | Методы |
|---|---|
| `accounts.accessBindings` | list, get, create, delete, patch, batchCreate/Delete/Get/Update |
| `properties.accessBindings` | list, get, create, delete, patch, batchCreate/Delete/Get/Update |

Управление доступом пользователей к аккаунтам и свойствам.

### Прочие v1alpha ресурсы

Также доступны: calculatedMetrics, expandedDataSets, displayVideo360AdvertiserLinks, searchAds360Links, adSenseLinks, rollupPropertySourceLinks, subpropertyEventFilters, reportingDataAnnotations, eventCreateRules, eventEditRules. Подробности -- в [документации Admin API](https://developers.google.com/analytics/devguides/config/admin/v1/rest).

## Дополнительные методы properties (v1alpha)

| Метод | Описание |
|---|---|
| `getAttributionSettings` / `updateAttributionSettings` | Настройки атрибуции |
| `getGoogleSignalsSettings` / `updateGoogleSignalsSettings` | Настройки Google Signals |
| `getReportingIdentitySettings` | Настройки идентификации для отчётов |
| `createRollupProperty` | Создание rollup-свойства |
| `provisionSubproperty` | Создание подсвойства |
| `submitUserDeletion` | Запрос удаления данных пользователя |

## Примеры

### Создать property

```json
POST https://analyticsadmin.googleapis.com/v1beta/properties

{
  "parent": "accounts/123456",
  "displayName": "My New Property",
  "timeZone": "Europe/Moscow",
  "currencyCode": "RUB",
  "industryCategory": "TECHNOLOGY"
}
```

### Добавить dataStream

```json
POST https://analyticsadmin.googleapis.com/v1beta/properties/123456789/dataStreams

{
  "type": "WEB_DATA_STREAM",
  "displayName": "Main Website",
  "webStreamData": {
    "defaultUri": "https://example.com"
  }
}
```

### Создать customDimension

```json
POST https://analyticsadmin.googleapis.com/v1beta/properties/123456789/customDimensions

{
  "parameterName": "membership_level",
  "displayName": "Membership Level",
  "description": "User membership tier",
  "scope": "USER",
  "disallowAdsPersonalization": false
}
```

`scope`: `EVENT` (событийный) или `USER` (пользовательский).

### Получить measurementProtocolSecrets

```bash
curl -H "Authorization: Bearer ACCESS_TOKEN" \
  "https://analyticsadmin.googleapis.com/v1beta/properties/123456789/dataStreams/STREAM_ID/measurementProtocolSecrets"
```

Ответ содержит `secretValue` -- используется как `api_secret` в Measurement Protocol.
