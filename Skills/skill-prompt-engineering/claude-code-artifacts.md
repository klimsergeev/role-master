# Тексты для Claude Code

## Назначение

Официальные правила и значения для текстов Claude Code: CLAUDE.md, правил `.claude/rules/`, определений субагентов и SKILL.md. Общие техники текста — в [principles.md](principles.md); задание, которое агент передаёт субагенту, — в [delegation-task.md](delegation-task.md).

Источники (сокращения ниже):

- Memory — https://code.claude.com/docs/en/memory
- CC best practices — https://code.claude.com/docs/en/best-practices
- Sub-agents — https://code.claude.com/docs/en/sub-agents
- Skills — https://code.claude.com/docs/en/skills
- Agent Skills — https://agentskills.io/skill-creation/optimizing-descriptions (открытый стандарт скиллов)

Значения сверены 2026-11-09; номера версий Claude Code и лимиты меняются — перед опорой на число в важном решении открой страницу.

## Общее для всех артефактов

- CC best practices: промпт, CLAUDE.md и скиллы — недетерминированные инструкции: модель читает и решает, следовать ли. Хуки, правила запрета и управляемые настройки — детерминированные: их исполняет харнесс. Правило, которое должно выполняться всегда, — в хук или правило запрета: «CLAUDE.md is for guidelines, and Claude is allowed to decide a guideline doesn't apply» (CLAUDE.md — для ориентиров, и Claude вправе решить, что ориентир не подходит).
- CC best practices: «Only write down what Claude can't find by reading the repo, or what it would otherwise spend time rediscovering every session» (записывай только то, чего Claude не найдёт в репозитории или будет заново выяснять каждую сессию). Тест перед записью: может ли модель найти это, читая код, и пойдёт ли искать; если оба ответа «да» — не записывать. Правило относится и к скиллам.
- CC best practices: строку, которую модель продолжает пропускать, выделение не спасает: либо файл слишком длинный, либо это правило без исключений и ему место в хуке.

## CLAUDE.md

| Правило или значение | Источник |
|---|---|
| Содержимое CLAUDE.md приходит пользовательским сообщением после системного промпта, а не частью системного промпта; строгого соблюдения нет, особенно у расплывчатых и противоречивых инструкций | Memory, раздел Claude isn't following my CLAUDE.md |
| Цель — меньше 200 строк на файл: «Longer files consume more context and reduce adherence» (длинные файлы занимают больше контекста и хуже соблюдаются) | Memory, раздел Write effective instructions |
| Инструкции конкретные настолько, чтобы их можно было проверить: «Run `npm test` before committing» вместо «Test your changes», «Use 2-space indentation» вместо «Format code properly» | Memory, раздел Write effective instructions |
| Связанные инструкции — под заголовками и в списках; организованные разделы соблюдаются легче плотных абзацев | Memory, раздел Write effective instructions |
| Из двух противоречащих инструкций Claude может выбрать любую; периодически убирать устаревшее и противоречащее | Memory, раздел Write effective instructions |
| Что держать: команды проверки работы (тесты, типы, линтер, запуск одного теста), места, где код вводит в заблуждение, решения, которых нет в репозитории, то, что приходилось поправлять дважды | CC best practices, раздел Keep CLAUDE.md short |
| Многошаговая процедура или правило для части кодовой базы — в скилл или правило с ограничением по путям | Memory, раздел When to add to CLAUDE.md |
| Описание архитектуры и структуры файлов не писать: «Claude reads the repo itself. Only write down what isn't in there» | CC best practices, таблица What you can stop doing |
| Импорты `@path` помогают организации, но не уменьшают стоимость контекста: импортированные файлы грузятся вместе с CLAUDE.md | Memory, раздел Write effective instructions |
| Блочные HTML-комментарии `<!-- ... -->` вырезаются перед попаданием в контекст; заметки для людей можно оставлять в них | Memory, раздел How CLAUDE.md files load |
| CLAUDE.md подкаталога и правила, загружаемые по требованию, сверх лимита на файл приходят только началом: 40 000 символов при окне 200K; при окне 1M — 200 000 у Opus 4.6 и Sonnet 4.6 и 150 000 у более поздних моделей | Memory, раздел Claude ignores the end of my subdirectory CLAUDE.md |
| Личные предпочтения — в `CLAUDE.local.md`, добавленный в `.gitignore` | CC best practices, раздел Keep CLAUDE.md short |
| Инструменты: `/init` создаёт стартовый вариант; `/doctor` предлагает сокращения; `/doctor prompt-audit` ищет инструкции для старых моделей, ссылки на несуществующие файлы и противоречия | CC best practices; Memory |

