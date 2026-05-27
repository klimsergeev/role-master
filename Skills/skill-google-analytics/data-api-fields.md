# Справочник Dimensions и Metrics

## Назначение

Полный справочник dimensions и metrics для GA4 Data API, сгруппированный по категориям. Для актуального списка по конкретному property используй `getMetadata` API.

## Dimensions по категориям

### Пользователь (User)

| API Name | Описание |
|---|---|
| `audienceId` | Числовой ID аудитории |
| `audienceName` | Название аудитории |
| `firstSessionDate` | Дата первой сессии (YYYYMMDD) |
| `newVsReturning` | Новый или вернувшийся пользователь |

### Сессия (Session)

| API Name | Описание |
|---|---|
| `sessionCampaignId` | ID кампании сессии |
| `sessionCampaignName` | Название кампании сессии |

### Событие (Event)

| API Name | Описание |
|---|---|
| `eventName` | Название события |
| `isKeyEvent` | Является ли ключевым событием |

### География (Geography)

| API Name | Описание |
|---|---|
| `continent` | Континент |
| `continentId` | ID континента |
| `country` | Страна |
| `countryId` | ID страны (ISO 3166-1 alpha-2) |
| `region` | Регион/область |
| `city` | Город |
| `cityId` | ID города |

### Технология (Technology)

| API Name | Описание |
|---|---|
| `browser` | Браузер |
| `browserVersion` | Версия браузера |
| `operatingSystem` | Операционная система |
| `operatingSystemVersion` | Версия ОС |
| `operatingSystemWithVersion` | ОС с версией |
| `deviceCategory` | Тип устройства: Desktop, Tablet, Mobile |
| `deviceModel` | Модель устройства |
| `mobileDeviceBranding` | Бренд устройства |
| `mobileDeviceMarketingName` | Маркетинговое название устройства |
| `mobileDeviceModel` | Модель мобильного устройства |
| `screenResolution` | Разрешение экрана |
| `language` | Язык браузера/устройства |
| `languageCode` | Код языка (ISO 639) |
| `platform` | Платформа: web, iOS, Android |

### Источники трафика (Traffic Source)

| API Name | Описание |
|---|---|
| `defaultChannelGroup` | Канал по умолчанию (Organic Search, Direct, Referral и др.) |
| `primaryChannelGroup` | Основной канал |
| `source` | Источник трафика |
| `medium` | Канал/среда |
| `manualSource` | Источник (UTM source) |
| `manualMedium` | Среда (UTM medium) |
| `manualSourceMedium` | Источник/среда (комбинация) |
| `manualCampaignId` | ID кампании (utm_id) |
| `manualCampaignName` | Название кампании (utm_campaign) |
| `manualAdContent` | Содержание объявления (utm_content) |
| `manualTerm` | Ключевое слово (utm_term) |
| `manualCreativeFormat` | Формат креатива |
| `manualMarketingTactic` | Маркетинговая тактика |
| `manualSourcePlatform` | Платформа источника |

### Первое привлечение (First User Attribution)

| API Name | Описание |
|---|---|
| `firstUserSource` | Источник первого привлечения |
| `firstUserMedium` | Среда первого привлечения |
| `firstUserSourceMedium` | Источник/среда первого привлечения |
| `firstUserCampaignId` | ID кампании первого привлечения |
| `firstUserCampaignName` | Название кампании первого привлечения |
| `firstUserDefaultChannelGroup` | Канал по умолчанию первого привлечения |
| `firstUserPrimaryChannelGroup` | Основной канал первого привлечения |

### Страницы (Page / Screen)

| API Name | Описание |
|---|---|
| `pageTitle` | Заголовок страницы |
| `pageLocation` | Полный URL страницы |
| `pagePath` | Путь URL (без домена и query) |
| `pagePathPlusQueryString` | Путь URL с query string |
| `pageReferrer` | Реферер страницы |
| `hostName` | Домен |
| `fullPageUrl` | Полный URL |
| `landingPage` | Страница входа |
| `landingPagePlusQueryString` | Страница входа с query |

### Ссылки и загрузки (Links & Downloads)

| API Name | Описание |
|---|---|
| `linkUrl` | URL ссылки |
| `linkDomain` | Домен ссылки |
| `linkId` | HTML ID ссылки |
| `linkText` | Текст ссылки |
| `linkClasses` | CSS-классы ссылки |
| `fileName` | Имя скачанного файла |
| `fileExtension` | Расширение файла (pdf, txt и др.) |
| `outbound` | Внешняя ссылка (true/false) |

