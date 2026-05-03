# Remote MCP Setup

## Назначение

Пошаговая процедура подключения к Remote MCP серверу Figma. Применяется когда нужен полный доступ к Figma API (включая write-операции) без необходимости запускать Figma Desktop.

## Предварительные требования

| Требование | Проверка |
|------------|----------|
| Figma аккаунт | Есть логин на figma.com |
| MCP-клиент | Claude Code, Cursor или VS Code |
| Edit permission | Для write-операций нужен доступ к файлу |

**API Token НЕ требуется** — авторизация через OAuth в браузере.

## Алгоритм

### Шаг 1: Добавить Remote MCP сервер

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

```
Используй mcp__figma__whoami для проверки подключения
```

**Ожидаемый результат:** Информация о пользователе (email, plan, permissions).

### Шаг 6: Проверить доступ к файлам

```
Используй mcp__figma__get_design_context с fileKey="[ключ файла]" и nodeId="0:1"
```

**Ключ файла** из URL: `figma.com/design/[fileKey]/...`

## Устранение проблем

### OAuth ошибка или redirect не работает

| Причина | Решение |
|---------|---------|
| Браузер заблокировал popup | Разрешить popups для figma.com |
| Сессия истекла | Повторить аутентификацию через `/mcp` |
| Неправильный аккаунт | Выйти из Figma, залогиниться нужным аккаунтом |

### "Connection refused" или timeout

| Причина | Решение |
|---------|---------|
| Сервер временно недоступен | Подождать и повторить |
| Firewall блокирует | Проверить сетевые настройки |
| Неправильный URL | Проверить: `https://mcp.figma.com/mcp` |

### Rate limit exceeded

| Причина | Решение |
|---------|---------|
| Превышен лимит вызовов | Подождать (15/min для Pro, 20/min для Enterprise) |
| Starter/View seat | Только 6 вызовов/месяц — нужен Full seat |

### "Permission denied" при write-операциях

| Причина | Решение |
|---------|---------|
| View-only доступ к файлу | Запросить Edit permission |
| Viewer seat | Нужен Full Design seat |

## Правила

- ЕСЛИ OAuth не срабатывает -> проверить браузер, попробовать incognito
- ЕСЛИ rate limit -> подождать или оптимизировать количество вызовов
- ЕСЛИ нужен write-доступ -> убедиться в Edit permission И Full seat
- ВСЕГДА проверять подключение через `whoami` после настройки
- НИКОГДА не хранить токены вручную — OAuth управляет авторизацией автоматически

## Формат выдачи

После успешной настройки:

```
Figma Remote MCP подключён.

Пользователь: [email из whoami]
Plan: [plan из whoami]

Доступные инструменты (19):
- Чтение: get_design_context, get_screenshot, get_metadata, get_variable_defs
- Code Connect: get_code_connect_map, add_code_connect_map, get_code_connect_suggestions, send_code_connect_mappings
- Создание: use_figma [beta], generate_figma_design, create_new_file, generate_diagram
- Поиск: search_design_system
- Служебные: whoami, create_design_system_rules, get_figjam, get_libraries, get_context_for_code_connect, upload_assets

Проверка: "создай прямоугольник в файле [fileKey]" (требует Edit permission)
```

## Примеры

### Пример 1: Первичная настройка

**Вход:** Пользователь хочет подключить Remote MCP

**Действия:**
1. `claude mcp add --transport http figma https://mcp.figma.com/mcp`
2. Перезапуск Claude Code
3. `/mcp` -> figma -> Authenticate
4. Allow Access в браузере
5. Проверка через `whoami`

**Результат:** Подключение активно, 19 инструментов доступны.

### Пример 2: Глобальная настройка для всех проектов

**Вход:** Пользователь хочет Figma MCP во всех проектах

**Действия:**
1. `claude mcp add --transport http --scope user figma https://mcp.figma.com/mcp`
2. Перезапуск Claude Code
3. Аутентификация через `/mcp`

**Результат:** Figma MCP доступен в любом проекте.

### Пример 3: Миграция с Desktop на Remote

**Вход:** Пользователь использует Desktop MCP, хочет перейти на Remote для write-операций

**Действия:**
1. Добавить Remote: `claude mcp add --transport http figma https://mcp.figma.com/mcp`
2. Перезапуск Claude Code
3. Аутентификация OAuth
4. Desktop MCP можно оставить параллельно или удалить

**Результат:** Оба MCP доступны. Desktop-инструменты через `mcp__figma-desktop__*`, Remote через `mcp__figma__*`.
