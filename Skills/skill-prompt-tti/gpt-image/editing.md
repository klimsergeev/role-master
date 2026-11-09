# GPT Image: правка готового изображения

## Назначение

Как править готовое изображение моделями GPT Image: формулировка `change only X`, повтор сохраняемого, маска, правка по разметке, типовые правки, пиксельная неизменность и прозрачный фон в цепочке правок.

## Что меняется и что остаётся

- Для правки — `change only X` и список сохраняемого: внешность, геометрия, раскладка, свет, подписи.
- Формула `Change only X. Keep everything else exactly the same` — часто самый ясный способ точной правки.
- Пример: `Edit the attached image. Replace only the mug with a small potted plant. Preserve the person, desk layout, lighting, colors, crop, and every other detail exactly. Do not add text or logos.`

## Одно изменение за раз

- Предыдущий результат — вход следующей правки, одно изменение за раз, повтор сохраняемого.
- Начать с одного результата, проверить его и использовать как следующий вход; каждое уточнение — узкое, чтобы было видно, какое изменение помогло. Пример следующего шага: `Make it look like a winter evening with snowfall.`
- Повтор главных деталей удерживает изображение от дрейфа при доработке.
- Свет и погода: менять только условия среды — направление и характер света, тени, атмосферу, осадки, влажность земли, — сохраняя внешность, геометрию, ракурс и расположение предметов.

## Маска

- Правятся полностью прозрачные пиксели маски (альфа равна нулю); непрозрачные пиксели обозначают то, что сохраняется.
- Маска должна содержать альфа-канал.
- Маска — ориентир, а не трафарет: маскирование у GPT Image опирается на промпт, и модель может не следовать форме маски с полной точностью.
- При нескольких входных изображениях маска применяется к первому.
- С маской промпт описывает всё итоговое изображение, а не только правимую область. Пример: `A sunlit indoor lounge area with a pool containing a flamingo`
- Изображение и маска — одного формата и размера; предел размера маски — расхождение, позиции в [parameters.md](parameters.md).
- В Responses API маска передаётся в `input_image_mask`.
- Маска не сочетается с `markup`.

## Правка по разметке `markup`

Только Image API, `/v1/images/edits`, модели 2.5 и 2.6.

1. Оригинал — первым входным изображением.
2. Сделать отдельный прозрачный PNG с кружками, набросками и пометками; после учёта ориентации слой пометок и первое изображение — одной ширины и высоты; в PNG должны быть прозрачные пиксели; слой не впечатывается в оригинал.
3. Передать слой пометок в `markup`.
4. Описать изменение и то, что сохранить; проверить результат.

- Разметка применяется к первому изображению, остальные служат референсами. Первое изображение и слой пометок — каждый не больше 16 777 216 пикселей; файл пометок — до 50 МБ.
- `markup` не сочетается с `mask`.
- Пример: `Recolor the striped vase inside the red circle to solid cobalt blue ceramic. Keep its shape, the dried stems, and the rest of the kitchen unchanged. Remove the red circle from the finished photo.` Промпт ссылается на пометку и просит убрать её из результата.

## Типовые правки

| Правка | Промпт |
|---|---|
| Удалить объект | `Remove the flower from man's hand. Do not change anything else.` |
| Заменить мебель | `In this room photo, replace ONLY the white chairs with chairs made of wood. Preserve camera angle, room lighting, floor shadows, and surrounding objects. Keep all other aspects of the image unchanged. Photorealistic contact shadows and fabric texture.` |
| Перевести текст на изображении | `Translate the text in the infographic to Spanish. Do not change any other aspect of the image.` После — проверить перевод и оставшиеся слова на исходном языке |
| Эскиз в фото | `Turn this drawing into a photorealistic image. Preserve the exact layout, proportions, and perspective. Choose realistic materials and lighting consistent with the sketch intent. Do not add new elements or text.` |
| Примерочная одежды | назвать, что в человеке неизменно, и разрешить менять только одежду; начало примера: `Do not change her face, facial features, skin tone, body shape, pose, or identity in any way. Preserve her exact likeness, expression, hairstyle, and proportions. Replace only the clothing` |
| Вставить человека в сцену | назвать, какие черты лица и пропорции не меняются |
| Вырезать товар на прозрачный фон | `Extract the product from the input image and isolate it on a fully transparent background. … Do not add a solid backdrop, checkerboard, scenery, or shadow.` вместе с `background="transparent"` и `png` или `webp` |

## Пиксельная неизменность

- Повторные правки всё равно могут менять сохраняемое: ограничения повторяются в каждом промпте, каждый результат проверяется. ЕСЛИ область должна остаться неизменной до пикселя -> вклеить одобренную правку в оригинал, а не полагаться только на промпт.

## Прозрачный фон в цепочке правок

- В каждой следующей правке повторять требование сохранить прозрачный фон.

## Примеры

### Пример 1: заменить одну вещь

**Вход:** фото рабочего стола, заменить кружку на растение.

**Результат:** `Edit the attached image. Replace only the mug with a small potted plant. Preserve the person, desk layout, lighting, colors, crop, and every other detail exactly. Do not add text or logos.`; одна правка за запрос.

### Пример 2: логотип клиента должен остаться неизменным

**Вход:** «меняем фон вокруг упаковки, логотип не должен измениться ни на пиксель».

**Результат:** `change only the background` и список сохраняемого (упаковка, логотип, свет на упаковке); после одобрения правки область логотипа вклеивается в оригинал, потому что промпт пиксельной неизменности не гарантирует.
