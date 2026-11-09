# Nano Banana: параметры

## Назначение

Параметры моделей Nano Banana в Gemini API (generateContent и Interactions API) и Google Cloud: имена, значения, умолчания по моделям, лимиты входа и коды завершения.

Состояние на 2026-11-09.

## Имена параметров в двух интерфейсах

| Что задаётся | generateContent (Python SDK / REST) | Interactions API |
|---|---|---|
| Модальности ответа | `response_modalities=['TEXT', 'IMAGE']` / `"responseModalities": ["TEXT", "IMAGE"]` | `response_format=[{"type": "text"}, {"type": "image"}]` |
| Только изображение | `response_modalities=['Image']` | `response_format={"type": "image", …}` |
| Пропорции | `image_config=types.ImageConfig(aspect_ratio="16:9")` / `"imageConfig": {"aspectRatio": "16:9"}` | `response_format={"type": "image", "aspect_ratio": "16:9"}` |
| Разрешение | `image_size="2K"` / `"imageSize": "2K"` | `"image_size": "2K"` |
| Формат файла | — | `"mime_type": "image/jpeg"` |
| Уровень рассуждения | `thinking_config=types.ThinkingConfig(thinking_level="High", include_thoughts=True)` / `"thinkingConfig": {"thinkingLevel": "HIGH", "includeThoughts": true}` | `generation_config={"thinking_level": "high"}` |
| Поиск Google | `tools=[{"google_search": {}}]` | `tools=[{"type": "google_search"}]` |
| Поиск по картинкам | `types.GoogleSearch(search_types=types.SearchTypes(web_search=types.WebSearch(), image_search=types.ImageSearch()))` / `{"google_search": {"searchTypes": {"webSearch": {}, "imageSearch": {}}}}` | `{"type": "google_search", "search_types": ["web_search", "image_search"]}` |
| Многошаговый диалог | `client.chats.create(...)` + `chat.send_message(...)` | `previous_interaction_id=interaction.id` |
| Системная инструкция | `systemInstruction` | — |

## Модальности ответа

- По умолчанию модель возвращает текст и изображение.
- Только изображение: `response_modalities=['Image']`.

## Пропорции `aspectRatio`

