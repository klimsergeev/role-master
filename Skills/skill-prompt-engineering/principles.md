# Общие техники текста промпта

## Назначение

Официальные техники написания текста промпта, общие для текущих моделей Claude, с источниками и расхождениями между официальными материалами. Особенности конкретных моделей — в [models.md](models.md), готовые тексты — в [official-blocks.md](official-blocks.md).

Источники (сокращения ниже):

- Best practices — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
- Overview — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview
- Context engineering — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Блог 2025 — https://claude.com/blog/best-practices-for-prompt-engineering (переадресует на claude.com/resources/articles/best-practices-for-prompt-engineering, дата публикации 10 ноября 2025)
- Claude Code best practices — https://code.claude.com/docs/en/best-practices
- Claude Code memory — https://code.claude.com/docs/en/memory
- Claude Code skills — https://code.claude.com/docs/en/skills

Значения сверены 2026-11-09.

## 1. Что нужно до промпта

Overview: «This guide assumes that you have: 1. A clear definition of the success criteria for your use case 2. Some ways to empirically test against those criteria 3. A first draft prompt you want to improve» (руководство предполагает: чёткие критерии успеха, способы эмпирически проверить их, черновик промпта). Без критериев и проверки улучшение промпта не измерить — процедура в [prompt-debugging.md](prompt-debugging.md).

Overview: не каждая проблема решается промптом; задержку и стоимость иногда проще улучшить выбором другой модели.

## 2. Ясность и прямота

- Best practices: «Think of Claude as a brilliant but new employee who lacks context on your norms and workflows» (представь Claude блестящим, но новым сотрудником без знания ваших норм и процессов).
- Ключевой тест, Best practices: «Show your prompt to a colleague with minimal context on the task and ask them to follow it. If they'd be confused, Claude will be too» (покажи промпт коллеге с минимальным контекстом; если он запутается, запутается и Claude).
- Конкретно указывать формат результата и ограничения.
- Нумерованные или маркированные шаги — когда важны порядок или полнота шагов (Best practices).
- Нужно больше, чем строго требует задача, — просить явно, а не надеяться, что модель выведет это из расплывчатого промпта (Best practices). Claude Code best practices: фраза «be ambitious» говорит модели об объёме, которого она не видит.
- Нужное действие — повелительной формой: Best practices — «Can you suggest some changes to improve this function?» даёт предложения, «Change this function to improve its performance.» даёт правки.

## 3. Причина инструкции

Best practices: «Providing context or motivation behind your instructions, such as explaining to Claude why such behavior is important, can give Claude more information about your goals» (контекст и мотивация инструкции дают Claude больше сведений о целях). Пример: вместо «NEVER use ellipses» — «Your response will be read aloud by a text-to-speech engine, so never use ellipses since the text-to-speech engine will not know how to pronounce them.» Там же: «Claude can generalize from the explanation» (Claude обобщает по объяснению).

Гайд Fable 5 (https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5): модель работает лучше, когда промпт называет намерение за запросом; шаблон — блок «Цель запроса» в [official-blocks.md](official-blocks.md).

Расхождение официальных источников:

- Best practices — объяснять, почему поведение важно (цитата выше).
- Claude Code skills, раздел Types of skill content: «State what to do rather than narrating how or why, and apply the same conciseness test you would for CLAUDE.md content» (пиши, что делать, а не рассказывай, как и почему; применяй тот же тест краткости, что для CLAUDE.md). Относится к телу скилла, которое остаётся в контексте на все ходы.

## 4. Примеры

- Best practices: примеры — один из самых надёжных способов задать формат, тон и структуру; «Include 3–5 examples for best results» (для лучшего результата — 3–5 примеров).
- Примеры: релевантные (близки к реальному случаю), разнообразные (покрывают граничные случаи и не дают модели подхватить непреднамеренный шаблон), оформленные в `<example>`, несколько — в `<examples>` (Best practices).
- Context engineering: «teams will often stuff a laundry list of edge cases into a prompt… We do not recommend this. Instead, we recommend working to curate a set of diverse, canonical examples» (команды набивают промпт перечнем граничных случаев; не рекомендуем; подберите разнообразные канонические примеры).
- Примеры работают и с мышлением: каждый пример подавать как задачу, метод и ожидаемый ответ (Best practices).
- Гайды Opus 5 и Sonnet 5: положительные примеры нужного стиля обычно действеннее запретов.

