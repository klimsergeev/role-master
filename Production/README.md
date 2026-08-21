# 📚 Production — Библиотека ролей и скиллов для AI-агентов

> ⚠️ **READ-ONLY LIBRARY** — Эта папка содержит стабильные версии для внешнего использования.

---

## Для AI-агентов из других проектов

| Действие | Разрешено |
|----------|-----------|
| ✅ Читать файлы | Да |
| ❌ Изменять файлы | **Нет** |
| ❌ Создавать файлы | **Нет** |
| ❌ Удалять файлы | **Нет** |

### Как использовать

1. **Найди роль или скилл** в каталоге ниже
2. **Перейди по пути** к файлу `.md`
3. **Прочитай описание** и применяй инструкции

### Если нужны изменения

Изменения вносятся только через проект **Role Creator**:
- Роли: `/Roles` → `Production/Agents`
- Скиллы: `/Skills` → `Production/Skills`
- После изменений запускается скрипт публикации

---

## 📋 Каталог ролей (Agents/)


### 🎭 Мета-роли

| Роль | Файл | Описание |
|------|------|----------|
| **prompt-engineer-claude** | `Agents/meta/prompt-engineer-claude.md` | Инженер промптов для моделей Claude |
| **role-master** | `Agents/meta/role-master.md` | Мета-агент для создания и оптимизации ролей AI-агентов |
| **skill-master** | `Agents/meta/skill-master.md` | Мета-агент для создания скиллов Claude Code |

### 🤖 Помощники и ассистенты

| Роль | Файл | Описание |
|------|------|----------|
| **advisor** | `Agents/assistants/advisor.md` | Лаконичный ассистент для быстрых ответов |
| **company-researcher** | `Agents/assistants/company-researcher.md` | Исследователь компаний для HR, найма и оценки работодателей. Собирает профиль компании из открытых источников — описание, метрики, отзывы сотрудников и клиентов, технологический стек, руководство, новостной фон. Используй эту роль при любом запросе на исследование компании, анализ работодателя, сбор информации о компании для найма или due diligence. |
| **data-aggregator** | `Agents/assistants/data-aggregator.md` | Извлечение структурированных данных из веб-страниц в JSON |
| **message-writer** | `Agents/assistants/message-writer.md` | Ассистент по написанию сообщений в инфостиле |
| **project-logger** | `Agents/assistants/project-logger.md` | Секретарь проектной документации для портфолио |
| **research-analyst** | `Agents/assistants/research-analyst.md` | Аналитик-исследователь для глубокого анализа и исследований |
| **shopping-assistant** | `Agents/assistants/shopping-assistant.md` | Персональный консультант по подбору товаров — ресёрч, визуальный отбор, руководство для покупки |
| **travel-agent** | `Agents/assistants/travel-agent.md` | Персональный ИИ-турагент-советник — ведёт от выбора направления до дебрифа с обязательной верификацией фактов |

### 🔧 Специалисты

| Роль | Файл | Описание |
|------|------|----------|
| **dev-ops** | `Agents/specialists/dev-ops.md` | Системный администратор Linux |
| **frontend-developer** | `Agents/specialists/frontend-developer.md` | Опытный фронтенд-разработчик Vue/React/Quasar |
| **git-ops** | `Agents/specialists/git-ops.md` | Автономный эксперт по Git — аудит репозиториев, решение проблем, настройка воркфлоу |
| **product-analyst** | `Agents/specialists/product-analyst.md` | Продуктовый аналитик для анализа данных, метрик, воронок, когорт, A/B-тестов и обоснования продуктовых решений |
| **product-designer** | `Agents/specialists/product-designer.md` | UX/UI эксперт по проектированию интерфейсов |
| **product-manager** | `Agents/specialists/product-manager.md` | Продуктовый стратег — discovery, метрики, приоритизация и роадмап |
| **qa-engineer** | `Agents/specialists/qa-engineer.md` | Тестировщик веб-приложений на Python + Playwright |
| **seo-engineer** | `Agents/specialists/seo-engineer.md` | Универсальный SEO-аудитор для анализа любых сайтов |
| **telegram-developer** | `Agents/specialists/telegram-developer.md` | Python-разработчик Telegram-ботов на aiogram |
| **ux-heuristic** | `Agents/specialists/ux-heuristic.md` | Эксперт по эвристической оценке интерфейсов |
| **ux-researcher** | `Agents/specialists/ux-researcher.md` | UX-исследователь для анализа опыта пользователей и actionable-рекомендаций |
| **ux-writer** | `Agents/specialists/ux-writer.md` | Редактор интерфейсных текстов по редполитике |