## Правила `.claude/rules/`

| Правило или значение | Источник |
|---|---|
| Один файл — одна тема, с описательным именем; все `.md` ищутся рекурсивно | Memory, раздел Set up rules |
| Правило без `paths` грузится при старте с тем же приоритетом, что `.claude/CLAUDE.md` | Memory, раздел Set up rules |
| Правило с `paths` грузится, когда Claude читает, пишет или правит подходящий файл | Memory, раздел Path-specific rules |
| `paths` — единственное поле фронтматтера, которое читает Claude Code; остальные молча игнорируются; фронтматтер вырезается перед загрузкой | Memory, раздел Rule frontmatter reference |
| Фронтматтер, который не разбирается как YAML, игнорируется, и правило грузится как без `paths` | Memory, раздел Rule frontmatter reference |
| Правила пользователя (`~/.claude/rules/`) грузятся раньше правил проекта; при конфликте Claude может последовать любому | Memory, раздел User-level rules |
| Задачам, которым не нужно быть в контексте постоянно, — скиллы, а не правила | Memory, раздел Organize rules with `.claude/rules/` |

## Определение субагента (`.claude/agents/*.md`)

| Правило или значение | Источник |
|---|---|
| Обязательны только `name` и `description`; `description` — «When Claude should delegate to this subagent» (когда Claude делегировать этому субагенту) | Sub-agents, раздел Frontmatter reference |
| Claude делегирует по описанию задачи, полю `description` и текущему контексту; для проактивного делегирования добавлять в `description` фразы вроде «use proactively» | Sub-agents, раздел Understand automatic delegation |
| Описания короткие: при суммарном объёме описаний субагентов больше 15 000 токенов Claude Code предупреждает при старте | Sub-agents, раздел Understand automatic delegation |
| «Write descriptions that single out one subagent» (описание выделяет одного субагента): достаточно конкретно, чтобы направить к нужному | Sub-agents, раздел Example subagents |
| Тело файла — системный промпт субагента; субагент получает его и сведения об окружении, но не системный промпт Claude Code | Sub-agents, раздел Write subagent files |
| В начальном контексте субагента: его системный промпт, сообщение-задание, файлы CLAUDE.md всех уровней (кроме Explore, Plan и субагентов с `omitClaudeMd`), снимок git status, предзагруженные скиллы. Истории разговора, уже вызванных скиллов и прочитанных файлов нет | Sub-agents, раздел What loads at startup |
| Правило, которое обязано дойти до субагента, повторить в задании при делегировании | Sub-agents, раздел What loads at startup |
| Поле `skills` внедряет полное содержимое скиллов при старте, не больше 32 различных имён; скилл с `disable-model-invocation: true` предзагрузить нельзя | Sub-agents, раздел Preload skills into subagents |
| Пример хорошей практики в документации: сфокусированный субагент с ограниченными инструментами и «a detailed prompt that specifies exactly what to look for and how to format output» (подробный промпт, точно говорящий, что искать и как оформить результат) | Sub-agents, раздел Example subagents |

Отдельной официальной инструкции по написанию тела субагента на странице нет; к телу применяются общие техники системного промпта из [principles.md](principles.md) и [write-prompt.md](write-prompt.md).

