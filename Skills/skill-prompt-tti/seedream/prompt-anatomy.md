# Seedream: устройство промпта

## Назначение

Как писать промпт для Seedream 5.0 pro и 5.0 flash: откуда берутся правила, пять общих правил, состав и порядок описания, длина, соотношение сторон, цвет, текст на изображении, язык — и что проверить перед выдачей промпта.

## Откуда берутся правила

- Отдельных правил промпта для 5.0 pro и flash нет. Для них заявлено, что базовое использование — генерация по тексту, по изображению, смешение нескольких изображений — такое же, как у других моделей Seedream.
- Правила этого файла, кроме помеченных как правила 5.0 pro и flash, сформулированы для других моделей Seedream. Источники расходятся о том, для каких именно: одна позиция — для Seedream 4.5 и 4.0; другая — для Seedream 5.0 lite, 4.5 и 4.0.
- Правила 5.0 pro и flash о координатах, рамках, слоях и цвете — в [editing.md](editing.md) и в разделе «Цвет» ниже.

## Пять общих правил

1. Сцена описывается связным естественным языком: объект + действие + окружение; если важна эстетика — добавить стиль, цвет, свет или композицию.
   - Рекомендуется: `A girl in a lavish dress walking under a parasol along a tree-lined path, in the style of a Monet oil painting.`
   - Избегать: `Girl, umbrella, tree-lined street, oil painting texture.`
2. Прямо назвать назначение и тип изображения.
   - Пример: `Design a logo for a gaming company. The logo features a dog playing with a game controller. The company name "PITBULL" is written on it.`
3. Если нужен определённый стиль — точные слова стиля или изображение-референс: `picture book style`, `children's book illustration style`.
4. Текст, который должен появиться на изображении, — в двойных кавычках.
   - Рекомендуется: `Generate a poster with the title "Seedream 4.5".` Избегать: `Generate a poster titled Seedream 4.5.`
5. Для правок — краткие однозначные инструкции без расплывчатых местоимений; если остальное должно остаться как было, сказать это прямо.
   - Рекомендуется: `Dress the tallest panda in pink Peking Opera costume and headgear, keeping its pose unchanged.` Избегать: `Put that one in pink clothes.`

Общие правила выбора элементов — в [../prompt-elements.md](../prompt-elements.md).

## Состав и порядок

- Схема: объект + действие + окружение, затем по необходимости стиль, цвет, свет, композиция.
- Влияние порядка элементов на результат не установлено.

## Краткость

- Краткий точный промпт обычно лучше нагромождения вычурных и сложных слов.
- Для сложных сцен — перечисление элементов с положением. Пример: `Interior view of an open refrigerator: Top shelf: On the left… Middle shelf… Bottom shelf…`
- Для схем, формул и учебных иллюстраций — точная терминология и явно заданные форма визуализации, вёрстка и стиль. Пример: `Draw the following system of binary linear equations and the corresponding solution steps on the blackboard: 5x + 2y = 26; 2x -y = 5.`

## Длина

- Не больше 300 китайских иероглифов или 600 английских слов. Слишком длинный промпт рассеивает информацию: модель упускает детали, держится главного, и элементы пропадают с изображения. Промпт пишется на английском — предел 600 слов.

## Соотношение сторон

- При `size` = уровень разрешения соотношение сторон, форма или назначение описываются словами в промпте, а итоговый размер выбирает модель. Пример начала промпта: `Vertical 9:16 educational infographic poster…`
- Другой способ — точный размер `widthxheight` (подробности в [parameters.md](parameters.md)).

## Цвет (5.0 pro)

- Цвет задаётся HEX-кодом или внешним образцом цвета.
- Пример с HEX: `change the pumpkins to an alternating pattern of dark green (#3E4A2E) and turmeric yellow (#DB973E)`
- Пример с образцом: `Using the material from Image 1 and the color swatch from Image 2, modify the sofa in Image 3.`
- Палитра перечисляется в промпте: `Color palette: white, deep navy blue…`

