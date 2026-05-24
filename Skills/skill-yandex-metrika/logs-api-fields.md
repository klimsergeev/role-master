# Поля Logs API

## Назначение

Полный справочник полей для выгрузки через Logs API Яндекс Метрики — визиты (`source=visits`, префикс `ym:s:`) и хиты (`source=hits`, префикс `ym:pv:`).

## Поля визитов (`source=visits`, префикс `ym:s:`)

### Основные данные визита

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:s:visitID` | UInt64 | Идентификатор визита, уникален в рамках одного года |
| `ym:s:counterID` | UInt32 | Номер счётчика |
| `ym:s:date` | Date | Дата визита |
| `ym:s:dateTime` | DateTime | Дата и время визита (часовой пояс счётчика) |
| `ym:s:dateTimeUTC` | DateTime | Дата и время события (UTC+3) |

### Поведение посетителя

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:s:isNewUser` | UInt8 | Первый визит посетителя |
| `ym:s:startURL` | String | Страница входа |
| `ym:s:endURL` | String | Страница выхода |
| `ym:s:pageViews` | Int32 | Глубина просмотра |
| `ym:s:visitDuration` | UInt32 | Время на сайте (секунды) |
| `ym:s:bounce` | UInt8 | Отказность |
| `ym:s:watchIDs` | Array(UInt64) | Просмотры в визите (лимит 500) |

### Идентификация пользователя

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:s:clientID` | UInt64 | Анонимный идентификатор в браузере (first-party cookies) |
| `ym:s:counterUserIDHash` | UInt64 | Идентификатор посетителя для подсчёта уникальных |
| `ym:s:isRobotPro` | UInt8 | Роботность визита (0 или 1). Доступно с 19.04.2025 в Метрике Про |

### Геолокация и сеть

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:s:ipAddress` | String | IP-адрес |
| `ym:s:regionCountry` | String | Страна (ISO) |
| `ym:s:regionCity` | String | Город (английское название) |
| `ym:s:regionCountryID` | UInt32 | ID страны |
| `ym:s:regionCityID` | UInt32 | ID города |
| `ym:s:networkType` | String | Тип соединения |

### Устройство и ОС

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:s:deviceCategory` | String | Тип устройства (1-десктоп, 2-мобильные, 3-планшеты, 4-TV) |
| `ym:s:mobilePhone` | String | Производитель устройства |
| `ym:s:mobilePhoneModel` | String | Модель устройства |
| `ym:s:operatingSystemRoot` | String | Группа операционных систем |
| `ym:s:operatingSystem` | String | Операционная система (детально) |

### Браузер

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:s:browser` | String | Браузер |
| `ym:s:browserMajorVersion` | UInt16 | Major-версия браузера |
| `ym:s:browserMinorVersion` | UInt16 | Minor-версия браузера |
| `ym:s:browserEngine` | String | Движок браузера |
| `ym:s:browserEngineVersion1` | UInt16 | Major-версия движка |
| `ym:s:browserEngineVersion2` | UInt16 | Minor-версия движка |
| `ym:s:browserEngineVersion3` | UInt16 | Build-версия движка |
| `ym:s:browserEngineVersion4` | UInt16 | Revision-версия движка |
| `ym:s:browserLanguage` | String | Язык браузера |
| `ym:s:browserCountry` | String | Страна браузера |
| `ym:s:clientTimeZone` | Int16 | Разница часового пояса и UTC (минуты) |
| `ym:s:cookieEnabled` | UInt8 | Наличие Cookie |
| `ym:s:javascriptEnabled` | UInt8 | Наличие JavaScript |

### Экран

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:s:screenFormat` | String | Соотношение сторон (9:16, 16:9, 4:3 и др.) |
| `ym:s:screenColors` | UInt8 | Глубина цвета |
| `ym:s:screenOrientation` | UInt8 | Ориентация (1-portrait, 2-landscape) |
| `ym:s:screenOrientationName` | String | Ориентация экрана (текст) |
| `ym:s:screenWidth` | UInt16 | Логическая ширина (CSS-пиксели) |
| `ym:s:screenHeight` | UInt16 | Логическая высота (CSS-пиксели) |
| `ym:s:physicalScreenWidth` | UInt16 | Физическая ширина |
| `ym:s:physicalScreenHeight` | UInt16 | Физическая высота |
| `ym:s:windowClientWidth` | UInt16 | Ширина окна браузера (viewport) |
| `ym:s:windowClientHeight` | UInt16 | Высота окна браузера (viewport) |

### Цели и заказы

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:s:goalsID` | Array(UInt32) | Номера целей, достигнутых за визит |
| `ym:s:goalsSerialNumber` | Array(UInt32) | Порядковые номера достижений целей |
| `ym:s:goalsDateTime` | Array(DateTime) | Время достижения каждой цели (UTC+3) |
| `ym:s:goalsPrice` | Array(Int64) | Ценность цели |
| `ym:s:goalsOrder` | Array(String) | Идентификатор заказов |
| `ym:s:goalsCurrency` | Array(String) | Валюта |

