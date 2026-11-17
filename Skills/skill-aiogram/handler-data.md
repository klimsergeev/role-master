# Аргументы обработчиков и свои данные

## Назначение

Какие аргументы aiogram подставляет в обработчик по имени, как передать свои данные и по каким правилам данные сопоставляются с параметрами, какие обработчики-классы есть в aiogram. Middleware, которые добавляют данные, — в [middlewares.md](middlewares.md).

## Аргументы, которые подставляет aiogram

| Имя | Тип | Откуда берётся |
|---|---|---|
| событие (любое имя параметра, первый позиционный аргумент) | тип события наблюдателя: `Message`, `CallbackQuery` и так далее | наблюдатель роутера |
| `dispatcher` | `Dispatcher` | диспетчер |
| `bot` | `Bot` | бот, получивший обновление, в том числе при нескольких ботах в одном `Dispatcher` ([polling.md](polling.md)) |
| `bots` | `list[Bot]` | запуск polling (все боты); есть в данных `startup` и `shutdown` и в данных запуска polling |
| `event_update` | `Update` | диспетчер, обновление целиком |
| `event_router` | `Router` | роутер, который обрабатывает событие |
| `handler` | `HandlerObject` | наблюдатель, для каждого подошедшего обработчика; во внешних middleware недоступен |
| `event_context` | `EventContext` | middleware контекста пользователя; поля `chat`, `user`, `thread_id`, `business_connection_id`, `is_guest`, `sender_chat` |
| `event_from_user` | `User` | middleware контекста пользователя; нет, если в обновлении нет пользователя |
| `event_chat` | `Chat` | middleware контекста пользователя; нет, если нет чата |
| `event_thread_id` | `int` | middleware контекста пользователя; нет, если темы нет |
| `event_business_connection_id` | `str` | ключ помечен устаревшим с 3.5.0; параметр с этим именем в обработчиках не объявляют, идентификатор делового подключения берут из `event_context.business_connection_id` |
| `fsm_storage` | `BaseStorage` | middleware FSM, при каждом событии, пока FSM не отключён |
| `state` | `FSMContext` | middleware FSM, когда удаётся определить чат или пользователя |
| `raw_state` | `str` или `None` | middleware FSM, сохранённое значение состояния |
| `command` | `CommandObject` | фильтр `Command` или `CommandStart` |
| `callback_data` | подкласс `CallbackData` | `CallbackData.filter()` |
| любое имя | любой | именованные аргументы `Dispatcher` и запуска polling, `workflow_data`, данные middleware, словарь из фильтра, `F...as_(name)` |

- Необязательные ключи в данных не устанавливаются, а не получают `None`, поэтому параметрам для них задают значения по умолчанию: `event_chat: Chat | None = None`.
- `i18n` и `i18n_middleware` — необязательные ключи, которых нет в классе данных по умолчанию; они появляются, когда подключена встроенная локализация ([utilities.md](utilities.md)).

## Как передать свои данные

- Именованные аргументы `Dispatcher(..., foo=42)` или запуска polling: `dp.start_polling(bot, bar="Bazz")`. Именованные аргументы `Dispatcher` хранятся как `workflow_data`; polling собирает `dispatcher`, `bots`, `workflow_data`, затем именованные аргументы запуска, более поздние перекрывают более ранние.
- Присваивание в `workflow_data` по ключу: `dp["eggs"] = Spam()`.
- Middleware: запись в словарь `data`, который они получают ([middlewares.md](middlewares.md)).
- Фильтры: возвращаемый словарь и `F...as_(name)` ([filters.md](filters.md)).
- Данные, добавленные фильтром, видны следующим фильтрам и обработчику той же регистрации: словарь один и тот же.

## Правила сопоставления

- Каждый обработчик, фильтр и middleware проверяется по сигнатуре: передаются только те именованные аргументы, имена которых есть среди параметров вызываемого объекта.
- Если объявлен `**kwargs`, передаётся весь словарь данных.
- Аннотации типов для сопоставления не используются и необязательны.
- Синхронные вызываемые объекты выполняются в потоке.

## Обработчики-классы

- Импорт: `from aiogram.handlers import ...`. Классы: `BaseHandler`, `CallbackQueryHandler`, `ChatMemberHandler`, `ChosenInlineResultHandler`, `ErrorHandler`, `InlineQueryHandler`, `MessageHandler`, `PollHandler`, `PreCheckoutQueryHandler`, `ShippingQueryHandler`; примеси `BaseHandlerMixin`, `MessageHandlerCommandMixin`.
- Логика пишется в `async def handle(self) -> Any`; инициализатор по умолчанию принимает событие и все данные. Регистрация — декоратором роутера на самом классе: `@router.message()` над подклассом `MessageHandler`.
- Доступ к данным: `self.event` (событие с типом), `self.data` (словарь всего контекста), `self.bot` (из данных; `RuntimeError`, если бота в контексте нет), `self.update`.
- Свойства классов: у `MessageHandler` — `chat` и `from_user`; у `CallbackQueryHandler` — `from_user`, `message` и `callback_data` (сырая строка `event.data`); у `ChatMemberHandler` — `chat`; у `ErrorHandler` — `exception_name` (имя класса) и `exception_message` (строка исключения).
- В `ChosenInlineResultHandler`, `InlineQueryHandler`, `PollHandler`, `PreCheckoutQueryHandler` и `ShippingQueryHandler` событие и данные читаются через `self.event` и `self.data`.

## Примеры

### Пример 1: Свои данные через Dispatcher

**Вход:** обработчикам нужен общий объект настроек.

**Результат:**

```python
dp = Dispatcher(settings=settings)


@router.message(Command("info"))
async def cmd_info(message: Message, settings: Settings) -> None:
    await message.answer(text=settings.greeting)
```

### Пример 2: Обработчик-класс

**Вход:** обработчик сообщения оформлен классом.

**Результат:**

```python
@router.message()
class EchoHandler(MessageHandler):
    async def handle(self) -> Any:
        return await self.event.answer(text=self.event.text or "")
```