## Текст на изображении

Общие правила — в [../text-in-image.md](../text-in-image.md). Особенности Seedream:

- Двойные кавычки — правило 4 выше; сформулировано для других моделей Seedream, для 5.0 pro и flash отдельно не повторено и не отменено.
- 5.0 pro нативно генерирует текст ещё на 14 языках сверх китайского и английского: русском, арабском, филиппинском, тайском, турецком, корейском, малайском, испанском, португальском, индонезийском, французском, немецком, вьетнамском, японском.
- Мелкий текст — ограничение 5.0 pro. ЕСЛИ на изображении мелкий текст -> рядом с промптом предупредить об этом ограничении.

## Язык промпта

Промпт пишется на английском — это принцип скилла. Что известно о языке у Seedream 5.0 pro и flash:

- Заявленные языки промпта: все модели Seedream поддерживают китайский и английский; 5.0 pro и 5.0 flash дополнительно — русский, арабский, филиппинский, тайский, турецкий, корейский, малайский, испанский, португальский, индонезийский, французский, немецкий, вьетнамский и японский.
- У 5.0 pro язык промпта меняет культурный контекст изображения: модель подстраивает архитектуру, черты лиц и детали одежды под культуру языка промпта. ЕСЛИ нужен культурный контекст определённой страны -> назвать его словами в английском промпте.
- Сравнения качества по языкам промпта нет — не установлено.
- Модель доработки промпта — позиция в [models.md](models.md); язык её работы не описан.
- Переводит ли сервис промпт — не установлено.

## Шаблоны

| Сценарий | Пример |
|---|---|
| Сцена в стиле художника | `A girl in a lavish dress walking under a parasol along a tree-lined path, in the style of a Monet oil painting.` |
| Логотип с названием | `Design a logo for a gaming company. The logo features a dog playing with a game controller. The company name "PITBULL" is written on it.` |
| Плакат с заголовком | `Generate a poster with the title "Seedream 4.5".` |
| Сложная сцена по частям | `Interior view of an open refrigerator: Top shelf: On the left… Middle shelf… Bottom shelf…` |
| Учебная схема | `Draw the following system of binary linear equations and the corresponding solution steps on the blackboard: 5x + 2y = 26; 2x -y = 5.` |

## Проверка перед выдачей

1. Промпт — связное описание «объект + действие + окружение», а не ключевые слова через запятую.
2. Названы назначение и тип изображения.
3. Стиль задан точными словами или референсом; противоречащих стилей нет.
4. Текст для изображения — дословно в двойных кавычках.
5. Промпт не длиннее 600 английских слов.
6. При `size` = уровень разрешения соотношение сторон написано словами в промпте.
7. Для правки — краткая инструкция без местоимений и сказано, что не менять.
8. Нет синтаксиса других моделей: `--ar`, `--seed`, негативного промпта, весов референсов.
9. Нет параметров, которые у 5.0 pro и flash не поддерживаются: `sequential_image_generation`, `stream`, `tools`; `fast` — только у 5.0 pro.
10. Предупреждение о мелком тексте приведено рядом с промптом.

## Примеры

### Пример 1: инфографика

**Вход:** «вертикальная инфографика о цикле воды для школьников, Seedream 5.0 pro».

**Результат:** `Vertical 9:16 educational infographic poster for middle-school students explaining the water cycle: evaporation, condensation, precipitation, and collection, shown as four labeled stages connected by arrows around a stylized landscape. Flat illustration style, color palette: white, deep navy blue, sky blue, and leaf green. Title at the top: "THE WATER CYCLE".` `size` — `2K`.

### Пример 2: промпт ключевыми словами

**Вход:** «girl, umbrella, alley, oil painting — сделай промпт для Seedream».

**Результат:** список заменён связным описанием по правилу 1: `A girl in a lavish dress walking under a parasol along a tree-lined path, in the style of a Monet oil painting.`