### Источники трафика (с атрибуцией)

Поля с `<attribution>` заменяются на модель атрибуции: `last`, `first`, `lastSign` и др.

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:s:<attribution>TrafficSource` | String | Источник трафика |
| `ym:s:<attribution>AdvEngine` | String | Рекламная система |
| `ym:s:<attribution>ReferalSource` | String | Переход с сайтов |
| `ym:s:<attribution>SearchEngineRoot` | String | Поисковая система |
| `ym:s:<attribution>SearchEngine` | String | Поисковая система (детально) |
| `ym:s:<attribution>SocialNetwork` | String | Социальная сеть |
| `ym:s:<attribution>SocialNetworkProfile` | String | Группа социальной сети |
| `ym:s:<attribution>RecommendationSystem` | String | Рекомендательная система |
| `ym:s:<attribution>Messenger` | String | Мессенджер |
| `ym:s:referer` | String | Реферер |

### UTM-параметры (с атрибуцией)

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:s:from` | String | Метка from |
| `ym:s:<attribution>UTMCampaign` | String | UTM Campaign |
| `ym:s:<attribution>UTMContent` | String | UTM Content |
| `ym:s:<attribution>UTMMedium` | String | UTM Medium |
| `ym:s:<attribution>UTMSource` | String | UTM Source |
| `ym:s:<attribution>UTMTerm` | String | UTM Term |

### Яндекс Директ (с атрибуцией)

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:s:<attribution>DirectClickOrder` | UInt32 | Кампания Яндекс Директа |
| `ym:s:<attribution>DirectBannerGroup` | UInt64 | Группа объявлений |
| `ym:s:<attribution>DirectClickBanner` | String | Объявление |
| `ym:s:<attribution>DirectClickOrderName` | String | Название кампании |
| `ym:s:<attribution>ClickBannerGroupName` | String | Название группы объявлений |
| `ym:s:<attribution>DirectClickBannerName` | String | Название объявления |
| `ym:s:<attribution>DirectPhraseOrCond` | String | Условие показа объявления |
| `ym:s:<attribution>DirectPlatformType` | String | Тип площадки |
| `ym:s:<attribution>DirectPlatform` | String | Площадка |
| `ym:s:<attribution>DirectConditionType` | String | Тип условия показа |
| `ym:s:<attribution>CurrencyID` | String | Валюта |

### Openstat (с атрибуцией)

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:s:<attribution>openstatAd` | String | Openstat Ad |
| `ym:s:<attribution>openstatCampaign` | String | Openstat Campaign |
| `ym:s:<attribution>openstatService` | String | Openstat Service |
| `ym:s:<attribution>openstatSource` | String | Openstat Source |

### Tracking-метки (с атрибуцией)

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:s:<attribution>hasGCLID` | UInt8 | Наличие метки GCLID |
| `ym:s:<attribution>GCLID` | String | Метка GCLID |
| `ym:s:<attribution>hasSBCLID` | UInt8 | Наличие метки SBCLID |
| `ym:s:<attribution>SBCLID` | String | Метка SBCLID |

### E-commerce: покупки

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:s:purchaseID` | Array(String) | Идентификатор покупки |
| `ym:s:purchaseDateTime` | Array(DateTime) | Дата и время покупки |
| `ym:s:purchaseAffiliation` | Array(String) | Магазин или филиал |
| `ym:s:purchaseRevenue` | Array(Float64) | Доход транзакции |
| `ym:s:purchaseTax` | Array(Float64) | Сумма налогов |
| `ym:s:purchaseShipping` | Array(Float64) | Стоимость доставки |
| `ym:s:purchaseCoupon` | Array(String) | Промокод покупки |
| `ym:s:purchaseCurrency` | Array(String) | Валюта транзакции |
| `ym:s:purchaseProductQuantity` | Array(Int64) | Количество товаров в покупке |

