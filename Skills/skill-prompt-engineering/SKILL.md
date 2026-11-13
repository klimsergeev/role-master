---
name: skill-prompt-engineering
description: >
  Процедуры и справочные значения для текста промптов к текущим моделям четырёх семейств: Claude (Fable 5.1, Opus 5.5, Sonnet 5.5, Haiku 5.5), Gemini (Gemini 4 Carbon и Argon, 3.8 Flash, 3.6 Flash, 3.5 и 3.1 Flash-Lite), GPT (GPT-6 Astra, 6.1 Sol, 6.1 Terra, 6 Luna, 6 Sol, GPT-5.3-Codex) и Grok (Grok 4.7, 4.6, 4.5, 4.3, 4.20). Системный промпт или developer-сообщение; тексты Claude Code, Gemini CLI, Codex и Grok Build (CLAUDE.md, GEMINI.md, AGENTS.md, правила, скиллы, субагенты); инструкции ChatGPT; задание субагенту; описания функций и полей схем; проверить и улучшить промпт; перенести на другую версию внутри семейства; аудит на устаревшие приёмы; для Gemini, GPT и Grok — параметры запроса, связанные с текстом; для Claude — отладка на тестах. Официальные блоки вендоров дословно, с условием применения.
when_to_use: >
  Когда пишут, правят, переносят или проверяют текст для модели Claude, Gemini, GPT или Grok. Примеры: «напиши системный промпт для агента», «улучши этот промпт», «почему модель игнорирует инструкцию», «перенеси промпт с Opus 5 на Opus 5.5», «системная инструкция для Gemini 3.8 Flash», «developer-сообщение для GPT-6.1 Sol», «напиши AGENTS.md для Codex», «системный промпт для Grok 4.7», «перенеси промпт с grok-4-fast на Grok 4.3», «проверь скиллы на устаревшие приёмы», prompt engineering, system prompt, thinking_level, reasoning.effort. Не для промптов к генераторам изображений (Nano Banana, GPT Image) и к моделям других семейств, не для переноса промпта между семействами.
version: 3.2.0
created: 2026-11-09
---

# Prompt Engineering

## Назначение

Скилл задаёт процедуры и официальные значения для текста промптов к текущим моделям Claude, Gemini, GPT и Grok: написание, проверка, перенос между версиями внутри семейства, аудит на устаревшие приёмы, для Claude — отладка на тестах. Применяется к системным промптам, системным инструкциям и developer-сообщениям приложений и агентов, к текстам агентных сред Claude Code, Gemini CLI, Codex и Grok Build, к инструкциям ChatGPT и к заданиям, которые агент передаёт субагенту.

## Принципы

