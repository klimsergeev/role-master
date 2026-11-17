# Форматирование текста сообщений

## Назначение

Модуль `aiogram.utils.formatting`, отправка форматированного текста и помощники экранирования текста пользователя для режимов HTML и MarkdownV2. Режим разметки для всего бота задаётся через `DefaultBotProperties` ([bot-client.md](bot-client.md)).

## Модуль aiogram.utils.formatting

Сообщение строится из элементов (сущностей), а не из разметки HTML или Markdown, поэтому не нужно ни балансировать теги, ни экранировать ввод пользователя.

- Базовый элемент: `Text` — вкладывает другие элементы и строки.
- Элементы стиля: `Bold`, `Italic`, `Underline`, `Strikethrough`, `Spoiler`, `Code`, `Pre` (необязательный `language`).
- Ссылка: `TextLink` (принимает `url`).
- Элементы-сущности: `HashTag`, `CashTag`, `BotCommand`, `Url`, `Email`, `PhoneNumber`, `BankCardNumber`, `TonAddress`.
- Части сообщения объединяются вложением в `Text(...)` или помощниками из таблицы ниже, а не оператором `+`.

Функции-помощники:

| Функция | Что делает |
|---|---|
| `as_line` | соединяет элементы в одну строку и заканчивает её переводом строки |
| `as_list` | каждый элемент на своей строке |
| `as_marked_list`, `as_numbered_list` | список с маркерами или с номерами |
| `as_section`, `as_marked_section`, `as_numbered_section` | заголовок и тело, при желании списком |
| `as_key_value` | жирный ключ и значение |

Отправка: `content = Text("Hello, ", Bold(message.from_user.full_name), "!")`, затем `await message.answer(**content.as_kwargs())`. `as_kwargs()` возвращает текст и сущности как именованные аргументы вызова API.

Варианты:

- `as_caption_kwargs` — подписи
- `as_poll_question_kwargs`, `as_poll_explanation_kwargs`, `as_gift_text_kwargs`
- `as_html()` и `as_markdown()` — строки в соответствующей разметке
- `render()` — простой текст и список сущностей

## Экранирование для HTML и MarkdownV2

- `html_decoration.quote(text)` (`from aiogram.utils.text_decorations import html_decoration`) экранирует только `&`, `<`, `>`; кавычки не меняются. Короткая форма — `html.quote(...)` из `from aiogram import html`.
- `markdown_decoration.quote(text)` ставит обратную косую черту перед каждым из символов ``_ * [ ] ( ) ~ ` > # + - = | { } . ! \``.
- Функции форматирования из `aiogram.utils.markdown` экранируют свой текстовый аргумент: для HTML — `hbold`, `hitalic`, `hcode`, `hpre`, `hunderline`, `hstrikethrough`, `hlink`, `hblockquote`; для MarkdownV2 — `bold`, `italic`, `code`, `pre`, `underline`, `strikethrough`, `link`, `blockquote`.
- `link` и `hlink` экранируют заголовок, а адрес до 3.32.0 не экранировали; с 3.32.0 текстовые помощники (`link()`, `hlink()`, `TextLink`) экранируют адреса сами, поэтому передают сырые адреса, а не заранее экранированные.
- `text` склеивает строки без экранирования.
- Элементы `aiogram.utils.formatting` экранирования не требуют вообще.

## Примеры

### Пример: Приветствие с выделенным именем

**Вход:** имя пользователя нужно выделить жирным без ручного экранирования.

**Результат:**

```python
@router.message(CommandStart())
async def cmd_start(message: Message) -> None:
    content = Text("Hello, ", Bold(message.from_user.full_name), "!")
    await message.answer(**content.as_kwargs())
```
