# gRPC-форма вызова

## Назначение

Транспортная сторона Wordstat: адрес и полное имя сервиса, четыре RPC, proto-нотация сообщений, соответствие имён REST ↔ gRPC, примеры `grpcurl` и различия сериализации между транспортами.

> Здесь только транспорт: адрес, RPC, proto-нотация, соответствие имён и примеры `grpcurl`. Обязательность полей, диапазоны, длины и границы дат — в [methods.md](methods.md); для gRPC они действуют ровно так же. Перед первым вызовом прочитай оба файла: по одному этому файлу корректный вызов не собрать.

Ограничений полей здесь нет намеренно — они одни и те же для обоих транспортов и живут в [methods.md](methods.md). Правка ограничений всегда идёт в одно место.

## Точка входа

```
Адрес:          searchapi.api.cloud.yandex.net:443
Полное имя:     yandex.cloud.searchapi.v2.WordstatService
Заголовок:      Authorization: Api-Key <API-ключ>  либо  Authorization: Bearer <IAM-токен>
```

Четыре RPC:

```proto
rpc GetTop                  (GetTopRequest)                  returns (GetTopResponse);
rpc GetDynamics             (GetDynamicsRequest)             returns (GetDynamicsResponse);
rpc GetRegionsDistribution  (GetRegionsDistributionRequest)  returns (GetRegionsDistributionResponse);
rpc GetRegionsTree          (GetRegionsTreeRequest)          returns (GetRegionsTreeResponse);
```

REST-пути — это HTTP-биндинги тех же RPC, заданные в proto:

```proto
GetTop                 → body: "*"  post: "/v2/wordstat/topRequests"
GetDynamics            → body: "*"  post: "/v2/wordstat/dynamics"
GetRegionsDistribution → body: "*"  post: "/v2/wordstat/regions"
GetRegionsTree         → body: "*"  post: "/v2/wordstat/getRegionsTree"
```

Отсюда практическое следствие: REST и gRPC — не два разных API, а один сервис с транскодером перед ним. Всё, что отвергает валидация по одному транспорту, отвергается и по другому.

## Соответствие имён

| REST (camelCase) | gRPC / proto (snake_case) |
|---|---|
| `numPhrases` | `num_phrases` |
| `folderId` | `folder_id` |
| `fromDate` | `from_date` |
| `toDate` | `to_date` |
| `totalCount` | `total_count` |
| `affinityIndex` | `affinity_index` |
| `phrase`, `regions`, `devices`, `period`, `region`, `count`, `share`, `date`, `id`, `label`, `children`, `results`, `associations` | совпадают |

Два замечания, которые снимают половину путаницы:

- **REST-тело принимает оба написания.** `{"num_phrases": 10}` по REST разбирается так же, как `{"numPhrases": 10}` (проверено живым вызовом 25.08.2026: значение вне диапазона в snake_case даёт диапазонную ошибку, то есть поле действительно разобрано, а не отброшено как неизвестное).
- **Тексты ошибок всегда в snake_case**, по какому бы транспорту ни пришёл запрос ([errors.md](errors.md)).

## Сообщения в proto-нотации

Нотация упрощена: опции валидации `(required)`, `(length)`, `(size)`, `(value)` из оригинального proto здесь опущены — те же ограничения собраны таблицами в [methods.md](methods.md). Сами расширения объявлены в `yandex/cloud/validation.proto`.

```proto
message GetTopRequest {
  string phrase = 1;  int64 num_phrases = 2;  repeated string regions = 3;
  repeated Device devices = 4;  string folder_id = 5;
}
message GetTopResponse {
  int64 total_count = 1;
  repeated PhraseInfo results = 2;        // PhraseInfo { string phrase = 1; int64 count = 2; }
  repeated PhraseInfo associations = 3;
}

message GetDynamicsRequest {
  string phrase = 1;  Period period = 2;
  google.protobuf.Timestamp from_date = 3;  google.protobuf.Timestamp to_date = 4;
  repeated string regions = 5;  repeated Device devices = 6;  string folder_id = 7;
}
message GetDynamicsResponse {
  repeated DynamicsInfo results = 1;
  // DynamicsInfo { google.protobuf.Timestamp date = 1; int64 count = 2; double share = 3; }
}

message GetRegionsDistributionRequest {
  string phrase = 1;  Region region = 2;  repeated Device devices = 3;  string folder_id = 4;
}
message GetRegionsDistributionResponse {
  repeated RegionInfo results = 1;
  // RegionInfo { string region = 1; int64 count = 2; double share = 3; double affinity_index = 4; }
}

message GetRegionsTreeRequest  { string folder_id = 1; }
message GetRegionsTreeResponse {
  repeated RegionInfo regions = 1;
  // RegionInfo { string id = 1; string label = 2; repeated RegionInfo children = 3; }
}
```

