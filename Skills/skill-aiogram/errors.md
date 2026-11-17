# Ошибки: обработчики ошибок и исключения API Telegram

## Назначение

Как aiogram ловит исключения из обработчиков, что бывает с неперехваченным исключением, какие исключения бросают вызовы методов API и как ведёт себя библиотека при flood control. Ошибки получения обновлений при polling — в [polling.md](polling.md).

## Обработчики ошибок

- Обработчик регистрируется как `@router.errors()` (псевдоним `error`) или `router.errors.register(...)` и получает `ErrorEvent`. На диспетчере — `@dp.errors(...)` так же. Обработчик ошибок принимает и другие контекстные данные по имени параметра: например, `bot`.
- `ErrorEvent` (`aiogram.types.ErrorEvent`): поле `update` (`Update`) и поле `exception` (исключение).
- `ErrorsMiddleware` ловит любое `Exception` из цепочки обработчиков, собирает `ErrorEvent` и передаёт его наблюдателям `errors` как обновление типа `error` с теми же данными. `SkipHandler` и `CancelHandler` в ошибки не превращаются.
- Фильтры: `ExceptionTypeFilter(exception_type)` и `ExceptionMessageFilter(pattern)` из `aiogram.filters`. Чтобы получить сообщение упавшего обновления, используют `F.update.message.as_("message")`.
- Обработчики ошибок работают как любые наблюдатели: первый, у которого прошли фильтры, обрабатывает ошибку, и распространение прекращается.
- Если обработчик ошибок вернул результат, отличный от «не обработано», исключение считается погашенным, и этот результат возвращается.
- Для частных случаев `try`/`except` ставят прямо в обработчике, общие случаи отдают глобальным обработчикам ошибок.

### По какому дереву идёт событие ошибки

- `ErrorsMiddleware` создаёт сам `Dispatcher` и запускает событие `error` всегда с корня, с диспетчера, а не с роутера, чей обработчик упал. Дальше событие идёт по дереву так же, как любое событие ([dispatching.md](dispatching.md)): сначала наблюдатель `errors` самого роутера, затем вложенные роутеры в порядке подключения, вглубь; родитель всегда раньше вложенных.
- Поэтому обработчик ошибок на роутере получает не только ошибки своего роутера, а ошибки любого обработчика бота, до которых дошло событие `error`.
- Подходят и обработчик ошибок роутера, и обработчик на диспетчере → срабатывает обработчик диспетчера, обработчик роутера не вызывается ни до, ни после.
- Обработчик ошибок роутера срабатывает, только если на диспетчере и на роутерах, проверенных раньше, ни один обработчик ошибок не подошёл; первый подошедший во всём дереве останавливает поиск.
- Обработчик ошибок без фильтров на диспетчере перехватывает все ошибки, и обработчики ошибок роутеров не срабатывают никогда. Чтобы ошибку определённого вида обработал обработчик роутера, обработчик диспетчера сужают фильтрами.
- Если не прошли фильтры, повешенные на весь наблюдатель `errors` роутера (`router.errors.filter(...)`), его вложенные роутеры для этой ошибки тоже не проверяются.

## Исключение, которое не поймал ни один обработчик

- `ErrorsMiddleware` пробрасывает его дальше; обработка обновления в диспетчере ловит его, пишет в журнал логгера `aiogram.event` и возвращает «обработано».
- Polling продолжает работу: исключение не покидает задачу обновления. Обновление считается обработанным (смещение сдвигается), повторно оно не приходит.
- Вызовы внутри обработчика ошибок (ответ пользователю и другие вызовы API) оборачиваются в собственный `try`/`except`: исключение из обработчика ошибок наружу не выпускается.

## Исключения aiogram

Все классы лежат в `aiogram.exceptions`. Исключение выбирается по HTTP-статусу и параметрам ответа, а не по тексту описания ошибки.