1. Охват — текст промпта для текущих моделей четырёх семейств; перечень моделей — в `models.md` папки семейства (`claude/`, `gemini/`, `gpt/` или `grok/`). Параметры запроса для Claude (effort, режимы мышления, принудительный вызов инструментов, temperature, заданное начало ответа) в скилл не входят. Для Gemini, GPT и Grok параметры, связанные с текстом, — в [gemini/parameters.md](gemini/parameters.md), [gpt/parameters.md](gpt/parameters.md) и [grok/parameters.md](grok/parameters.md); остальные не входят.
2. Текст промпта включает значения `description` и имена функций, их параметров и полей схем структурированного вывода.
3. Скилл работает с моделью, названной в запросе, и не выбирает ни модель, ни семейство.
4. Утверждения о моделях и блоки — официальные значения вендора семейства. Факты, блоки и приёмы одного семейства в промпт для другого не переносятся; перенос промпта между семействами скилл не описывает. Приём, измеренный на одной модели, на другой перепроверяется.
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
| Написать новый промпт для GPT | [write-prompt.md](write-prompt.md), [gpt/principles.md](gpt/principles.md), [gpt/models.md](gpt/models.md) (справочник), [gpt/official-blocks.md](gpt/official-blocks.md) (справочник), [gpt/legacy-patterns.md](gpt/legacy-patterns.md) (справочник) | если текст передаётся через API OpenAI: [gpt/parameters.md](gpt/parameters.md) (справочник); если у модели есть функции, скиллы или структурированный вывод либо текст задаёт агента: [gpt/agents-and-tools.md](gpt/agents-and-tools.md); если текст — `AGENTS.md`, SKILL.md скилла или определение субагента Codex: [gpt/codex-artifacts.md](gpt/codex-artifacts.md) |
| Написать задание субагенту Codex | [gpt/delegation-task.md](gpt/delegation-task.md), [gpt/principles.md](gpt/principles.md), [gpt/official-blocks.md](gpt/official-blocks.md) (справочник) | если субагент задан файлом определения Codex: [gpt/codex-artifacts.md](gpt/codex-artifacts.md); если задание ставит долгую автономную задачу или поручает проверить работу: [gpt/agents-and-tools.md](gpt/agents-and-tools.md); если названа модель субагента: [gpt/models.md](gpt/models.md) (справочник) |
| Проверить или улучшить промпт для GPT | [review-prompt.md](review-prompt.md), [gpt/principles.md](gpt/principles.md), [gpt/models.md](gpt/models.md) (справочник), [gpt/official-blocks.md](gpt/official-blocks.md) (справочник), [gpt/legacy-patterns.md](gpt/legacy-patterns.md) (справочник) | если текст передаётся через API OpenAI: [gpt/parameters.md](gpt/parameters.md) (справочник); если у модели есть функции, скиллы или структурированный вывод либо текст задаёт агента: [gpt/agents-and-tools.md](gpt/agents-and-tools.md); если текст — `AGENTS.md`, SKILL.md скилла или определение субагента Codex: [gpt/codex-artifacts.md](gpt/codex-artifacts.md); если текст — задание субагенту Codex: [gpt/delegation-task.md](gpt/delegation-task.md) |
| Перенести промпт на другую версию GPT | [migrate-prompt.md](migrate-prompt.md), [gpt/migrations.md](gpt/migrations.md), [gpt/models.md](gpt/models.md) (справочник), [gpt/legacy-patterns.md](gpt/legacy-patterns.md) (справочник), [gpt/official-blocks.md](gpt/official-blocks.md) (справочник), [gpt/principles.md](gpt/principles.md) | если текст передаётся через API OpenAI: [gpt/parameters.md](gpt/parameters.md) (справочник); если у модели есть функции, скиллы или структурированный вывод либо текст задаёт агента: [gpt/agents-and-tools.md](gpt/agents-and-tools.md); если переносимый текст — артефакт Codex: [gpt/codex-artifacts.md](gpt/codex-artifacts.md) |
| Аудит промптов и скиллов для GPT на устаревшие приёмы | [audit-legacy.md](audit-legacy.md), [gpt/legacy-patterns.md](gpt/legacy-patterns.md) (справочник), [gpt/official-blocks.md](gpt/official-blocks.md) (справочник), [gpt/principles.md](gpt/principles.md) | если в охвате есть `AGENTS.md`, скиллы или определения субагентов Codex: [gpt/codex-artifacts.md](gpt/codex-artifacts.md); если в охвате есть описания функций, описания скиллов или схемы структурированного вывода: [gpt/agents-and-tools.md](gpt/agents-and-tools.md); если в охвате есть код запросов к API OpenAI: [gpt/parameters.md](gpt/parameters.md) (справочник) |
| Написать новый промпт для Grok | [write-prompt.md](write-prompt.md), [grok/principles.md](grok/principles.md), [grok/models.md](grok/models.md) (справочник), [grok/official-blocks.md](grok/official-blocks.md) (справочник), [grok/legacy-patterns.md](grok/legacy-patterns.md) (справочник) | если текст передаётся через API xAI: [grok/parameters.md](grok/parameters.md) (справочник); если у модели есть функции, серверные инструменты или структурированный вывод либо текст задаёт агента: [grok/agents-and-tools.md](grok/agents-and-tools.md); если текст — `AGENTS.md` или правило `.grok/rules/` для Grok Build, текст флага `--rules` или `--system-prompt-override`, определение субагента или персоны Grok Build, SKILL.md скилла Grok Build: [grok/grok-build-artifacts.md](grok/grok-build-artifacts.md) |
| Написать задание субагенту Grok Build | [grok/delegation-task.md](grok/delegation-task.md), [grok/principles.md](grok/principles.md), [grok/official-blocks.md](grok/official-blocks.md) (справочник) | если субагент или персона заданы файлом определения Grok Build: [grok/grok-build-artifacts.md](grok/grok-build-artifacts.md); если субагент работает с веб-страницами или результатами инструментов: [grok/agents-and-tools.md](grok/agents-and-tools.md); если названа модель субагента: [grok/models.md](grok/models.md) (справочник) |
| Проверить или улучшить промпт для Grok | [review-prompt.md](review-prompt.md), [grok/principles.md](grok/principles.md), [grok/models.md](grok/models.md) (справочник), [grok/official-blocks.md](grok/official-blocks.md) (справочник), [grok/legacy-patterns.md](grok/legacy-patterns.md) (справочник) | если текст передаётся через API xAI: [grok/parameters.md](grok/parameters.md) (справочник); если у модели есть функции, серверные инструменты или структурированный вывод либо текст задаёт агента: [grok/agents-and-tools.md](grok/agents-and-tools.md); если текст — `AGENTS.md` или правило `.grok/rules/` для Grok Build, текст флага `--rules` или `--system-prompt-override`, определение субагента или персоны Grok Build, SKILL.md скилла Grok Build: [grok/grok-build-artifacts.md](grok/grok-build-artifacts.md); если текст — задание субагенту Grok Build: [grok/delegation-task.md](grok/delegation-task.md) |
| Перенести промпт на другую версию Grok | [migrate-prompt.md](migrate-prompt.md), [grok/migrations.md](grok/migrations.md), [grok/models.md](grok/models.md) (справочник), [grok/legacy-patterns.md](grok/legacy-patterns.md) (справочник), [grok/official-blocks.md](grok/official-blocks.md) (справочник), [grok/principles.md](grok/principles.md) | если текст передаётся через API xAI: [grok/parameters.md](grok/parameters.md) (справочник); если у модели есть функции, серверные инструменты или структурированный вывод либо текст задаёт агента: [grok/agents-and-tools.md](grok/agents-and-tools.md); если переносимый текст — артефакт Grok Build: [grok/grok-build-artifacts.md](grok/grok-build-artifacts.md) |
| Аудит промптов и правил для Grok на устаревшие приёмы | [audit-legacy.md](audit-legacy.md), [grok/legacy-patterns.md](grok/legacy-patterns.md) (справочник), [grok/official-blocks.md](grok/official-blocks.md) (справочник), [grok/principles.md](grok/principles.md) | если в охвате есть `AGENTS.md`, правила `.grok/rules/`, скиллы или определения субагентов и персон Grok Build: [grok/grok-build-artifacts.md](grok/grok-build-artifacts.md); если в охвате есть описания функций или схемы структурированного вывода: [grok/agents-and-tools.md](grok/agents-and-tools.md); если в охвате есть код запросов к API xAI: [grok/parameters.md](grok/parameters.md) (справочник) |