### 🎨 Креативные роли

| Роль | Файл | Описание |
|------|------|----------|
| **prompt-engineer-tti** | `Agents/creative/prompt-engineer-tti.md` | Генератор промптов для text-to-image нейросетей |
| **song-writer** | `Agents/creative/song-writer.md` | Поэт-песенник и автор песенных текстов с экспертизой в русской прозодии — пишет с нуля и дорабатывает/критикует |

---

## 📚 Каталог скиллов (Skills/)

| Скилл | Файл | Описание |
|-------|------|----------|
| **skill-3d-artist** | `Skills/skill-3d-artist.skill` | Справочник Blender MCP для агентов — настройка подключения (official connector и community-сервер ahujasid), workflows моделирования через bpy API, промптинг 3D-сцен, troubleshooting, безопасность execute_blender_code, механика MCP-канала и env-переменные. Покрывает Claude Desktop, Cowork, Code. |
| **skill-ab-test-analysis** | `Skills/skill-ab-test-analysis.skill` | Процедура анализа результатов A/B-тестов и принятия ship/no-ship решений. Покрывает полный цикл: валидация эксперимента (SRM, длительность, мощность), расчёт primary metric (lift, CI, p-value), проверка guardrail-метрик, сегментный анализ (новые/старые, mobile/desktop, гео), финальная рекомендация (ship/no-ship/iterate). Включает статистический фреймворк (frequentist и bayesian подходы), матрицу принятия решений, типичные ошибки анализа (peeking, multiple comparisons, Simpson's paradox). |
| **skill-agent-orchestration** | `Skills/skill-agent-orchestration.skill` | Правила оркестрации субагентов в Claude Code — когда делегировать задачу агенту или скиллу, как формировать промпт для субагента, как сохранять контекст оркестратора чистым. Содержит pre-flight checklist, трёхслойную модель контекста, паттерны декомпозиции, алгоритм разрешения противоречий роль vs задание. |
| **skill-agent-teams** | `Skills/skill-agent-teams.skill` | Процедура запуска и управления Agent Teams в Claude Code — параллельная работа нескольких агентов-тиммейтов, каждый в своём контексте, с прямой peer-to-peer коммуникацией через SendMessage и общим task list. Покрывает включение фичи (env CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS), спавн тиммейтов на естественном языке через Agent tool (команда формируется автоматически, TeamCreate/TeamDelete больше не нужны), именование тиммейта по его роли (имя = subagent_type, двое одной роли -- с числовыми индексами), общий список задач (TaskCreate/TaskUpdate/TaskList), режимы отображения (in-process и split-panes), plan approval, тиммейты из subagent-определений, завершение через TaskStop и ограничения (один team на сессию, нет вложенных команд, /resume не восстанавливает). Команда поднимается ТОЛЬКО по явному указанию пользователя: указания нет — скилл не применяется. |
| **skill-anti-bias** | `Skills/skill-anti-bias.skill` | Процедура настройки защиты от галлюцинаций и обеспечения качества в проекте. Создаёт .claude/rules/anti-bias.md с правилами: блокирующие проверки фактов, запрет выдумывания данных, перепроверка расчётов, поиск граничных случаев, рассмотрение альтернатив, исследование перед вопросом, верификация агентов, обязательный чеклист «Что перепроверено». |
| **skill-chrome-mcp** | `Skills/skill-chrome-mcp.skill` | Справочник браузерной автоматизации через расширение Claude in Chrome и MCP-сервер claude-in-chrome: 22 инструмента с параметрами, значениями по умолчанию и форматами ответов; каталог молчаливых отказов, где инструмент отвечает «успешно», а результат неверен; четыре слоя разрешений; подключение через native messaging и диагностика обрыва связи; границы платформы — модальные диалоги, теневое дерево, кадры с других источников, служебные адреса; безопасность и prompt injection. |
| **skill-cohort-analysis** | `Skills/skill-cohort-analysis.skill` | Процедура когортного анализа продуктовых данных -- построение retention-таблиц, диагностика кривых удержания (healthy/declining/dying), поиск activation metric ("aha moment"), сравнение когорт по типам (acquisition, behavioral, segment). Включает формулы N-day и rolling retention, шаблон когортной таблицы, алгоритм activation analysis, формат продуктовых рекомендаций. Применяется продуктовыми аналитиками и product-менеджерами. |
| **skill-editorial-guidelines** | `Skills/skill-editorial-guidelines.skill` | Редполитика UX-текстов — свод правил написания текстов в интерфейсах. Тон, лексика, пунктуация, форматирование, ошибки. Не для перевода текстов, не для длинных статей и блогов, не для маркетинговых рассылок. |
| **skill-figma-mcp** | `Skills/skill-figma-mcp.skill` | Справочник Figma MCP — инструменты, настройка подключения (Desktop и Remote), workflows для дизайн-to-код, Code Connect, диаграммы, write-операции на canvas. Покрывает 19 MCP tools, 8+ Figma Skills (MCP prompts), типичные задачи фронтенд-разработки и продуктового дизайна с Figma. |
| **skill-figma-plugin** | `Skills/skill-figma-plugin.skill` | Справочник и процедура разработки плагинов Figma с Plugin API. Архитектура плагинов (sandbox main thread + UI iframe), манипуляция нодами, стили, компоненты, переменные (Variables), UI-разработка с postMessage-коммуникацией, настройка проекта (manifest.json, TypeScript, esbuild), тестирование и публикация в Figma Community. Пошаговый workflow от идеи до опубликованного плагина. |
| **skill-google-analytics** | `Skills/skill-google-analytics.skill` | Справочник API Google Analytics 4 для Claude Code агентов -- Data API (отчёты с dimensions и metrics, фильтры, pivot, cohort, realtime), Admin API (accounts, properties, dataStreams, customDimensions, keyEvents), Measurement Protocol (серверная отправка событий), BigQuery Export (сырые данные без семплирования). Включает авторизацию через Google Cloud (Service Account и OAuth 2.0), Python-сниппеты для google-analytics-data и google-analytics-admin, справочник 200+ dimensions и 100+ metrics, квоты на токены. |
| **skill-humanizer-ru** | `Skills/skill-humanizer-ru.skill` | Очеловечивание русскоязычного текста — редактура ради живого авторского тона. Убирает признаки AI-генерации (канцелярит, кальки с английского, штампы, шаблонный ритм и структуру), возвращает голос, мнение и живой ритм. Три режима: полное редактирование / аудит / точечная правка. Работает ТОЛЬКО с русским языком. Триггеры-глаголы: «очеловечь», «убери следы нейросети», «сделай живым/естественным», «перепиши как человек», «убери канцелярит», «звучит как робот», «слишком формально/искусственно», «проверь на AI-маркеры». |
| **skill-markup** | `Skills/skill-markup.skill` | Справочник синтаксиса разметки — Markdown (CommonMark, MultiMarkdown, MDC), Confluence Wiki Markup, Jira Text Formatting, LaTeX, MediaWiki Wikitext, Textile, разметка Telegram — клиентская (Desktop и macOS) и Rich Markdown / Rich HTML в Bot API. |
| **skill-moodboard** | `Skills/skill-moodboard.skill` | Создание визуальных мудбордов и тематических коллекций UI-паттернов. Два типа: (1) визуальное направление проекта — палитра, типографика, лейаут, настроение; (2) тематическая коллекция паттернов (FOMO, онбординг, empty states и т.п.) — категории, вариации, визуальные мокапы, do/don't. Три режима сбора источников: из URL пользователя, поисковый (агент сам ищет примеры по теме через WebSearch), fallback (по описанию настроения). Два формата выдачи: markdown и/или Figma-фрейм с визуальными мокапами. |
| **skill-mts-analytics** | `Skills/skill-mts-analytics.skill` | Справочник Data API МТС Аналитики для Claude Code агентов. Покрывает Data API (асинхронный экспорт сырых событий WEB_HIT, SESSION, MOBILE_HIT в CSV через gzip), API Link Manager (короткие ссылки с перенаправлением). Включает авторизацию Bearer token, справочник полей CSV для сайтов и приложений, Python-сниппеты полного цикла выгрузки (create task, poll, download, parse), подводные камни (cooldown, partial downloads, date format, 429). |
| **skill-nuxt-data-fetching** | `Skills/skill-nuxt-data-fetching.md` | Процедура выбора и использования методов загрузки данных в Nuxt 3 (useFetch, useAsyncData, $fetch) |
| **skill-prd-writing** | `Skills/skill-prd-writing.skill` | Процедура создания PRD-документов (Product Requirements Document) через интерактивный сбор требований, проработку сценариев и формализацию функциональных/нефункциональных требований для UI-продуктов. Включает шаблон PRD, User Stories, Acceptance Criteria, состояния UI, edge-cases. Применяется продуктовиками, дизайнерами, аналитиками. |
| **skill-product-analytics-methods** | `Skills/skill-product-analytics-methods.skill` | Справочник методов продуктовой аналитики -- воронки (funnel analysis, drop-off, конверсия, оптимизация), сегментация пользователей (RFM, поведенческая, демографическая, выбор типа), фреймворки метрик (North Star Metric, дерево метрик, guardrail-метрики, AARRR/пиратские метрики). Содержит пошаговые процедуры анализа, шаблоны отчётов, критерии выбора метода. Дополняет skill-ab-test-analysis (эксперименты) и skill-cohort-analysis (удержание), покрывая остальные методы продуктового анализа. |
| **skill-product-strategy** | `Skills/skill-product-strategy.skill` | Процедура построения полной продуктовой стратегии для любого digital-продукта (мобильное приложение, web, SaaS) — от исследования рынка до дорожной карты. Охватывает: анализ рынка и трендов, конкурентный анализ (включая AI-стартапы и быстрорастущих), персоны и JTBD, CJM, симулятор интервью и AI-касдев (синтетические интервью, анализ отзывов, проверка гипотез), стратегическое видение (несколько вижинов), дорожную карту, продуктовые метрики. Итог — Markdown-документ, опционально выгружаемый в интерактивный HTML; каждая цифра сопровождается свежим источником и датой. |
| **skill-proxy-nekobox-android** | `Skills/skill-proxy-nekobox-android.md` | Настройка NekoBox на Android с WireGuard и split tunneling |
| **skill-proxy-singbox** | `Skills/skill-proxy-singbox.skill` | Настройка VPN-клиента sing-box на macOS, Android и iOS: сборка JSON-конфига под протоколы TUIC и WireGuard, split tunneling по доменам и приложениям, импорт профиля (локальный файл, QR-код, share link), проверка и отладка подключения. Учитывает различия формата конфига между версиями ядра 1.11.x и 1.12+ и платформенные ограничения (stack, strict_route, route_exclude_address, per-app фильтрация). Клиенты: sing-box VT (SFM/SFI) в App Store, SFA в Google Play, альтернативы Hiddify и NekoBox. |
| **skill-report-company** | `Skills/skill-report-company.md` | Процедура создания структурированного профиля компании на основе веб-поиска. Генерирует markdown-отчёт с 7 секциями — описание, отзывы сотрудников, отзывы клиентов, технологический стек, руководство, новостной фон, метрики. |
| **skill-semantic-core** | `Skills/skill-semantic-core.skill` | Справочник формата YAML-семантики сайта для SEO/GEO-анализа веб-страниц. Объясняет структуру YAML-файлов, полученных из HTML путём извлечения SEO-релевантной семантики: мета-теги, Open Graph, Twitter Cards, Schema.org (JSON-LD), hreflang, иерархия контента (h1-h6, p, a, img, semantic HTML). Используй для понимания формата данных при анализе страниц. |
| **skill-seo-reference** | `Skills/skill-seo-reference.skill` | SEO-справочники — E-E-A-T, Schema.org, keyword research, technical SEO, readability, internal linking, GEO. Для аудита, оптимизации и создания SEO-контента. |
| **skill-session-harvest** | `Skills/skill-session-harvest.skill` | Извлекает из текущей AI-сессии переносимое знание в один Markdown-файл со связной выжимкой — установленные факты, решения с обоснованиями, приёмы, трение и поправки, ограничения среды. Не протокол и не пересказ диалога, а плотная честная выжимка уроков, которые пригодятся за пределами сессии. Активируется ТОЛЬКО при явном вызове по имени («запусти session-harvest», «run session harvest», «session-harvest») или через механизм харнесса. НЕ реагирует на смежные просьбы без имени — «собери итоги», «сохрани заметки», «подведи итоги», «законспектируй диалог» и подобные. |
| **skill-shopping-assistant** | `Skills/skill-shopping-assistant.skill` | Процесс подбора товаров: структурированный опрос, ресёрч с покрытием, визуальный отбор (да/нет/возможно), дожим, генерация руководства для агента-покупателя. Универсальный -- от обуви до билетов. Включает браузерный шоппинг через Chrome MCP (корзина/избранное); сами браузерные инструменты, их отказы и разрешения -- в скилле skill-chrome-mcp. |
| **skill-skill-refine** | `Skills/skill-skill-refine.skill` | По вызову анализирует существующий скилл в git против выжимки уроков из сессии (артефакт session-harvest) и по каждому уроку выдаёт вердикт — вносить ли его и почему — с конкретными предложениями правок «было → стало». В файлы пишет только после явного одобрения; ничего не коммитит. Дефолт — «не менять». Запускается ТОЛЬКО при явном назывании скилла по имени («skill-refine», «skill-skill-refine», «запусти/вызови/прогони skill-refine») или через механизм харнесса — срабатывает даже если рядом рабочие глаголы («сверь уроки», «предложи правки»). БЕЗ имени НЕ реагирует на смежные просьбы — «улучши этот скилл», «посмотри что поправить», «примени находку». |
| **skill-songwriting** | `Skills/skill-songwriting.skill` | Жанро-независимое ядро ремесла песнописания с акцентом на русский язык: теория и приёмы структуры песни, лирики, мелодии/гармонии, русской силлабо-тоники и процесса написания. Объясняет, как устроена песня и как её пишут — секции и формы, прозодия (укладка слова на музыку), рифма, образность, хук, размер, ударение, мелодический контур, аккордовые функции и прогрессии, точки входа в песню, object writing, ко-райтинг/топлайнинг, итерация и редактура, оценка готового текста. Пассивный справочник-роутер с lazy-loading по доменам. Теория и ремесло — здесь; генерация готового промпта/трека в Suno — skill-suno. |
| **skill-strapi-api-integration** | `Skills/skill-strapi-api-integration.md` | Процедура интеграции Vue/Nuxt приложения с Strapi v5 API через @nuxtjs/strapi модуль |
| **skill-strapi-content-modeling** | `Skills/skill-strapi-content-modeling.md` | Процедура проектирования контент-типов, компонентов и dynamic zones в Strapi v5 |
| **skill-suno** | `Skills/skill-suno.skill` | Генерация ready-to-paste промптов для Suno AI (AI-генерация музыки) и полный workflow от идеи до финального трека. По описанию пользователя создаёт три поля Suno Custom Mode: Style (жанр, темп, инструменты, вокал, продакшн, настроение), Lyrics (текст с метатегами структуры и параметризованными секциями), Title. Валидирует лимиты символов, проверяет конфликтные дескрипторы, подбирает надёжные метатеги, учитывает версию модели (V4.5-All / V5.5) и язык текста (включая русский). Покрывает Extend, Song Editor, Covers, Remixes, Album art. |
| **skill-travel-agent** | `Skills/skill-travel-agent.skill` | Методология персонального ИИ-турагента: фазовый процесс планирования поездки (профиль → выбор направления → логистика внутри страны → дни → верификация → сопровождение в поездке → дебриф), промпт-паттерны, шаблон профиля вкусов, обязательный верификационный протокол по времязависимым фактам (часы, расписания, визы, сезонные закрытия), цена на билеты и отели только от первоисточника — ценовой travel-API (read-only) или страница поставщика в браузере, — с провенансом; агрегатор, сниппет и память модели запрещены; ценово-временны́е эвристики «когда дешевле», работа в браузере по границе финансового обязательства (смотреть, читать цену, класть в корзину и в избранное — можно; бронировать и оплачивать — нет), компенсирующие практики рисков, шаблон итогового документа поездки. |
| **skill-ubuntu** | `Skills/skill-ubuntu.skill` | Справочник Ubuntu/Debian-специфичных процедур — apt, dpkg, snap, PPA, ufw, unattended-upgrades, управление ядрами, Netplan, systemd-resolved, AppArmor, cloud-init, do-release-upgrade. Не покрывает SSH (он универсален) и не покрывает деплой приложений (это задача роли). |
| **skill-vue-typescript-patterns** | `Skills/skill-vue-typescript-patterns.md` | Справочник TypeScript-паттернов для Vue 3 / Nuxt 3 — типизация props, emits, slots, composables, Pinia stores |
| **skill-yandex-metrika** | `Skills/skill-yandex-metrika.skill` | Справочник API Яндекс Метрики для Claude Code агентов — Logs API (сырые данные визитов и хитов), API отчётов (агрегированные данные с группировками и метриками), API управления (счётчики, цели, сегменты). Включает справочник полей, Python-сниппеты для выгрузки данных, конвертации TSV в CSV, обработки через pandas. Покрывает авторизацию OAuth, работу с квотами, обработку ошибок. |

---

## 📊 Статистика

- **Ролей:** 25
- **Скиллов:** 35
- **Последнее обновление:** 2026-08-21 19:13

---

## Структура папок

```
/Production
├── /Agents              # Роли по категориям
│   ├── /meta    # Мета-роли
│   ├── /assistants    # Помощники
│   ├── /specialists    # Специалисты
│   └── /creative    # Креативные роли
├── /Dialog              # Загрузчики ролей для диалоговых ассистентов
└── /Skills              # Скиллы (справочники)
```

---

## Версионирование

Каждая роль и скилл содержит версию в метаданных:
- **X.0.0** — Мажорные изменения (несовместимые)
- **X.Y.0** — Новые возможности
- **X.Y.Z** — Исправления и улучшения

---

*Источник: Role Creator Project | Обновлено через `scripts/publish.sh`*
