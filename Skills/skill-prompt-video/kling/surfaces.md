# Kling: поверхности

## Назначение

Где доступны модели Kling — приложение Kling AI, новые адреса API и старые адреса `/v1/videos/...`, — чем они различаются, как устроены задача и тело запроса и в какой форме выдаётся готовый результат.

Состояние на 2026-11-16.

## Приложение Kling AI

- Веб-приложение и мобильное приложение. Функции и параметры приложения определяются его фактическим интерфейсом; скилл даёт текст промпта и настройки словами.
- Доступ к Kling 3.0 связан с подписками Pro, Premier и Ultra.
- VIDEO 3.0 и 3.0 Omni — два режима мультикадровости:
  - Multi-Shot — модель сама планирует смену планов, ракурсов и композиции; если сцена лучше подходит для одного плана, может сделать один. Без Multi-Shot генерируется один план.
  - Custom Multi-Shot — включается только вместе с Multi-Shot; пользователь задаёт число планов и длительность каждого, модель строго следует промпту.
- Kling 4.0 — мультикадровость и синхронный звук включены по умолчанию, отдельных переключателей нет.
- Kling 4.0 — входы Omni Reference и Keyframes; в одной задаче приложения их не совместить. Вход Keyframes референсы не принимает; соотношение сторон берётся с первого ключевого кадра.
- Библиотека элементов: элемент вызывается набором `@` в поле ввода. Элемент создаётся из видео (загрузка или запись; запись видео для персонажа — только в мобильном приложении) или из 2–4 изображений (в [references.md](references.md)).
- Материалы Kling 4.0 в приложении нумеруются по порядку загрузки: `@Image1`, `@Image2`, `@Video1`.

## Новые адреса API

- Метод создания задачи: `POST https://api-singapore.klingai.com/<путь>` — для серверов вне Китая, заменил прежний `https://api.klingai.com`; для Китая — `POST https://api-beijing.klingai.com/<путь>`.
- Пути: `/text-to-video/kling-4.0`, `/image-to-video/kling-4.0`, `/omni-video/kling-4.0`, `/text-to-video/kling-4.0-flash`, `/image-to-video/kling-4.0-flash`, `/omni-video/kling-4.0-flash`, `/text-to-video/kling-3.0`, `/image-to-video/kling-3.0`, `/omni-video/kling-3.0-omni`.
- Заголовки: `Content-Type: application/json` и `Authorization: Bearer ${KLING_API_KEY}`, оба обязательны.
- Поля `model` в теле нет: модель задаётся путём адреса.
- Верхний уровень тела: у адресов из текста — `prompt` (обязателен), `settings`, `options`; у адресов из изображения и Omni — `contents` (обязателен), `settings`, `options`. Поля `negative_prompt` нет; поле промпта допускает положительные и отрицательные описания.
- `options`: `callback_url`; `external_task_id` — уникален в пределах аккаунта; `watermark_info` — `{"enabled": false}`, по умолчанию `false`, собственный водяной знак не поддерживается.
- Ответ на создание: `{"code", "message", "request_id", "data": {"id", "status", "create_time", "update_time", "external_id"}}`; статусы — `submitted`, `processing`, `succeeded`, `failed`.
- Результат запрашивается `GET /tasks?task_ids=…` или `GET /tasks?external_task_ids=…` (идентификаторы через запятую) либо `POST /tasks` с курсором.
- Доступ к Kling 4.0 в API требует пакета ресурсов Flagship или положительного денежного баланса аккаунта. ЕСЛИ API отказывает в доступе к 4.0 -> назвать пользователю это условие.
- Ключ API действует для всех моделей; пара AccessKey и SecretKey — только для старой схемы.

## Старые адреса `/v1/videos/...`

- Версия модели задаётся значением `model_name`, а не путём, — это признак старой схемы.
- `/v1/videos/text2video` и `/v1/videos/image2video` — `model_name` из `kling-v2-5-turbo`, `kling-v2-6`, `kling-v3`; скиллом покрыт только `kling-v3`.
- `/v1/videos/omni-video` — `model_name` из `kling-video-o1`, `kling-v3-omni`, по умолчанию `kling-video-o1`; для VIDEO 3.0 Omni `model_name: "kling-v3-omni"` передаётся явно.
- Старый API остаётся доступным, планов вывода из эксплуатации не объявлено.
- Результат запрашивается `GET /v1/videos/<тип>/{id}`.
- Синтаксис ссылок, поля и значения старых адресов — в [references.md](references.md) и [parameters.md](parameters.md).

## Форма готового результата

### Приложение

Текст промпта на английском и настройки словами: модель; для Kling 4.0 — вход Omni Reference или Keyframes (какой вход приложения выбрать для генерации из одного текста, без материалов, не установлено — так и сказать в настройках); для VIDEO 3.0 и 3.0 Omni — Multi-Shot или Custom Multi-Shot с числом и длительностью планов; длительность, соотношение сторон, разрешение; какие материалы загрузить, в каком порядке и под какими именами они вызываются через `@`.

### API

Текст промпта и тело запроса. Скелеты собраны скиллом из полей адресов; допустимые значения — в [parameters.md](parameters.md), поля элементов `contents` — в [references.md](references.md).

Kling 4.0 из текста — `/text-to-video/kling-4.0` (у 4.0 Flash `resolution` только `720p`, `duration` до 20):

```json
{
  "prompt": "<промпт на английском>",
  "settings": { "duration": 10, "resolution": "1080p", "aspect_ratio": "16:9" },
  "options": { "callback_url": "<URL>", "external_task_id": "", "watermark_info": { "enabled": false } }
}
```

