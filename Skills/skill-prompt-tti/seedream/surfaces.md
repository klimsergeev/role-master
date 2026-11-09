# Seedream: поверхности

## Назначение

Где доступны Seedream 5.0 pro и 5.0 flash на собственных площадках ByteDance с API — BytePlus ModelArk и Volcano Engine Ark, — чем они различаются и в какой форме выдаётся готовый результат.

## BytePlus ModelArk

- Международная платформа, регион ap-southeast-1.
- Метод: `POST /api/v3/images/generations`.
- Идентификаторы моделей с префиксом `dola-` (`dola-seedream-5-0-pro-260628`, `dola-seedream-5-0-flash-260915`).

## Volcano Engine Ark

- Китайская платформа, регион cn-beijing.
- Метод: `POST /api/v3/images/generations`.
- Идентификаторы моделей с префиксом `doubao-` (`doubao-seedream-5-0-pro-260628`, `doubao-seedream-5-0-flash-260915`).

## Общее для обеих платформ

- Генерация и правка — один метод; правка отличается наличием входных изображений в `image`.
- Соотношение сторон задаётся словами в промпте при `size` = уровень разрешения либо размером `widthxheight` (подробности в [parameters.md](parameters.md)). Отдельного параметра соотношения сторон нет.
- Перед генерацией промпт может обрабатывать оптимизация промпта (`optimize_prompt_options`); что она делает с промптом, описано только для Seedream 4.0 (позиция — в [models.md](models.md)).
- Приложения ByteDance (Dreamina, Jianying, CapCut, Jimeng) скиллом не покрываются.

## Форма готового результата

Текст промпта плюс поля запроса API:

```json
{
  "model": "dola-seedream-5-0-pro-260628",
  "prompt": "<промпт на английском>",
  "image": ["<URL или data:image/<формат>;base64,...>"],
  "size": "2K",
  "output_format": "png",
  "response_format": "url"
}
```

Поле `image` — только при правке или генерации по референсам.

## Примеры

### Пример 1: генерация на BytePlus

**Вход:** «баннер 16:9 через Seedream 5.0 flash на BytePlus».

**Результат:** `model` — `dola-seedream-5-0-flash-260915`, `size` — `2K`, соотношение 16:9 написано словами в начале промпта: `A 16:9 horizontal banner of …`.

### Пример 2: запрос на Volcano Engine

**Вход:** «то же самое на Volcano Engine».

**Результат:** `model` — `doubao-seedream-5-0-flash-260915`; поля запроса те же.
