# Объект Bot, вызовы методов API, типы и сессия

## Назначение

Как создать `Bot`, как aiogram вызывает методы Telegram API, как отправить эфемерный ответ на нажатие кнопки без чата, какие сокращённые методы есть у типов, как устроены типы и недоступные сообщения, как использовать перечисления и управлять HTTP-сессией. Исключения вызовов — в [errors.md](errors.md), форматирование текста — в [text-formatting.md](text-formatting.md), файлы — в [files-and-media.md](files-and-media.md).

## Создание Bot

`Bot` (`from aiogram import Bot`) хранит токен и сессию, и через него идёт каждый вызов API.

- Сигнатура: `Bot(token, session=None, default=None, **kwargs)`.
- `token` обязателен — строка от BotFather. Токен неверного формата даёт `TokenValidationError` при создании.
- `session` — объект сессии, например `AiohttpSession`; без него `Bot` создаёт `AiohttpSession()`.
- `default` — экземпляр `DefaultBotProperties`; без него используется пустой `DefaultBotProperties()`. Значения применяются к вызовам методов в момент вызова.
- У `Bot` есть свойства `token` и `id` (идентификатор бота из токена); сессия хранится в `bot.session`.
- `await bot.me()` — закешированный `getMe` (метод, а не свойство). `await bot.usernames()` (3.32.0) возвращает кортеж: имя из `getMe` первым, затем дополнительные имена; если дополнительный запрос не удался, возвращается только первое имя и ничего не кешируется.

`DefaultBotProperties` (`aiogram.client.default`): все поля только именованные, по умолчанию `None` (значение не применяется).

| Поле | Тип |
|---|---|
| `parse_mode` | `str \| None` |
| `disable_notification` | `bool \| None` |
| `protect_content` | `bool \| None` |
| `allow_sending_without_reply` | `bool \| None` |
| `link_preview` | `LinkPreviewOptions \| None` |
| `link_preview_is_disabled` | `bool \| None` |
| `link_preview_prefer_small_media` | `bool \| None` |
| `link_preview_prefer_large_media` | `bool \| None` |
| `link_preview_show_above_text` | `bool \| None` |
| `show_caption_above_media` | `bool \| None` |

Форма: `Bot(token=..., default=DefaultBotProperties(parse_mode=ParseMode.HTML))`. Значение, переданное явно в вызове, перекрывает значение по умолчанию; `parse_mode=None` в вызове отправляет простой текст.

История переноса глобальных параметров бота по версиям:

- До 3.4.0 `DefaultBotProperties` нет, глобальные параметры передаются только аргументами `Bot`: `parse_mode`, а с 3.0.0b8 ещё `disable_web_page_preview` и `protect_content`.
- 3.4.0 переработала глобальные параметры бота и объявила устаревшим прежний способ передавать их в `Bot`. В этом выпуске появились `DefaultBotProperties` и параметр конструктора `default: Optional[DefaultBotProperties] = None`; прежние аргументы `parse_mode`, `disable_web_page_preview`, `protect_content` остались рядом. Форма `Bot(token=..., default=DefaultBotProperties(...))` поэтому работает с 3.4.0.
- 3.7.0 убрала из `Bot` аргументы `parse_mode`, `disable_web_page_preview` и `protect_content`: их передача даёт `TypeError` с указанием использовать `default=DefaultBotProperties(...)`. Код для 3.0–3.6 при переходе на 3.7 переводится на `aiogram.client.default.DefaultBotProperties`.
- 3.31.0 исправила игнорирование значений `parse_mode`, `protect_content`, `show_caption_above_media` и `link_preview` на уровне бота: теперь они применяются к методам, которые раньше их игнорировали.

## Три формы вызова метода API

Любой метод Telegram API вызывается тремя способами; все ожидаются через `await` и дают один результат.

- Метод бота в `snake_case`: `result: Message = await bot.send_message(...)`.
- Объект метода, переданный боту: `from aiogram.methods import SendMessage`, затем `await bot(SendMessage(...))`. `Bot.__call__(method, request_timeout=None)` отправляет объект через сессию бота; `request_timeout` перекрывает таймаут сессии для этого вызова.
- Сокращённый метод у полученного объекта (раздел ниже): он возвращает объект метода, уже привязанный к боту, и `await` его отправляет.

Результат — тип Telegram, который возвращает метод (у `SendMessage` — `Message`). Объекты результата — типы aiogram, привязанные к боту.