Kling 4.0 по ключевым кадрам — `/image-to-video/kling-4.0`; поля `aspect_ratio` нет; кадры в порядке появления:

```json
{
  "contents": [
    { "type": "prompt", "text": "<промпт на английском>" },
    { "type": "first_frame", "url": "<URL или Base64>", "id": "frame_1" },
    { "type": "middle_frame", "url": "<URL или Base64>", "id": "frame_2" },
    { "type": "last_frame", "url": "<URL или Base64>", "id": "frame_3" }
  ],
  "settings": { "resolution": "1080p", "duration": 10 }
}
```

Kling 4.0 Omni — `/omni-video/kling-4.0` (у 4.0 Flash — `/omni-video/kling-4.0-flash`, без `voice`, `middle_frame`, `last_frame`, `resolution` только `720p`):

```json
{
  "contents": [
    { "type": "prompt", "text": "<промпт на английском>" },
    { "type": "refer_image", "url": "<URL или Base64>", "id": "image_1" },
    { "type": "feature_video", "url": "<URL>", "id": "video_1" },
    { "type": "element", "element_id": "<ID элемента>", "id": "element_1" },
    { "type": "voice", "voice_id": "<ID голоса>", "id": "voice_1" }
  ],
  "settings": { "audio": "native", "resolution": "1080p", "aspect_ratio": "adaptive", "duration": 15 }
}
```

Kling VIDEO 3.0 из текста — `/text-to-video/kling-3.0`:

```json
{
  "prompt": "<промпт на английском>",
  "settings": { "multi_shot": true, "audio": "native", "resolution": "1080p", "aspect_ratio": "16:9", "duration": 10 }
}
```

Kling VIDEO 3.0 из изображения — `/image-to-video/kling-3.0`; у кадров поля `id` нет; поля `aspect_ratio` нет:

```json
{
  "contents": [
    { "type": "prompt", "text": "<промпт на английском>" },
    { "type": "first_frame", "url": "<URL или Base64>" },
    { "type": "last_frame", "url": "<URL или Base64>" },
    { "type": "element", "element_id": "<ID элемента>", "id": "<id>" }
  ],
  "settings": { "multi_shot": false, "audio": "native", "resolution": "1080p", "duration": 10 }
}
```

Kling VIDEO 3.0 Omni без видео на входе — `/omni-video/kling-3.0-omni`; `aspect_ratio` обязателен, если нет первого кадра и видео-референса:

```json
{
  "contents": [
    { "type": "prompt", "text": "<промпт на английском>" },
    { "type": "refer_image", "url": "<URL или Base64>", "id": "image_1" },
    { "type": "element", "element_id": "<ID элемента>", "id": "<id>" }
  ],
  "settings": { "multi_shot": true, "audio": "native", "resolution": "1080p", "aspect_ratio": "16:9", "duration": 10 }
}
```

Kling VIDEO 3.0 Omni, правка видео — `/omni-video/kling-3.0-omni` с `base_video`; `multi_shot` — `false` явно (умолчание `true` с `base_video` запрещено), `audio` — `off`; `duration` и `aspect_ratio` — по входному видео (подробности в [editing.md](editing.md)):

```json
{
  "contents": [
    { "type": "prompt", "text": "<промпт правки на английском>" },
    { "type": "base_video", "url": "<URL>", "id": "video_1" }
  ],
  "settings": { "multi_shot": false, "audio": "off", "resolution": "1080p", "aspect_ratio": "16:9", "duration": 8 }
}
```

Старый адрес `/v1/videos/omni-video` для VIDEO 3.0 Omni; `duration` — строка; ссылки в промпте — `<<<image_1>>>`, `<<<element_1>>>`, `<<<video_1>>>`:

```json
{
  "model_name": "kling-v3-omni",
  "prompt": "<промпт на английском>",
  "image_list": [ { "image_url": "<URL>" } ],
  "element_list": [ { "element_id": 123 } ],
  "sound": "on",
  "mode": "pro",
  "aspect_ratio": "16:9",
  "duration": "10"
}
```

Старый адрес `/v1/videos/image2video` для VIDEO 3.0; `image_tail` — последний кадр; `element_list` и `voice_list` взаимоисключающие:

```json
{
  "model_name": "kling-v3",
  "prompt": "<промпт на английском>",
  "negative_prompt": "<что исключить>",
  "image": "<URL или Base64 без префикса data:>",
  "image_tail": "<URL или Base64>",
  "element_list": [ { "element_id": 123 } ],
  "sound": "on",
  "mode": "pro",
  "duration": "10"
}
```

## Примеры

### Пример 1: Kling 4.0 через API, вне Китая

**Вход:** «Kling 4.0 через API, 15 секунд, 9:16, без референсов».

**Результат:** текст промпта и тело для `POST https://api-singapore.klingai.com/text-to-video/kling-4.0`: `"settings": {"duration": 15, "resolution": "1080p", "aspect_ratio": "9:16"}`; поля `model` и `negative_prompt` в теле нет; результат — `GET /tasks?task_ids=<id>` после статуса `succeeded`.

### Пример 2: VIDEO 3.0 в приложении с ручными планами

**Вход:** «Kling 3 в приложении, четыре плана по три-четыре секунды».

**Результат:** текст промпта по планам и настройки словами: модель VIDEO 3.0, включить Multi-Shot и Custom Multi-Shot, четыре плана с длительностями, общая длительность 14 с, соотношение сторон по запросу.
