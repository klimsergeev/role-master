# Сцены

## Назначение

Сцены aiogram — изолированные этапы диалога поверх FSM: как объявить сцену, зарегистрировать её, войти в неё и выйти. Состояния и хранилище, на которых сцены работают, — в [fsm.md](fsm.md).

## Что такое сцена

- Сцена — изолированный этап разговора: пока пользователь находится в сцене, на его сообщения отвечают обработчики этой сцены.
- Версия появления: 3.2.
- Исключения сцен — `SceneException` (`aiogram.exceptions`, родитель `AiogramError`).
- Классы сцен импортируются из модуля `aiogram.fsm.scene`: `from aiogram.fsm.scene import After, Scene, SceneRegistry, ScenesManager, on`.

## Объявление

- Подкласс `Scene` с ключевым словом `state`: `class QuizScene(Scene, state="quiz")`.
- Методы помечаются декораторами: `@on.message.enter()` — вход, `@on.message(...)` — обработчик, пока пользователь в сцене, `@on.message.exit()` — выход; есть также `on.message.leave()` и `on.message.back()`.
- `on.message(..., after=After.exit())` выходит из сцены после обработчика; есть также `After.back()` и `After.goto(scene)`.
- Другие ключевые слова класса: `reset_data_on_enter`, `reset_history_on_enter`, `callback_query_without_state`.

## Регистрация

- `SceneRegistry(router)`, затем `registry.add(QuizScene)`; есть также `register`. Сцены монтируются на роутер, переданный реестру.
- `add` бросает ошибку, если сцена с таким `state` уже зарегистрирована.

## Вход и выход

- Вход из обычного обработчика: зарегистрировать `QuizScene.as_handler()` на нужное обновление, например с `Command("quiz")`. Обработчики получают аргумент `scenes: ScenesManager`, вход — `await scenes.enter(QuizScene)`; при входе активная сцена по умолчанию сначала завершается.
- Выход изнутри сцены: `await self.wizard.exit()`. Из обычного обработчика: `await scenes.close()`: завершает активную сцену и ничего не делает, если активной нет.
- Другие методы мастера сцены: `leave`, `back`, `retake`, `goto`.

## Примеры

### Пример: Сцена викторины

**Вход:** команда `/quiz` запускает сцену с вопросом; ответ завершает её.

**Результат:**

```python
from aiogram.fsm.scene import After, Scene, SceneRegistry, on


class QuizScene(Scene, state="quiz"):
    @on.message.enter()
    async def on_enter(self, message: Message) -> None:
        await message.answer(text="2 + 2 = ?")

    @on.message(F.text, after=After.exit())
    async def on_answer(self, message: Message) -> None:
        await message.answer(text="Accepted.")


registry = SceneRegistry(dp)
registry.add(QuizScene)
router.message.register(QuizScene.as_handler(), Command("quiz"))
```
