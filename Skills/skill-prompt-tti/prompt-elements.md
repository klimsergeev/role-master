# Элементы описания изображения

## Назначение

Общие для пяти моделей элементы, из которых складывается описание изображения, и правило «конкретные видимые признаки вместо оценочных и абстрактных слов». Порядок элементов, длина и форма промпта у моделей разные и лежат в файлах моделей: [midjourney/prompt-anatomy.md](midjourney/prompt-anatomy.md), [nano-banana/prompt-anatomy.md](nano-banana/prompt-anatomy.md), [gpt-image/prompt-anatomy.md](gpt-image/prompt-anatomy.md), [seedream/prompt-anatomy.md](seedream/prompt-anatomy.md), [krea/prompt-anatomy.md](krea/prompt-anatomy.md).

## Элементы

Промпт задаёт элемент или оставляет его модели. Разбор задачи — пройти по таблице и для каждого элемента решить: задан в запросе, нужен по назначению изображения или остаётся модели.

| Элемент | Что задаёт | Примеры значений |
|---|---|---|
| Объект и его видимые признаки | кто или что на изображении, сколько их, как выглядят | `three cats`, `a tan full-grain leather backpack` |
| Действие или поза | что происходит, как стоит или движется объект, куда смотрит | `walking under a parasol`, `looking down at the open book`, `full body visible, feet included` |
| Окружение | где происходит сцена, фон | `indoors`, `on a dark grey slate surface`, `in a surreal red desert landscape` |
| Композиция и кадр | план, ракурс, размещение объектов в кадре | `closeup`, `birds-eye view`, `low-angle perspective`, `subject centered with negative space on left` |
| Свет | источник, направление, характер света | `soft natural light from a window on the left`, `golden hour`, `single soft light source from the upper left` |
| Техника и стиль | носитель изображения и стиль | `photo`, `watercolor painting`, `colored pencil illustration`, `picture book style` |
| Цвет и палитра | цвета, насыщенность, гамма | `muted`, `pastel`, `warm orange and deep blue palette`, HEX-код |
| Настроение | эмоциональный тон сцены, выраженный видимым | `calm`, `gloomy`, `melancholic, overcast afternoon` |

## Конкретные видимые признаки вместо оценок

Оценочное или абстрактное слово заменяется признаками, которые видны на изображении.

| Модель | Вместо | Писать |
|---|---|---|
| Midjourney | `big` | `huge`, `gigantic`, `enormous` |
| Midjourney | `cats` | `three cats` |
| Nano Banana | `fantasy armor` | `ornate elven plate armor, etched with silver leaf patterns, with a high collar and pauldrons shaped like falcon wings` |
| GPT Image | `beautiful lighting` | `soft natural light from a window on the left` |
| Seedream | общие слова стиля и нагромождение вычурных слов | точные слова стиля — `picture book style`, `children's book illustration style`; краткий точный промпт вместо нагромождения сложной лексики |
| Krea 1 | `sad photo` | `melancholic, overcast afternoon, empty parking lot, muted palette` |

## Примеры

### Пример 1: разбор задачи по элементам

**Вход:** «уютная картинка с котом для обложки детской книги».

**Результат:** объект — рыжий кот, свернувшийся клубком; действие — спит; окружение — подоконник с подушкой; композиция — средний план, место под название сверху; свет — тёплый вечерний свет от лампы; техника — `picture book style`; цвет — тёплая палитра; настроение «уютно» выражено светом и позой, а не словом `cozy`. Порядок и длина — по файлу устройства промпта выбранной модели.

### Пример 2: оценочное слово в запросе

**Вход:** «сделай красивый портрет».

**Результат:** «красивый» заменяется видимыми признаками: свет, кадр, фактура, палитра — например, `soft diffuse key light from the upper left, headshot, visible skin texture, muted earth tones`.
