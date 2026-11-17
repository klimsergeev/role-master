# Клавиатуры и callback-данные

## Назначение

Билдеры клавиатур aiogram, фабрика `CallbackData` с её фильтром и ответ на callback-запрос. Редактирование сообщения по нажатию — в [bot-client.md](bot-client.md), автоматический ответ через middleware — в [middlewares.md](middlewares.md).

## Билдеры клавиатур

`InlineKeyboardBuilder` и `ReplyKeyboardBuilder` лежат в `aiogram.utils.keyboard` и имеют общий интерфейс. Методы раскладки возвращают билдер, поэтому вызовы выстраиваются в цепочку.

Пределы: у inline-билдера не больше 8 кнопок в ряду и 100 кнопок всего; у reply-билдера не больше 10 в ряду и 300 всего. Число кнопок проверяется только при создании билдера из готовой разметки.

| Метод | Что делает |
|---|---|
| `button(**fields)` | добавляет одну кнопку; `text` обязателен, все аргументы только именованные |
| `add(*buttons)` | добавляет объекты кнопок, дозаполняя последний ряд до максимальной ширины и затем начиная новые ряды |
| `row(*buttons, width=None)` | добавляет новый ряд; `width` по умолчанию максимальная ширина и должна быть в допустимых пределах; лишние кнопки переходят в следующие ряды |
| `adjust(*sizes, repeat=False)` | заново раскладывает все кнопки, отбрасывая прежние ряды; при `repeat=False` последний размер повторяется для всех оставшихся кнопок, при `repeat=True` размеры идут по кругу; размеры — целые числа в допустимых пределах |
| `attach(builder)` | добавляет все ряды другого билдера как есть; тип кнопок должен совпадать (inline с inline, reply с reply), иначе `ValueError`; пределы ширины не проверяются |
| `copy()` | возвращает новый независимый билдер с той же разметкой и параметрами |
| `export()` | возвращает разметку списком рядов кнопок (копия) |
| `as_markup(**options)` | возвращает готовую разметку |
| `from_markup(markup)` | метод класса: строит билдер из готовой разметки, сохраняя её параметры |
| свойство `buttons` | плоский список всех кнопок |

Аргументы `button`:

- inline: `text`, `url`, `callback_data` (строка или экземпляр `CallbackData`, который билдер упакует сам), `web_app`, `login_url`, `switch_inline_query`, `switch_inline_query_current_chat`, `switch_inline_query_chosen_chat`, `copy_text`, `callback_game`, `pay`, а также дополнительные именованные аргументы
- reply: `text`, `request_users`, `request_chat`, `request_contact`, `request_location`, `request_poll`, `web_app`, а также дополнительные именованные аргументы

Результат `as_markup`:

- inline: `InlineKeyboardMarkup` (необязательный `force_reply`)
- reply: `ReplyKeyboardMarkup` с параметрами `is_persistent`, `resize_keyboard`, `one_time_keyboard`, `input_field_placeholder`, `selective`, `force_reply`

## Фабрика CallbackData

- Объявление: `class MyCallback(CallbackData, prefix="my"): foo: str; bar: int`. Ключевое слово класса `prefix` обязательно (без него `ValueError`). Необязательное `sep` задаёт разделитель, по умолчанию `:`; разделитель не может входить в префикс (`ValueError`).
- Допустимые типы полей: `str`, `int`, `bool`, `float`, `Decimal`, `Fraction`, `UUID` и их подклассы; `Enum` только со строковыми значениями; целочисленные перечисления должны быть подклассами `IntEnum`. `bool` упаковывается как `1` или `0`, `UUID` — в шестнадцатеричной форме, `None` — пустой строкой; любой другой тип при упаковке даёт `ValueError`.
- `pack()` возвращает строку: `MyCallback(foo="demo", bar=42).pack()` даёт `'my:demo:42'`. Значение с разделителем внутри — `ValueError`.
- `MyCallback.unpack(value)` (метод класса) возвращает экземпляр. `TypeError`, если число частей не равно числу полей; `ValueError`, если префикс не совпал. Пустая часть становится `None`, если поле это допускает.
- Предел — 64 байта в UTF-8 (ограничение Telegram). Если упакованная строка длиннее, `pack()` бросает `ValueError`.

