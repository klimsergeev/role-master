---
name: skill-prompt-engineering
description: >
  Процедуры и справочные значения для текста промптов к текущим текстовым моделям двух семейств: Claude (Fable 5.1, Opus 5.5, Sonnet 5.5, Haiku 5.5) и Gemini (Gemini 4 Carbon, Gemini 4 Argon, Gemini 3.8 Flash, 3.6 Flash, 3.5 Flash-Lite, 3.1 Flash-Lite). Написать системный промпт или системную инструкцию приложения и агента; тексты Claude Code (CLAUDE.md, правила, субагенты, SKILL.md) и Gemini CLI (GEMINI.md, system.md, навыки, субагенты); задание субагенту; описания функций и полей схем; проверить и улучшить промпт; перенести промпт на другую версию модели внутри семейства; аудит на устаревшие приёмы; для Gemini — параметры запроса, связанные с текстом; для Claude — отладка промпта на тестах. Официальные блоки вендоров дословно, с условием применения.
when_to_use: >
  Когда пишут, правят, переносят или проверяют текст для модели Claude или Gemini. Примеры: «напиши системный промпт для агента», «улучши этот промпт», «почему модель игнорирует инструкцию», «перенеси промпт с Opus 5 на Opus 5.5», «системная инструкция для Gemini 3.8 Flash», «перенеси промпт с Gemini 2.5 на Gemini 3.8 Flash», «напиши GEMINI.md», «Gemini игнорирует системную инструкцию», «проверь скиллы на устаревшие приёмы», «составь задание субагенту», «как проверить промпт на тестах», prompt engineering, system prompt, system instruction, CLAUDE.md, thinking_level. Не для промптов к генераторам изображений (включая Nano Banana) и к моделям других семейств, не для переноса промпта между Claude и Gemini.
version: 3.0.0
created: 2026-11-09
---

# Prompt Engineering

## Назначение

Скилл задаёт процедуры и официальные значения для текста промптов к текущим моделям Claude и Gemini: написание, проверка, перенос между версиями внутри семейства, аудит на устаревшие приёмы, для Claude — отладка на тестах. Применяется к системным промптам и системным инструкциям приложений и агентов, к текстам агентных сред Claude Code и Gemini CLI и к заданиям, которые агент передаёт субагенту.

## Принципы

1. Охват — текст промпта для текущих моделей двух семейств; перечень моделей — в `models.md` папки семейства (`claude/` или `gemini/`). Параметры запроса для Claude (effort, режимы мышления, принудительный вызов инструментов, temperature, заданное начало ответа) в скилл не входят. Для Gemini параметры, связанные с текстом, — в [gemini/parameters.md](gemini/parameters.md); остальные не входят.
2. Текст промпта включает значения `description` и имена функций, их параметров и полей схем структурированного вывода.
3. Скилл работает с моделью, названной в запросе, и не выбирает ни модель, ни семейство.
4. Утверждения о моделях и блоки — официальные значения вендора семейства. Факты, блоки и приёмы одного семейства в промпт для другого не переносятся; перенос промпта между семействами скилл не выполняет. Приём, измеренный на одной модели, на другой перепроверяется.
5. Официальные блоки вендора вставляются дословно, на английском; меняются только плейсхолдеры, а у блока, помеченного в строке «Когда» как шаблон для доработки, — ещё части, на которые указывает эта строка.
6. Где источники расходятся, приводятся все позиции; скилл между ними не выбирает.
7. Неустановленное значение называется неустановленным. Дата сверки значений — в каждом файле папки семейства.

## Таблица маршрутизации

> Читай файлы под задачу, а не скилл целиком. Колонка «Обязательно» — открыть до начала работы. Колонка «Читать, если» — открыть, когда условие выполнено; условие проверяется по задаче, а не по желанию. Файлы с пометкой `(справочник)` устроены как таблицы для точечного поиска — в них допустим поиск нужной строки вместо чтения целиком.