Документация не уточняет, внедряются ли при предзагрузке файлы рядом со SKILL.md. Замер проекта Role creator (CLAUDE.md проекта, 2026-08-20): внедряется только SKILL.md, файлы-процедуры субагент дочитывает сам.

## SKILL.md

| Правило или значение | Источник |
|---|---|
| Все поля фронтматтера необязательны; рекомендовано `description`, чтобы Claude знал, когда применять скилл; неизвестное поле молча игнорируется | Skills, раздел Frontmatter reference |
| `description` — что делает скилл и когда его применять; ключевой сценарий — первым: суммарный текст `description` и `when_to_use` в списке скиллов обрезается на 1 536 символах | Skills, раздел Frontmatter reference |
| `when_to_use` — дополнительные триггеры: фразы, примеры запросов; дописывается к `description` и входит в те же 1 536 символов | Skills, раздел Frontmatter reference |
| Угловые скобки в `description` и `when_to_use` показываются как `&lt;` и `&gt;`; для плейсхолдеров — квадратные скобки | Skills, раздел Troubleshooting |
| При сломанном YAML скилл грузится без полей: `/имя` работает, но по описанию скилл не находится | Skills, раздел Troubleshooting |
| Тело — коротко: после вызова содержимое остаётся в контексте на все ходы, каждая строка — постоянная плата; «State what to do rather than narrating how or why» (расхождение с best practices — [principles.md](principles.md), раздел 3) | Skills, раздел Types of skill content |
| SKILL.md — меньше 500 строк; подробные справочные материалы — в отдельные файлы | Skills, раздел Add supporting files |
| Дополнительные файлы перечисляются в SKILL.md с указанием, что в каждом и когда его читать; скрипты исполняются, а не грузятся в контекст | Skills, раздел Add supporting files |
| Claude Code не перечитывает файл скилла на следующих ходах: указания на всю задачу пишутся как постоянные («Run the tests after every edit», а не «Run the tests») | Skills, разделы Skill content lifecycle и Claude stops following a skill |
| После компакции от каждого вызванного скилла остаются первые 5 000 токенов, на все скиллы — 25 000; самое важное — в начало SKILL.md | Skills, разделы Skill content lifecycle и Claude stops following a skill |
| `context: fork` — только для скиллов с явной задачей: субагент не видит истории разговора, инструкции должны быть самодостаточными; набор правил без задачи вернёт пустой результат | Skills, раздел Run skills in a subagent |
| Скилл не срабатывает — проверить, есть ли в описании слова, которые скажет пользователь | Skills, раздел Troubleshooting |
| Скилл срабатывает слишком часто — сделать описание конкретнее или запретить автовызов | Skills, раздел Troubleshooting |
| Скилл, просящий модель выписать мышление или рассуждение, может получить отказ `reasoning_extraction` | Гайд Opus 5 (https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5), раздел Reasoning in the response; гайд Fable 5.1 |
| Скиллы, написанные для прежних моделей, часто слишком предписывающие и могут ухудшать результат | Гайд Fable 5 (https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5), раздел Recommended scaffolding changes |

Расхождение официальных источников о длине описания:

- Skills (Claude Code): `description` и `when_to_use` вместе обрезаются на 1 536 символах в списке скиллов; лимит настраивается параметром `skillListingMaxDescChars`.
- Agent Skills (открытый стандарт): «The specification enforces a hard limit of 1024 characters» (спецификация задаёт жёсткий лимит 1024 символа). Skills (Claude Code), раздел Using skill frontmatter outside Claude Code: при загрузке скилла на claude.ai, через Skills API и упаковке `package_skill.py` допустимы только поля спецификации: `name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`.

## Проверка срабатывания

Срабатывание скилла и делегирование субагенту проверяются на тестах — раздел «Скиллы и субагенты Claude Code» в [prompt-debugging.md](prompt-debugging.md).
