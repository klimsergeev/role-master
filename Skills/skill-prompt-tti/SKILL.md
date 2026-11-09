---
name: skill-prompt-tti
description: >
  Процедуры и справочные значения для составления и правки промптов к нейросетям, генерирующим изображения: Midjourney V8, Nano Banana (модели изображений Gemini, приложение Gemini, Gemini API, Google Cloud), GPT Image (Image API, Responses API, ChatGPT Images, Codex), Seedream 5.0 pro и flash (BytePlus, Volcano Engine), Krea 1, Krea 2 и Krea 3. Промпт генерации и правки готового изображения, текст на изображении, входные изображения и референсы стиля, параметры и поля запроса API, версии моделей и поверхности, разбор неудачного результата. Работает с моделью, названной в запросе, модель под задачу не выбирает.
when_to_use: >
  Пользователь просит промпт для картинки или правку изображения в одной из пяти моделей. Примеры: «промпт для Midjourney», «напиши промпт для картинки», «отредактируй фото в Nano Banana», «промпт для Seedream», «правка в Krea 3», «промпт для GPT Image через API», «почему Midjourney не рисует надпись», «write a Midjourney prompt», «Nano Banana prompt for product photo», «GPT Image edit prompt with mask», «Seedream bbox edit», «Krea 2 style reference».
version: 1.0.0
created: 2026-11-09
---

# Prompt TTI

## Назначение

Процедуры и справочные значения для составления и правки промптов к пяти моделям генерации изображений: Midjourney, Nano Banana, GPT Image, Seedream, Krea.

## Принципы

1. Скилл работает с моделью, названной в запросе, и модель под задачу не выбирает.
2. Синтаксис, параметры и значения берутся только из файлов папки названной модели и только для её версии и поверхности; между моделями, версиями и поверхностями они не переносятся.
3. Значения в файлах датированы строкой «Состояние на …»; версия или поверхность, которых нет в `models.md` и `surfaces.md` модели, скиллом не покрыта.
4. Промпт пишется на английском для всех моделей и при любом языке запроса. Текст, который должен появиться на изображении, пишется дословно, на том языке, на котором он должен быть на картинке, в кавычках.
5. Где сведения расходятся, скилл даёт обе позиции.
6. Значение, которое не установлено, скилл называет неустановленным и не подставляет вместо него значение другой версии или догадку.

## Таблица маршрутизации

> Читай файлы под задачу, а не скилл целиком. Колонка «Обязательно» — открыть до начала работы. Колонка «Читать, если» — открыть, когда условие выполнено; условие проверяется по задаче, а не по желанию. Файлы с пометкой `(справочник)` устроены как таблицы для точечного поиска — в них допустим поиск нужной строки вместо чтения целиком.

| Задача | Обязательно | Читать, если |
|---|---|---|
| Промпт для Midjourney | [prompt-elements.md](prompt-elements.md), [midjourney/models.md](midjourney/models.md), [midjourney/surfaces.md](midjourney/surfaces.md), [midjourney/prompt-anatomy.md](midjourney/prompt-anatomy.md) | если правится готовое изображение: [midjourney/editing.md](midjourney/editing.md); если в задаче есть входные изображения или персонаж повторяется между кадрами: [midjourney/references.md](midjourney/references.md); если на изображении должен быть текст: [text-in-image.md](text-in-image.md); если задаются параметры: [midjourney/parameters.md](midjourney/parameters.md) (справочник); если в задаче есть неудачный результат генерации: [midjourney/troubleshooting.md](midjourney/troubleshooting.md) (справочник) |
| Промпт для Nano Banana | [prompt-elements.md](prompt-elements.md), [nano-banana/models.md](nano-banana/models.md), [nano-banana/surfaces.md](nano-banana/surfaces.md), [nano-banana/prompt-anatomy.md](nano-banana/prompt-anatomy.md) | если правится готовое изображение: [nano-banana/editing.md](nano-banana/editing.md); если в задаче есть входные изображения или персонаж повторяется между кадрами: [nano-banana/references.md](nano-banana/references.md); если на изображении должен быть текст: [text-in-image.md](text-in-image.md); если задаются параметры или поля запроса: [nano-banana/parameters.md](nano-banana/parameters.md) (справочник); если в задаче есть неудачный результат генерации: [nano-banana/troubleshooting.md](nano-banana/troubleshooting.md) (справочник) |
| Промпт для GPT Image | [prompt-elements.md](prompt-elements.md), [gpt-image/models.md](gpt-image/models.md), [gpt-image/surfaces.md](gpt-image/surfaces.md), [gpt-image/prompt-anatomy.md](gpt-image/prompt-anatomy.md) | если правится готовое изображение: [gpt-image/editing.md](gpt-image/editing.md); если в задаче есть входные изображения или персонаж повторяется между кадрами: [gpt-image/references.md](gpt-image/references.md); если на изображении должен быть текст: [text-in-image.md](text-in-image.md); если задаются параметры или поля запроса: [gpt-image/parameters.md](gpt-image/parameters.md) (справочник); если в задаче есть неудачный результат генерации: [gpt-image/troubleshooting.md](gpt-image/troubleshooting.md) (справочник); если тип задачи есть в перечне рецептов (фото, инфографика, точный текст, логотип, исторический контекст, комикс, макет интерфейса, учебный визуал, слайд и график, реклама, прозрачный ассет, спрайт-лист, персонаж серии): [gpt-image/task-recipes.md](gpt-image/task-recipes.md) (справочник) |
| Промпт для Seedream | [prompt-elements.md](prompt-elements.md), [seedream/models.md](seedream/models.md), [seedream/surfaces.md](seedream/surfaces.md), [seedream/prompt-anatomy.md](seedream/prompt-anatomy.md) | если правится готовое изображение: [seedream/editing.md](seedream/editing.md); если в задаче есть входные изображения или персонаж повторяется между кадрами: [seedream/references.md](seedream/references.md); если на изображении должен быть текст: [text-in-image.md](text-in-image.md); если задаются параметры или поля запроса: [seedream/parameters.md](seedream/parameters.md) (справочник); если в задаче есть неудачный результат генерации: [seedream/troubleshooting.md](seedream/troubleshooting.md) (справочник) |
| Промпт для Krea | [prompt-elements.md](prompt-elements.md), [krea/models.md](krea/models.md), [krea/surfaces.md](krea/surfaces.md), [krea/prompt-anatomy.md](krea/prompt-anatomy.md) | если правится готовое изображение: [krea/editing.md](krea/editing.md); если в задаче есть входные изображения или персонаж повторяется между кадрами: [krea/references.md](krea/references.md); если на изображении должен быть текст: [text-in-image.md](text-in-image.md); если задаются параметры или поля запроса: [krea/parameters.md](krea/parameters.md) (справочник); если в задаче есть неудачный результат генерации: [krea/troubleshooting.md](krea/troubleshooting.md) (справочник); если модель Krea 2 и в задаче есть стилевые референсы, мудборды, ползунки или режимы Creativity: [krea/style-controls.md](krea/style-controls.md) |