### E-commerce: товары (события)

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:s:productID` | Array(String) | Идентификатор товара |
| `ym:s:productName` | Array(String) | Название товара |
| `ym:s:productList` | Array(String) | Список товаров |
| `ym:s:productBrand` | Array(String) | Бренд |
| `ym:s:productCategory` | Array(String) | Категория |
| `ym:s:productCategoryLevel1`..`5` | Array(String) | Категория товара, уровни 1-5 |
| `ym:s:productVariant` | Array(String) | Вариант товара |
| `ym:s:productPosition` | Array(Int32) | Позиция в списке |
| `ym:s:productPrice` | Array(Int64) | Цена товара |
| `ym:s:productCurrency` | Array(String) | Валюта |
| `ym:s:productCoupon` | Array(String) | Промокод товара |
| `ym:s:productQuantity` | Array(UInt64) | Количество |
| `ym:s:productEventTime` | Array(DateTime) | Дата и время события |
| `ym:s:productEventType` | Array(UInt8) | Тип события (view_item_list, click, detail, add, purchase, remove) |
| `ym:s:productDiscount` | Array(String) | Процент скидки |
| `ym:s:productURL` | Array(String) | URL страницы события |

### E-commerce: купленные товары

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:s:purchasedProductPurchaseID` | Array(String) | Идентификатор покупки |
| `ym:s:purchasedProductID` | Array(String) | Идентификатор купленного товара |
| `ym:s:purchasedProductName` | Array(String) | Название |
| `ym:s:purchasedProductBrand` | Array(String) | Бренд |
| `ym:s:purchasedProductCategory` | Array(String) | Категория |
| `ym:s:purchasedProductCategoryLevel1`..`5` | Array(String) | Категория, уровни 1-5 |
| `ym:s:purchasedProductVariant` | Array(String) | Вариант |
| `ym:s:purchasedProductPosition` | Array(Int32) | Позиция |
| `ym:s:purchasedProductPrice` | Array(Float64) | Цена |
| `ym:s:purchasedProductCurrency` | Array(String) | Валюта |
| `ym:s:purchasedProductCoupon` | Array(String) | Промокод |
| `ym:s:purchasedProductQuantity` | Array(Int64) | Количество |
| `ym:s:purchasedProductList` | Array(String) | Список |
| `ym:s:purchasedProductEventTime` | Array(DateTime) | Дата и время покупки |
| `ym:s:purchasedProductDiscount` | Array(String) | Скидка |

### E-commerce: просмотры товаров (impressions)

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:s:impressionsURL` | Array(String) | URL страницы |
| `ym:s:impressionsDateTime` | Array(DateTime) | Дата и время просмотра |
| `ym:s:impressionsProductID` | Array(String) | ID товара |
| `ym:s:impressionsProductName` | Array(String) | Название |
| `ym:s:impressionsProductBrand` | Array(String) | Бренд |
| `ym:s:impressionsProductCategory` | Array(String) | Категория |
| `ym:s:impressionsProductCategory1`..`5` | Array(String) | Категория, уровни 1-5 |
| `ym:s:impressionsProductVariant` | Array(String) | Вариант |
| `ym:s:impressionsProductPrice` | Array(Int64) | Цена |
| `ym:s:impressionsProductCurrency` | Array(String) | Валюта |
| `ym:s:impressionsProductCoupon` | Array(String) | Промокод |
| `ym:s:impressionsProductList` | Array(String) | Список |
| `ym:s:impressionsProductQuantity` | Array(UInt64) | Количество |
| `ym:s:impressionsProductEventTime` | Array(DateTime) | Дата и время |
| `ym:s:impressionsProductDiscount` | Array(String) | Скидка |

### E-commerce: промокампании

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:s:promotionID` | Array(String) | ID промокампании |
| `ym:s:promotionName` | Array(String) | Название |
| `ym:s:promotionCreative` | Array(String) | Название баннера |
| `ym:s:promotionPosition` | Array(String) | Позиция баннера |
| `ym:s:promotionCreativeSlot` | Array(String) | Слот баннера |
| `ym:s:promotionEventTime` | Array(DateTime) | Дата и время события |
| `ym:s:promotionType` | Array(UInt8) | Тип (promoView, promoClick) |

### Офлайн-звонки

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:s:offlineCallTalkDuration` | Array(UInt32) | Длительность звонка (секунды) |
| `ym:s:offlineCallHoldDuration` | Array(UInt32) | Длительность ожидания (секунды) |
| `ym:s:offlineCallMissed` | Array(UInt32) | Пропущен ли звонок |
| `ym:s:offlineCallTag` | Array(String) | Произвольная метка |
| `ym:s:offlineCallFirstTimeCaller` | Array(Int32) | Первичный ли звонок |
| `ym:s:offlineCallURL` | Array(String) | Ассоциированная страница |

### Пользовательские параметры визита

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:s:parsedParamsKey1`..`10` | Array(String) | Параметры визита, уровни 1-10 |

