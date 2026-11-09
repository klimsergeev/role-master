# Nano Banana: устройство промпта

## Назначение

Как модели Nano Banana читают промпт: форма, формулы, порядок, детализация, текст на изображении, стиль и фотореализм, язык — и что проверить перед выдачей промпта. Правила общие для всех моделей семейства.

## Форма: связный абзац, а не список слов

- Сцена описывается связным описательным абзацем, а не перечнем ключевых слов: главная сила модели — понимание языка, и связное описание почти всегда даёт более цельное изображение, чем набор разрозненных слов.

## Конкретика

- Чем конкретнее описание, тем больше контроля над результатом.
- Предельная конкретика: вместо `fantasy armor` — `ornate elven plate armor, etched with silver leaf patterns, with a high collar and pauldrons shaped like falcon wings`.
- Контекст и цель: промпт `Create a logo for a high-end, minimalist skincare brand` даёт лучший результат, чем `Create a logo`.

Общие правила выбора элементов — в [../prompt-elements.md](../prompt-elements.md).

## Глагол операции в начале

- Промпт начинается с сильного глагола, который называет основную операцию.
- В приложении Gemini — со слов `draw`, `generate`, `create`.

## Формулы

| Задача | Формула |
|---|---|
| Генерация без референсов | `[Subject] + [Action] + [Location/context] + [Composition] + [Style]` |
| Генерация с референсами | `[Reference images] + [Relationship instruction] + [New scenario]` — подробности в [references.md](references.md) |
| Правка | промпт говорит, что меняется и что остаётся, и явно называет то, что должно остаться в точности прежним — подробности в [editing.md](editing.md) |
| Данные из поиска | `[Source/Search request] + [Analytical task] + [Visual translation]` |
| Текст и локализация | кавычки, шрифт, язык текста — раздел «Текст на изображении» ниже |

## Элементы промпта

| Элемент | Что задать |
|---|---|
| Subject | кто или что на изображении, конкретно |
| Composition | как построен кадр |
| Action | что происходит |
| Location | где происходит сцена |
| Style | общая эстетика |
| Editing Instructions | для изменения готового изображения — прямо и конкретно: `change the man's tie to green`, `remove the car in the background` |

Уточнения:

- Композиция и пропорции — задать холст: `A 9:16 vertical poster`, `A cinematic 21:9 wide shot`.
- Камера и свет — ставить кадр как оператор: `A low-angle shot with a shallow depth of field (f/1.8)`, `Golden hour backlighting creating long shadows`, `Cinematic color grading with muted teal tones`.
- Фактические ограничения для схем — требовать точности и следить, чтобы входные данные были верны; фактическую точность схем и инфографики проверять всегда.
- Каждому персонажу или объекту можно присвоить имя и дальше ссылаться на него по имени.

## Порядок и сложные сцены

- Сложную сцену со многими элементами разбивать на шаги: `First, create a background … Then, in the foreground, add … Finally, place …`.
- Иного правила о порядке элементов, кроме формул выше и глагола операции в начале, нет.

## Длина

- Числового предела длины промпта нет; общий лимит входа модели в токенах — в [models.md](models.md).

## Отрицания

- Вместо запрета описывать желаемую сцену утвердительно: вместо `no cars` — `an empty, deserted street with no signs of traffic`.
- Отдельного поля негативного промпта нет.

## Доработка

- Идеала с первой попытки не ждать; доработка — мелкими правками в диалоге: `That's great, but can you make the lighting a bit warmer?`, `Keep everything the same, but change the character's expression to be more serious.`

## Пропорции в промпте

- Пропорцию задают и в тексте промпта (`Aspect ratio 16:9`, `Square image`, `Vertical portrait orientation`), и параметром `aspect_ratio` в API (значения — в [parameters.md](parameters.md)).
- В приложении Gemini пропорция задаётся словами в тексте промпта.

## Стиль и фотореализм