| Задача | Обязательно | Читать, если |
|---|---|---|
| Написать новый промпт для Claude | [write-prompt.md](write-prompt.md), [claude/principles.md](claude/principles.md), [claude/models.md](claude/models.md) (справочник), [claude/official-blocks.md](claude/official-blocks.md) (справочник), [claude/legacy-patterns.md](claude/legacy-patterns.md) (справочник) | если текст — CLAUDE.md, правило `.claude/rules/`, определение субагента или SKILL.md: [claude/claude-code-artifacts.md](claude/claude-code-artifacts.md) |
| Написать задание субагенту Claude Code | [claude/delegation-task.md](claude/delegation-task.md), [claude/principles.md](claude/principles.md), [claude/official-blocks.md](claude/official-blocks.md) (справочник) | если субагент задан файлом определения в `.claude/agents/`: [claude/claude-code-artifacts.md](claude/claude-code-artifacts.md); если задание поручает проверить свою или чужую работу: [claude/models.md](claude/models.md) (справочник) |
| Проверить или улучшить промпт для Claude | [review-prompt.md](review-prompt.md), [claude/principles.md](claude/principles.md), [claude/models.md](claude/models.md) (справочник), [claude/official-blocks.md](claude/official-blocks.md) (справочник), [claude/legacy-patterns.md](claude/legacy-patterns.md) (справочник) | если текст — CLAUDE.md, правило `.claude/rules/`, определение субагента или SKILL.md: [claude/claude-code-artifacts.md](claude/claude-code-artifacts.md); если текст — задание субагенту: [claude/delegation-task.md](claude/delegation-task.md) |
| Перенести промпт на другую версию Claude | [migrate-prompt.md](migrate-prompt.md), [claude/migrations.md](claude/migrations.md), [claude/models.md](claude/models.md) (справочник), [claude/legacy-patterns.md](claude/legacy-patterns.md) (справочник), [claude/official-blocks.md](claude/official-blocks.md) (справочник), [claude/principles.md](claude/principles.md) | если переносимый текст — CLAUDE.md, правило `.claude/rules/`, определение субагента или SKILL.md: [claude/claude-code-artifacts.md](claude/claude-code-artifacts.md) |
| Аудит промптов и скиллов для Claude на устаревшие приёмы | [audit-legacy.md](audit-legacy.md), [claude/legacy-patterns.md](claude/legacy-patterns.md) (справочник), [claude/official-blocks.md](claude/official-blocks.md) (справочник), [claude/principles.md](claude/principles.md) | если в охвате есть CLAUDE.md, правила `.claude/rules/`, определения субагентов или SKILL.md: [claude/claude-code-artifacts.md](claude/claude-code-artifacts.md) |
| Отладка промпта для Claude на тестах | [claude/prompt-debugging.md](claude/prompt-debugging.md) | если проверяется срабатывание скилла Claude Code или делегирование субагенту: [claude/claude-code-artifacts.md](claude/claude-code-artifacts.md) |
| Написать новый промпт для Gemini | [write-prompt.md](write-prompt.md), [gemini/principles.md](gemini/principles.md), [gemini/models.md](gemini/models.md) (справочник), [gemini/official-blocks.md](gemini/official-blocks.md) (справочник), [gemini/legacy-patterns.md](gemini/legacy-patterns.md) (справочник) | если текст передаётся через Gemini API или Google Cloud: [gemini/parameters.md](gemini/parameters.md) (справочник); если у модели есть функции, встроенные инструменты или структурированный вывод либо текст задаёт агента: [gemini/agents-and-tools.md](gemini/agents-and-tools.md); если текст — `GEMINI.md`, `system.md`, SKILL.md навыка, определение субагента или файл контекста расширения Gemini CLI: [gemini/gemini-cli-artifacts.md](gemini/gemini-cli-artifacts.md) |
| Написать задание субагенту Gemini CLI | [gemini/delegation-task.md](gemini/delegation-task.md), [gemini/principles.md](gemini/principles.md), [gemini/official-blocks.md](gemini/official-blocks.md) (справочник) | если субагент задан файлом определения в `.gemini/agents/`: [gemini/gemini-cli-artifacts.md](gemini/gemini-cli-artifacts.md); если задание поручает проверить работу или ставит долгую автономную задачу: [gemini/agents-and-tools.md](gemini/agents-and-tools.md); если названа модель субагента: [gemini/models.md](gemini/models.md) (справочник) |
| Проверить или улучшить промпт для Gemini | [review-prompt.md](review-prompt.md), [gemini/principles.md](gemini/principles.md), [gemini/models.md](gemini/models.md) (справочник), [gemini/official-blocks.md](gemini/official-blocks.md) (справочник), [gemini/legacy-patterns.md](gemini/legacy-patterns.md) (справочник) | если текст передаётся через Gemini API или Google Cloud: [gemini/parameters.md](gemini/parameters.md) (справочник); если у модели есть функции, встроенные инструменты или структурированный вывод либо текст задаёт агента: [gemini/agents-and-tools.md](gemini/agents-and-tools.md); если текст — `GEMINI.md`, `system.md`, SKILL.md навыка, определение субагента или файл контекста расширения Gemini CLI: [gemini/gemini-cli-artifacts.md](gemini/gemini-cli-artifacts.md); если текст — задание субагенту Gemini CLI: [gemini/delegation-task.md](gemini/delegation-task.md) |
| Перенести промпт на другую версию Gemini | [migrate-prompt.md](migrate-prompt.md), [gemini/migrations.md](gemini/migrations.md), [gemini/models.md](gemini/models.md) (справочник), [gemini/legacy-patterns.md](gemini/legacy-patterns.md) (справочник), [gemini/official-blocks.md](gemini/official-blocks.md) (справочник), [gemini/principles.md](gemini/principles.md) | если текст передаётся через Gemini API или Google Cloud: [gemini/parameters.md](gemini/parameters.md) (справочник); если у модели есть функции, встроенные инструменты или структурированный вывод либо текст задаёт агента: [gemini/agents-and-tools.md](gemini/agents-and-tools.md); если переносимый текст — артефакт Gemini CLI: [gemini/gemini-cli-artifacts.md](gemini/gemini-cli-artifacts.md) |
| Аудит промптов и навыков для Gemini на устаревшие приёмы | [audit-legacy.md](audit-legacy.md), [gemini/legacy-patterns.md](gemini/legacy-patterns.md) (справочник), [gemini/official-blocks.md](gemini/official-blocks.md) (справочник), [gemini/principles.md](gemini/principles.md) | если в охвате есть `GEMINI.md`, `system.md`, навыки или определения субагентов Gemini CLI: [gemini/gemini-cli-artifacts.md](gemini/gemini-cli-artifacts.md); если в охвате есть `AGENTS.md` управляемых агентов, описания функций или схемы структурированного вывода: [gemini/agents-and-tools.md](gemini/agents-and-tools.md); если в охвате есть код запросов к Gemini API или Google Cloud: [gemini/parameters.md](gemini/parameters.md) (справочник) |

