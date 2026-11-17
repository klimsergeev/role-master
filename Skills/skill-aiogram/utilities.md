# Deep links, индикатор действия и локализация

## Назначение

Встроенные утилиты aiogram: создание и разбор deep links, индикатор действия в чате на время долгой операции и встроенная локализация `aiogram.utils.i18n`. Разбор `/start` с данными — в [filters.md](filters.md), `ChatActionMiddleware` — в [middlewares.md](middlewares.md).

## Deep links

Всё лежит в `aiogram.utils.deep_linking`.

- Создание: `await create_start_link(bot, payload, encode=False, encoder=None)` даёт `https://t.me/ИМЯ_БОТА?start=PAYLOAD`. `create_startgroup_link` принимает те же параметры и создаёт вариант для групп; `create_startapp_link(bot, payload, encode=False, app_name=None, encoder=None)` — для Mini Apps. Это корутины: они запрашивают у бота его имя пользователя.
- `encode=True` кодирует данные как base64url (`'foo'` превращается в `Zm9v`); `encoder` — своя функция «байты в байты».
- Разбор: `decode_payload(payload, decoder=None)`. В обработчике: зарегистрировать `CommandStart(deep_link=True)`, взять `command.args` из `CommandObject` и передать в `decode_payload`. Альтернатива — `CommandStart(deep_link=True, deep_link_encoded=True)`, который сам декодирует Base64 в `args` ([filters.md](filters.md)).
- Пределы: без кодирования допустимы только буквы, цифры, `_` и `-`, иначе `ValueError`; длина до 64 символов для ссылок start и startgroup и до 512 для startapp, иначе `ValueError`. Проверка идёт по закодированному результату.

## ChatActionSender

- Применение — асинхронный контекстный менеджер вокруг медленной работы: `async with ChatActionSender.typing(bot=bot, chat_id=message.chat.id): ...`. Пока блок выполняется, фоновая задача повторно отправляет действие.
- Параметры: `bot`, `chat_id`, `message_thread_id`, `action` (по умолчанию `typing`), `interval` (по умолчанию 5.0 секунд), `initial_sleep` (по умолчанию 0.0), `business_connection_id`.
- Пресеты: `typing`, `choose_sticker`, `find_location`, `record_video`, `record_video_note`, `record_voice`, `upload_document`, `upload_photo`, `upload_video`, `upload_video_note`, `upload_voice`.
- Альтернатива — зарегистрировать `ChatActionMiddleware` на наблюдателе `message`: обработчики, выполняющиеся дольше `initial_sleep`, тогда показывают `typing` автоматически; для отдельного обработчика флаг `flags.chat_action` меняет только действие либо задаёт `initial_sleep`, `action` и `interval` ([middlewares.md](middlewares.md)).

## Встроенная локализация

Требуется Babel: `pip install aiogram[i18n]` или `pip install Babel`.

- Объект: `i18n = I18n(path="locales", default_locale="en", domain="messages")`, параметры только именованные.
- Middleware выбора локали (все принимают `i18n` первым аргументом):
  - `SimpleI18nMiddleware(i18n, ...)` — локаль по коду языка пользователя; если кода нет или он не входит в доступные локали, берётся локаль по умолчанию
  - `ConstI18nMiddleware(locale, i18n, ...)` — одна фиксированная локаль
  - `FSMI18nMiddleware(i18n, key="locale", ...)` — локаль хранится в данных FSM; `set_locale(state, locale)` меняет её; запасной вариант — код языка пользователя
  - `I18nMiddleware` — абстрактная база; подкласс реализует `async get_locale(event, data) -> str`
- Подключение: `middleware.setup(router)` добавляет middleware как внешний на каждый наблюдатель роутера, кроме `update` (параметр `exclude` перечисляет другие имена событий, которые нужно пропустить). Middleware кладёт объект `I18n` в данные обработчика под ключом `i18n`. Для `FSMI18nMiddleware` нужен включённый FSM ([fsm.md](fsm.md)): локаль лежит в данных состояния.
- Строки: `from aiogram.utils.i18n import gettext as _`, затем `_("text")`; форма множественного числа — `_("one", "many", n)`. f-строки перевести нельзя: значения подставляют после перевода через `.format()`.
- Ленивые строки: `lazy_gettext` (псевдоним `__`) для мест, где язык ещё неизвестен, например в фильтрах: `F.text == __("My menu entry")`. Ленивые строки нельзя передавать значениями в методы API и объекты Telegram вроде `InlineKeyboardButton`.
- У `I18n` множественное число поддерживает `gettext(singular, plural, n, locale)`.
- Файлы переводов: извлечь строки `pybabel extract -k _:1,1t -k _:1,2 -k __ --input-dirs=. -o locales/messages.pot`, создать язык `pybabel init -i locales/messages.pot -d locales -D messages -l en`, отредактировать файл `.po`, скомпилировать `pybabel compile -d locales -D messages`. После изменений в коде: снова извлечь строки, выполнить `pybabel update -d locales -D messages -i locales/messages.pot`, отредактировать, скомпилировать снова.

## Примеры

### Пример 1: Ссылка с закодированными данными и разбор

**Вход:** реферальная ссылка с данными, которые бот читает по `/start`.

**Результат:**

```python
link = await create_start_link(bot, "ref42", encode=True)


@router.message(CommandStart(deep_link=True))
async def start_with_payload(message: Message, command: CommandObject) -> None:
    payload = decode_payload(command.args)
    await message.answer(text=f"Referral: {payload}")
```

### Пример 2: Индикатор «печатает» на время долгой операции

**Вход:** ответ готовится долго.

**Результат:**

```python
@router.message(Command("report"))
async def cmd_report(message: Message, bot: Bot) -> None:
    async with ChatActionSender.typing(bot=bot, chat_id=message.chat.id):
        text = await build_report()
    await message.answer(text=text)
```