- Для реализма — фототермины: ракурсы, типы объективов, свет, мелкие детали.
- Язык фото и кино: `wide-angle shot`, `macro shot`, `low-angle perspective`, `85mm portrait lens`, `Dutch angle`.
- Лексика постановки кадра:
  - свет — `three-point softbox setup`, `Chiaroscuro lighting with harsh, high contrast`;
  - камера — `GoPro`, `Fujifilm camera for authentic color science`, `cheap disposable camera`;
  - объектив — `low-angle shot with a shallow depth of field (f/1.8)`, `wide-angle lens`, `macro lens`;
  - цветокоррекция и плёнка — `as if on 1980s color film, slightly grainy`, `Cinematic color grading with muted teal tones`;
  - материалы — `navy blue tweed`.
- Иллюстрация и стикер: явно назвать стиль и попросить белый фон. Прозрачный фон модель не поддерживает.

## Текст на изображении

Общие правила — в [../text-in-image.md](../text-in-image.md). Особенности Nano Banana:

- Нужные слова — в кавычках.
- Шрифт — описанием стиля или названием: `bold, white, sans-serif font`, `Century Gothic 12px font`.
- Ясно сказать, какой текст должен появиться и как он выглядит: `The headline 'URBAN EXPLORER' rendered in bold, white, sans-serif font at the top.`
- Сначала текст, потом изображение: со сложным текстом модель работает лучше, если сначала получить текст, а затем попросить изображение с ним.
- Перевод текста на изображении: промпт пишется на одном языке, а язык текста на изображении указывается отдельно.
- Для профессиональных материалов с текстом подходит Gemini 3 Pro Image.
- Ограничения:
  - мелкий текст, мелкие детали и точная орфография могут получаться неидеально;
  - многоязычный текст может содержать грамматические ошибки и упускать культурные нюансы. ЕСЛИ текст на изображении не на английском -> рядом с промптом предупредить о возможных грамматических ошибках;
  - у 2.1 мелкий текст часто размыт в 1K. ЕСЛИ модель 2.1 и текст мелкий -> рядом с промптом предупредить об этом.

## Системная инструкция

- Влияние системной инструкции на изображение не установлено: поле `systemInstruction` описано для всех моделей без оговорок, в Google Cloud у моделей изображений отмечена поддержка системных инструкций, но что она меняет в изображении, не описано.

## Язык промпта

Промпт пишется на английском — это принцип скилла. Что известно о языке у Nano Banana:

- Список языков для лучшего качества, без привязки к модели: EN, ar-EG, de-DE, es-MX, fr-FR, hi-IN, id-ID, it-IT, ja-JP, ko-KR, pt-BR, ru-RU, ua-UA, vi-VN, zh-CN.
- У Gemini 3 Pro Image — список из 15 языков: ar-EG, de-DE, EN, es-MX, fr-FR, hi-IN, id-ID, it-IT, ja-JP, ko-KR, pt-BR, ru-RU, ua-UA, vi-VN, zh-CN.
- Для `gemini-2.5-flash-image` источники расходятся: одна позиция — общий список из 15 языков выше; другая — пять языков: EN, es-MX, ja-JP, zh-CN, hi-IN.
- Отдельного списка для 2.1, 3.1 Flash Image и 3.1 Flash Lite Image нет.
- Переводит ли сервис промпт — не установлено.
- Промпт моделей Gemini 3 проходит встроенное рассуждение; язык этого шага не описан.

## Шаблоны генерации

