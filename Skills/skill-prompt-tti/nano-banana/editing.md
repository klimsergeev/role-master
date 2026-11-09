# Nano Banana: правка готового изображения

## Назначение

Как править готовое изображение моделями Nano Banana: шаблоны правки, что называть меняющимся и сохраняемым, многошаговый диалог, подписи рассуждения, пропорции при правке и известные сбои.

## Что меняется и что остаётся

- Промпт правки говорит, что меняется и что остаётся; то, что должно остаться в точности прежним, называется явно.
- Маску рисовать не нужно — область правки задаётся словами, остальное не трогается.
- Важные детали (лицо, логотип) сохраняются, если подробно описать их вместе с просьбой о правке.
- Инструкции правки — прямо и конкретно: `change the man's tie to green`, `remove the car in the background`.

## Шаблоны правки

| Задача | Шаблон |
|---|---|
| Добавить или убрать элемент | `Using the provided image of [subject], please [add/remove/modify] [element] to/from the scene. Ensure the change is [description of how the change should integrate].` Модель подстраивается под стиль, свет и перспективу исходника |
| Семантическая маска | `Using the provided image, change only the [specific element] to [new element/description]. Keep everything else in the image exactly the same, preserving the original style, lighting, and composition.` |
| Перенос стиля | `Transform the provided photograph of [subject] into the artistic style of [artist/art style]. Preserve the original composition but render it with [description of stylistic elements].` |
| Композиция из нескольких изображений | `Create a new image by combining the elements from the provided images. Take the [element from image 1] and place it with/on the [element from image 2]. The final image should be a [description of the final scene].` |
| Сохранение деталей | `Using the provided images, place [element from image 2] onto [element from image 1]. Ensure that the features of [element from image 1] remain completely unchanged.` |
| Эскиз в изображение | `Turn this rough [medium] sketch of a [subject] into a [style description] photo. Keep the [specific features] from the sketch but add [new details/materials].` |
| Обзор персонажа по ракурсам | `A studio portrait of [person] against [background], [looking forward/in profile looking right/etc.]`; ракурсы получают последовательными запросами, включая ранее сгенерированные изображения в следующие запросы; для сложной позы — референс позы |
| Перевод текста на изображении | `translate all the English text on the three yellow and blue cans into Korean, while keeping everything else the same` |

## Многошаговый диалог

- Многошаговый диалог — рекомендуемый способ доработки изображений.
- generateContent: `client.chats.create(...)` и `chat.send_message(...)`.
- Interactions API: `previous_interaction_id` ссылается на исходное взаимодействие — персонаж и стиль сохраняются между правками без повторной загрузки изображения.

### Подписи рассуждения

- Подпись рассуждения из ответа модели возвращается в историю следующего хода без изменений; без этого запрос может завершиться ошибкой.
- В SDK Google Gen AI в режиме чата подписи обрабатываются автоматически.
- В Google Cloud уровень `MINIMAL` в многошаговом диалоге требует подписей рассуждения; без них — ошибка `400: INVALID_ARGUMENT`.

## Пропорции при правке

- Источники расходятся о пропорции по умолчанию: одна позиция — модель подгоняет размер результата под входное изображение, иначе генерирует квадрат 1:1; другая — модель сама выбирает пропорцию с учётом переданных референсов.
- Для `gemini-2.5-flash-image`: модель обычно сохраняет пропорции входа. ЕСЛИ не сохранила -> сказать прямо: `Update the input image... Do not change the input aspect ratio.` При нескольких входах с разными пропорциями модель берёт пропорции последнего. ЕСЛИ нужной пропорции не добиться промптом -> приложить референс с нужными размерами.
- Для API — явный `aspect_ratio` (значения — в [parameters.md](parameters.md)).

## Известные сбои

- Уплывание персонажа: если черты персонажа начинают уплывать после многих правок, начать новый диалог с подробным описанием.
- Сложные правки (смешение изображений, смена света) иногда дают неестественные артефакты; сохранение персонажа между правками может различаться.
- У 2.1 при правке изредка сохраняется поза исходного объекта.
- Nano Banana 2 Lite не оптимизирована под последовательное многошаговое редактирование; рассчитана на быстрые локальные правки в диалоге (смена цветов, стикеры, правка фона).

## Примеры

### Пример 1: заменить одну деталь

**Вход:** фото гостиной, нужно заменить синий диван на кожаный коньячного цвета.

**Результат:** `Using the provided image, change only the blue sofa to a cognac leather sofa. Keep everything else in the image exactly the same, preserving the original style, lighting, and composition.`

### Пример 2: персонаж уплыл после серии правок

**Вход:** «после седьмой правки лицо героини стало другим».

**Результат:** новый диалог; в первом промпте — подробное описание черт героини и исходное изображение; дальше правки по одной.