---

## Поля хитов (`source=hits`, префикс `ym:pv:`)

### Основные идентификаторы

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:pv:watchID` | UInt64 | Идентификатор события |
| `ym:pv:pageViewID` | UInt32 | Идентификатор просмотра |
| `ym:pv:visitID` | UInt64 | Идентификатор визита (с 10.10.2025) |
| `ym:pv:counterID` | UInt32 | Номер счётчика |
| `ym:pv:clientID` | UInt64 | Анонимный ID пользователя |
| `ym:pv:counterUserIDHash` | UInt64 | ID посетителя для подсчёта уникальных |

### Дата и время

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:pv:date` | Date | Дата события |
| `ym:pv:dateTime` | DateTime | Дата и время (часовой пояс счётчика) |

### Содержание страницы

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:pv:title` | String | Заголовок страницы |
| `ym:pv:pageCharset` | String | Кодировка |
| `ym:pv:URL` | String | Адрес страницы |
| `ym:pv:referer` | String | Реферер |

### UTM и маркировка

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:pv:UTMCampaign` | String | UTM Campaign |
| `ym:pv:UTMContent` | String | UTM Content |
| `ym:pv:UTMMedium` | String | UTM Medium |
| `ym:pv:UTMSource` | String | UTM Source |
| `ym:pv:UTMTerm` | String | UTM Term |
| `ym:pv:openstatAd` | String | Openstat Ad |
| `ym:pv:openstatCampaign` | String | Openstat Campaign |
| `ym:pv:openstatService` | String | Openstat Service |
| `ym:pv:openstatSource` | String | Openstat Source |
| `ym:pv:from` | String | Метка from |
| `ym:pv:GCLID` | String | GCLID |
| `ym:pv:hasGCLID` | UInt8 | Наличие GCLID |
| `ym:pv:SBCLID` | String | SBCLID |
| `ym:pv:hasSBCLID` | UInt8 | Наличие SBCLID |

### Источники трафика

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:pv:lastTrafficSource` | String | Источник трафика |
| `ym:pv:lastSearchEngineRoot` | String | Поисковая система |
| `ym:pv:lastSearchEngine` | String | Поисковая система (детально) |
| `ym:pv:lastAdvEngine` | String | Рекламная система |
| `ym:pv:lastSocialNetwork` | String | Социальная сеть |
| `ym:pv:lastSocialNetworkProfile` | String | Страница соцсети |
| `ym:pv:recommendationSystem` | String | Рекомендательная система |
| `ym:pv:messenger` | String | Мессенджер |

### Устройство и ОС

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:pv:deviceCategory` | String | Тип устройства (1-десктоп, 2-мобиль, 3-планшет, 4-TV) |
| `ym:pv:mobilePhone` | String | Производитель устройства |
| `ym:pv:mobilePhoneModel` | String | Модель устройства |
| `ym:pv:operatingSystem` | String | ОС (детально) |
| `ym:pv:operatingSystemRoot` | String | Группа ОС |

### Браузер

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:pv:browser` | String | Браузер |
| `ym:pv:browserMajorVersion` | UInt16 | Major-версия |
| `ym:pv:browserMinorVersion` | UInt16 | Minor-версия |
| `ym:pv:browserCountry` | String | Страна браузера |
| `ym:pv:browserEngine` | String | Движок |
| `ym:pv:browserEngineVersion1`..`4` | UInt16 | Версии движка |
| `ym:pv:browserLanguage` | String | Язык |
| `ym:pv:clientTimeZone` | Int16 | Разница с UTC (минуты) |
| `ym:pv:cookieEnabled` | UInt8 | Наличие Cookie |
| `ym:pv:javascriptEnabled` | UInt8 | Наличие JavaScript |

### Экран

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:pv:screenWidth` | UInt16 | Логическая ширина |
| `ym:pv:screenHeight` | UInt16 | Логическая высота |
| `ym:pv:physicalScreenWidth` | UInt16 | Физическая ширина |
| `ym:pv:physicalScreenHeight` | UInt16 | Физическая высота |
| `ym:pv:windowClientWidth` | UInt16 | Ширина окна |
| `ym:pv:windowClientHeight` | UInt16 | Высота окна |
| `ym:pv:screenColors` | UInt8 | Глубина цвета |
| `ym:pv:screenFormat` | String | Соотношение сторон |
| `ym:pv:screenOrientation` | UInt8 | Ориентация (1-portrait, 2-landscape) |
| `ym:pv:screenOrientationName` | String | Ориентация (текст) |

