---
name: skill-figma-mcp-remote-setup
description: Процедура подключения к Figma Remote MCP серверу (https://mcp.figma.com/mcp)
---

# Figma Remote MCP Setup

## Назначение

Пошаговая процедура подключения к Remote MCP серверу Figma. Применяется когда нужен полный доступ к Figma API (включая write-операции) без необходимости запускать Figma Desktop.

---

## Desktop vs Remote

| Характеристика | Desktop | Remote |
|----------------|---------|--------|
| URL | `127.0.0.1:3845/mcp` | `mcp.figma.com/mcp` |
| Требует Figma Desktop | Да | Нет |
| Инструментов | 8 | 16 |
| Write-to-canvas | Ограничено | Полный (use_figma) |
| Rate limits | Нет | Да |
| API | REST API | Plugin API |

**Когда выбрать Remote:**
- Нужны write-операции (создание элементов на canvas)
- Figma Desktop недоступен или неудобен
- Нужны инструменты generate_figma_design, use_figma

**Когда выбрать Desktop:**
- Работа с локальным файлом без rate limits
- Интеграция с Dev Mode и Code Connect
- Нет необходимости в write-операциях

---

## Предварительные требования

| Требование | Проверка |
|------------|----------|
| Figma аккаунт | Есть логин на figma.com |
| MCP-клиент | Claude Code, Cursor или VS Code |
| Edit permission | Для write-операций нужен доступ к файлу |

**API Token НЕ требуется** — авторизация через OAuth в браузере.

---

## Алгоритм

### Шаг 1: Добавить Remote MCP сервер

Выполнить в терминале:

```bash
claude mcp add --transport http figma https://mcp.figma.com/mcp
```

**Для глобальной доступности** (во всех проектах):

```bash
claude mcp add --transport http --scope user figma https://mcp.figma.com/mcp
```

### Шаг 2: Перезапустить Claude Code

Закрыть и открыть Claude Code заново, чтобы новая конфигурация загрузилась.

### Шаг 3: Аутентифицироваться в Figma

1. Выполнить команду `/mcp` в Claude Code
2. Выбрать `figma` из списка серверов
3. Нажать "Authenticate"

### Шаг 4: Разрешить доступ в браузере

1. Откроется браузер с Figma OAuth
2. Нажать "Allow Access"
3. Вернуться в Claude Code

### Шаг 5: Проверить подключение

Вызвать инструмент `whoami`:

```
Используй mcp__figma__whoami для проверки подключения
```

**Ожидаемый результат:** Информация о пользователе (email, plan, permissions).

### Шаг 6: Проверить доступ к файлам

Попробовать получить данные из файла:

```
Используй mcp__figma__get_design_context с fileKey="[ключ файла]" и nodeId="0:1"
```

**Ключ файла** можно взять из URL: `figma.com/design/[fileKey]/...`

---

## Устранение проблем

### Проблема: OAuth ошибка или redirect не работает

| Причина | Решение |
|---------|---------|
| Браузер заблокировал popup | Разрешить popups для figma.com |
| Сессия истекла | Повторить аутентификацию через `/mcp` |
| Неправильный аккаунт | Выйти из Figma, залогиниться нужным аккаунтом |

### Проблема: "Connection refused" или timeout

| Причина | Решение |
|---------|---------|
| Сервер временно недоступен | Подождать и повторить |
| Firewall блокирует | Проверить сетевые настройки |
| Неправильный URL | Проверить: `https://mcp.figma.com/mcp` |

### Проблема: Rate limit exceeded

| Причина | Решение |
|---------|---------|
| Превышен лимит вызовов | Подождать (15/min для Pro, 20/min для Enterprise) |
| Starter/View seat | Только 6 вызовов/месяц — нужен Full seat |

### Проблема: "Permission denied" при write-операциях

| Причина | Решение |
|---------|---------|
| View-only доступ к файлу | Запросить Edit permission |
| Viewer seat | Нужен Full Design seat |

---

## Rate Limits

| План/Seat | Лимит |
|-----------|-------|
| Starter/View/Collab | 6 calls/месяц |
| Dev/Full (Pro) | 15/min, 200/day |
| Dev/Full (Enterprise) | 20/min, 600/day |

**Примечание:** `use_figma` в beta — free during beta period, лимиты могут измениться.

---

## Правила

- ЕСЛИ OAuth не срабатывает -> проверить браузер, попробовать incognito
- ЕСЛИ rate limit -> подождать или оптимизировать количество вызовов
- ЕСЛИ нужен write-доступ -> убедиться в Edit permission И Full seat
- ВСЕГДА проверять подключение через `whoami` после настройки
- НИКОГДА не хранить токены вручную — OAuth управляет авторизацией автоматически

---

## Формат выдачи

После успешной настройки сообщить пользователю:

```
Figma Remote MCP подключён.

Пользователь: [email из whoami]
Plan: [plan из whoami]

Доступные инструменты (16):
• Чтение: get_design_context, get_screenshot, get_metadata, get_variable_defs
• Code Connect: get_code_connect_map, add_code_connect_map, get_code_connect_suggestions, send_code_connect_mappings
• Создание: use_figma [beta], generate_figma_design, create_new_file, generate_diagram
• Поиск: search_design_system
• Служебные: whoami, create_design_system_rules, get_figjam

Проверка: "создай прямоугольник в файле [fileKey]" (требует Edit permission)
```

---

## Примеры

### Пример 1: Первичная настройка

**Вход:** Пользователь хочет подключить Remote MCP для работы с Figma без Desktop

**Действия:**
1. `claude mcp add --transport http figma https://mcp.figma.com/mcp`
2. Перезапуск Claude Code
3. `/mcp` -> figma -> Authenticate
4. Allow Access в браузере
5. Проверка через `whoami`

**Выход:** Подключение активно, 16 инструментов доступны.

### Пример 2: Глобальная настройка для всех проектов

**Вход:** Пользователь хочет, чтобы Figma MCP был доступен во всех проектах

**Действия:**
1. `claude mcp add --transport http --scope user figma https://mcp.figma.com/mcp`
2. Перезапуск Claude Code
3. Аутентификация через `/mcp`

**Выход:** Figma MCP доступен в любом проекте без дополнительной настройки.

### Пример 3: Ошибка rate limit

**Вход:** Пользователь получает "Rate limit exceeded" при вызове инструмента

**Действия:**
1. Вызвать `whoami` для определения плана
2. Если Starter/View — сообщить о лимите 6 calls/месяц
3. Если Pro/Enterprise — подождать 1 минуту и повторить
4. Рекомендовать batch-операции вместо множества одиночных вызовов

**Выход:** Пользователь понимает причину и способ решения.

---

## Самопроверка при подключении

При подключении скилла агент должен:

1. Попробовать вызвать `mcp__figma__whoami`
2. Вывести сообщение:

```
Скилл подключён: Figma Remote MCP Setup

Назначение: Процедура подключения к Remote MCP серверу Figma.

Статус подключения:
• Remote MCP: [доступен/недоступен]
• Пользователь: [email или "не авторизован"]
• Plan: [plan или "неизвестно"]
```

---

## Что НЕ входит в scope

- Настройка Desktop MCP (см. skill-figma-mcp-setup)
- Использование инструментов (см. skill-figma-mcp-tools)
- Создание Figma аккаунта
- Управление правами доступа к файлам в Figma
- Настройка billing и seats в Figma
