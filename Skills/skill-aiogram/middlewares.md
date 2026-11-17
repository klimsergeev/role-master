# Middleware и флаги обработчиков

## Назначение

Внешние и внутренние middleware aiogram: где регистрируются, когда выполняются, как написать свой, какие middleware встроены; флаги обработчиков, которые читают middleware.

## Внешние и внутренние middleware

| | Внешний (outer) | Внутренний (inner) |
|---|---|---|
| Регистрация | `<роутер>.<событие>.outer_middleware(...)` | `<роутер>.<событие>.middleware(...)` |
| Когда выполняется | для каждого входящего события до фильтров, даже если обработчика нет; срабатывает, когда событие доходит до наблюдателя этого роутера | только когда фильтры обработчика прошли, непосредственно перед обработчиком |

- Оба вида регистрируются на конкретном наблюдателе роутера или диспетчера: `router.message.middleware(...)`, `dp.callback_query.middleware(...)`. На уровне обновления: `dp.update.outer_middleware()`.
- Внутренние middleware наблюдателя `update` вызываются всегда: каждое обновление доходит до обработчиков своего типа через встроенный обработчик `update`.
- Внутренние middleware собираются с роутера вверх по родителям, поэтому внутренний middleware на родителе действует на обработчики вложенных роутеров. Внутренний middleware не опирается на данные, которые кладёт внутренний middleware другого уровня (родителя или вложенного роутера): middleware, зависящие друг от друга, регистрируются на одном наблюдателе, первым — тот, что готовит данные.
- Форма регистрации: декоратор `@observer.middleware()` или вызов `observer.middleware(instance)`. Зарегистрированный первым оказывается самым внешним.
- Во внешних middleware ключа `handler` в данных нет, поэтому `get_flag` там возвращает `None`: middleware, читающий флаги, должен быть внутренним.

## Контракт middleware

- Подкласс `BaseMiddleware` (`from aiogram import BaseMiddleware`) с методом `async def __call__(self, handler, event, data)` либо любая асинхронная функция с теми же тремя аргументами.
- `handler` — следующий шаг, `Callable[[TelegramObject, dict[str, Any]], Awaitable[Any]]`; `event` — входящее событие; `data` — словарь контекста, который сопоставляется с аргументами обработчика.
- Возвращает `Any`: обычно результат `await handler(event, data)`.
- Изменить данные: записать ключи в `data` до вызова `handler`; обработчик получит их по имени.
- Продолжить обработку: всегда вызывать `await handler(event, data)`. Остановить: не вызывать его.
- Действовать после обработчика: выполнить код после возврата из `await handler(...)` или обернуть вызов контекстным менеджером (`async with database.transaction():` вокруг вызова `handler`).
- `SkipHandler` и `CancelHandler` проходят через `ErrorsMiddleware` без изменений.

## Встроенные middleware

| Middleware | Что делает | Как включается |
|---|---|---|
| `UserContextMiddleware` | внешний на `update`; задаёт `event_context`, `event_from_user`, `event_chat`, `event_thread_id` | `Dispatcher` регистрирует сам |
| `FSMContextMiddleware` (`aiogram.fsm.middleware`) | внешний на `update`, третий после `ErrorsMiddleware` и `UserContextMiddleware`; задаёт `fsm_storage`, `state`, `raw_state`; использует `storage or MemoryStorage()` и `events_isolation or DisabledEventIsolation()` и держит блокировку изоляции событий, пока выполняется всё, что ниже него (раздел «Изоляция событий» в [fsm.md](fsm.md)) | регистрируется сам, пока не задано `disable_fsm=True` |
| `ErrorsMiddleware` | оборачивает всё, что ниже, и отправляет исключения в наблюдатель `errors` | регистрируется сам первым |
| `ChatActionMiddleware` (`aiogram.utils.chat_action`) | показывает действие «typing», пока обработчик выполняется дольше `initial_sleep` | `<роутер или диспетчер>.message.middleware(ChatActionMiddleware())`; для отдельного обработчика — флаг `@flags.chat_action("sticker")` или `@flags.chat_action(initial_sleep=2, action="upload_document", interval=3)` |
| `CallbackAnswerMiddleware` (`aiogram.utils.callback_answer`) | автоматически отвечает на callback-запросы | внутренний; `dp.callback_query.middleware(CallbackAnswerMiddleware(...))`; параметры и флаг — в [keyboards-callbacks.md](keyboards-callbacks.md) |

Отправитель действия, который использует `ChatActionMiddleware`, — `ChatActionSender`; параметры и пресеты — в [utilities.md](utilities.md).

## Флаги обработчиков

- Флаг — пометка на обработчике, по которой middleware и утилиты классифицируют обработчики.
- Установка: декораторы из `aiogram.flags` (`@flags.chat_action` со значением `True` или `@flags.rate_limit(rate=2, key="something")` с именованными значениями; значение и именованные аргументы вместе нельзя), словарь `flags={...}` при регистрации (`@router.message(..., flags={"chat_action": "typing"})`) либо фильтр с переопределённым `update_handler_flags(self, flags)`. Декоратор флага ставится под декоратором роутера, непосредственно над `async def`.
- Чтение: `from aiogram.dispatcher.flags import get_flag, extract_flags, check_flags`. `get_flag(handler_or_data, name, default=None)` возвращает один флаг; `extract_flags(...)` — все флаги словарём; `check_flags(..., magic)` проверяет магический фильтр над флагами. Все принимают обработчик или словарь `data` middleware (читается `data["handler"]`).
- Флаги видны только во внутренних middleware, потому что во внешних `handler` в данных нет. Утилиты могут читать `handler.flags` у `router.message.handlers` напрямую.

## Примеры

### Пример 1: Middleware со счётчиком

**Вход:** обработчики сообщений должны получать номер обработанного сообщения.

**Результат:**

```python
class CounterMiddleware(BaseMiddleware):
    def __init__(self) -> None:
        self.counter = 0

    async def __call__(
        self,
        handler: Callable[[TelegramObject, dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: dict[str, Any],
    ) -> Any:
        self.counter += 1
        data["counter"] = self.counter
        return await handler(event, data)


router.message.middleware(CounterMiddleware())
```

Обработчик объявляет параметр `counter: int` и получает значение по имени.

### Пример 2: Middleware, читающий флаг

**Вход:** долгие команды помечены флагом, middleware меряет их время.

**Результат:**

```python
@router.message(Command("report"), flags={"long_operation": True})
async def cmd_report(message: Message) -> None:
    ...


async def timing_middleware(handler, event, data):
    if get_flag(data, "long_operation"):
        started = time.monotonic()
        try:
            return await handler(event, data)
        finally:
            logging.info("took %.2f s", time.monotonic() - started)
    return await handler(event, data)


router.message.middleware(timing_middleware)
```

Middleware зарегистрирован как внутренний (`middleware`, не `outer_middleware`): во внешнем `get_flag` вернул бы `None`.