### Поиск по сайту

| API Name | Описание |
|---|---|
| `searchTerm` | Поисковый запрос на сайте |

### Контент

| API Name | Описание |
|---|---|
| `contentGroup` | Группа контента |
| `contentId` | ID контента |
| `contentType` | Тип контента |

### Электронная коммерция (Ecommerce)

| API Name | Описание |
|---|---|
| `itemId` | ID товара |
| `itemName` | Название товара |
| `itemBrand` | Бренд товара |
| `itemCategory` | Категория товара (уровень 1) |
| `itemCategory2` -- `itemCategory5` | Категории товара (уровни 2-5) |
| `itemVariant` | Вариант товара (XS, S, M, L) |
| `itemAffiliation` | Партнёр/вендор |
| `itemListName` | Название списка товаров |
| `itemListId` | ID списка товаров |
| `itemListPosition` | Позиция в списке |
| `itemLocationID` | Физическое местоположение |
| `itemPromotionId` | ID промоакции |
| `itemPromotionName` | Название промоакции |
| `itemPromotionCreativeName` | Название креатива промоакции |
| `itemPromotionCreativeSlot` | Слот креатива промоакции |
| `currencyCode` | Код валюты (ISO 4217) |
| `orderCoupon` | Купон заказа |

### Дата и время (Date/Time)

| API Name | Описание |
|---|---|
| `date` | Дата (YYYYMMDD) |
| `dateHour` | Дата+час (YYYYMMDDHH) |
| `dateHourMinute` | Дата+час+минута |
| `day` | День месяца (01-31) |
| `dayOfWeek` | День недели (0-6, 0=воскресенье) |
| `dayOfWeekName` | Название дня недели (Sunday, Monday...) |
| `hour` | Час (00-23) |
| `minute` | Минута (00-59) |
| `month` | Месяц (01-12) |
| `isoWeek` | ISO-неделя |
| `isoYear` | ISO-год |
| `isoYearIsoWeek` | ISO-год + ISO-неделя |
| `nthDay`, `nthHour`, `nthMinute`, `nthMonth`, `nthWeek`, `nthYear` | Порядковый номер от начала диапазона |

### Когорты

| API Name | Описание |
|---|---|
| `cohort` | Название когорты |
| `cohortNthDay` | День от первой сессии |
| `cohortNthMonth` | Месяц от первой сессии |
| `cohortNthWeek` | Неделя от первой сессии |

### Google Ads

googleAdsCampaignId, googleAdsCampaignName, googleAdsCampaignType, googleAdsAdGroupId, googleAdsAdGroupName, googleAdsAdNetworkType, googleAdsCreativeId, googleAdsKeyword, googleAdsQuery, googleAdsCustomerId, googleAdsAccountName + аналогичные `firstUser*` варианты.

### Игры

| API Name | Описание |
|---|---|
| `level` | Уровень игрока |
| `character` | Персонаж |
| `achievementId` | ID достижения |
| `groupId` | ID группы |

### Реклама в приложении (Ad Monetization)

| API Name | Описание |
|---|---|
| `adFormat` | Формат рекламы |
| `adSourceName` | Рекламная сеть |
| `adUnitName` | Название рекламного блока |

### Прочие

| API Name | Описание |
|---|---|
| `method` | Метод инициации события |
| `percentScrolled` | Процент прокрутки страницы |

Также доступны dimensions для SA360, DV360, CM360 -- вызовите `getMetadata` для полного списка по конкретному property.

## Metrics по категориям

### Пользователи (Users)

| API Name | Описание |
|---|---|
| `totalUsers` | Общее число пользователей |
| `newUsers` | Новые пользователи |
| `activeUsers` | Активные пользователи (основная метрика GA4) |
| `returningUsers` | Вернувшиеся пользователи |
| `active1DayUsers` | Активные за 1 день |
| `active7DayUsers` | Активные за 7 дней |
| `active28DayUsers` | Активные за 28 дней |
| `active30DayUsers` | Активные за 30 дней |

### Сессии и вовлечённость (Sessions & Engagement)

| API Name | Описание |
|---|---|
| `sessions` | Число сессий |
| `sessionsPerUser` | Сессий на пользователя |
| `engagedSessions` | Вовлечённые сессии (>10 сек, или 2+ просмотра, или конверсия) |
| `engagementRate` | Доля вовлечённых сессий |
| `bounceRate` | 1 - engagementRate (отличается от UA!) |
| `averageSessionDuration` | Средняя длительность сессии |
| `screenPageViewsPerSession` | Просмотров страниц за сессию |

