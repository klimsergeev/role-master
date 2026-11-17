# Фильтры

## Назначение

Встроенные фильтры aiogram, магический фильтр `F`, свои фильтры, комбинирование фильтров и разбор команд. Привязка фильтров к роутеру целиком — в [dispatching.md](dispatching.md), фильтрация по состоянию FSM — в [fsm.md](fsm.md).

## Встроенные фильтры

| Фильтр | Импорт | Параметры | Что подходит |
|---|---|---|---|
| `Command` | `aiogram.filters.Command` | `*values`, `commands=None`, `prefix="/"`, `ignore_case=False`, `ignore_mention=False`, `magic=None` | сообщение (в том числе `edited_message`), текст или подпись которого начинается с команды; передаёт в обработчик `command` |
| `CommandStart` | `aiogram.filters.CommandStart` | `deep_link=None`, `deep_link_encoded=False`, `ignore_case=False`, `ignore_mention=False`, `magic=None` | `/start`, при желании с данными deep link |
| `ChatMemberUpdatedFilter` | `aiogram.filters.ChatMemberUpdatedFilter` | `member_status_changed` (статус, группа или переход) | обновления `my_chat_member` и `chat_member` с заданным изменением статуса |
| `MagicData` | `aiogram.filters.MagicData` | `magic_data` (магический фильтр) | выражение магического фильтра над контекстными данными (`F.event`, значения из middleware); любой тип обновления |
| `StateFilter` | `aiogram.filters.StateFilter` | `*states`, минимум одно значение | состояние FSM из `raw_state`; подробности в [fsm.md](fsm.md) |
| `ExceptionTypeFilter` | `aiogram.filters.exception.ExceptionTypeFilter` (также `aiogram.filters`) | `exceptions` (тип исключения) | события `error` с исключением этого типа |
| `ExceptionMessageFilter` | `aiogram.filters.exception.ExceptionMessageFilter` (также `aiogram.filters`) | `pattern` (строка или скомпилированное регулярное выражение) | события `error`, у которых текст исключения подходит под шаблон; строка работает как подстрока |
| `CallbackData.filter()` | `aiogram.filters.callback_data.CallbackData` | метод класса `filter(rule=None)`, `rule` — магический фильтр | `callback_query`, данные которого распаковываются в этот класс; передаёт `callback_data`; подробности в [keyboards-callbacks.md](keyboards-callbacks.md) |
| `and_f`, `or_f`, `invert_f` | `aiogram.filters` | фильтры | логическое сочетание (раздел «Комбинирование») |
| `Filter` (псевдоним `BaseFilter`) | `aiogram.filters` | — | базовый класс своих фильтров |
| `F` (`MagicFilter`) | `aiogram` | — | выражение над атрибутами события |

Константы для `ChatMemberUpdatedFilter` лежат в `aiogram.filters`:

- статусы `CREATOR`, `ADMINISTRATOR`, `MEMBER`, `RESTRICTED`, `LEFT`, `KICKED` (префикс `+` или `-` задаёт `is_member`)
- группы `IS_MEMBER`, `IS_ADMIN`, `IS_NOT_MEMBER`
- переходы `JOIN_TRANSITION`, `LEAVE_TRANSITION`, `PROMOTED_TRANSITION`
- свой переход строится операторами `>>` и `<<`, инвертируется через `~`; объединение через `|` перед `>>` берётся в скобки

Словарь, который вернул фильтр, сливается в контекст данных и виден следующим фильтрам и обработчику.

## Магический фильтр F

`F` (`from aiogram import F`) записывает выражение из обращений к атрибутам и операций и применяет его к событию: `F.text` означает `event.text`. `F` импортируется из `aiogram`, потому что метод `as_` — дополнение aiogram к библиотеке `magic_filter`.

- `F.attr` — атрибут истинен и не `None` (`F.photo`).
- `==`, `!=` — сравнение на равенство. Сравнение по порядку записывается через `.func(...)`: `F.text.func(lambda text: len(text) > 100)`.
- `.in_(iterable)` (также оператор `@`), `.contains(x)`, `.startswith(x)`, `.endswith(x)` (последние два только для строковых атрибутов), `.regexp(pattern)`, `.func(callable)` (вызываемая функция получает значение на этом месте выражения), `.len()`, `.lower()`, `.upper()`.
- `~` инвертирует, `&` — «и», `|` — «или»; группировка скобками.
- `.as_(name)` сохраняет результат выражения под ключом `name` и передаёт его в параметр обработчика с тем же именем: `F.text.regexp(r"^(\d+)$").as_("digits")` даёт параметр `digits: Match[str]`.
- Фильтр без `.as_()` данных не передаёт. Используется как позиционный фильтр.

## Свои фильтры