Перечисления объявлены так:

```proto
enum Device { DEVICE_UNSPECIFIED = 0; DEVICE_ALL = 1; DEVICE_DESKTOP = 2; DEVICE_PHONE = 3; DEVICE_TABLET = 4; }
enum GetDynamicsRequest.Period { PERIOD_UNSPECIFIED = 0; PERIOD_MONTHLY = 1; PERIOD_WEEKLY = 2; PERIOD_DAILY = 3; }
enum GetRegionsDistributionRequest.Region { REGION_UNSPECIFIED = 0; REGION_ALL = 1; REGION_CITIES = 2; REGION_REGIONS = 3; }
```

Нулевые члены `*_UNSPECIFIED` есть в proto, в справочнике API не показаны и передавать их не нужно. `Device` объявлен на уровне пакета и общий для методов; `Period` вложен в `GetDynamicsRequest`, `Region` — в `GetRegionsDistributionRequest`.

Источник: `github.com/yandex-cloud/cloudapi`, ветка `master`, `yandex/cloud/searchapi/v2/wordstat_service.proto` — 225 строк, 5358 байт (файл скачан и сверен 25.08.2026). Опции пакета: `go_package = "github.com/yandex-cloud/go-genproto/yandex/cloud/searchapi/v2;searchapi"`, `java_package = "yandex.cloud.api.search.v2"`.

## Различия сериализации между транспортами

| Что | REST (JSON после транскодирования) | gRPC (protobuf) |
|---|---|---|
| `count`, `total_count` | строка `"48885"` | `int64` |
| `share`, `affinity_index` | число `0.00201…` | `double` |
| `date`, `from_date`, `to_date` | строка RFC3339 | `google.protobuf.Timestamp` |
| Имена полей | camelCase (snake_case тоже принимается) | snake_case |

Различие в первой строке — не особенность Wordstat, а каноническое отображение protobuf в JSON: 64-битные целые всегда сериализуются строками. Поэтому клиент на Go или Java получает числа, а клиент на `requests` — строки, и приводить типы приходится только второму.

## Примеры `grpcurl`

По образцу самой документации:

```bash
grpcurl \
  -rpc-header "Authorization: Api-Key <API-ключ>" \
  -d @ < body.json \
  searchapi.api.cloud.yandex.net:443 yandex.cloud.searchapi.v2.WordstatService/GetTop \
  > result.json
```

```bash
grpcurl \
  -rpc-header "Authorization: Bearer <IAM-токен>" \
  -d '{"folderId": "<идентификатор_каталога>"}' \
  searchapi.api.cloud.yandex.net:443 yandex.cloud.searchapi.v2.WordstatService/GetRegionsTree \
  > regions_tree.json
```

В теле для `grpcurl` можно писать camelCase — он принимает оба написания; так и сделано в примерах Яндекса.

## Сгенерированные клиенты для других языков

Из proto Яндекс публикует генерированный код: файл `yandex/cloud/searchapi/v2/wordstat_service.pb.go` в `github.com/yandex-cloud/go-genproto` существует (HTTP 200 на raw-адресе, проверено 24.08.2026).

Родственные репозитории: `java-genproto`, `nodejs-sdk`, `dotnet-sdk` — там только генерированные стабы; специализированных Wordstat-обёрток, как в Python SDK ([sdk.md](sdk.md)), не заявлено.

**Наличие Wordstat-стабов именно в этих трёх репозиториях выведено из общей схемы генерации, а поимённо не проверялось:** прежде чем обещать пользователю готовый клиент на Java или Node, загляни в дерево репозитория.