## CallbackData как фильтр

- `MyCallback.filter(rule=None)` (метод класса) возвращает фильтр; условие передаётся магическим фильтром: `@router.callback_query(MyCallback.filter(F.foo == "demo"))`. Без условия подходит любой callback-запрос, данные которого распаковываются в этот класс.
- Обработчик получает распакованный объект в аргументе `callback_data`, аннотированном этим классом: `async def handler(query: CallbackQuery, callback_data: MyCallback)`; поля читаются как `callback_data.bar`.
- Фильтр не подходит, не бросая исключения, если событие не callback-запрос, у него нет данных или данные не распаковываются (чужой префикс или другое число частей).
- Кнопка: `builder.button(text=..., callback_data=MyCallback(...))` упаковывает экземпляр; в обычной `InlineKeyboardButton` вызывается `.pack()`.

## Ответ на callback-запрос

- Прямой ответ: `await callback.answer(text=None, show_alert=None, url=None, cache_time=None)`. `text` — от 0 до 200 символов (если не задан, ничего не показывается), `show_alert=True` показывает окно вместо уведомления сверху, `url` — для игр с кнопкой `callback_game`, `cache_time` — секунды, на которые клиент может кешировать ответ (по умолчанию 0). Идентификатор запроса подставляется сам, при успехе возвращается `True`. Тот же вызов, что `bot.answer_callback_query(callback_query_id=..., ...)`.
- Middleware: `dispatcher.callback_query.middleware(CallbackAnswerMiddleware())` — внутренний, на диспетчере или роутере — автоматически отвечает на каждый обработанный callback-запрос. Параметры: `pre=False` (отвечать до обработчика, а не после), `text`, `show_alert`, `url`, `cache_time` (все по умолчанию `None`).
- В обработчике аргумент `callback_answer: CallbackAnswer` позволяет изменить `text`, `show_alert`, `url`, `cache_time` или вызвать `disable()`; при `pre=True` менять нельзя (после ответа сеттеры бросают ошибку).
- Для отдельного обработчика: `@flags.callback_answer(...)` с теми же аргументами и дополнительным `disabled`. При `pre=False` ответ отправляется, даже если обработчик бросил исключение.
- Если обработчик не ответил и middleware не зарегистрирован, клиенты Telegram продолжают показывать на кнопке индикатор загрузки; ответ нужно отправлять всегда, даже без уведомления. Автоматического ответа aiogram без middleware нет.

## Редактирование сообщения по нажатию

`callback.message` имеет тип `Message | InaccessibleMessage | None`. Поэтому перед `callback.message.edit_text(...)` и любым другим сокращённым методом на `callback.message` проверяют `isinstance(callback.message, Message)`; для `InaccessibleMessage` действие выполняется методом `Bot` с `chat_id=callback.message.chat.id` ([bot-client.md](bot-client.md)).

## Эфемерный ответ на нажатие

С 3.32.0 на нажатие можно ответить сообщением, которое видит только нажавший пользователь: метод отправки вызывается без чата, а адресата задаёт `ephemeral_message_parameters`. Вызов и условия — в [bot-client.md](bot-client.md), раздел «Эфемерный ответ на нажатие кнопки: вызов без чата». В проекте на aiogram ниже 3.32.0 эфемерный ответ не пишется; что предложить вместо него, сказано там же. На сам callback-запрос по-прежнему отвечают `callback.answer()` или через `CallbackAnswerMiddleware`.

## Примеры

### Пример: Кнопки списка и обработчик нажатия

**Вход:** список позиций кнопками по две в ряд, нажатие показывает позицию.

**Результат:**

```python
class ItemCallback(CallbackData, prefix="item"):
    action: str
    item_id: int


def items_keyboard(item_ids: list[int]) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    for item_id in item_ids:
        builder.button(
            text=f"Item {item_id}",
            callback_data=ItemCallback(action="open", item_id=item_id),
        )
    builder.adjust(2)
    return builder.as_markup()


@router.callback_query(ItemCallback.filter(F.action == "open"))
async def open_item(callback: CallbackQuery, callback_data: ItemCallback) -> None:
    if isinstance(callback.message, Message):
        await callback.message.edit_text(text=f"Item {callback_data.item_id}")
    await callback.answer()
```
