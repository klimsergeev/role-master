# Файлы и медиагруппы

## Назначение

Классы входных файлов aiogram, отправка по `file_id` или адресу, сборка медиагруппы через `MediaGroupBuilder` и скачивание файлов через бота. Вызовы методов отправки — в [bot-client.md](bot-client.md).

## Классы входных файлов

Классы — подклассы `InputFile`, используются для новой загрузки.

| Класс | Сигнатура | Когда применяется |
|---|---|---|
| `FSInputFile` | `FSInputFile(path, filename=None, chunk_size=65536)` | файл лежит на диске; `filename` по умолчанию берётся из пути |
| `BufferedInputFile` | `BufferedInputFile(file, filename, chunk_size=65536)` | данные — байты в памяти (например, картинка, созданная Pillow); `file` — `bytes`, `filename` обязателен |
| `URLInputFile` | `URLInputFile(url, headers=None, filename=None, chunk_size=65536, timeout=30, bot=None)` | aiogram сам скачивает файл по адресу и загружает; полезен, когда ссылка привязана к IP сервера или нужно обойти ограничения Telegram на отправку по адресу |

## Отправка по file_id или по адресу

Файл, который уже есть на серверах Telegram, или файл по публичному адресу заново загружать не нужно: файл загружают один раз и дальше используют `file_id`.

- Отдельного параметра для `file_id` или адреса нет. Файловый параметр метода отправки (`photo` у `send_photo`, `document` у `send_document`) один и обязательный, его тип — `InputFileUnion`, то есть `str | InputFile`.
- Строка `file_id` в этом параметре отправляет файл, который уже лежит на серверах Telegram; для `send_photo` это рекомендуемый способ.
- Строка с HTTP-адресом в этом параметре заставляет Telegram самому скачать файл. Этим она отличается от `URLInputFile`, с которым файл по адресу скачивает aiogram и загружает как новый.
- Объект `InputFile` в этом же параметре — новая загрузка.
- Сокращённые методы `answer_photo`, `answer_document` и остальные `answer_*` и `reply_*` принимают строку в том же параметре: они собирают те же методы отправки.

## Медиагруппа

- `MediaGroupBuilder(media=None, caption=None, caption_entities=None)`; подпись билдера ставится на первый элемент.
- Элементы добавляются методами `add_photo(media, caption, parse_mode, caption_entities, has_spoiler)`, `add_video(...)`, `add_audio(...)`, `add_document(...)` или `add(type=..., media=..., ...)`, где `type` — `photo`, `video`, `audio` или `document`. `media` — `file_id`, HTTP-адрес, `InputFile` либо ссылка `attach://`. Методы возвращают `None`, поэтому цепочкой их не вызвать.
- `build()` возвращает список объектов `InputMedia*`; отправка: `await bot.send_media_group(chat_id=chat_id, media=group.build())`.
- Пределы: не больше 10 элементов, иначе `ValueError`; анимации в медиагруппах не поддерживаются; смешение типов билдер не проверяет.

## Скачивание файла

- `file_id` берётся из сообщения: `message.document.file_id`.
- Короткая форма: `await bot.download(file, destination)`, где `file` — `file_id` или скачиваемый объект вроде `message.document`. Куда писать: путь (запись на диск, возвращается `None`), бинарный файловый объект (возвращается он сам) или ничего (возвращается заполненный `io.BytesIO`). Параметры: `timeout` (30 секунд), `chunk_size` (64 КБ), `seek` (по умолчанию `True`, перематывает бинарные объекты в начало).
- В два шага: `file = await bot.get_file(file_id=file_id)`, затем `await bot.download_file(file.file_path, destination)`. `get_file` — метод API, его аргументы передаются по ключевым словам; `download` и `download_file` — помощники aiogram, а не методы API.

## Примеры

### Пример 1: Отправить файл с диска

**Вход:** отправить документ из каталога бота.

**Результат:**

```python
await message.answer_document(document=FSInputFile("report.pdf"))
```

### Пример 2: Повторно отправить уже загруженный файл

**Вход:** пользователь прислал документ, бот отправляет его в другой чат без новой загрузки.

**Результат:**

```python
await bot.send_document(chat_id=target_chat_id, document=message.document.file_id)
```

Строка `file_id` передаётся в тот же параметр `document`, что принимает `InputFile`.

### Пример 3: Медиагруппа из двух фотографий

**Вход:** отправить две фотографии одним сообщением-альбомом.

**Результат:**

```python
group = MediaGroupBuilder(caption="Album")
group.add_photo(media=FSInputFile("one.jpg"))
group.add_photo(media=FSInputFile("two.jpg"))
await bot.send_media_group(chat_id=message.chat.id, media=group.build())
```

### Пример 4: Скачать документ в память

**Вход:** прочитать присланный документ без записи на диск.

**Результат:**

```python
buffer = await bot.download(message.document)
data = buffer.read()
```