| Класс | Родитель | Когда бросается | Атрибуты |
|---|---|---|---|
| `AiogramError` | `Exception` | база всех ошибок aiogram | нет |
| `DetailedAiogramError` | `AiogramError` | база ошибок с подробным сообщением | `message`, атрибут класса `url` |
| `TelegramAPIError` | `DetailedAiogramError` | база всех ошибок API Telegram; также любой неудачный ответ, который не подошёл ни под один подкласс | `method`, `message`, `label` (`"Telegram server says"`) |
| `TelegramNetworkError` | `TelegramAPIError` | сбои сети и таймаут запроса (сообщение «Request timeout error») | унаследованные; `label` — `"HTTP Client says"` |
| `TelegramRetryAfter` | `TelegramAPIError` | превышено ограничение частоты запросов (в ответе есть `retry_after`) | `retry_after` (секунды) |
| `TelegramMigrateToChat` | `TelegramAPIError` | группа стала супергруппой (в ответе есть `migrate_to_chat_id`) | `migrate_to_chat_id` |
| `TelegramBadRequest` | `TelegramAPIError` | HTTP 400, неверно составленный запрос | унаследованные |
| `TelegramNotFound` | `TelegramAPIError` | HTTP 404, не найден чат, сообщение, пользователь и подобное | унаследованные |
| `TelegramConflictError` | `TelegramAPIError` | HTTP 409, токен используется другим приложением в режиме polling | унаследованные |
| `TelegramUnauthorizedError` | `TelegramAPIError` | HTTP 401, неверный токен | унаследованные |
| `TelegramForbiddenError` | `TelegramAPIError` | HTTP 403, например бота исключили из чата | унаследованные |
| `TelegramServerError` | `TelegramAPIError` | HTTP 5xx от Telegram | унаследованные |
| `RestartingTelegram` | `TelegramServerError` | 5xx, в описании которого есть «restart»; оставлен для обратной совместимости, теперь Telegram обычно присылает ошибку с `retry_after` | унаследованные |
| `TelegramEntityTooLarge` | `TelegramNetworkError` | HTTP 413, отправляемый файл слишком велик | унаследованные |
| `ClientDecodeError` | `AiogramError` | ответ не удаётся декодировать или десериализовать | `message`, `original`, `data` (сырое тело с 3.32.0) |
| `DataNotDictLikeError` | `DetailedAiogramError` | данные не похожи на словарь | унаследованные |
| `UnsupportedKeywordArgument` | `DetailedAiogramError` | именованный аргумент передан как фильтр | унаследованные |
| `CallbackAnswerException` | `AiogramError` | утилита ответа на callback-запросы | нет |
| `SceneException` | `AiogramError` | сцены ([scenes.md](scenes.md)) | нет |

- Конструкторы: `TelegramAPIError(method, message)`, `TelegramRetryAfter(method, message, retry_after)`, `TelegramMigrateToChat(method, message, migrate_to_chat_id)`. Сообщения `TelegramRetryAfter` и `TelegramMigrateToChat` содержат имя метода и, если оно известно, идентификатор чата.
- `TelegramEntityTooLarge` — потомок `TelegramNetworkError`, поэтому `except TelegramNetworkError` ловит и его.
- Неверный формат токена при создании `Bot(...)` даёт `TokenValidationError`.

## Flood control

- Сессия бросает `TelegramRetryAfter`, как только в ответе есть параметр `retry_after` (проверяется раньше статуса). Время ожидания в секундах — атрибут `retry_after`.
- Автоматического повтора при вызовах методов нет: исключение доходит до кода, повтор остаётся за кодом.
- Сообщение, отправленное из обработчика, — вызов метода, поэтому `TelegramRetryAfter` из него попадает в обработчики ошибок роутера как любое исключение обработчика.
- Поведение polling при flood control — в [polling.md](polling.md), раздел «Повторы при сбоях».

## Примеры

### Пример 1: Глобальный обработчик конкретной ошибки

**Вход:** при `TelegramBadRequest` пользователь должен получить понятный ответ.

**Результат:**

```python
@router.error(ExceptionTypeFilter(TelegramBadRequest), F.update.message.as_("message"))
async def on_bad_request(event: ErrorEvent, message: Message) -> None:
    try:
        await message.answer(text="Could not complete the action.")
    except Exception:
        logging.exception("Failed to notify the user about an error")
```

Ответ пользователю обёрнут в `try`/`except`: исключение из обработчика ошибок наружу не выпускается. Обработчик получит `TelegramBadRequest` из обработчиков любого роутера, а не только своего, — если на диспетчере и на роутерах, проверенных раньше, нет обработчика ошибок, который подходит к этому исключению.

### Пример 2: Повтор после ожидания при flood control

**Вход:** отправка сообщения упала с `TelegramRetryAfter`.

**Результат:**

```python
try:
    await message.answer(text=text)
except TelegramRetryAfter as error:
    await asyncio.sleep(error.retry_after)
    await message.answer(text=text)
```