## Рабочий процесс

### Шаг 1: Определить семейство и модель

- ЕСЛИ модель не названа и не выводится из материалов заказчика → запросить; строку таблицы до ответа не выбирать.
- ЕСЛИ модель другого вендора → скилл её не покрывает, сообщить.
- ЕСЛИ модель генерации изображений, включая Nano Banana → это задача скилла skill-prompt-tti, сообщить.
- ЕСЛИ модель из покрываемого семейства, но её нет в `models.md` семейства → писать по правилам ближайшей покрываемой версии: покрываемой модели той же линии (у Claude — Fable, Opus, Sonnet, Haiku; у Gemini — Flash, Flash-Lite, Gemini 4) с ближайшим номером версии. В результат — предупреждение, что правила взяты у названной покрываемой модели и для целевой не проверены. ЕСЛИ покрываемой модели той же линии нет или ближайших две (Gemini 4 Carbon и Gemini 4 Argon) → назвать покрываемые модели семейства и спросить, по правилам какой писать.
- ЕСЛИ в задаче несколько текстов для разных моделей → каждый текст по семейству той модели, которая его читает.
- ЕСЛИ просят перенести промпт с модели одного семейства на модель другого → перенос между семействами скилл не выполняет, сообщить.
- ЕСЛИ просят отладку на тестах для Gemini → методика скилла только для Claude, сообщить; официальные приёмы отладки Gemini — раздел «Отладка промпта» в [gemini/principles.md](gemini/principles.md), работа идёт по строке «Проверить или улучшить промпт для Gemini».

### Шаг 2: Определить задачу

Найти строку таблицы маршрутизации по задаче и семейству. ЕСЛИ запрос включает несколько задач (проверить и затем сравнить на тестах) → выполнить строки по очереди.

### Шаг 3: Открыть файлы

Открыть файлы колонки «Обязательно» и проверить условия колонки «Читать, если»; для каждого выполненного условия открыть указанный файл.

### Шаг 4: Выполнить процедуру

Пройти шаги файла процедуры по порядку.

### Шаг 5: Сверить блоки

ЕСЛИ в результат вставлены официальные блоки → сверить каждый с `official-blocks.md` папки семейства ([claude/official-blocks.md](claude/official-blocks.md) или [gemini/official-blocks.md](gemini/official-blocks.md)) посимвольно, кроме заменённых плейсхолдеров и частей, доработанных по строке «Когда».

### Шаг 6: Результат

Результат — артефакт процедуры: текст промпта, таблица находок с исправленной версией, перечень изменений при переносе, отчёт аудита или результаты прогона тестов; плюс предупреждение шага 1, если правила взяты у ближайшей покрываемой версии.

Для моделей Claude отладка на тестах — отдельная процедура скилла ([claude/prompt-debugging.md](claude/prompt-debugging.md)): ею подтверждается, что написанный, исправленный или перенесённый промпт достигает критериев успеха.

## Что НЕ делать