### Геолокация

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:pv:ipAddress` | String | IP-адрес |
| `ym:pv:regionCity` | String | Город |
| `ym:pv:regionCountry` | String | Страна (ISO) |
| `ym:pv:regionCityID` | UInt32 | ID города |
| `ym:pv:regionCountryID` | UInt32 | ID страны |

### Типы событий

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:pv:isPageView` | UInt8 | Просмотр страницы |
| `ym:pv:isTurboPage` | UInt8 | Турбо-страница |
| `ym:pv:isTurboApp` | UInt8 | Турбо-сервис |
| `ym:pv:iFrame` | UInt8 | Событие в iframe |
| `ym:pv:link` | UInt8 | Переход по ссылке / загрузка файла |
| `ym:pv:download` | UInt8 | Загрузка файла |
| `ym:pv:notBounce` | UInt8 | Событие «неотказ» |
| `ym:pv:artificial` | UInt8 | Искусственное событие (hit(), event()) |

### Цели (с 12.08.2025)

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:pv:goalsID` | Array(UInt32) | Номера достигнутых целей |

### E-commerce (с 19.06.2025)

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:pv:ecommerce` | String | События электронной коммерции |
| `ym:pv:purchaseID` | Array(String) | ID покупки |
| `ym:pv:purchaseRevenue` | Array(Float64) | Доход транзакции |
| `ym:pv:purchaseTax` | Array(String) | Сумма налогов |
| `ym:pv:purchaseShipping` | Array(String) | Стоимость доставки |
| `ym:pv:purchaseCoupon` | Array(String) | Промокод |
| `ym:pv:purchaseCurrency` | Array(String) | Валюта |
| `ym:pv:purchaseProductQuantity` | Array(UInt64) | Количество товаров |

### Товары (hits)

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:pv:productID` | Array(String) | ID товара |
| `ym:pv:productName` | Array(String) | Название |
| `ym:pv:productList` | Array(String) | Список |
| `ym:pv:productBrand` | Array(String) | Бренд |
| `ym:pv:productCategory` | Array(String) | Категория |
| `ym:pv:productCategoryLevel1`..`5` | Array(String) | Уровни категории 1-5 |
| `ym:pv:productVariant` | Array(String) | Вариант |
| `ym:pv:productPosition` | Array(Int32) | Позиция |
| `ym:pv:productPrice` | Array(Int64) | Цена |
| `ym:pv:productCurrency` | Array(String) | Валюта |
| `ym:pv:productCoupon` | Array(String) | Промокод |
| `ym:pv:productQuantity` | Array(UInt64) | Количество |
| `ym:pv:productEventType` | Array(UInt8) | Тип события |
| `ym:pv:productDiscount` | Array(String) | Скидка |

### Промокампании (hits)

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:pv:promotionID` | Array(String) | ID промокампании |
| `ym:pv:promotionName` | Array(String) | Название |
| `ym:pv:promotionCreative` | Array(String) | Баннер |
| `ym:pv:promotionPosition` | Array(String) | Позиция |
| `ym:pv:promotionCreativeSlot` | Array(String) | Слот |
| `ym:pv:promotionEventType` | Array(UInt8) | Тип события |

### Офлайн-звонки (с 12.08.2025)

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:pv:offlineCallTalkDuration` | UInt32 | Длительность звонка |
| `ym:pv:offlineCallHoldDuration` | UInt16 | Ожидание |
| `ym:pv:offlineCallMissed` | UInt8 | Пропущен |
| `ym:pv:offlineCallTag` | String | Метка |
| `ym:pv:offlineCallFirstTimeCaller` | Int8 | Первичный |
| `ym:pv:offlineCallURL` | String | URL |
| `ym:pv:offlineUploadingID` | String | ID загрузки офлайн |

### Параметры (hits)

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:pv:params` | String | Параметры |
| `ym:pv:parsedParamsKey1`..`10` | Array(String) | Параметры, уровни 1-10 |

### Прочее (hits)

| Поле | Тип | Описание |
|------|-----|----------|
| `ym:pv:httpError` | String | Код ошибки |
| `ym:pv:networkType` | String | Тип соединения (устарело) |
| `ym:pv:shareService` | String | Сервис «Поделиться» |
| `ym:pv:shareURL` | String | URL «Поделиться» |
| `ym:pv:shareTitle` | String | Заголовок «Поделиться» |