## 5. Структура промпта

- Best practices: «XML tags help Claude parse complex prompts unambiguously, especially when your prompt mixes instructions, context, examples, and variable inputs» (XML-теги помогают однозначно разбирать сложные промпты, особенно когда в промпте смешаны инструкции, контекст, примеры и переменные входы). Согласованные описательные имена тегов; вложенность для иерархии (документы в `<documents>`, каждый в `<document index="n">`).
- Claude Code memory (про CLAUDE.md): «group related instructions under markdown headers and bullets. Organized sections are easier for Claude to follow than dense paragraphs» (группируй связанные инструкции под заголовками и в списках; организованные разделы легче соблюдать, чем плотные абзацы).

Расхождение официальных источников о роли XML-тегов:

- Best practices — теги помогают однозначно разбирать сложные промпты (цитата выше).
- Context engineering: «We recommend organizing prompts into distinct sections… using techniques like XML tagging or Markdown headers… although the exact formatting of prompts is likely becoming less important as models become more capable» (рекомендуем разделы с XML-тегами или заголовками Markdown, хотя точный формат промпта, вероятно, становится менее важным по мере роста моделей).
- Блог 2025: «XML tags were once a recommended way to add structure and clarity to prompts… While modern models are better at understanding structure without XML tags, they can still be useful in specific situations» (XML-теги когда-то были рекомендованы; современные модели лучше понимают структуру без них, но в отдельных ситуациях теги полезны). Среди таких ситуаций блог называет «You're working with older model versions» (работа со старыми версиями моделей).

## 6. Роль

- Best practices: «Setting a role in the system prompt focuses Claude's behavior and tone for your use case. Even a single sentence makes a difference» (роль в системном промпте фокусирует поведение и тон; даже одно предложение имеет значение).
- Блог 2025: «modern models are sophisticated enough that heavy-handed role prompting is often unnecessary» (тяжёлая ролевая настройка часто не нужна).

Обе позиции официальные; они расходятся в объёме роли, а не в её месте: роль — в системном промпте.

## 7. Длинные документы

- Best practices (входы от 20 тысяч токенов): «Place your long documents and inputs near the top of your prompt, above your query, instructions, and examples» (длинные документы — в начало, над запросом, инструкциями и примерами). Заметка там же: «Queries at the end can improve response quality by up to 30 percent in tests, especially with complex, multidocument inputs» (запрос в конце улучшал качество до 30 процентов в тестах, особенно на сложных многодокументных входах).
- Каждый документ — в `<document>` с подтегами `<document_content>` и `<source>` (Best practices).
- Для длинных документов — сначала попросить процитировать релевантные части, потом выполнить задачу (Best practices). Пример — блок «Длинные документы и цитаты» в [official-blocks.md](official-blocks.md).

## 8. Формат ответа

Best practices, раздел Control the format of responses:

- Говорить, что делать, а не чего не делать: вместо «Do not use markdown in your response» — «Your response should be composed of smoothly flowing prose paragraphs.»
- Индикаторы формата в XML-тегах.
- Стиль промпта влияет на стиль ответа: «removing markdown from your prompt can reduce the volume of markdown in the output» (убрав markdown из промпта, можно уменьшить markdown в ответе).
- Для точного контроля — подробная инструкция о форматировании (блок «Против избытка markdown», с оговоркой для Fable 5.1).

## 9. Рассуждение

- Best practices: «Prefer general instructions over prescriptive steps. A prompt such as "think thoroughly" often produces better reasoning than a hand-written step-by-step plan» (предпочитай общие инструкции расписанным шагам; «think thoroughly» часто даёт лучшее рассуждение, чем написанный вручную пошаговый план).
- Best practices: на Fable 5.1, Fable 5, Opus 5.5, Opus 5 и Sonnet 5.5 полагаться на встроенное мышление; «a prompt that asks the model to write out its reasoning, for example in `<thinking>` tags, may be declined» (промпт, требующий выписать рассуждение, например в тегах `<thinking>`, может быть отклонён). Гайды моделей: вместо этого — короткое объяснение ответа или сводка действий.
- Claude Code best practices: «Phrases like `think step by step` or `be thorough` are ordinary prompt text rather than keywords» (это обычный текст, а не ключевые слова); главный рычаг глубины мышления — уровень effort, параметр вне этого скилла.

