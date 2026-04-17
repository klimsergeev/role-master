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
| **markup-converter** | `Agents/assistants/markup-converter.md` | Конвертер разметки документов (MD/MDC/plain text -> Confluence Wiki/Jira) |
| **message-writer** | `Agents/assistants/message-writer.md` | Ассистент по написанию сообщений в инфостиле |
| **project-logger** | `Agents/assistants/project-logger.md` | Секретарь проектной документации для портфолио |
| **research-analyst** | `Agents/assistants/research-analyst.md` | Аналитик-исследователь для глубокого анализа и исследований |

### 🔧 Специалисты

| Роль | Файл | Описание |
|------|------|----------|
| **devops-ubuntu** | `Agents/specialists/devops-ubuntu.md` | Системный администратор Linux Ubuntu |
| **frontend-developer** | `Agents/specialists/frontend-developer.md` | Опытный фронтенд-разработчик Vue/React/Quasar |
| **git-ops** | `Agents/specialists/git-ops.md` | Автономный эксперт по Git — аудит репозиториев, решение проблем, настройка воркфлоу |
| **prd-writer** | `Agents/specialists/prd-writer.md` | Эксперт по формализации продуктовых требований для UI-продуктов |
| **product-designer** | `Agents/specialists/product-designer.md` | UX/UI эксперт по проектированию интерфейсов |
| **product-manager** | `Agents/specialists/product-manager.md` | Продуктовый стратег — discovery, метрики, приоритизация и роадмап |
| **qa-engineer** | `Agents/specialists/qa-engineer.md` | Тестировщик веб-приложений на Python + Playwright |
| **seo-specialist** | `Agents/specialists/seo-specialist.md` | Универсальный SEO-аудитор для анализа любых сайтов |
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
| **skill-agent-orchestration** | `Skills/skill-agent-orchestration.md` | Правила оркестрации субагентов в Claude Code — когда делегировать, как сохранять контекст чистым |
| **skill-agent-teams** | `Skills/skill-agent-teams.md` | Процедура создания и управления Agent Teams в Claude Code — параллельная работа нескольких агентов с peer-to-peer коммуникацией |
| **skill-editorial-guidelines** | `Skills/skill-editorial-guidelines.md` | Редполитика UX-текстов — свод правил написания текстов в интерфейсах |
| **skill-figma-mcp-remote-setup** | `Skills/skill-figma-mcp-remote-setup.md` | Процедура подключения к Figma Remote MCP серверу (https://mcp.figma.com/mcp) |
| **skill-figma-mcp-setup** | `Skills/skill-figma-mcp-setup.md` | Процедура подключения проекта к Figma Desktop MCP серверу для интеграции Claude Code с Figma Desktop |
| **skill-figma-mcp-tools** | `Skills/skill-figma-mcp-tools.md` | Справочник MCP-инструментов Figma для агентов Claude Code (Desktop + Remote) |
| **skill-local-permissions** | `Skills/skill-local-permissions.md` | Процедура настройки локальных разрешений проекта в .claude/settings.local.json для автоматизации типовых подтверждений |
| **skill-markup-confluence** | `Skills/skill-markup-confluence.md` | Справочник синтаксиса Confluence Wiki Markup для форматирования документов |
| **skill-markup-jira** | `Skills/skill-markup-jira.md` | Справочник Jira Text Formatting Notation для форматирования текста в задачах и комментариях Jira |
| **skill-markup-latex** | `Skills/skill-markup-latex.md` | Справочник синтаксиса LaTeX для создания и редактирования документов |
| **skill-markup-markdown** | `Skills/skill-markup-markdown.md` | Справочник синтаксиса Markdown, MultiMarkdown и MDC для форматирования документов |
| **skill-markup-textile** | `Skills/skill-markup-textile.md` | Справочник синтаксиса Textile для форматирования текста в HTML |
| **skill-markup-wikitext** | `Skills/skill-markup-wikitext.md` | Справочник синтаксиса Wikitext (MediaWiki markup) для разметки wiki-страниц |
| **skill-nuxt-data-fetching** | `Skills/skill-nuxt-data-fetching.md` | Процедура выбора и использования методов загрузки данных в Nuxt 3 (useFetch, useAsyncData, $fetch) |
| **skill-prd-writing** | `Skills/skill-prd-writing.md` | Процедура создания PRD-документов с интерактивным сбором требований для UI-продуктов |
| **skill-proxy-nekobox-android** | `Skills/skill-proxy-nekobox-android.md` | Настройка NekoBox на Android с WireGuard и split tunneling |
| **skill-proxy-singbox-macos** | `Skills/skill-proxy-singbox-macos.md` | Настройка sing-box VT на macOS с WireGuard endpoint и split tunneling |
| **skill-report-company** | `Skills/skill-report-company.md` | Процедура создания структурированного профиля компании на основе веб-поиска. Генерирует markdown-отчёт с 7 секциями — описание, отзывы сотрудников, отзывы клиентов, технологический стек, руководство, новостной фон, метрики. |
| **skill-semantic-core** | `Skills/skill-semantic-core.md` | Справочник формата YAML-семантики сайта для SEO/GEO-анализа веб-страниц |
| **skill-strapi-api-integration** | `Skills/skill-strapi-api-integration.md` | Процедура интеграции Vue/Nuxt приложения с Strapi v5 API через @nuxtjs/strapi модуль |
| **skill-strapi-content-modeling** | `Skills/skill-strapi-content-modeling.md` | Процедура проектирования контент-типов, компонентов и dynamic zones в Strapi v5 |
| **skill-tlnd-browser** | `Skills/skill-tlnd-browser.md` | Процедура доступа к Ticketland.ru через Chrome MCP |
| **skill-tlnd-seo** | `Skills/skill-tlnd-seo.md` | SEO-стандарты Ticketland.ru — эталонные требования к мета-тегам, структурированным данным и техническому SEO для билетного сервиса |
| **skill-vue-typescript-patterns** | `Skills/skill-vue-typescript-patterns.md` | Справочник TypeScript-паттернов для Vue 3 / Nuxt 3 — типизация props, emits, slots, composables, Pinia stores |

---

## 📊 Статистика

- **Ролей:** 23
- **Скиллов:** 24
- **Последнее обновление:** 2026-04-17 22:41

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
