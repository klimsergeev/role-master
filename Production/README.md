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

---

## 📚 Каталог скиллов (Skills/)

| Скилл | Файл | Описание |
|-------|------|----------|
| **skill-3d-artist** | `Skills/skill-3d-artist.skill` | Справочник Blender MCP для агентов — настройка подключения (official connector и community-сервер ahujasid), workflows моделирования через bpy API, промптинг 3D-сцен, troubleshooting, безопасность execute_blender_code, экономия токенов в agentic-сессиях. Покрывает Claude Desktop, Cowork, Code. |
| **skill-ab-test-analysis** | `Skills/skill-ab-test-analysis.skill` | Процедура анализа результатов A/B-тестов и принятия ship/no-ship решений. Покрывает полный цикл: валидация эксперимента (SRM, длительность, мощность), расчёт primary metric (lift, CI, p-value), проверка guardrail-метрик, сегментный анализ (новые/старые, mobile/desktop, гео), финальная рекомендация (ship/no-ship/iterate). Включает статистический фреймворк (frequentist и bayesian подходы), матрицу принятия решений, типичные ошибки анализа (peeking, multiple comparisons, Simpson's paradox). |
| **skill-agent-orchestration** | `Skills/skill-agent-orchestration.skill` | Правила оркестрации субагентов в Claude Code — когда делегировать задачу агенту или скиллу, как формировать промпт для субагента, как сохранять контекст оркестратора чистым. Содержит pre-flight checklist, трёхслойную модель контекста, паттерны декомпозиции, алгоритм разрешения противоречий роль vs задание. |
| **skill-agent-teams** | `Skills/skill-agent-teams.md` | Процедура создания и управления Agent Teams в Claude Code — параллельная работа нескольких агентов с peer-to-peer коммуникацией |
| **skill-cohort-analysis** | `Skills/skill-cohort-analysis.skill` | Процедура когортного анализа продуктовых данных -- построение retention-таблиц, диагностика кривых удержания (healthy/declining/dying), поиск activation metric ("aha moment"), сравнение когорт по типам (acquisition, behavioral, segment). Включает формулы N-day и rolling retention, шаблон когортной таблицы, алгоритм activation analysis, формат продуктовых рекомендаций. Применяется продуктовыми аналитиками и product-менеджерами. |
| **skill-editorial-guidelines** | `Skills/skill-editorial-guidelines.skill` | Редполитика UX-текстов — свод правил написания текстов в интерфейсах. Тон, лексика, пунктуация, форматирование, ошибки. Не для перевода текстов, не для длинных статей и блогов, не для маркетинговых рассылок. |
| **skill-figma-mcp** | `Skills/skill-figma-mcp.skill` | Справочник Figma MCP — инструменты, настройка подключения (Desktop и Remote), workflows для дизайн-to-код, Code Connect, диаграммы, write-операции на canvas. Покрывает 19 MCP tools, 8+ Figma Skills (MCP prompts), типичные задачи фронтенд-разработки и продуктового дизайна с Figma. |
| **skill-google-analytics** | `Skills/skill-google-analytics.skill` | Справочник API Google Analytics 4 для Claude Code агентов -- Data API (отчёты с dimensions и metrics, фильтры, pivot, cohort, realtime), Admin API (accounts, properties, dataStreams, customDimensions, keyEvents), Measurement Protocol (серверная отправка событий), BigQuery Export (сырые данные без семплирования). Включает авторизацию через Google Cloud (Service Account и OAuth 2.0), Python-сниппеты для google-analytics-data и google-analytics-admin, справочник 200+ dimensions и 100+ metrics, квоты на токены. |
| **skill-local-permissions** | `Skills/skill-local-permissions.skill` | Процедура настройки локальных разрешений проекта в .claude/settings.local.json для автоматизации типовых подтверждений. Содержит пресеты (базовый, расширенный), алгоритм настройки, правила работы с permissions.allow. Скилл работает ТОЛЬКО с .claude/settings.local.json (уровень Local), не с глобальными или проектными settings. |
| **skill-markup** | `Skills/skill-markup.skill` | Справочник синтаксиса разметки — Markdown (CommonMark, MultiMarkdown, MDC), Confluence Wiki Markup, Jira Text Formatting, LaTeX, MediaWiki Wikitext, Textile. |
| **skill-mts-analytics** | `Skills/skill-mts-analytics.skill` | Справочник Data API МТС Аналитики для Claude Code агентов. Покрывает Data API (асинхронный экспорт сырых событий WEB_HIT, SESSION, MOBILE_HIT в CSV через gzip), API Link Manager (короткие ссылки с перенаправлением). Включает авторизацию Bearer token, справочник полей CSV для сайтов и приложений, Python-сниппеты полного цикла выгрузки (create task, poll, download, parse), подводные камни (cooldown, partial downloads, date format, 429). |
| **skill-nuxt-data-fetching** | `Skills/skill-nuxt-data-fetching.md` | Процедура выбора и использования методов загрузки данных в Nuxt 3 (useFetch, useAsyncData, $fetch) |
| **skill-prd-writing** | `Skills/skill-prd-writing.skill` | Процедура создания PRD-документов (Product Requirements Document) через интерактивный сбор требований, проработку сценариев и формализацию функциональных/нефункциональных требований для UI-продуктов. Включает шаблон PRD, User Stories, Acceptance Criteria, состояния UI, edge-cases. Применяется продуктовиками, дизайнерами, аналитиками. |
| **skill-product-analytics-methods** | `Skills/skill-product-analytics-methods.skill` | Справочник методов продуктовой аналитики -- воронки (funnel analysis, drop-off, конверсия, оптимизация), сегментация пользователей (RFM, поведенческая, демографическая, выбор типа), фреймворки метрик (North Star Metric, дерево метрик, guardrail-метрики, AARRR/пиратские метрики). Содержит пошаговые процедуры анализа, шаблоны отчётов, критерии выбора метода. Дополняет skill-ab-test-analysis (эксперименты) и skill-cohort-analysis (удержание), покрывая остальные методы продуктового анализа. |
| **skill-proxy-nekobox-android** | `Skills/skill-proxy-nekobox-android.md` | Настройка NekoBox на Android с WireGuard и split tunneling |
| **skill-proxy-singbox-macos** | `Skills/skill-proxy-singbox-macos.md` | Настройка sing-box VT на macOS с WireGuard endpoint и split tunneling |
| **skill-report-company** | `Skills/skill-report-company.md` | Процедура создания структурированного профиля компании на основе веб-поиска. Генерирует markdown-отчёт с 7 секциями — описание, отзывы сотрудников, отзывы клиентов, технологический стек, руководство, новостной фон, метрики. |
| **skill-semantic-core** | `Skills/skill-semantic-core.skill` | Справочник формата YAML-семантики сайта для SEO/GEO-анализа веб-страниц. Объясняет структуру YAML-файлов, полученных из HTML путём извлечения SEO-релевантной семантики: мета-теги, Open Graph, Twitter Cards, Schema.org (JSON-LD), hreflang, иерархия контента (h1-h6, p, a, img, semantic HTML). Используй для понимания формата данных при анализе страниц. |
| **skill-seo-reference** | `Skills/skill-seo-reference.skill` | SEO-справочники — E-E-A-T, Schema.org, keyword research, technical SEO, readability, internal linking, GEO. Для аудита, оптимизации и создания SEO-контента. |
| **skill-shopping-assistant** | `Skills/skill-shopping-assistant.skill` | Процесс подбора товаров: структурированный опрос, ресёрч с покрытием, визуальный отбор (да/нет/возможно), дожим, генерация руководства для агента-покупателя. Универсальный -- от обуви до билетов. Включает браузерный шоппинг через Chrome MCP (корзина/избранное). |
| **skill-strapi-api-integration** | `Skills/skill-strapi-api-integration.md` | Процедура интеграции Vue/Nuxt приложения с Strapi v5 API через @nuxtjs/strapi модуль |
| **skill-strapi-content-modeling** | `Skills/skill-strapi-content-modeling.md` | Процедура проектирования контент-типов, компонентов и dynamic zones в Strapi v5 |
| **skill-test-nested** | `Skills/skill-test-nested.skill` | Test nested skill structure |
| **skill-tlnd-browser** | `Skills/skill-tlnd-browser.md` | Процедура доступа к Ticketland.ru через Chrome MCP |
| **skill-tlnd-seo** | `Skills/skill-tlnd-seo.md` | SEO-стандарты Ticketland.ru — эталонные требования к мета-тегам, структурированным данным и техническому SEO для билетного сервиса |
| **skill-ubuntu** | `Skills/skill-ubuntu.skill` | Справочник Ubuntu/Debian-специфичных процедур — apt, dpkg, snap, PPA, ufw, unattended-upgrades, управление ядрами, Netplan, systemd-resolved, AppArmor, cloud-init, do-release-upgrade. Не покрывает SSH (он универсален) и не покрывает деплой приложений (это задача роли). |
| **skill-vue-typescript-patterns** | `Skills/skill-vue-typescript-patterns.md` | Справочник TypeScript-паттернов для Vue 3 / Nuxt 3 — типизация props, emits, slots, composables, Pinia stores |
| **skill-yandex-metrika** | `Skills/skill-yandex-metrika.skill` | Справочник API Яндекс Метрики для Claude Code агентов — Logs API (сырые данные визитов и хитов), API отчётов (агрегированные данные с группировками и метриками), API управления (счётчики, цели, сегменты). Включает справочник полей, Python-сниппеты для выгрузки данных, конвертации TSV в CSV, обработки через pandas. Покрывает авторизацию OAuth, работу с квотами, обработку ошибок. |

---

## 📊 Статистика

- **Ролей:** 23
- **Скиллов:** 28
- **Последнее обновление:** 2026-05-28 17:44

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
