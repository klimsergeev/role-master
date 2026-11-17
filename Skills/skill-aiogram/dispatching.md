# Dispatcher, роутеры и обработчики

## Назначение

Как устроены `Dispatcher` и `Router`, как подключать роутеры, регистрировать обработчики и в каком порядке aiogram ищет обработчик события. Запуск polling — в [polling.md](polling.md), фильтры — в [filters.md](filters.md).

## Dispatcher и Router

- `Router` (`from aiogram import Router`, `Router(name=None)`) группирует обработчики и маршрутизирует обновления и вложенные типы событий. Имя необязательно и нужно для отладки.
- `Dispatcher` (`aiogram.dispatcher.dispatcher.Dispatcher`) — подкласс `Router` и всегда корневой роутер. Он сам регистрирует обработчики (`@dp.message()`) и принимает вложенные роутеры.
- Конструктор принимает только именованные аргументы: `Dispatcher(*, storage=None, fsm_strategy=FSMStrategy.USER_IN_CHAT, events_isolation=None, disable_fsm=False, fsm_key_on_sender_chat=False, name=None, **kwargs)`. Лишние именованные аргументы (`**kwargs`) становятся данными, которые получают обработчики (см. [handler-data.md](handler-data.md)). Параметры FSM — в [fsm.md](fsm.md).

## Подключение роутеров

- `router.include_router(other)` подключает один роутер и возвращает подключённый роутер.
- `router.include_routers(a, b, ...)` подключает несколько роутеров по порядку.
- Вложенность не ограничена по глубине: `router1.include_router(router2)`.
- Порядок подключения — порядок проверки вложенных роутеров.

Ограничения:

- роутер не подключается сам к себе, и круговое подключение (первый включает второй, второй — третий, третий — первый) недопустимо: бросается `RuntimeError`
- роутер, у которого уже есть родитель, второй раз не подключается: `RuntimeError`
- аргумент, не являющийся `Router`, даёт `ValueError`
- `include_routers` без аргументов даёт `ValueError`

## Наблюдатели событий

Каждый наблюдатель используется как `@router.<имя>()` и получает событие указанного типа.

| Наблюдатель | Тип события |
|---|---|
| `message`, `edited_message`, `channel_post`, `edited_channel_post`, `business_message`, `edited_business_message`, `guest_message` | `Message` |
| `inline_query` | `InlineQuery` |
| `chosen_inline_result` | `ChosenInlineResult` |
| `callback_query` | `CallbackQuery` |
| `shipping_query` | `ShippingQuery` |
| `pre_checkout_query` | `PreCheckoutQuery` |
| `poll` | `Poll` |
| `poll_answer` | `PollAnswer` |
| `my_chat_member`, `chat_member` | `ChatMemberUpdated` |
| `chat_join_request` | `ChatJoinRequest` |
| `message_reaction` | `MessageReactionUpdated` |
| `message_reaction_count` | `MessageReactionCountUpdated` |
| `chat_boost` | `ChatBoostUpdated` |
| `removed_chat_boost` | `ChatBoostRemoved` |
| `deleted_business_messages` | `BusinessMessagesDeleted` |
| `business_connection` | `BusinessConnection` |
| `purchased_paid_media` | `PaidMediaPurchased` |
| `managed_bot` | `ManagedBotUpdated` |
| `subscription` | `BotSubscriptionUpdated` |
| `stopped_message_generation` | `MessageGenerationStopped` |
| `widget_query` | `WidgetQuery` |
| `shared_widget_query` | `SharedWidgetQuery` |
| `errors` (псевдоним `error`) | `ErrorEvent` |

- `update` обрабатывается только корневым роутером (`@dp.update()`); у диспетчера есть обработчик `update` по умолчанию.
- `startup` и `shutdown` — отдельные наблюдатели, не входящие в этот перечень (раздел ниже). Наблюдатель `errors` — в [errors.md](errors.md).
- У `message` событие может нести разные наборы атрибутов, поэтому обработчик сообщения фильтруют магическим фильтром: `F.text`, `F.sticker`.

## Регистрация обработчиков

- Декоратор: `@router.<событие>(<фильтры>)`.
- Метод: `router.<событие>.register(handler, <фильтры>)`.
- Оба способа принимают необязательный словарь `flags=` (см. [middlewares.md](middlewares.md)).
- Обработчик пишется как `async def`. Синхронная функция тоже принимается и выполняется в потоке.
- Имя функции не важно. Имя параметра события не важно, но оно не должно совпадать с именами контекстных данных (список — в [handler-data.md](handler-data.md)).
- Фильтры передаются только позиционно: именованный аргумент-фильтр даёт `UnsupportedKeywordArgument`.

## Порядок проверки и передача события дальше

1. Диспетчер направляет обновление в наблюдатель его типа на корневом роутере.
2. В роутере сначала проверяется его собственный наблюдатель: обработчики в порядке регистрации, фильтры каждого обработчика — в порядке передачи.
3. Затем по очереди, вглубь, проверяются вложенные роутеры в порядке подключения.
4. Первый обработчик, у которого прошли все фильтры, выполняется, и поиск на этом заканчивается: ни следующие обработчики, ни вложенные роутеры уже не проверяются. Исключение — обработчик вернул `UNHANDLED`: следующие обработчики того же наблюдателя не проверяются, а вложенные роутеры проверяются (раздел ниже).
5. Обработчик без фильтров подходит к любому событию, которое до него дошло. Поэтому универсальный обработчик регистрируют последним или подключают последним тот роутер, в котором он лежит.

