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
| **---** | `Agents/meta/prompt-engineer-claude.md` | — |
| **---** | `Agents/meta/role-master.md` | — |
| **---** | `Agents/meta/skill-master.md` | — |

### 🤖 Помощники и ассистенты

| Роль | Файл | Описание |
|------|------|----------|
| **---** | `Agents/assistants/advisor.md` | — |
| **---** | `Agents/assistants/data-aggregator.md` | — |
| **---** | `Agents/assistants/message-writer.md` | — |
| **---** | `Agents/assistants/project-logger.md` | — |
| **---** | `Agents/assistants/research-analyst.md` | — |

### 🔧 Специалисты

| Роль | Файл | Описание |
|------|------|----------|
| **---** | `Agents/specialists/frontend-developer.md` | — |
| **---** | `Agents/specialists/git-specialist.md` | — |
| **---** | `Agents/specialists/prd-writer.md` | — |
| **---** | `Agents/specialists/product-designer.md` | — |
| **---** | `Agents/specialists/qa-engineer.md` | — |
| **---** | `Agents/specialists/seo-specialist.md` | — |
| **---** | `Agents/specialists/sysadmin-ubuntu.md` | — |
| **---** | `Agents/specialists/telegram-developer.md` | — |
| **---** | `Agents/specialists/ux-heuristic.md` | — |
| **---** | `Agents/specialists/ux-writer.md` | — |

### 🎨 Креативные роли

| Роль | Файл | Описание |
|------|------|----------|
| **---** | `Agents/creative/prompt-engineer-tti.md` | — |

---

## 📚 Каталог скиллов (Skills/)

| Скилл | Файл | Описание |
|-------|------|----------|
| **---** | `Skills/skill-editorial-guidelines.md` | — |
| **---** | `Skills/skill-ticketland-seo.md` | — |

---

## 📊 Статистика

- **Ролей:** 19
- **Скиллов:** 2
- **Последнее обновление:** 2026-02-08 15:52

---

## Структура папок

```
/Production
├── /Agents              # Роли по категориям
│   └── /meta    # Мета-роли
│   └── /assistants    # Помощники
│   └── /specialists    # Специалисты
│   └── /creative    # Креативные роли
├── /Dialog              # Заглушки для Claude
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