## 10. Буквальность и охват

- Гайд Sonnet 5: «Claude Sonnet 5 interprets prompts literally and explicitly, particularly at lower effort levels. It does not silently generalize an instruction from one item to another» (понимает промпт буквально, не переносит инструкцию с одного элемента на другие сама). Охват задаётся явно: «Apply this formatting to every section, not just the first one».
- Гайды Opus 5 и Sonnet 5: фильтрующие формулировки в ревью («only report high-severity issues», «be conservative») исполняются буквально, находок становится меньше.

## 11. Выделение и капс

- Claude Code best practices, таблица What you can stop doing: «Older models sometimes needed the emphasis. Current ones follow a plainly worded line, and piling on emphasis mostly makes Claude over-apply the rule» (старым моделям иногда нужно было выделение; нынешние следуют простой строке, а нагромождение выделений в основном заставляет применять правило слишком широко). Правило без исключений — в хук или правило запрета; строка, теряющаяся в длинном файле, — повод сократить файл.
- Best practices: Opus 4.5 и Opus 4.6 чувствительнее к системному промпту; там, где писали «CRITICAL: You MUST use this tool when...», писать «Use this tool when...».

Расхождение официальных источников: официальные блоки сами содержат выделение — «you MUST read the file» в `investigate_before_answering`, «DO NOT use ordered lists» и «NEVER output» в `avoid_excessive_markdown_and_bullet_points`, «NEVER use generic AI-generated aesthetics» в короткой `frontend_aesthetics`. Блоки вставляются дословно; совет не нагромождать выделение относится к собственному тексту.

## 12. Объём и плотность

- Context engineering: «good context engineering means finding the smallest possible set of high-signal tokens that maximize the likelihood of some desired outcome» (найти наименьший набор высокосигнальных токенов, максимизирующий вероятность нужного исхода).
- Там же: «you should be striving for the minimal set of information that fully outlines your expected behavior. (Note that minimal does not necessarily mean short…)» (минимальный набор сведений, полностью описывающий ожидаемое поведение; минимальный не значит короткий).
- Там же — «правильная высота»: между жёстко зашитой хрупкой логикой «если-то» и расплывчатыми общими указаниями, которые ложно предполагают общий контекст; достаточно конкретно, чтобы направлять, и достаточно гибко, чтобы дать модели сильные эвристики.
- Там же: начинать с минимального промпта, затем добавлять ясные инструкции и примеры по сбоям, найденным на тестах.
- Гайд Fable 5: следование инструкциям улучшилось настолько, что большинство поведений задаётся короткой инструкцией, без перечисления каждого по имени.

## 13. Инструменты в тексте промпта

- Гайд Sonnet 5: если модель не пользуется инструментом поиска — ясно описать, почему и как им пользоваться.
- Best practices (Opus 4.6): вместо общих умолчаний «Default to using [tool]» — «Use [tool] when it would enhance your understanding of the problem»; фразы «If in doubt, use [tool]» вызывают избыточное срабатывание.
- Context engineering: «If a human engineer can't definitively say which tool should be used in a given situation, an AI agent can't be expected to do better» (если инженер не может однозначно сказать, какой инструмент нужен, агент не сделает лучше).

## 14. Противоречия внутри промпта

Claude Code memory (про CLAUDE.md и правила): «if two instructions contradict each other, Claude may pick one arbitrarily» (из двух противоречащих инструкций Claude может выбрать любую).

## 15. Источники, которые расходятся с текущими страницами

- Overview: туториал на GitHub «was written for Claude 3 models, so follow Prompting best practices where the two differ» (написан для моделей Claude 3; при расхождении следуй Prompting best practices).
- Блог 2025 содержит приёмы, которые best practices называет неподдерживаемыми или рискованными для текущих моделей: начало ответа ассистента, заданное заранее, и рассуждение в тегах `<thinking>`. Перечень — в [legacy-patterns.md](legacy-patterns.md).