## Рабочий процесс

### Шаг 1: Определить модель, версию и поверхность

- ЕСЛИ модель не названа или названа модель не из пяти -> сообщить, что скилл модель не выбирает и пишет промпт под одну из пяти названных моделей.
- ЕСЛИ версия не названа -> взять версию по умолчанию для этой поверхности из `models.md` модели.
- ЕСЛИ версия по умолчанию на поверхности дана двумя позициями или не установлена (приложение Gemini, ChatGPT, Codex) -> сообщить об этом и писать по правилам `prompt-anatomy.md`, общим для версий-кандидатов, без параметров, которые у них различаются.
- ЕСЛИ названа версия или поверхность, которой нет в `models.md` и `surfaces.md` модели -> сообщить, что скилл её не покрывает; синтаксис соседней версии не подставлять.

### Шаг 2: Открыть файлы

Открыть файлы строки модели из таблицы маршрутизации: все из колонки «Обязательно» и те из колонки «Читать, если», чьё условие выполнено.

### Шаг 3: Разобрать задачу по элементам

Пройти элементы из [prompt-elements.md](prompt-elements.md): что задано в запросе, что нужно по назначению изображения, что остаётся модели.

### Шаг 4: Составить текст промпта

- Форма, порядок и длина — по `prompt-anatomy.md` модели.
- Промпт пишется на английском, на каком бы языке ни был запрос.
- ЕСЛИ на изображении должен быть текст -> вставить его дословно, на том языке, на котором он должен быть на картинке, в кавычках по [text-in-image.md](text-in-image.md) и `prompt-anatomy.md` модели.
- ЕСЛИ в `prompt-anatomy.md` модели есть предупреждение о надёжности текста на этом языке или алфавите -> привести его рядом с промптом.

### Шаг 5: Добавить параметры

Добавить параметры и настройки поверхности по `surfaces.md` и `parameters.md` модели.

### Шаг 6: Проверить

Пройти раздел «Проверка перед выдачей» из `prompt-anatomy.md` модели до последнего пункта.

### Шаг 7: Оформить результат

Оформить результат в форме поверхности из `surfaces.md` модели.

## Что НЕ делать

- Не подставлять синтаксис другой модели или версии: `--ar` в Seedream, `::` и `--style raw` в Midjourney V8, `input_fidelity` для `gpt-image-2` и новее, `style` в GPT Image.
- Не называть параметр или значение, которых нет в `parameters.md` модели.
- Не называть значения по памяти вместо файлов скилла.
- Не выбирать и не подменять модель вместо названной в запросе.

## Примеры

### Пример 1: постер с надписью в Midjourney V8.2

**Запрос:** «промпт для Midjourney V8.2 на сайте: винтажный постер джазового фестиваля с надписью JAZZ NIGHT, вертикальный».

**Маршрут:** обязательные файлы строки «Промпт для Midjourney»; плюс [text-in-image.md](text-in-image.md), потому что выполнилось условие «на изображении должен быть текст», и [midjourney/parameters.md](midjourney/parameters.md), потому что задаётся соотношение сторон.

**Результат:** одна строка — описание сцены на английском, надпись в двойных кавычках с `with the words`, в конце `--ar 2:3`; пройдена проверка перед выдачей Midjourney.

### Пример 2: запрос под Midjourney V7

**Запрос:** «напиши промпт для Midjourney V7 с `--oref`».

**Маршрут:** [midjourney/models.md](midjourney/models.md) из колонки «Обязательно» строки «Промпт для Midjourney».

**Результат:** V7 в покрываемых версиях нет — скилл сообщает, что версия не покрыта, и синтаксис V8 за синтаксис V7 не выдаёт.
