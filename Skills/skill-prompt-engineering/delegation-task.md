# Задание субагенту

## Назначение

Техника текста задания, которое агент передаёт субагенту: что в нём должно быть, чтобы субагент без истории разговора сделал нужную работу.

Граница с другим скиллом: рамку вызова Agent tool в проекте Role creator — путь к файлу роли, рабочую директорию, правило о кавычках в путях, обязательные разделы промпта и pre-flight checklist — задаёт скилл skill-agent-orchestration, файл prompt-format.md. Этот файл о содержании текста внутри этой рамки.

Источники (сокращения ниже):

- SDK subagents — https://code.claude.com/docs/en/agent-sdk/subagents
- Sub-agents — https://code.claude.com/docs/en/sub-agents
- Multi-agent research — https://www.anthropic.com/engineering/multi-agent-research-system (переадресует на anthropic.com/research/multi-agent-research-system)
- CC best practices — https://code.claude.com/docs/en/best-practices

Сверено 2026-11-09.

## Что субагент знает

- SDK subagents: «The only content you pass from parent to subagent is the Agent tool's prompt string, so include any file paths, error messages, or decisions the subagent needs directly in that prompt» (единственное, что родитель передаёт субагенту, — строка prompt инструмента Agent; пути к файлам, тексты ошибок и решения вписываются прямо в неё).
- Sub-agents: субагент начинает с чистого контекста и не видит истории разговора, уже вызванных скиллов и прочитанных файлов; CLAUDE.md проекта у него есть (кроме Explore, Plan и субагентов с `omitClaudeMd`). Правило, которое обязано до него дойти, повторяется в задании.
- Значит, задание читает тот самый «коллега с минимальным контекстом» из ключевого теста best practices ([principles.md](principles.md), раздел 2).

## Что должно быть в задании

Multi-agent research: «Each subagent needs an objective, an output format, guidance on the tools and sources to use, and clear task boundaries. Without detailed task descriptions, agents duplicate work, leave gaps, or fail to find necessary information» (каждому субагенту нужны цель, формат результата, указания по инструментам и источникам и чёткие границы задачи; без подробного описания агенты дублируют работу, оставляют пробелы или не находят нужного). Там же — пример: короткие указания вроде «research the semiconductor shortage» субагенты понимали неверно или повторяли поиски друг друга.

| Часть задания | Что в ней | Основание |
|---|---|---|
| Цель | Что сделать и зачем, для кого результат | Multi-agent research; гайд Fable 5 — намерение за запросом (блок «Цель запроса» в [official-blocks.md](official-blocks.md)) |
| Вводные | Пути к файлам, тексты ошибок, принятые решения, установленные факты | SDK subagents |
| Инструменты и источники | Чем пользоваться и где искать | Multi-agent research |
| Границы | Что не входит в задачу и чего не делать | Multi-agent research |
| Формат результата | Что вернуть и в каком виде | Multi-agent research |

## Как писать текст задания

- Повелительной формой, с явным охватом: модели понимают инструкции буквально ([principles.md](principles.md), разделы 2 и 10).
- Не просить выписать рассуждение в ответ; просить короткое объяснение или сводку действий ([principles.md](principles.md), раздел 9).
- Для задания проверяющему — формулировать, что сверять и что пропускать. Пример CC best practices: «use a subagent to review the rate limiter diff against SPEC.md, check every requirement is implemented and the listed edge cases have tests, report gaps that affect correctness and skip style». Там же: «Don't drop the `skip style` part of that prompt. A reviewer that's asked to find problems will always find *something*» (не убирай «skip style»: проверяющий, которому велели искать проблемы, всегда что-нибудь найдёт).
- Использовать ли субагента для проверки собственной работы — официальные источники расходятся ([models.md](models.md), раздел о расхождениях, пункт «Самопроверка»).

## Проверка задания перед отправкой

- [ ] Субагент выполнит задание, не зная ничего, кроме его текста и CLAUDE.md проекта.
- [ ] Есть цель, вводные, инструменты и источники, границы, формат результата.
- [ ] Пути, ошибки и решения вписаны в текст, а не упомянуты как «см. выше».
- [ ] Правила, которые субагент обязан соблюдать и которых нет в CLAUDE.md, повторены.
- [ ] Нет просьбы выписать рассуждение.

## Пример

**Плохо:**

```text
Look into why the auth tests fail and fix it.
```

**Лучше:**

```text
Goal: find why the auth tests fail after the session-timeout change and fix the cause. The fix ships in today's release, so keep it to the auth module.

Inputs:
- Failing tests: tests/auth/test_refresh.py::test_expired_session, tests/auth/test_refresh.py::test_refresh_rotation
- Error output: "AssertionError: expected 401, got 200" in both.
- Decision already made: refresh tokens rotate on every use; don't change that.

Tools and sources: read src/auth/ and tests/auth/; run the tests with `pytest tests/auth -q`.

Boundaries: change only files under src/auth/; don't edit the tests.

Result: the root cause in two or three sentences, the diff, and the test command output after the fix.
```

Пример иллюстративный: пути и ошибки условные.