| Модель | Значения |
|---|---|
| Nano Banana 2.1, Nano Banana 2 | `1:1`, `1:4`, `4:1`, `1:8`, `8:1`, `2:3`, `3:2`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9` |
| Nano Banana Pro | источники расходятся: одна позиция — `1:1`, `2:3`, `3:2`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9`; другая — те же плюс `1:4`, `4:1`, `1:8`, `8:1` |
| Nano Banana 2 Lite | `1:1`, `3:2`, `2:3`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9` (расхождение о числе пропорций — в [models.md](models.md)) |

- Умолчание: источники расходятся — одна позиция: пропорция входного изображения, иначе 1:1; другая: модель выбирает пропорцию с учётом переданных референсов.

## Разрешение `imageSize`

- Допустимые значения — `512`, `1K`, `2K`, `4K`; если не задано — `1K`.
- `K` пишется заглавной; `512` пишется без `K`; строчные значения вроде `1k` отклоняются.
- По моделям: 2.1 — `1K`, `2K`, `4K`; Nano Banana 2 — `512`, `1K`, `2K`, `4K`; Pro — `1K`, `2K`, `4K`; Lite — только `1K`.
- Поле, заданное для модели, которая эти настройки не поддерживает, возвращает ошибку.

### Выходные размеры (выборка)

| Пропорция | 2.1: 1K / 2K / 4K | Nano Banana 2: 512 | Pro: 1K / 4K | 2.5 Flash Image |
|---|---|---|---|---|
| 1:1 | 1024x1024 / 2048x2048 / 4096x4096 | 512x512 | 1024x1024 / 4096x4096 | 1024x1024 |
| 16:9 | 1376x768 / 2752x1536 / 5504x3072 | 688x384 | 1376x768 / 5504x3072 | 1344x768 |
| 9:16 | 768x1376 / 1536x2752 / 3072x5504 | 384x688 | 768x1376 / 3072x5504 | 768x1344 |
| 21:9 | 1584x672 / 3168x1344 / 6336x2688 | 792x168 (так указано; пропорции 21:9 при ширине 792 соответствует высота около 339) | 1584x672 / 6336x2688 | 1536x672 |
| 8:1 | 3072x384 / 6144x768 / 12288x1536 | 1536x192 | нет | нет |

## Рассуждение

| Модель | Gemini API | Google Cloud |
|---|---|---|
| Nano Banana 2.1 | `minimal`, `medium`, `high`; по умолчанию `medium` | `MINIMAL`, `MEDIUM`, `HIGH`; по умолчанию `MEDIUM` |
| Nano Banana 2 | `minimal`, `high`; по умолчанию `minimal` | `MINIMAL`, `HIGH`; по умолчанию `MINIMAL` |
| Nano Banana 2 Lite | `minimal`, `high`; по умолчанию `minimal` | `MINIMAL`, `HIGH`; по умолчанию `MINIMAL` |
| Nano Banana Pro | уровни не перечислены; умолчание зависит от модели | только `HIGH`; по умолчанию `HIGH` |

- `minimal` даёт наименьшую задержку, но не означает, что модель совсем не рассуждает.
- Рассуждение не гарантировано в каждом запросе: поведение модели недетерминировано.
- `include_thoughts` / `includeThoughts` возвращает части рассуждения; в Google Cloud при `includeThoughts` = true промежуточные изображения рассуждения тоже записываются в Cloud Storage.
- Отключение рассуждения у Nano Banana 2 — позиции в [models.md](models.md).

## Параметры, которые возвращают ошибку

- У Nano Banana 2.1 в Google Cloud: `seed`, `topK`, `logprobs`, `temperature`, `topP` — любой из них возвращает ошибку API.
- `imageSize` на модели, которая его не поддерживает, — ошибка.
- `thinkingLevel` рассчитан на Gemini 3 и новее; с более ранними моделями — ошибка.

## Системная инструкция

- `systemInstruction` — необязательное поле системных инструкций; в частях допускается только текст, каждая часть идёт отдельным абзацем.
- Влияние на изображение не установлено.

## Поиск

- Поиск Google не поддерживается моделью `gemini-3.1-flash-lite-image`.
- Поиск по картинкам — только Nano Banana 2.1 и Nano Banana 2.
- Реальные фото людей из веб-поиска при привязке к поиску у 2.1 и 3.1 Flash Image пока не используются.

## Вход

- Встроенные изображения ограничивают весь запрос (текст, системные инструкции, байты) 20 МБ; для больших запросов файлы загружаются через File API.
- Форматы: `image/png`, `image/jpeg`, `image/webp`, `image/heic`, `image/heif`.
- Google Cloud: вложение — не больше 256 МБ, весь сжатый запрос — не больше 500 МиБ; у Pro по ссылкам HTTP и HTTPS — не больше 10 изображений.
- Лимиты токенов по моделям — в [models.md](models.md).

## Коды завершения, не связанные с модерацией

| Код | Значение |
|---|---|
| `NO_IMAGE` | изображение ожидалось, но не создано |
| `IMAGE_OTHER` | генерация остановлена по прочей причине |
| `IMAGE_RECITATION` | генерация остановлена из-за воспроизведения известного материала |

## Примеры

### Пример 1: широкий баннер в 2K

**Вход:** «баннер 21:9 в 2K, Nano Banana 2.1, generateContent».

**Результат:** `config=types.GenerateContentConfig(response_modalities=['Image'], image_config=types.ImageConfig(aspect_ratio="21:9", image_size="2K"))`.

### Пример 2: `512` на Nano Banana 2.1

**Вход:** «сделай превью в 512px на 2.1».

**Результат:** 2.1 не поддерживает 512px; варианты — `1K` на 2.1 или `512` на Nano Banana 2 (`gemini-3.1-flash-image`), если пользователь назовёт эту модель.
