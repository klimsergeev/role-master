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
| **data-aggregator** | `Agents/assistants/data-aggregator.md` | Извлечение структурированных данных из веб-страниц в JSON |
| **message-writer** | `Agents/assistants/message-writer.md` | Ассистент по написанию сообщений в инфостиле |
| **project-logger** | `Agents/assistants/project-logger.md` | Секретарь проектной документации для портфолио |
| **research-analyst** | `Agents/assistants/research-analyst.md` | Аналитик-исследователь для глубокого анализа и исследований |

### 🔧 Специалисты

| Роль | Файл | Описание |
|------|------|----------|
| **frontend-developer** | `Agents/specialists/frontend-developer.md` | Опытный фронтенд-разработчик Vue/React/Quasar |
| **git-specialist** | `Agents/specialists/git-ops.md` | Автономный эксперт по Git — аудит репозиториев, решение проблем, настройка воркфлоу |
| **prd-writer** | `Agents/specialists/prd-writer.md` | Эксперт по формализации продуктовых требований для UI-продуктов |
| **product-designer** | `Agents/specialists/product-designer.md` | UX/UI эксперт по проектированию интерфейсов |
| **product-manager** | `Agents/specialists/product-manager.md` | Продуктовый стратег — discovery, метрики, приоритизация и роадмап |
| **qa-engineer** | `Agents/specialists/qa-engineer.md` | Тестировщик веб-приложений на Python + Playwright |
| **seo-specialist** | `Agents/specialists/seo-specialist.md` | Универсальный SEO-аудитор для анализа любых сайтов |
| **sysadmin-ubuntu** | `Agents/specialists/sysadmin-ubuntu.md` | Системный администратор Linux Ubuntu |
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
| **skill-editorial-guidelines** | `Skills/skill-editorial-guidelines.md` | Редполитика UX-текстов — свод правил написания текстов в интерфейсах |
| **skill-figma-mcp-setup** | `Skills/skill-figma-mcp-setup.md` | Процедура подключения проекта к Figma MCP серверу для интеграции Claude Code с Figma Desktop |
| **skill-figma-mcp-tools** | `Skills/skill-figma-mcp-tools.md` | Справочник MCP-инструментов Figma Desktop для агентов Claude Code |
| **skill-prd-writing** | `Skills/skill-prd-writing.md` | Процедура создания PRD-документов с интерактивным сбором требований для UI-продуктов |
| **skill-tlnd-browser** | `Skills/skill-tlnd-browser.md` | Процедура доступа к Ticketland.ru через Chrome MCP |
| **skill-tlnd-seo** | `Skills/skill-tlnd-seo.md` | SEO-стандарты Ticketland.ru — эталонные требования к мета-тегам, структурированным данным и техническому SEO для билетного сервиса |

---

## 📊 Статистика

- **Ролей:** 21
- **Скиллов:** 7
- **Последнее обновление:** 2026-02-14 12:52

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