## Рабочий процесс

### Шаг 1: Определить семейство и модель

- ЕСЛИ модель не названа и не выводится из материалов заказчика → запросить; строку таблицы до ответа не выбирать.
- ЕСЛИ модель из покрываемого семейства, но её нет в `models.md` семейства → писать по правилам ближайшей покрываемой версии: покрываемой модели той же линии (у Claude — Fable, Opus, Sonnet, Haiku; у Gemini — Flash, Flash-Lite, Gemini 4; у GPT — Astra, Sol, Terra, Luna, Codex; у Grok — одна линия с порядком версий 4.20, 4.3, 4.5, 4.6, 4.7: Grok 4.20 вышла раньше Grok 4.3 и стоит перед ней, а не после Grok 4.7) с ближайшим номером версии. В результат — предупреждение, что правила взяты у названной покрываемой модели и для целевой не проверены. ЕСЛИ покрываемой модели той же линии нет или ближайших две (Gemini 4 Carbon и Gemini 4 Argon) → назвать покрываемые модели семейства и спросить, по правилам какой писать.
- ЕСЛИ в задаче несколько текстов для разных моделей → каждый текст по семейству той модели, которая его читает.
- ЕСЛИ просят отладку на тестах для Gemini, GPT или Grok → методика отладки на тестах в скилле описана только для Claude; официальные приёмы отладки — раздел «Отладка промпта» в [gemini/principles.md](gemini/principles.md), [gpt/principles.md](gpt/principles.md) или [grok/principles.md](grok/principles.md), работа идёт по строке «Проверить или улучшить промпт» этого семейства; для GPT прогон оценок до и после правки — шаг раздела «Порядок переноса» в [gpt/migrations.md](gpt/migrations.md).

