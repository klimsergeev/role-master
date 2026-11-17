# Версии aiogram 3

## Назначение

Справочник по текущему выпуску aiogram 3, требованиям к окружению и изменениям внутри линии 3, которые меняют код бота. Используется, чтобы проверить код под закреплённую версию или обновить его до текущей.

## Текущий выпуск

| Что | Значение |
|---|---|
| Последний стабильный выпуск | 3.32.0 |
| Дата выпуска | 2026-11-15 |
| Минимальный Python | 3.11 (`requires-python` — `>=3.11,<3.16`); выпуск 3.32.0 убрал Python 3.10 и добавил 3.15 |
| Версия Telegram Bot API | 10.4 |
| Pydantic | `>=2.7.0,<2.15` |

## Когда появились параметры и возможности

| Что | Версия |
|---|---|
| `FSMStrategy.USER_IN_TOPIC` | 3.0.0b8 |
| `FSMStrategy.CHAT_TOPIC` | 3.2.0 |
| Сцены (Scenes) | 3.2 |
| `DefaultBotProperties` и параметр `default` у `Bot` | 3.4.0 |
| `Bot` как асинхронный контекстный менеджер | 3.5.0 |
| `FSMContext.get_value` | 3.14.0 |
| `tasks_concurrency_limit` в `start_polling` и `run_polling` | 3.20.0 |
| `tasks_shutdown_timeout` в `start_polling` и `run_polling` | 3.32.0 |
| `fsm_key_on_sender_chat` у `Dispatcher` | 3.32.0 |
| Необязательный `chat_id` в методах отправки для эфемерного ответа на callback-запрос | 3.32.0 |

## Изменения внутри линии 3, меняющие код

Каждый выпуск от 3.3.0 до 3.32.0 добавляет версию Bot API; в таблице только записи, которые меняют существующий код.

| Версия | Изменение | Прежнее использование | Новое использование |
|---|---|---|---|
| 3.4.0 | переработаны глобальные параметры бота; появились `DefaultBotProperties` и параметр `default` у `Bot` | `Bot(token, parse_mode=...)` | `Bot(token, default=DefaultBotProperties(parse_mode=...))`; прежние аргументы остаются в конструкторе рядом с `default`, но объявлены устаревшими |
| 3.5.0 | `Bot` стал асинхронным контекстным менеджером | `Bot(...).context()` | `async with Bot(...) as bot:` |
| 3.7.0 | из `Bot` убраны `parse_mode`, `disable_web_page_preview`, `protect_content` | `Bot(token, parse_mode=...)`, `disable_web_page_preview=`, `protect_content=` (теперь `TypeError`) | `default=DefaultBotProperties(parse_mode=..., link_preview_is_disabled=..., protect_content=...)` |
| 3.11.0 | добавлен `Message.as_reply_parameters()`; методы ответа принимают `reply_parameters` | `reply_to_message_id` в методах ответа `Message` | `reply_parameters` (собираются через `as_reply_parameters()`) |
| 3.13.0 | у `InaccessibleMessage` появились сокращённые методы | нет `answer()` и `reply()` | доступны `answer()`, `reply()` и другие |
| 3.14.0 | сокращённые методы сами берут деловое подключение сообщения | передавать `business_connection_id` самому | подставляется сокращённым методом |
| 3.14.0 | убран Python 3.8 | Python 3.8 | Python 3.9 и новее |
| 3.23.0 | убран Python 3.9 | Python 3.9 | Python 3.10 и новее |
| 3.27.0 | `CommandStart(deep_link=False)` отклоняет аргументы; значение по умолчанию стало `None` | `CommandStart(deep_link=False)` принимал любое сообщение | `deep_link=None` принимает оба вида; `False` отклоняет сообщения с аргументами |
| 3.30.0 | сокращённые `reply_*` больше не принимают `receiver_user_id` | `reply_*(..., receiver_user_id=...)` | `answer(..., receiver_user_id=...)` |
| 3.31.0 | введены параметры эфемерных сообщений; `receiver_user_id` и `callback_query_id` в методах отправки объявлены устаревшими | `receiver_user_id`, `callback_query_id` | `EphemeralMessageParameters` (заполняются `reply_*`) |
| 3.31.0 | значения по умолчанию на уровне бота применяются к гораздо большему числу методов | часть методов значения игнорировала | значения применяются |
| 3.32.0 | `answer_*` и `reply_*` сами подставляют `direct_messages_topic_id` | передавать `direct_messages_topic_id` самому | не передавать (`TypeError`); необязательные позиционные аргументы сдвигаются на один, поэтому нужны ключевые слова |
| 3.32.0 | перечисления стали `StrEnum` (`TopicIconColor` — `IntEnum`) | перечисления — `(str, Enum)` и `(int, Enum)`, `str(ParseMode.HTML)` показывал имя члена | `str()` и f-строки дают значение |
| 3.32.0 | `chat_id` необязателен в 14 методах отправки для эфемерного ответа на callback-запрос; перечень и формы вызова — в разделе «Эфемерный ответ на нажатие кнопки: вызов без чата» файла [bot-client.md](bot-client.md) | `chat_id` обязателен; эфемерный ответ на нажатие ниже 3.32.0 не пишется | `bot.send_message(chat_id=None, ..., ephemeral_message_parameters=EphemeralMessageParameters(callback_query_id=...))`; у объекта метода `chat_id` можно не передавать |
| 3.32.0 | `Message.delete()` и `Message.react()` падают на деловых сообщениях | `message.delete()` | `Bot.delete_business_messages()` |
| 3.32.0 | убраны `TelegramObject.remove_unset` и `TelegramMethod.remove_unset` | вызов `remove_unset` | ЕСЛИ код вызывает `remove_unset` → перед обновлением до 3.32.0 сообщить пользователю, что вызовы придётся переписать; замену не подбирать наугад |
| 3.32.0 | аргумент `parameter` у `create_channel_bot_link()` объявлен устаревшим (`DeprecationWarning`) | `parameter=...` | вызов с `parameter` работает и выдаёт `DeprecationWarning`; в новый код `parameter` не добавлять без запроса пользователя |
| 3.32.0 | текстовые помощники (`link()`, `hlink()`, `TextLink`) экранируют адреса | передавать заранее экранированные адреса | передавать сырые адреса |
| 3.32.0 | убран Python 3.10 | Python 3.10 | Python 3.11 и новее |
| 3.32.0 | в `start_polling` и `run_polling` добавлен `tasks_shutdown_timeout` | остановка не ждала обработчики | ждать заданное число секунд |

## Как пользоваться справочником

- Закреплена версия ниже 3.32.0: пройти строки таблицы с версией выше закреплённой и проверить, не использует ли код прежние формы; писать в стиле закреплённой версии, а не текущей.
- Обновление до текущего выпуска: пройти строки таблицы от закреплённой версии до 3.32.0 по возрастанию и заменить прежние формы новыми.
- Закреплена версия ниже 3.4.0: `DefaultBotProperties` нет, глобальные параметры передаются аргументами `Bot`.
- Закреплена версия от 3.4.0 до 3.6: глобальные параметры уже записывают через `default=DefaultBotProperties(...)`, чтобы код пережил 3.7.0.
- Переход через 3.7.0: код для 3.0–3.6 с аргументами `parse_mode`, `disable_web_page_preview`, `protect_content` в `Bot` перестаёт работать (`TypeError`).
- Переход через 3.32.0: проверить вызовы `answer_*` и `reply_*` с необязательными позиционными аргументами и версию Python (нужна 3.11 или новее).