- Непривязанный к боту объект метода ожидать нельзя: `await SendMessage(...)` бросает `RuntimeError`. Нужно либо `await bot(method)`, либо привязать `method.as_(bot)` и ожидать результат.
- Позиционные аргументы вызовов сдвигаются, когда Telegram добавляет параметры, поэтому все аргументы передаются по ключевым словам.
- Ошибки вызовов — исключения из [errors.md](errors.md).

## Эфемерный ответ на нажатие кнопки: вызов без чата

С 3.32.0 параметр `chat_id` необязателен в 14 классах методов отправки: `SendMessage`, `SendRichMessage`, `SendAnimation`, `SendAudio`, `SendContact`, `SendDocument`, `SendLivePhoto`, `SendLocation`, `SendPhoto`, `SendSticker`, `SendVenue`, `SendVideo`, `SendVideoNote`, `SendVoice`.

Когда чата нет:

- Единственный такой случай — эфемерный ответ на callback-запрос: сообщение, которое видит только пользователь, нажавший inline-кнопку. В остальных случаях `chat_id` по-прежнему обязателен.
- Адресата задаёт `ephemeral_message_parameters=EphemeralMessageParameters(...)`. Поле `callback_query_id` называет callback-запрос: если оно задано, а `receiver_user_id` нет, сообщение уходит эфемерным ответом нажавшему пользователю. Поле `receiver_user_id` с 3.32.0 тоже необязательно: оно нужно, только когда сообщение не эфемерный ответ на callback-запрос, а вместе с `callback_query_id` в нём может стоять только идентификатор нажавшего. Необязательное `replace_callback_query_message=True` показывает эфемерное сообщение вместо исходного.
- Без `receiver_user_id` значение `chat_id` метода игнорируется.
- Эфемерный ответ работает в любом чате, кроме чатов личных сообщений каналов.
- На сам callback-запрос бот отвечает как обычно: `callback.answer()` или `CallbackAnswerMiddleware` ([keyboards-callbacks.md](keyboards-callbacks.md)).

Как вызывать:

| Форма | Сигнатура `chat_id` в 3.32.0 | Вызов без чата |
|---|---|---|
| Метод `Bot` (`bot.send_message`) | первый параметр, позиционный или именованный; тип `ChatIdUnion \| None` (`int \| str \| None`); значения по умолчанию нет | аргумент передаётся всегда: `chat_id=None` по ключевому слову; пропущенный `chat_id` — ошибка вызова |
| Объект метода (`SendMessage(...)`) | только именованный; `chat_id: int \| str \| None = None` | `chat_id` можно не передавать или написать `chat_id=None` |

- У всех 14 методов `Bot` `chat_id` остаётся первым параметром без значения по умолчанию; без чата передаётся явный `chat_id=None`.
- В сигнатуре `Bot.send_message` 3.32.0 остаются верхнеуровневые `receiver_user_id` и `callback_query_id`, объявленные устаревшими в 3.31.0.
- До 3.32.0 `chat_id` обязателен во всех методах отправки. ЕСЛИ в проекте aiogram ниже 3.32.0 → эфемерный ответ на нажатие не писать; предложить пользователю обновление до 3.32.0 либо уведомление нажавшему через `callback.answer(text=...)`.

## Сокращённые методы у типов

Сокращённый метод — метод полученного типа: он собирает объект нужного метода API, берёт идентификаторы из самого объекта, привязывает его к боту и возвращает; `await` отправляет (`await message.answer(text="...")`).

Сокращённые методы `Message`:

- `answer(...)` и `reply(...)` собирают `SendMessage`; такая же пара есть для каждого метода отправки: `answer_photo` и `reply_photo`, `answer_animation`, `answer_audio`, `answer_contact`, `answer_document`, `answer_game`, `answer_video`, `answer_voice` и так далее (пары `answer_*` и `reply_*`)
- `edit_text(...)` собирает `EditMessageText`, `edit_reply_markup(...)` — `EditMessageReplyMarkup`
- `delete()` собирает `DeleteMessage`
- `forward(...)` собирает `ForwardMessage`, `copy_to(...)` — `CopyMessage`, `send_copy(...)` отправляет копию тем методом отправки, что подходит типу содержимого
- помощники `as_reply_parameters()` и `as_ephemeral_message_parameters()` строят объекты параметров, которые используют `reply_*`

У других типов свои сокращённые методы: `CallbackQuery.answer(text, show_alert, url, cache_time)` собирает `AnswerCallbackQuery` и подставляет `callback_query_id` (единственный сокращённый метод этого типа). `SendMessage` доступен также из `ChatJoinRequest.answer()` и `answer_pm()`, `ChatMemberUpdated.answer()` и `InaccessibleMessage.answer()` с `reply()`.