- Не пересказывать официальный блок своими словами и не выдавать пересказ за официальный текст.
- Не добавлять официальный блок, если условие из его строки «Когда» не выполнено.
- Не переносить блоки, приёмы и значения между семействами: блок Anthropic в системную инструкцию Gemini, шаблон Google с `MUST` в промпт Claude, правило об отказе `reasoning_extraction` на Gemini.
- Не называть модели, значения и параметры Gemini по памяти вместо файлов скилла.
- Не применять к моделям Claude техники, написанные для Claude 3, там, где они расходятся с правилами скилла, а также заданное начало ответа и рассуждение в тегах `<thinking>`: для текущих моделей Claude они не поддерживаются или рискованны.
- Не задавать рамку вызова инструмента делегирования — какого субагента вызвать и какие поля вызова заполнить: скилл о тексте задания.

## Примеры

### Пример 1: Типовой сценарий для Claude

**Запрос:** «Напиши системный промпт для бота поддержки на Haiku 5.5, у бота есть веб-поиск».

**Маршрут:** строка «Написать новый промпт для Claude»: [write-prompt.md](write-prompt.md), [claude/principles.md](claude/principles.md), [claude/models.md](claude/models.md), [claude/official-blocks.md](claude/official-blocks.md), [claude/legacy-patterns.md](claude/legacy-patterns.md); условие колонки «Читать, если» не выполнено — текст не артефакт Claude Code.

**Результат:** системный промпт с ролью в одно предложение, целью, инструкциями и блоками «Дата и поиск» и «Правила системного промпта на весь разговор»; перечень вставленных блоков с местом вставки.

### Пример 2: Перенос скилла со старыми приёмами

**Запрос:** «Перенеси наш SKILL.md, писавшийся под Opus 4.6, на Fable 5.1. В нём „CRITICAL: ALWAYS…“ и просьба объяснять рассуждение в тегах `<thinking>`».

**Маршрут:** строка «Перенести промпт на другую версию Claude»: [migrate-prompt.md](migrate-prompt.md), [claude/migrations.md](claude/migrations.md), [claude/models.md](claude/models.md), [claude/legacy-patterns.md](claude/legacy-patterns.md), [claude/official-blocks.md](claude/official-blocks.md), [claude/principles.md](claude/principles.md); плюс [claude/claude-code-artifacts.md](claude/claude-code-artifacts.md), потому что переносимый текст — SKILL.md.

**Результат:** новый SKILL.md без капса и без просьбы выписать рассуждение (риск отказа `reasoning_extraction` на Fable 5.1), с проверкой длины `description` и `when_to_use`; перечень удалённого, заменённого и добавленного с основаниями.

### Пример 3: Две задачи в одном запросе

**Запрос:** «Агент-ревьюер на Sonnet 5.5 находит меньше багов, чем раньше. Проверь промпт и сравни старую и новую версию на тестах».

**Маршрут:** сначала строка «Проверить или улучшить промпт для Claude»: [review-prompt.md](review-prompt.md), [claude/principles.md](claude/principles.md), [claude/models.md](claude/models.md), [claude/official-blocks.md](claude/official-blocks.md), [claude/legacy-patterns.md](claude/legacy-patterns.md); затем строка «Отладка промпта для Claude на тестах»: [claude/prompt-debugging.md](claude/prompt-debugging.md). Условия колонки «Читать, если» не выполнены.

**Результат:** таблица находок (фильтрующие формулировки «only report high-severity issues» заменены блоком «Ревью кода без фильтрации»), исправленный промпт и таблица результатов двух версий на одном наборе задач.

### Пример 4: Типовой сценарий для Gemini

**Запрос:** «Системная инструкция для бота поддержки на Gemini 3.8 Flash через Interactions API; у бота поиск Google и функции заказа и возврата».

**Маршрут:** строка «Написать новый промпт для Gemini»: [write-prompt.md](write-prompt.md), [gemini/principles.md](gemini/principles.md), [gemini/models.md](gemini/models.md), [gemini/official-blocks.md](gemini/official-blocks.md), [gemini/legacy-patterns.md](gemini/legacy-patterns.md); плюс [gemini/parameters.md](gemini/parameters.md), потому что текст идёт через Gemini API, и [gemini/agents-and-tools.md](gemini/agents-and-tools.md), потому что у модели есть функции и встроенный инструмент.

**Результат:** системная инструкция с персоной, ограничениями и форматом в начале, без даты и места, противоречащих поиску; описания функций и их параметров как часть текста; без опоры на температуру и предзаполнение; перечень параметров, на которые опирается текст (уровень рассуждения; расхождение о том, переносится ли системная инструкция между взаимодействиями); блоков из [claude/official-blocks.md](claude/official-blocks.md) нет.

### Пример 5: Модель изображений Gemini

**Запрос:** «Напиши промпт для Nano Banana: фото товара на белом фоне».

**Маршрут:** шаг 1 рабочего процесса — модель генерации изображений.

**Результат:** скилл сообщает, что промпты к генераторам изображений, включая Nano Banana, — задача скилла skill-prompt-tti, и промпт не пишет.