| Сценарий | Шаблон |
|---|---|
| Фотореализм | `A photorealistic [type of shot] of a [subject description] in a [setting description]. [Description of the light]. Shot from a [camera angle] with a [lens type].` |
| Фотореализм с атмосферой | `A photorealistic [shot type] of [subject], [action or expression], set in [environment]. The scene is illuminated by [lighting description], creating a [mood] atmosphere. Captured with a [camera/lens details], emphasizing [key textures and details]. The image should be in a [aspect ratio] format.` |
| Иллюстрация | `A [style] of a [subject, with details about accessories or actions] doing [activity]. The design features [visual qualities, e.g., bold outlines, cel-shading, etc.] and [color/background preference].` Фон — белый, прозрачного фона нет |
| Стикер | `A [style] sticker of a [subject], featuring [key characteristics] and a [color palette]. The design should have [line style] and [shading style]. The background must be white.` |
| Текст на изображении | `Create a [image type] for [brand/concept] with the text "[text to render]" in a [font style]. The design should be [style description], with a [color scheme].` |
| Товарная съёмка | `A high-resolution, studio-lit product photograph of a [product description] on a [background surface/description]. The lighting is a [lighting setup, e.g., three-point softbox setup] to [lighting purpose]. The camera angle is a [angle type] to showcase [specific feature]. Ultra-realistic, with sharp focus on [key detail]. [Aspect ratio].` |
| Минимализм | `A minimalist composition featuring a single [subject] positioned in the [bottom-right/top-left/etc.] of the frame. The background is a vast, empty [color] canvas, creating significant negative space. Soft, subtle lighting. [Aspect ratio].` |
| Комикс, раскадровка | `Make a 3 panel comic in a [style]. Put the character in a [type of scene].` Лучше всего работает с Gemini 3 Pro Image и 3.1 Flash Image |
| Кадр комикса с текстом | `A single comic book panel in a [art style] style. In the foreground, [character description and action]. In the background, [setting details]. The panel has a [dialogue/caption box] with the text "[Text]". The lighting creates a [mood] mood. [Aspect ratio].` |
| Данные из поиска | `Make a simple but stylish graphic of last night's Arsenal game in the Champion's League`; нужен инструмент поиска Google в запросе |

## Проверка перед выдачей

1. Промпт — связный описательный абзац, а не список слов через запятую.
2. Промпт начинается с глагола операции (generate, create, draw, edit) и явно просит изображение.
3. Названы предмет, действие, место, композиция, стиль; есть назначение изображения, если оно известно.
4. Нежелаемое описано утвердительно, без `no X`.
5. Текст для изображения — в кавычках, шрифт описан или назван; при длинном или сложном тексте предложено сначала получить текст.
6. Пропорция названа в тексте и, для API, передана в `aspect_ratio` значением, которое есть у выбранной модели.
7. Не запрошен прозрачный фон; для стикера — белый фон.
8. Параметры названы именами выбранного интерфейса (generateContent или Interactions API) и есть в [parameters.md](parameters.md).
9. Не используются возможности, которых нет у модели: 512px у 2.1 и Pro, 2K и 4K у Lite, стилевые референсы не у Pro, поиск по картинкам не у 2.1 и 3.1 Flash, `seed` и параметры выборки у 2.1 в Google Cloud.
10. Предупреждения о тексте на неанглийском языке и о мелком тексте у 2.1 приведены рядом с промптом.

## Примеры

### Пример 1: товарная фотография

**Вход:** «фото керамической кружки для интернет-магазина, квадрат, Nano Banana 2.1 через API».

**Результат:** промпт по шаблону товарной съёмки: `Generate a high-resolution, studio-lit product photograph of a matte sage-green ceramic mug on a pale oak surface. The lighting is a three-point softbox setup to soften reflections on the glaze. The camera angle is a slightly elevated three-quarter view to showcase the handle. Ultra-realistic, with sharp focus on the glaze texture. Square image.` В запросе — `aspect_ratio="1:1"`.

### Пример 2: надпись на русском

**Вход:** «открытка с надписью «С днём рождения, мама!»».

**Результат:** промпт на английском, надпись дословно в кавычках: `Create a watercolor greeting card with the text "С днём рождения, мама!" in an elegant hand-lettered script font, surrounded by loose peonies in soft pink.`; рядом с промптом — предупреждение, что многоязычный текст может содержать грамматические ошибки, и предложение сначала получить текст отдельно.