### Шаг 2: Определить задачу

Найти строку таблицы маршрутизации по задаче и семейству. ЕСЛИ запрос включает несколько задач (проверить и затем сравнить на тестах) → выполнить строки по очереди.

### Шаг 3: Открыть файлы

Открыть файлы колонки «Обязательно» и проверить условия колонки «Читать, если»; для каждого выполненного условия открыть указанный файл.

### Шаг 4: Выполнить процедуру

Пройти шаги файла процедуры по порядку.

### Шаг 5: Сверить блоки

ЕСЛИ в результат вставлены официальные блоки → сверить каждый с `official-blocks.md` папки семейства ([claude/official-blocks.md](claude/official-blocks.md), [gemini/official-blocks.md](gemini/official-blocks.md), [gpt/official-blocks.md](gpt/official-blocks.md) или [grok/official-blocks.md](grok/official-blocks.md)) посимвольно, кроме заменённых плейсхолдеров и частей, доработанных по строке «Когда».

### Шаг 6: Результат

Результат — артефакт процедуры: текст промпта, таблица находок с исправленной версией, перечень изменений при переносе, отчёт аудита или результаты прогона тестов; плюс предупреждение шага 1, если правила взяты у ближайшей покрываемой версии.

Для моделей Claude отладка на тестах — отдельная процедура скилла ([claude/prompt-debugging.md](claude/prompt-debugging.md)): ею подтверждается, что написанный, исправленный или перенесённый промпт достигает критериев успеха.

## Что НЕ делать

- Не пересказывать официальный блок своими словами и не выдавать пересказ за официальный текст.
- Не добавлять официальный блок, если условие из его строки «Когда» не выполнено.
- Не переносить блоки, приёмы и значения между семействами: блок Anthropic в системную инструкцию Gemini, шаблон Google с `MUST` в промпт Claude, правило об отказе `reasoning_extraction` на Gemini, блок OpenAI о прозе вместо списков в промпт Claude или Gemini, официальный блок Claude или Gemini в developer-сообщение GPT, значения сэмплирования xAI (`temperature` 0.7, `top_p` 0.95) в запрос к модели другого семейства, блок OpenAI или Anthropic в системный промпт Grok.
- Не называть модели, значения и параметры Gemini, GPT и Grok по памяти вместо файлов скилла.
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

### Пример 5: Типовой сценарий для GPT

**Запрос:** «Developer-сообщение для агента поддержки на GPT-6.1 Sol через Responses API; у агента функции поиска заказа и оформления возврата, возврат — только с подтверждением клиента».

**Маршрут:** строка «Написать новый промпт для GPT»: [write-prompt.md](write-prompt.md), [gpt/principles.md](gpt/principles.md), [gpt/models.md](gpt/models.md), [gpt/official-blocks.md](gpt/official-blocks.md), [gpt/legacy-patterns.md](gpt/legacy-patterns.md); плюс [gpt/parameters.md](gpt/parameters.md), потому что текст идёт через API OpenAI, и [gpt/agents-and-tools.md](gpt/agents-and-tools.md), потому что у модели есть функции.

**Результат:** developer-сообщение с назначением, целью, критериями успеха, границами решений (оформить возврат — только после подтверждения клиента) и правилами остановки; описания функций с назначением, побочными эффектами и поведением при ошибке; блоки «Политика автономии» и «Условия остановки» по их условиям; перечень параметров, на которые опирается текст (`instructions` передаётся в каждом запросе, уровень `none` у GPT-6.1 Sol не поддерживается, схема ответа — структурированным выводом); блоков из [claude/official-blocks.md](claude/official-blocks.md) и [gemini/official-blocks.md](gemini/official-blocks.md) нет.

