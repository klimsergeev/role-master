# Seedream: входные изображения

## Назначение

Как подавать входные изображения Seedream 5.0 pro и 5.0 flash: лимит, что брать из какого изображения, цель ссылки и описание сцены, перенос стиля, сборка людей с разных фото и сохранение персонажа без серий.

## Лимит

- До 10 входных изображений.
- Форматы и размеры — в [parameters.md](parameters.md).

## Что брать из какого изображения

- Явно указывать, что брать или править из каждого изображения; например, заменить персонажа на изображении 2 персонажем с изображения 1 и выполнить в стиле изображения 3.
- Изображения называются по номерам: `Image 1`, `Image 2`.
- Примеры: `Replace the subject in Image 1 with the subject from Image 2.`, `Dress the character in Image 1 with the outfit from Image 2.`, `Apply the style of Image 2 to Image 1.`
- У 5.0 pro и flash внутри каждого изображения можно указать область координатами: `Place the subject from Image 1 <bbox>179 283 796 986</bbox> at the position in Image 2 <bbox>118 331 933 871</bbox>.` (подробности в [editing.md](editing.md)).

## Цель ссылки и описание сцены

- Цель ссылки: какие элементы взять и сохранить из референса. Описание сцены: подробно, что генерировать, включая сцену и компоновку.
- Примеры: `Based on the character in the reference image, create an anime figure…`, `Referencing the linear minimalist style of icons, design 9 application icons…`, `Generate four tops in different materials and colors, based on the clothing style worn by the girl in the image. Show only the clothing.`

## Перенос стиля и тона

- Стиль переносится по одной картинке-референсу. Пример: `Change the color tone of image 1 to match that of image 2.`
- Правка по примеру «до и после»: `Modify Figure 3 based on the changes observed from Figure 1 to Figure 2.`

## Сборка людей с разных фото

- `Combine the people from Images 2 to Image 6 into a group photo referencing the positioning in Image 1.`

## Персонаж между кадрами

- Серий у 5.0 pro и flash нет. Персонаж и объект между кадрами сохраняются референсами: каждый новый кадр — отдельный запрос с изображением персонажа на входе и указанием, что из него взять и что сохранить, либо правкой готового кадра.

## Примеры

### Пример 1: одежда с одного фото на модель с другого

**Вход:** два изображения: фото модели и фото пальто.

**Результат:** `Dress the woman in Image 1 with the coat from Image 2. Keep her face, hairstyle, pose, and the street background unchanged.`

### Пример 2: двенадцать фото для группового снимка

**Вход:** «собери групповое фото из двенадцати отдельных портретов».

**Результат:** лимит — 10 входных изображений; двенадцать портретов в один запрос не передаются — пользователю сообщается о лимите, в запрос идут не больше 10 изображений, каждое названо по номеру.
