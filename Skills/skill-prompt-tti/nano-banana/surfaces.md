# Nano Banana: поверхности

## Назначение

Где работают модели Nano Banana на собственных площадках Google — приложение Gemini, Google AI Studio, Gemini API, Google Cloud, — что меняется на каждой поверхности и в какой форме выдаётся готовый результат.

## Приложение Gemini

- Пользователь выбирает не модель изображений, а модель Gemini (Flash-Lite, Flash, Pro), и от неё и от тарифа зависит, какая Nano Banana отвечает. Позиции — в [models.md](models.md).
- Nano Banana 2 Lite не рассчитана на несколько референсов и множественные правки.
- Перегенерация через Pro: внизу справа More → Redo with Pro. Исчерпав дневную квоту Nano Banana 2, переделывать изображения через Pro нельзя.
- Возраст: генерация и редактирование — от 18 лет; генерация — от 13 лет (или возраста, принятого в стране); редактирование до 18 лет недоступно.
- Скачивание: в 2K с тарифом Google AI или в 1K без него.
- Пропорции в приложении задаются словами в тексте промпта.

### Как начинать промпт в приложении

- Начинать со слов `draw`, `generate`, `create`.
- Назвать стиль: например, `photorealistic`, `charcoal drawing`, `watercolor painting`, `cartoon illustration`.
- Дать подробное визуальное описание: предмет, что он делает, фон или обстановка.
- Формула: `<Create/generate an image of> <subject> <action> <scene>`.

## Google AI Studio и Gemini API

- Gemini API имеет два интерфейса с разными именами параметров:
  - generateContent (`client.models.generate_content`, путь `/v1/models/{model}:generateContent`);
  - Interactions API (`client.interactions.create`, путь `/v1beta/interactions`).
- Таблица имён параметров в обоих интерфейсах — в [parameters.md](parameters.md).
- Многошаговый диалог: в generateContent — `client.chats.create(...)` и `chat.send_message(...)`; в Interactions API — `previous_interaction_id=interaction.id`.
- При чередующемся выводе текста и изображений в Interactions API свойства `.output_image` и `.output_text` не захватывают всю последовательность — нужно перебрать `steps`.

## Google Cloud (Agent Platform)

- Интерфейсы — консоль Google Cloud и Agent Platform API. В консоли: Agent Studio → Create prompt, в панели Outputs выбрать Image and text.
- Генерацию, редактирование, многошаговое редактирование и чередование текста с изображениями поддерживают все пять моделей.
- У Pro поддерживается только generateContent; Interactions API не поддерживается.
- У всех моделей изображений отмечена поддержка системных инструкций; что системная инструкция меняет в изображении, не описано.
- Вложение в запросе — не больше 256 МБ, весь сжатый запрос — не больше 500 МиБ.
- У Pro по HTTP- и HTTPS-ссылкам — не больше 10 изображений; до 14 — через адреса Cloud Storage (`gs://`) или встроенные данные.
- Результат можно сохранять в Cloud Storage: `outputConfig.outputUriPrefix` и `generationConfig.responseFormat[].image.delivery` = `"URI"` (для 2.1, 3.1 Flash, 3.1 Flash-Lite, 3 Pro).

## Что делает поверхность с промптом

- При неоднозначном промпте модель может ответить только текстом. ЕСЛИ нужны изображения -> прямо просить их: `create an image of`, `generate an image of`, `provide images as you go along`.
- Модель может нарисовать текст картинкой. ЕСЛИ нужен текстовый ответ -> прямо просить его: `generate narrative text along with illustrations`.
- Модели Gemini 3 перед генерацией рассуждают: создают до двух промежуточных изображений для проверки композиции и логики; последнее из них и есть итоговое.
- Переписывает ли поверхность промпт перед генерацией — не установлено.
- Модель может остановиться, не закончив; тогда повторить запрос или изменить промпт.

## Форма готового результата

| Поверхность | Форма |
|---|---|
| Приложение Gemini | текст промпта; пропорции и ориентация — словами в тексте |
| Gemini API, generateContent | текст промпта плюс `config`: `response_modalities`, `image_config` (`aspect_ratio`, `image_size`), при необходимости `thinking_config` и `tools` |
| Gemini API, Interactions API | текст промпта плюс `response_format` (`type`, `aspect_ratio`, `image_size`, `mime_type`) и `generation_config` |
| Google Cloud | текст промпта плюс `generationConfig` с `imageConfig` и `responseModalities` |

## Примеры

### Пример 1: приложение

**Вход:** промпт для приложения Gemini, вертикальный постер.

**Результат:** `Create a vertical 9:16 poster of a lighthouse on a cliff at dusk, painted in bold gouache strokes with a warm orange and deep blue palette.`

### Пример 2: ответ текстом вместо изображения

**Вход:** «модель ответила описанием, а картинки нет».

**Результат:** в начало промпта добавлен явный запрос изображения (`Generate an image of …`), в API — `response_modalities=['Image']`.
