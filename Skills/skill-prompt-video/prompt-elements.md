# Элементы описания видео

## Назначение

Общие для Seedance и Kling элементы, из которых складывается описание видео, общий порядок элементов и правило «видимое и конкретное вместо оценок и абстракций». Устройство промпта, запись времени и длина у моделей разные и лежат в файлах семейств: [seedance/prompt-anatomy.md](seedance/prompt-anatomy.md), [kling/prompt-anatomy.md](kling/prompt-anatomy.md).

## Элементы

Промпт задаёт элемент или оставляет его модели. Разбор задачи — пройти по таблице и для каждого элемента решить: задан в запросе, нужен по назначению видео или остаётся модели.

| Элемент | Что задаёт | Примеры значений |
|---|---|---|
| Субъект и видимые признаки | кто или что в кадре, сколько их, как выглядят; 2–3 устойчивых признака (одежда, причёска, вид) | `a lighthouse keeper in a yellow oilskin coat`, `exactly two climbers` |
| Действие по тактам | что происходит и в каком порядке, с какой скоростью и силой; переходы между действиями | `slowly lifts the lantern, then turns toward the window` |
| Сцена и окружение | где и когда происходит действие, что на фоне, что движется на фоне | `a stone lantern room at the top of a lighthouse, storm clouds outside` |
| Камера | крупность, ракурс, движение камеры | `wide shot`, `medium close-up`, `low angle`, `overhead shot`, `push in`, `pull out`, `pan`, `orbit`, `handheld` |
| Планы и монтаж | число планов, склейки и их момент, переходы, один непрерывный план | `three shots, hard cuts`, `one continuous take, no cuts` |
| Время | отрезки, моменты, длительность тактов | запись — по файлу устройства промпта семейства |
| Свет | источник, направление, характер света | `a single oil lamp on the table, warm light from the left` |
| Стиль | носитель изображения и стиль | `live-action, 35mm film look`, `2D hand-drawn animation` |
| Цвет и палитра | цвета, насыщенность, цветовые отношения | `cold blue night outside, warm amber inside` |
| Звук | реплики, закадровый голос, фон, эффекты, музыка или их отсутствие | правила — [speech.md](speech.md) и `audio.md` семейства |
| Текст в кадре | надписи, титры, субтитры или их отсутствие | правила — [text-in-video.md](text-in-video.md) |
| Настроение | эмоциональный тон, выраженный видимым и слышимым | `the wind rattles the glass, the keeper's breath fogs the window` |

## Порядок элементов

- Общий порядок обоих семейств: субъект → действие → сцена → стиль и свет → камера → звук и ограничения. Число и состав звеньев у моделей разные; ненужные звенья опускаются.
- Порядок конкретной модели — в её `prompt-anatomy.md`; где он расходится с общим, действует порядок модели.

## Видимое и конкретное вместо оценок

Оценочное или абстрактное слово заменяется тем, что видно и слышно в кадре. Строки таблицы — собственные иллюстрации скилла.

| Модель | Правило | Вместо | Писать |
|---|---|---|---|
| Seedance 2.0 | эмоция выражается физическими деталями, а не названием эмоции | `she is very embarrassed` | `her cheeks flush, she tucks a strand of hair behind her ear, looks down at her shoes and gives a short awkward laugh` |
| Seedance 2.0 | общее впечатление о сцене заменяется раскадровкой: кто, где, что делает, как движется камера в каждом плане | `moody glassblowing footage` | `Shot 1: wide shot of a dim glass studio, the glassblower turns a glowing rod in the furnace. Shot 2: close-up of his cheeks as he blows into the pipe, the camera slowly pushes in.` |
| Seedance 2.5 | общие слова вроде `cinematic` заменяются конкретикой: место, источник света в кадре, поведение объектива, фактура материалов, цветовые отношения | `a cinematic bookbinding scene` | `a cluttered bookbinding workshop after dark, one green desk lamp, shallow focus on glue brushed along a cracked leather spine, oxblood leather against pale paper` |
| Seedance 2.5 | выражение лица — описательным предложением, а не идиомой | `she is over the moon` | `she bounces on her toes, claps twice and grins at the camera` |
| Kling 4.0 | абстрактное слово заменяется видимыми деталями: свет, фактура, предметы | `a mysterious forest` | `a pine forest at dusk, low fog between the trunks, one lantern swinging on a branch` |
| Kling 4.0 | вместо запрета — прямое описание того, что должно быть в кадре | `don't let the camera shake` | `the camera stays locked on a tripod, perfectly still` |

## Примеры

### Пример 1: разбор задачи по элементам

**Вход:** «ролик, где смотритель маяка зажигает огонь в шторм».

**Результат:** субъект — пожилой смотритель в жёлтом непромокаемом плаще; действие по тактам — поднимается по лестнице, открывает дверцу фонаря, зажигает фитиль, смотрит на море; сцена — фонарная комната маяка, за стеклом шторм; камера — следование снизу по лестнице, затем медленный облёт фонаря; планы — два плана со склейкой; свет — тёплый огонь против холодного синего шторма; стиль — игровое кино; звук — ветер, скрип двери, шипение фитиля, без музыки; текст в кадре — нет; настроение «тревожно» выражено ветром и дрожью стекла, а не словом `tense`. Порядок, запись времени и длина — по `prompt-anatomy.md` названной модели.

### Пример 2: оценочное слово в запросе

**Вход:** «сделай атмосферное видео с уличным музыкантом».

**Результат:** «атмосферное» заменяется видимым и слышимым: `a cobbled square at first light, a saxophonist on the steps of a stone arcade, his breath visible in the cold air, pigeons lifting off as he starts to play, slow push in from across the square`.
