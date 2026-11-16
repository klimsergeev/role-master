# Seedance: поверхности

## Назначение

Где доступны модели Seedance серий 2.0 и 2.5 — BytePlus ModelArk, Volcano Engine Ark и приложения ByteDance, — чем площадки различаются, как устроена асинхронная задача и в какой форме выдаётся готовый результат по типам задач.

Состояние на 2026-11-16.

## BytePlus ModelArk

- Международная площадка, регион `ap-southeast-1`; в регионе `eu-west-1` видео-моделей Seedance нет.
- Метод создания задачи: `POST https://ark.ap-southeast.bytepluses.com/api/v3/contents/generations/tasks`.
- Аутентификация — только ключ API: заголовок `Authorization: Bearer $ARK_API_KEY`.
- Идентификаторы моделей с префиксом `dreamina-` (в [models.md](models.md)).
- Включение Seedance 2.5 требует одного из условий: баланс аккаунта больше 30 USD, AI Savings Plan от 30 USD или купленный пакет ресурсов. ЕСЛИ API отказывает в доступе к 2.5 -> назвать пользователю эти условия.

## Volcano Engine Ark

- Китайская площадка, регион `cn-beijing`; других регионов с отдельным адресом не названо.
- Метод создания задачи: `POST https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks`.
- Аутентификация — ключ API: заголовок `Authorization: Bearer $ARK_API_KEY`.
- Идентификаторы моделей с префиксом `doubao-` (в [models.md](models.md)).
- Тело запроса совпадает с BytePlus по именам полей, типам, вложенности, умолчаниям, допустимым значениям и лимитам. Отличия: поле `tools` есть только у Volcano Engine; умолчание `duration` у серии 2.0 не указано; текст водяного знака другой. Подробности — в [parameters.md](parameters.md).

## Общее для обеих площадок

- Задача асинхронная: метод создания возвращает `id`; статус запрашивается `GET /contents/generations/tasks/{id}` или приходит на `callback_url`. Статусы: `queued`, `running`, `succeeded`, `failed`, `expired`.
- Готовое видео — в `content.video_url`; ссылка хранится 24 часа и скачивается не больше 100 раз — видео нужно скачать сразу.
- ID задачи действителен 7 дней; ID черновика, созданного с 10:00 28.10.2026 (UTC+8), — 14 дней.
- Параметры передаются в теле запроса — там их проверяют строго. Старый способ флагами после текста промпта существует, скиллом не используется (подробности в [parameters.md](parameters.md)).

## Приложения ByteDance

- Seedance 2.5 доступна в приложениях Jimeng AI и Doubao Pro (раздел генерации видео, выбор Seedance 2.5) и в Dreamina.
- Скилл даёт для приложений только текст промпта. Настройки интерфейса приложений скиллом не описаны: длительность, соотношение сторон и порядок загрузки материалов называются словами из запроса пользователя.
- Ссылки на загруженные материалы в тексте промпта — по [references.md](references.md): номера по порядку загрузки.

## Форма готового результата

### Приложение

Текст промпта на английском и перечень настроек словами: длительность, соотношение сторон, какие материалы загрузить и в каком порядке.

### API

Текст промпта и тело запроса. Скелеты ниже собраны скиллом из полей `content` и параметров; модель в скелетах — Seedance 2.5 на BytePlus, для другой модели и площадки идентификатор берётся из [models.md](models.md), допустимые значения — из [parameters.md](parameters.md).

Из текста:

```json
{
  "model": "dreamina-seedance-2-5-260628",
  "content": [
    { "type": "text", "text": "<промпт на английском>" }
  ],
  "ratio": "16:9",
  "duration": 10,
  "resolution": "720p",
  "generate_audio": true
}
```

По первому кадру — изображение с ролью `first_frame` (роль можно не указывать); у серии 2.5 `ratio` только `adaptive`:

```json
"content": [
  { "type": "text", "text": "<промпт на английском>" },
  { "type": "image_url", "image_url": { "url": "<URL или data:image/<формат>;base64,...>" }, "role": "first_frame" }
],
"ratio": "adaptive"
```

По первому и последнему кадру — два изображения, роль обязательна у обоих; у серии 2.5 `ratio` только `adaptive`:

```json
"content": [
  { "type": "text", "text": "<промпт на английском>" },
  { "type": "image_url", "image_url": { "url": "<URL>" }, "role": "first_frame" },
  { "type": "image_url", "image_url": { "url": "<URL>" }, "role": "last_frame" }
],
"ratio": "adaptive"
```

По референсам — роли `reference_image`, `reference_video`, `reference_audio`; у серии 2.5 можно явно задать `omni_reference_task_type`:

```json
"content": [
  { "type": "text", "text": "<промпт на английском>" },
  { "type": "image_url", "image_url": { "url": "<URL>" }, "role": "reference_image" },
  { "type": "video_url", "video_url": { "url": "<URL>" }, "role": "reference_video" },
  { "type": "audio_url", "audio_url": { "url": "<URL>" }, "role": "reference_audio" }
],
"omni_reference_task_type": "reference"
```

Правка видео у серии 2.5 — видео с ролью `reference_video` длиной 4–30 с, `ratio` — `adaptive`, `duration` — `-1`:

```json
"content": [
  { "type": "text", "text": "<промпт правки на английском>" },
  { "type": "video_url", "video_url": { "url": "<URL>" }, "role": "reference_video" }
],
"ratio": "adaptive",
"duration": -1,
"omni_reference_task_type": "edit"
```

Продление у серии 2.5 — видео с ролью `reference_video`, `ratio` — `adaptive`, выход `mov`:

```json
"content": [
  { "type": "text", "text": "<промпт продления на английском>" },
  { "type": "video_url", "video_url": { "url": "<URL>" }, "role": "reference_video" }
],
"ratio": "adaptive",
"duration": 10,
"output_format": "mov",
"omni_reference_task_type": "extend"
```

Черновик Seedance 2.5, шаг 2 — только ID черновика, `resolution` — `1080p` или `4k`; промпт, материалы, `duration`, `ratio`, `seed`, `generate_audio` и `omni_reference_task_type` не передаются:

```json
{
  "model": "dreamina-seedance-2-5-260628",
  "content": [
    { "type": "draft_task", "draft_task": { "id": "<DRAFT_TASK_ID>" } }
  ],
  "resolution": "1080p"
}
```

- У серии 2.0 поля `omni_reference_task_type` и `output_format` не передаются; в задачах по кадрам, правки и продления у 2.0 можно задать конкретное соотношение сторон.
- Сочетания элементов `content`, лимиты материалов и правила ролей — в [references.md](references.md).

## Примеры

### Пример 1: генерация на BytePlus

**Вход:** «Seedance 2.5, не flash, через BytePlus, 15 секунд, горизонтально, со звуком».

**Результат:** текст промпта и тело запроса из скелета «Из текста»: `"model": "dreamina-seedance-2-5-260628"`, `"ratio": "16:9"`, `"duration": 15`, `"generate_audio": true`; метод `POST https://ark.ap-southeast.bytepluses.com/api/v3/contents/generations/tasks`; видео скачать сразу после статуса `succeeded`.

### Пример 2: та же задача на Volcano Engine

**Вход:** «то же самое через Volcano Engine».

**Результат:** `"model": "doubao-seedance-2-5-260628"`, метод `POST https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks`; остальные поля те же.