Какие идентификаторы подставляются сами:

| Сокращённый метод | Что подставляется |
|---|---|
| `answer_*` | `chat_id`, `message_thread_id` (только если сообщение из темы), `business_connection_id`, `direct_messages_topic_id` |
| `reply_*` | то же, а также `reply_parameters` (собирается из сообщения) и `ephemeral_message_parameters` |
| `edit_text`, `edit_reply_markup` | `chat_id`, `message_id`, `business_connection_id` |
| `delete` | `chat_id`, `message_id` |
| `forward`, `copy_to` | `from_chat_id`, `message_id` |

Разница между `answer` и `reply`: `answer` отправляет сообщение в тот же чат, `reply` отправляет его ответом на исходное сообщение (добавляет `reply_parameters`).

Ограничения по версиям и типам:

- С 3.32.0 `answer_*` и `reply_*` сами подставляют `direct_messages_topic_id`; если передать его самому, будет `TypeError`, а необязательные позиционные аргументы сдвигаются на один, поэтому необязательные аргументы передают по ключевым словам.
- С 3.32.0 `Message.delete()` и `Message.react()` на деловых сообщениях бросают `AssertionError`; для удаления используют `Bot.delete_business_messages()`.
- С 3.30.0 `reply_*` не принимают `receiver_user_id`; используют `answer()` с явным `receiver_user_id`.
- `callback.message` имеет тип `Message | InaccessibleMessage | None`. Любой сокращённый метод на `callback.message` вызывается только после проверки `isinstance(callback.message, Message)`; для `InaccessibleMessage` действие выполняется методом `Bot` с `chat_id=callback.message.chat.id`.
- Сокращённый метод работает только на объекте, привязанном к боту.

## Типы

- Типы и методы — модели pydantic; aiogram 3.32.0 требует pydantic `>=2.7.0,<2.15`, то есть мажорная версия 2.
- Базовый класс `TelegramObject`: `frozen=True`, `extra="allow"` (неизвестные поля сохраняются, а не отклоняются), `validate_assignment=True`, `populate_by_name=True`, `use_enum_values=True`.
- Входящие объекты (`Message`, `User`) поэтому неизменяемы; изменённая копия делается через `model_copy(update=...)`.
- Входные типы, которые собирает и отправляет код (`InlineKeyboardButton`, `BotCommand`), наследуют `MutableTelegramObject` (`frozen=False`) и изменяемы.
- Конструкторы принимают только именованные аргументы. Отсутствующие необязательные списки равны `None`, а не `[]`.
- Привязка к боту: объект получает бота через контекст валидации (свойство `bot` возвращает его или `None`); `obj.as_(bot)` привязывает бота и возвращает объект. Если бот не привязан, ошибки нет: сокращённые методы упадут позже.
- Недоступные сообщения: `CallbackQuery.message` имеет тип `Message | InaccessibleMessage | None` (объединение доступно как `MaybeInaccessibleMessageUnion`). `InaccessibleMessage` описывает сообщение, удалённое или иначе недоступное боту; поля `chat`, `message_id` и `date`, причём `date` всегда `0` — по этому признаку его отличают от обычного сообщения. `MaybeInaccessibleMessage` — тип «либо `Message`, либо `InaccessibleMessage`». С 3.13.0 у `InaccessibleMessage` есть сокращённые методы `.answer()`, `.reply()` и другие; вызывать их по правилу из раздела «Сокращённые методы у типов»: только после проверки типа.

## Перечисления

- Перечисления `aiogram.enums` называют строковые константы Telegram (`ParseMode.HTML`, `ChatType.PRIVATE`, `ContentType.TEXT`), чтобы код не повторял голые строки. Импорт: `from aiogram.enums import ParseMode, ChatType, ContentType`.
- Значения: `ParseMode.MARKDOWN_V2` — `'MarkdownV2'`, `ParseMode.MARKDOWN` — `'Markdown'`, `ParseMode.HTML` — `'HTML'`; у `ChatType` члены `SENDER`, `PRIVATE`, `GROUP`, `SUPERGROUP`, `CHANNEL` со строчными значениями; у `ContentType` — `UNKNOWN`, `ANY`, `TEXT`, `ANIMATION`, `AUDIO` и другие.
- С 3.32.0 перечисления — `StrEnum` (`TopicIconColor` — `IntEnum`): `str()` и f-строки дают значение (`f"{ParseMode.HTML}"` равно `HTML`); сравнения и сериализация не изменились.
- До 3.32.0 строковые перечисления наследовали `(str, Enum)`, а `TopicIconColor` — `(int, Enum)`, поэтому `str()` и f-строки давали имя члена (`ParseMode.HTML`), а не значение.
- Типы принимают члены перечислений там, где ожидается строка (`DefaultBotProperties(parse_mode=ParseMode.HTML)`); `use_enum_values=True` сохраняет в поле значение члена.

