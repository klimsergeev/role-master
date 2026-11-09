# Nano Banana: входные изображения

## Назначение

Как подавать входные изображения моделям Nano Banana: лимиты по моделям, роль каждого изображения, формула промпта с референсами, обход лимита, серии и сохранение персонажа между кадрами.

## Лимиты по моделям

| Модель | Объекты | Персонажи | Стиль | Всего |
|---|---|---|---|---|
| Nano Banana 2.1 (`gemini-nano-banana-2.1`) | до 10 | до 4 | нет | до 14 |
| Nano Banana 2 (`gemini-3.1-flash-image`) | до 10 | до 4 | нет | до 14 |
| Nano Banana Pro (`gemini-3-pro-image`) | до 6 | до 5 | до 3 | до 14 |
| Nano Banana 2 Lite (`gemini-3.1-flash-lite-image`) | не оптимизирована под несколько референсов | — | — | — |
| Nano Banana (`gemini-2.5-flash-image`) | лучше всего не больше 3 входных изображений | — | — | — |

- Расхождение о лимитах Nano Banana 2 — в [models.md](models.md).
- У Pro в Google Cloud по HTTP- и HTTPS-ссылкам — не больше 10 изображений, до 14 — через `gs://` или встроенные данные.
- Форматы и размеры входа — в [parameters.md](parameters.md).

## Роль каждого изображения

- Роль каждого загруженного изображения задаётся явно, например: `Use Image A for the character's pose, Image B for the art style, and Image C for the background environment.`
- Каждому персонажу или объекту можно присвоить имя и ссылаться на него по имени.

## Формула промпта с референсами

- `[Reference images] + [Relationship instruction] + [New scenario]`.
- Пример: `Using the attached napkin sketch as the structure and the attached fabric sample as the texture, transform this into a high-fidelity 3D armchair render. Place it in a sun-drenched, minimalist living room.`

## Больше изображений, чем позволяет лимит

- ЕСЛИ изображений больше лимита загрузки -> сначала собрать несколько изображений в один коллаж и подать его одним изображением.

## Перенос стиля

- Шаблон переноса стиля на фотографию — в [editing.md](editing.md).
- Стилевые референсы как отдельный вид входа есть только у Pro (до 3).

## Сохранение персонажа и объекта между кадрами

- Ракурсы персонажа получают последовательными запросами, включая ранее сгенерированные изображения в следующие запросы; для сложной позы добавляется референс позы.
- Важные черты (лицо, логотип) описываются подробно вместе с запросом.
- Серия по одному изображению — пример: `Now create identity system one by one, use 10 high quality mockups with variety of relevant products, ads, billboards, bus stop, etc. generate one at a time, 16:9 each`
- Модель не всегда выдаёт ровно столько изображений, сколько просили.
- ЕСЛИ черты уплывают после многих правок -> новый диалог с подробным описанием (подробности в [editing.md](editing.md)).

## Примеры

### Пример 1: поза с одного фото, стиль с другого

**Вход:** три изображения: фото позы, картина в нужном стиле, фото улицы; Nano Banana Pro.

**Результат:** `Use Image A for the character's pose, Image B for the art style, and Image C for the background environment. Create an image of a street musician playing violin in this pose and setting, painted in the style of Image B.`

### Пример 2: двадцать референсов

**Вход:** «у меня 20 фото товара для одной композиции».

**Результат:** лимит — до 14 входных изображений; часть фото собирается в один коллаж, коллаж подаётся одним изображением с указанием его роли.