### События (Events)

| API Name | Описание |
|---|---|
| `eventCount` | Общее число событий |
| `eventCountPerUser` | Событий на пользователя |
| `eventsPerSession` | Событий за сессию |
| `screenPageViews` | Просмотры страниц/экранов |

### Конверсии (Key Events)

| API Name | Описание |
|---|---|
| `conversions` | Число конверсий |
| `conversionRate` | Доля конвертируемых сессий |

Примечание: в API название `keyEvents` может встречаться в некоторых версиях вместо `conversions`. Ресурс `conversionEvents` в Admin API deprecated -- используй `keyEvents`.

### Доход и e-commerce (Revenue & Ecommerce)

| API Name | Описание |
|---|---|
| `totalRevenue` | Общий доход (покупки + подписки + реклама) |
| `purchaseRevenue` | Доход от покупок |
| `ecommercePurchases` | Число покупок |
| `itemRevenue` | Доход от товаров |
| `itemsPurchased` | Число купленных товаров |
| `averagePurchaseRevenue` | Средний доход от покупки |
| `averagePurchaseRevenuePerPayingUser` | ARPPU |
| `refunds` | Число возвратов |
| `refundAmount` | Сумма возвратов |

### Google Ads

| API Name | Описание |
|---|---|
| `googleAdsCost` | Расходы на Google Ads |
| `googleAdsClicks` | Клики Google Ads |
| `googleAdsImpressions` | Показы Google Ads |
| `returnOnAdSpend` | ROAS (доход/расходы) |
| `costPerClick` | CPC |
| `costPerConversion` | Стоимость конверсии |

### Publisher / AdMob

| API Name | Описание |
|---|---|
| `publisherAdClicks` | Клики по рекламе в приложении |
| `publisherAdImpressions` | Показы рекламы в приложении |
| `totalAdRevenue` | Общий доход от рекламы |

### Когортные метрики (Cohort)

| API Name | Описание |
|---|---|
| `cohortActiveUsers` | Активные пользователи когорты |
| `cohortTotalUsers` | Всего пользователей когорты |

### Предиктивные метрики (Predictive)

GA4 генерирует три предиктивные метрики при достаточном объёме данных:

- **Purchase probability** -- вероятность покупки в ближайшие 7 дней
- **Churn probability** -- вероятность ухода активного пользователя (не вернётся в течение 7 дней)
- **Predicted revenue** -- ожидаемый доход от пользователя за 28 дней

Предиктивные метрики доступны в GA4 UI и Explorations. Для использования в API проверьте доступность через `getMetadata`.

### Вовлечённость (Stickiness)

| API Name | Описание |
|---|---|
| `dauPerMauRatio` | DAU/MAU -- "липкость" аудитории |
| `dauPerWauRatio` | DAU/WAU |
| `wauPerMauRatio` | WAU/MAU |

## Типы значений метрик

| Тип | Описание |
|---|---|
| `TYPE_INTEGER` | Целое число |
| `TYPE_FLOAT` | Дробное число |
| `TYPE_SECONDS` | Длительность в секундах |
| `TYPE_MILLISECONDS` | Длительность в миллисекундах |
| `TYPE_MINUTES` | Длительность в минутах |
| `TYPE_HOURS` | Длительность в часах |
| `TYPE_STANDARD` | Стандартное число |
| `TYPE_CURRENCY` | Денежное значение |
| `TYPE_FEET` | Расстояние в футах |
| `TYPE_MILES` | Расстояние в милях |
| `TYPE_METERS` | Расстояние в метрах |
| `TYPE_KILOMETERS` | Расстояние в километрах |

## Пользовательские dimensions/metrics

### Custom Dimensions

- Событийный scope: `customEvent:parameter_name`
- Пользовательский scope: `customUser:parameter_name`

### Custom Metrics

- Событийный scope: `customEvent:parameter_name`

Пользовательские dimensions и metrics создаются в GA4 Admin (или через Admin API) и регистрируют event parameters как dimensions/metrics для отчётов.

## Примечание

Этот справочник содержит наиболее востребованные dimensions и metrics. Для получения полного актуального списка по конкретному property:

1. **API:** вызвать `getMetadata` -- `GET /v1beta/properties/{{PROPERTY_ID}}/metadata`
2. **Интерактивный инструмент:** [GA4 Dimensions & Metrics Explorer](https://ga-dev-tools.google/ga4/dimensions-metrics-explorer/)