Как передать событие дальше:

- фильтр вернул ложное значение — проверка идёт со следующим обработчиком
- обработчик бросил `SkipHandler` (`from aiogram.dispatcher.event.bases import SkipHandler`) или вызвал помощник `skip(message=None)`, который его бросает — наблюдатель продолжает со следующим обработчиком
- `CancelHandler` лежит в том же модуле; ни он, ни `SkipHandler` не превращаются в ошибки для наблюдателя `errors`

Служебное значение `UNHANDLED` означает «событие никто не взял»: когда в наблюдателе нет подходящего обработчика, он возвращает `UNHANDLED`, и роутер переходит к вложенным роутерам.

Обработчик, который сам вернул `UNHANDLED`:

- наблюдатель отдаёт роутеру результат обработчика сразу, не сравнивая его с `UNHANDLED`, поэтому следующие обработчики того же наблюдателя не проверяются
- для роутера такой результат неотличим от «подходящего обработчика нет»: он проверяет вложенные роутеры в порядке подключения до первого результата, отличного от `UNHANDLED`
- если ни один вложенный роутер событие не взял, `UNHANDLED` уходит вверх, и диспетчер считает обновление необработанным
- отличие от `SkipHandler`: после `SkipHandler` следующие обработчики того же наблюдателя проверяются, после возврата `UNHANDLED` — нет
- обработчик, который вернул `REJECTED`, закрывает вложенные роутеры: роутер сразу возвращает `UNHANDLED`, не проверяя их
- чтобы передать событие следующему обработчику, в коде бота бросают `SkipHandler` или вызывают `skip()`; `UNHANDLED` и `REJECTED` из обработчика не возвращают

Если событие не взял ни один обработчик во всём дереве, диспетчер считает его необработанным; это пишется в журнал логгера `aiogram.event` с пометкой `handled=False`.

## Фильтры на весь наблюдатель роутера

`router.<событие>.filter(*filters)` вешает фильтры на наблюдатель целиком. Они проверяются до обработчиков роутера. Если они не прошли, ни один обработчик этого роутера для этого события не выполняется, и вложенные роутеры тоже не проверяются. Подробнее о фильтрах — в [filters.md](filters.md).

## Наблюдатели startup и shutdown

- Регистрация: `@router.startup()` или `router.startup.register(fn)`, так же для `shutdown`. Их можно вешать на любой роутер.
- `startup` срабатывает в `start_polling` после подготовки обработчиков сигналов и данных и до первого запроса `getUpdates`.
- `shutdown` срабатывает после остановки polling и после ожидания (или отмены) выполняющихся обработчиков, до закрытия сессий ботов.
- Порядок: сначала обработчики самого роутера, затем вложенных, родитель первым; порядок `shutdown` не обращается.
- Обработчики получают данные по имени параметра: `dispatcher`, `bots` (список всех ботов), `bot` (последний бот, переданный в polling), все данные из именованных аргументов `Dispatcher`, из `workflow_data` и из именованных аргументов запуска polling, а также `router` (роутер, чьи обработчики выполняются).
- Закрытие FSM-хранилища регистрируется как обработчик `shutdown` автоматически, если FSM не отключён.

## Разбиение бота на модули

- Один модуль — один `Router` со своими обработчиками; точка входа создаёт `Dispatcher` и подключает роутеры через `include_routers`.
- Роутер со специфичными обработчиками подключается раньше роутера с универсальным обработчиком, чтобы универсальный не перекрыл остальные.
- Вложенные роутеры подключаются так же: `sub_router.include_router(deep_router)`, затем `router.include_routers(sub_router, other)`, затем `dp.include_router(router)`.
- Для маленького бота обработчики можно вешать прямо на `Dispatcher`: `@dp.message(CommandStart())`, затем универсальный `@dp.message()`.

## Примеры

### Пример 1: Роутер на модуль

**Вход:** бот с приветствием и эхо-ответом в двух модулях.

**Результат:**

```python
# handlers/start.py
from aiogram import Router
from aiogram.filters import CommandStart
from aiogram.types import Message

router = Router(name="start")


@router.message(CommandStart())
async def cmd_start(message: Message) -> None:
    await message.answer(text="Hello!")
```

```python
# handlers/echo.py
from aiogram import F, Router
from aiogram.types import Message

router = Router(name="echo")


@router.message(F.text)
async def echo(message: Message) -> None:
    await message.answer(text=message.text)
```

```python
# main.py
import asyncio
import os

from aiogram import Bot, Dispatcher

from handlers import echo, start


async def main() -> None:
    dp = Dispatcher()
    dp.include_routers(start.router, echo.router)
    bot = Bot(token=os.environ["BOT_TOKEN"])
    await dp.start_polling(bot)


asyncio.run(main())
```

Роутер приветствия подключён первым: эхо реагирует на любой текст и перекрыло бы `/start`, будь оно первым.

### Пример 2: Обработчик startup

**Вход:** при запуске нужно что-то сделать с ботом.

**Результат:**

```python
@dp.startup()
async def on_startup(bot: Bot) -> None:
    await bot.delete_webhook(drop_pending_updates=True)
```

Параметр `bot` подставляется по имени; при нескольких ботах в polling это последний переданный бот.