## HTTP-сессия

`AiohttpSession` (`aiogram.client.session.aiohttp`) — сессия `Bot` по умолчанию, обёртка над `ClientSession` из aiohttp. Объект сессии — контейнер, который могут делить несколько экземпляров `Bot`: `Bot(token, session=session)`. Сама сессия создаётся лениво, при первом запросе.

- Сигнатура: `AiohttpSession(proxy=None, limit=100, **kwargs)`. `limit` — общее число одновременных соединений; `kwargs` уходят в `BaseSession`.
- Прокси: `AiohttpSession(proxy="protocol://host:port/")`. Поддерживаются http (туннелирование), socks4(a), socks5. Нужен пакет `aiohttp-socks`, иначе создание сессии бросает `RuntimeError`. Учётные данные: `proxy=("protocol://host:port", BasicAuth(login=..., password=...))` либо в адресе (`protocol://user:password@host:port`); если заданы оба, побеждают значения `BasicAuth`. Набор прокси (строки или кортежи `(url, BasicAuth)`) образует цепочку прокси.
- Таймаут: `BaseSession(timeout=60.0)`, по умолчанию 60.0 секунд на запрос. Значение на один вызов — `request_timeout` в `bot(method, request_timeout=...)`. Превышение даёт `TelegramNetworkError`. В polling таймаут запроса `getUpdates` — таймаут сессии плюс `polling_timeout`. У скачивания файлов собственный `timeout=30` в `download` и `download_file`.
- Свой сервер API: `from aiogram.client.telegram import TelegramAPIServer`, затем `session = AiohttpSession(api=TelegramAPIServer.from_base('http://localhost:8082'))` и `Bot(..., session=session)`. `TelegramAPIServer(base, file, is_local=False, wrap_local_file=BareFilesPathWrapper)`: `base` — адрес API, `file` — адрес файлов, `is_local` включает локальный режим; `from_base(base, **kwargs)` строит экземпляр по одному базовому адресу.
- Закрытие: `await bot.session.close()` закрывает HTTP-клиент (сессия aiohttp закрывается, затем 250 мс ожидания даёт завершиться SSL-соединениям). `Bot` — асинхронный контекстный менеджер: `async with Bot(...) as bot:` закрывает `bot.session` при выходе (с 3.5.0, где он заменил `Bot(...).context()`). `Bot.context(auto_close=True)` тоже работает и закрывает сессию при выходе. `Dispatcher.start_polling` закрывает сессии ботов при остановке, если не задано `close_bot_session=False`.
- `async with session:` на `BaseSession` тоже закрывает её при выходе.

## Примеры

### Пример 1: Бот с разметкой HTML по умолчанию

**Вход:** все сообщения бота должны идти с разметкой HTML.

**Результат:**

```python
bot = Bot(
    token=os.environ["BOT_TOKEN"],
    default=DefaultBotProperties(parse_mode=ParseMode.HTML),
)
```

### Пример 2: Три формы вызова

**Вход:** отправить сообщение в чат тремя способами.

**Результат:**

```python
await bot.send_message(chat_id=chat_id, text="Hello")
await bot(SendMessage(chat_id=chat_id, text="Hello"))
await message.answer(text="Hello")
```

Первые две формы указывают чат явно; сокращённый метод берёт `chat_id` из `message`.

### Пример 3: Эфемерный ответ на нажатие кнопки

**Вход:** по нажатию inline-кнопки показать сообщение только нажавшему пользователю (aiogram 3.32.0).

**Результат:**

```python
@router.callback_query(F.data == "secret")
async def show_secret(callback: CallbackQuery, bot: Bot) -> None:
    await bot.send_message(
        chat_id=None,
        text="Only you can see this.",
        ephemeral_message_parameters=EphemeralMessageParameters(
            callback_query_id=callback.id,
        ),
    )
    await callback.answer()
```

`chat_id=None` передан явно: у метода `Bot` значения по умолчанию у `chat_id` нет. В форме объекта метода `chat_id` можно опустить: `await bot(SendMessage(text=..., ephemeral_message_parameters=...))`.