### Пример 6: Перенос со снимаемой модели

**Запрос:** «Перенеси системный промпт нашего классификатора обращений с GPT-4o на GPT-6 Luna».

**Маршрут:** строка «Перенести промпт на другую версию GPT»: [migrate-prompt.md](migrate-prompt.md), [gpt/migrations.md](gpt/migrations.md), [gpt/models.md](gpt/models.md), [gpt/legacy-patterns.md](gpt/legacy-patterns.md), [gpt/official-blocks.md](gpt/official-blocks.md), [gpt/principles.md](gpt/principles.md); плюс [gpt/parameters.md](gpt/parameters.md), если промпт идёт через API OpenAI. Исходная модель вне охвата: в [gpt/migrations.md](gpt/migrations.md) её строка называет GPT-6 Luna официальной заменой, а советов о тексте для этой модели в скилле нет.

**Результат:** новый текст, собранный по разделу «Порядок переноса» и разделу GPT-6 Luna (схема ответа — структурированным выводом, параметры сэмплирования убраны, если уровень рассуждения выше `none`); перечень изменений с основаниями; эффект подтверждается оценками до и после правки.

### Пример 7: Типовой сценарий для Grok

**Запрос:** «Системный промпт для бота поддержки на Grok 4.7 через Responses API; у бота функции поиска заказа, оформления возврата и загрузки страниц справочного центра по адресу».

**Маршрут:** строка «Написать новый промпт для Grok»: [write-prompt.md](write-prompt.md), [grok/principles.md](grok/principles.md), [grok/models.md](grok/models.md), [grok/official-blocks.md](grok/official-blocks.md), [grok/legacy-patterns.md](grok/legacy-patterns.md); плюс [grok/parameters.md](grok/parameters.md), потому что текст идёт через API xAI, и [grok/agents-and-tools.md](grok/agents-and-tools.md), потому что у модели есть функции.

**Результат:** системный промпт, где задача, ограничения и формат ответа сказаны прямо, статичное стоит в начале, а дата — в начале последнего сообщения пользователя, не в системном промпте; описания функций как часть текста; защита от внедрения инструкций через загружаемые страницы — все четыре меры: блок «Ограда в системном промпте», доработанный под бота, блок «Ограда вокруг вывода инструмента» в результате функции загрузки страниц, ограничение инструментов по шагам, проверка аргументов возврата и подтверждение человеком перед оформлением возврата; пометка для заказчика, что меры измерены на Grok 4.7 при уровне `low`. Если боту добавят серверный веб-поиск — защита его выводов не установлена. Перечень параметров, на которые опирается текст (Responses API, возврат зашифрованного рассуждения на каждом ходе, `temperature` 0.7 и `top_p` 0.95 без изменений, уровень рассуждения задан явно); блоков других семейств нет.

### Пример 8: Перенос с выведенной модели Grok

**Запрос:** «Перенеси системный промпт нашего классификатора обращений с grok-4-fast-non-reasoning на Grok 4.3».

**Маршрут:** строка «Перенести промпт на другую версию Grok»: [migrate-prompt.md](migrate-prompt.md), [grok/migrations.md](grok/migrations.md), [grok/models.md](grok/models.md), [grok/legacy-patterns.md](grok/legacy-patterns.md), [grok/official-blocks.md](grok/official-blocks.md), [grok/principles.md](grok/principles.md); плюс [grok/parameters.md](grok/parameters.md), если промпт идёт через API xAI. Исходная модель вне охвата: в [grok/migrations.md](grok/migrations.md) её строка называет перенаправление нерассуждающих моделей на Grok 4.3 с уровнем `none`, а советов о тексте для исходной модели в скилле нет.

**Результат:** новый текст по разделу Grok 4.3; уровень `none` задан явно; устаревшее имя модели в тексте заменено; перечень изменений с основаниями.