- Фильтром может быть асинхронная или синхронная функция, `lambda`, любой объект с ожиданием, подкласс `Filter` или `MagicFilter`. Результат — `bool` или `dict`.
- Подкласс: `from aiogram.filters import Filter` (псевдоним `BaseFilter`), параметры хранятся в `__init__`, метод `async def __call__(self, ...) -> bool | dict[str, Any]`. Метод `Filter.update_handler_flags(flags)` можно переопределить, чтобы добавить флаги обработчика.
- Параметры фильтра подставляются по имени так же, как параметры обработчика: фильтру можно объявить `message` и `event_from_user`, и они придут.
- Возврат `dict` означает, что фильтр прошёл, а его ключи добавляются в данные для следующих фильтров и обработчика; параметр обработчика с таким же именем получает значение. Ложное значение — фильтр не прошёл.
- Подключение: экземпляр или функция — позиционный фильтр, `@router.message(MyFilter(...))`.

## Комбинирование

- Несколько позиционных фильтров на одном обработчике — «и»: проверяются по порядку до первого отказа.
- «Или»: несколько декораторов на одном обработчике либо `or_f(a, b)` из `aiogram.filters`.
- `and_f(a, b)`, `or_f(a, b)`, `invert_f(a)` вкладываются друг в друга: `and_f(A, or_f(B, C))`. Оператор `~` работает на выражениях `F` и на объектах-фильтрах (`~IsAdmin()`).
- Для сравнения текста надёжна форма `F.text == "hi"`.

## Command, CommandStart и CommandObject

`Command` принимает только текст или подпись сообщения (`message`, `edited_message`) и передаёт `command: CommandObject`.

- Значения: строки, скомпилированные регулярные выражения или объекты `BotCommand`; пробелов в команде нет; нужно хотя бы одно значение, иначе `ValueError`. `ignore_case=True` приводит к нижнему регистру только строковые команды; у регулярных выражений свои флаги.
- Разбор: текст делится один раз по пробелам; первый фрагмент — команда, остаток (дальше не делится) становится `args`, а если остатка нет — `None`. Префикс — первый символ фрагмента, он должен входить в строку `prefix` (`"/!"` принимает `/` или `!`).
- Упоминание: `/cmd@bot` даёт команду `cmd` и упоминание `bot`. По умолчанию команда, адресованная другому боту, отклоняется; `ignore_mention=True` её принимает. Упоминание с именем бота (без учёта регистра) принимается.
- Регулярное выражение сопоставляется с именем команды, совпадение сохраняется в `regexp_match`.
- `magic` — магический фильтр, который выполняется над `CommandObject` последним; результат попадает в `magic_result` (если это словарь, он сливается в данные).
- `CommandStart` фиксирует команду `start` и префикс `/`. `deep_link=True` требует данные после команды, `False` запрещает, `None` не проверяет. `deep_link_encoded=True` декодирует данные из Base64 в `args`; ошибка декодирования отклоняет фильтр. С 3.32.0 `deep_link_encoded=True` не бросает `binascii.Error`. В 3.27.0 значение `deep_link` по умолчанию стало `None`: раньше `deep_link=False` принимал любое сообщение, теперь `False` отклоняет сообщения с аргументами.
- `CommandObject` (`aiogram.filters.CommandObject`): поля `prefix` (по умолчанию `"/"`), `command` (по умолчанию `""`, без префикса и упоминания), `mention` (`str | None`), `args` (`str | None`), `regexp_match` (`Match[str] | None`), `magic_result`; свойства `mentioned` (bool) и `text` (собирает текст из объекта, пробелы могут отличаться от исходных).

## Примеры

### Пример 1: Команда с аргументом

**Вход:** `/echo привет` отвечает «привет».

**Результат:**

```python
@router.message(Command("echo"))
async def cmd_echo(message: Message, command: CommandObject) -> None:
    if command.args is None:
        await message.answer(text="Usage: /echo text")
        return
    await message.answer(text=command.args)
```

### Пример 2: Свой фильтр, возвращающий данные

**Вход:** обработчик должен получить имя пользователя из фильтра.

**Результат:**

```python
class HasName(Filter):
    async def __call__(self, message: Message) -> bool | dict[str, str]:
        if message.from_user is None:
            return False
        return {"name": message.from_user.full_name}


@router.message(HasName())
async def greet(message: Message, name: str) -> None:
    await message.answer(text=f"Hello, {name}!")
```

### Пример 3: Выбор числа из текста через `as_`

**Вход:** сообщение из одних цифр должно прийти в обработчик как совпадение регулярного выражения.

**Результат:**

```python
@router.message(F.text.regexp(r"^(\d+)$").as_("digits"))
async def number(message: Message, digits: Match[str]) -> None:
    await message.answer(text=digits.group(1))
```
