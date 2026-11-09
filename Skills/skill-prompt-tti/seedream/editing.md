# Seedream: правка готового изображения

## Назначение

Как править изображение в Seedream 5.0 pro и 5.0 flash: операции правки, формулировка, визуальные пометки, координаты `<point>` и `<bbox>`, защитные рамки, правка по эскизу, разложение на слои и правка отдельного слоя.

## Операции и формулировка

- Операции: добавление, удаление, замена, изменение.
- Краткая однозначная инструкция без местоимений; что не менять — сказать прямо (правило 5 в [prompt-anatomy.md](prompt-anatomy.md)).

| Операция | Пример |
|---|---|
| Добавить | `Add matching silver earrings and a necklace to the girl in the image` |
| Удалить | `Remove the girl's hat.` |
| Заменить | `Replace the largest bread man with a croissant man, keeping the action and expression unchanged.` |
| Изменить | `Turn the three robots into transparent crystal, colored red, yellow and green from left to right.` |

## Визуальные пометки на изображении

- Когда содержимое сложно описать одними словами, цель и место правки указываются прямо на изображении стрелками, рамками или каракулями.
- У 5.0 pro и flash место правки отмечается на изображении от руки — наброском, каракулями, обводкой; модель распознаёт отмеченную область и создаёт или заменяет в ней содержимое. Пример: `Add a TV inside the blue box`
- Рамки разных цветов: каждая область обводится своим цветом, модель создаёт нужное в каждой области, не выходя за её границы; в промпте — указание для каждого цвета.
- Цветные пятна, линии и простые наброски работают как управляющий сигнал.
- Пример: `Insert a TV where the red area is marked and a sofa where the blue area is marked. Keep the original wooden style.`
- Полный пример: `Edit the image based on the hand-drawn sketch. Add a stack of realistic magazines or art books in the marked area at the lower left, and add a ceramic cup of coffee with a saucer in the marked area on the right. Remove all sketch lines. Keep the composition unchanged. Let the newly added objects blend naturally into the original scene.` Промпт просит убрать пометки из результата.

## Координаты `<point>` и `<bbox>` (5.0 pro и flash)

- Координаты нормированы на сетку 1000 × 1000: значения 0–999, левый верхний угол — 0,0, правый нижний — 999,999.
- `<point>x y</point>` — точка; область правки определяет модель.
- `<bbox>x1 y1 x2 y2</bbox>` — левый верхний и правый нижний углы; точно задаёт размер области.
- Пересчёт из пикселей: `x = round(x_px / width * 1000)`, `y = round(y_px / height * 1000)`.
- Шаблоны записываются в двух формах порядка слов, обе допустимы:
  - `Replace the object at Image 1 <point>520 460</point> with a crown.` и `Replace the object at <point>520 460</point> in Image 1 with a crown.`;
  - `Replace the area of Image 1 <bbox>120 180 640 760</bbox> with a garden.`;
  - `Place the subject from Image 1 <bbox>179 283 796 986</bbox> at the position of Image 2 <bbox>118 331 933 871</bbox>.`
- Цель внутри рамки: ЕСЛИ в рамке несколько объектов -> добавить в промпт описание цели (`the person on the left`, `the cat wearing a hat`, `the flower in the foreground`). Пример: `Replace the person on the left in Image 1 <bbox>120 180 640 760</bbox> with a robot.`
- Защитные рамки: объекты, которые должны остаться прежними, тоже обводятся рамкой с пометкой `keep unchanged` или `do not modify`. Пример: `Replace the area Image 1 <bbox>120 180 640 760</bbox> with a garden, and keep the area Image 1 <bbox>700 120 920 360</bbox> unchanged.`

## Эскиз с надписями

- Исходник должен быть чётким. ЕСЛИ на эскизе есть текстовые пояснения -> добавить в промпт `Generate based on the text in the image`. Явно назвать, что должно совпасть с референсом.
- Пример ограничений: `The room layout and furniture placement should exactly match the reference… Do not include any text or hand-drawn edges from the original sketch.`

## Разложение на слои `layer_decomposition`

- Включается `layer_decomposition: true`; изображение обязательно и только одно; промпт необязателен и может указать, что выделять.
- Результат — одно базовое изображение и до 16 независимо редактируемых слоёв; каждый слой — PNG с альфа-каналом.
- Три способа промпта:
  1. Без промпта — модель сама выделяет главные объекты, текст, фон, декоративные элементы; в SDK для Python и OpenAI промпт обязателен — общая инструкция вроде `decompose the main visual elements`.
  2. Перечисление элементов: `Decompose the person, title text, and decorative icon in the lower-right corner.`
  3. Рамки `<bbox>`: `Decompose the image into seven layers, including six text groups at: <bbox>180 64 812 198</bbox>, … and one parrot at <bbox>347 305 642 997</bbox>.`
- Если не получился хоть один слой, запрос падает целиком; если промпт просит больше слоёв, чем предел, часть информации может потеряться.
- Вход для разложения — только png и jpeg, от `512×512` пикселей.

## Правка отдельного слоя

- Обычная короткая инструкция: `Change the parrot in the image into a peacock.`
- Чтобы сохранить прозрачность в правленом слое, задать `background: transparent` и `output_format: png`.

## Примеры

### Пример 1: заменить объект в области

**Вход:** фото гостиной 2000×1500, заменить картину в области (240, 270)–(1280, 1140) на зеркало, не трогая лампу в области (1400, 180)–(1840, 540).

**Результат:** пересчёт: x = round(240 / 2000 × 1000) = 120 и так далее; промпт `Replace the painting in Image 1 <bbox>120 180 640 760</bbox> with a round brass-framed mirror, and keep the area Image 1 <bbox>700 120 920 360</bbox> unchanged.`

### Пример 2: в рамке два человека

**Вход:** «замени человека в рамке на робота», в рамке двое.

**Результат:** цель уточнена описанием внутри рамки: `Replace the person on the left in Image 1 <bbox>…</bbox> with a robot.`; второй человек защищён своей рамкой с `keep unchanged`.
