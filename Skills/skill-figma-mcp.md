---
name: skill-figma-mcp
description: Подключение и использование локального MCP-сервера Figma Desktop для работы с макетами
version: 1.0.0
created: 2026-02-08
type: reference
---

# Figma MCP

## Назначение

Справочный скилл для подключения к локальному MCP-серверу Figma и использования его инструментов. Описывает, как получать данные макетов и скачивать изображения напрямую из Figma.

---

## Типы MCP-серверов

| Тип | URL | Авторизация |
|-----|-----|-------------|
| **Desktop (локальный)** | `http://127.0.0.1:3845/mcp` | Через Figma Desktop, токен не нужен |
| **Remote (облачный)** | `https://mcp.figma.com/mcp` | OAuth через браузер |

Этот скилл описывает работу с **Desktop-сервером**.

---

## Требования

1. **Figma Desktop** установлен и запущен
2. **Dev Mode** включен (требуется платная подписка Dev или Full seat)
3. Пользователь авторизован в Figma
4. MCP-сервер активирован в Figma

---

## Алгоритм подключения

### Шаг 1: Настройка конфигурации

Добавить конфигурацию MCP-сервера в файл настроек вашего клиента.

**Пути к конфигурации по клиентам:**

| Клиент | Путь к файлу конфигурации |
|--------|---------------------------|
| Cursor | `~/.cursor/mcp.json` |
| VS Code (Copilot) | `~/.vscode/mcp.json` |
| Claude Code CLI | `~/.claude/settings.json` (секция `mcpServers`) |
| Другой клиент | См. документацию клиента |

**Конфигурация:**

```json
{
    "mcpServers": {
        "Figma": {
            "url": "http://127.0.0.1:3845/mcp",
            "headers": {}
        }
    }
}
```

`headers` пустой, потому что Desktop-сервер использует авторизацию Figma Desktop.

> **Примечание:** Формат конфигурации может отличаться в зависимости от клиента. Если указанный формат не работает, обратитесь к документации вашего MCP-клиента.

### Шаг 2: Включение MCP-сервера в Figma

1. Открыть файл в Figma Desktop
2. Нажать `Shift+D` для перехода в Dev Mode
3. В панели Inspect найти секцию **MCP server**
4. Нажать **Enable desktop MCP server**
5. Дождаться подтверждения запуска на `127.0.0.1:3845`

### Шаг 3: Проверка подключения

```
mcp__figma__get_figma_data(fileKey: "ABC123xyz", nodeId: "1-1")
```

Если получены данные — подключение работает.

---

## Инструменты

| Вызов | Описание |
|-------|----------|
| `mcp__figma__get_figma_data` | Получить структуру и стили макета |
| `mcp__figma__download_figma_images` | Скачать изображения и иконки |

---

## Извлечение параметров из URL

URL макета:
```
https://www.figma.com/design/ABC123xyz/Project?node-id=1-1&m=dev
```

| Параметр | Значение | Откуда |
|----------|----------|--------|
| `fileKey` | `ABC123xyz` | после `/design/` |
| `nodeId` | `1-1` | из `node-id=` |

---

## Правила

- ВСЕГДА проверять, что Figma Desktop запущен перед вызовом MCP
- ВСЕГДА извлекать `fileKey` и `nodeId` из URL макета
- ЕСЛИ MCP не отвечает -> проверить, включен ли сервер в Figma (Shift+D)
- ЕСЛИ ошибка доступа -> проверить, включен ли Dev Mode
- НИКОГДА не использовать этот скилл без активного Figma Desktop

---

## Примеры

### Пример 1: Получение данных макета

**Вход:** URL макета `https://www.figma.com/design/XYZ789abc/Layout?node-id=10-200&m=dev`

**Действия:**
1. Извлечь `fileKey`: `XYZ789abc`
2. Извлечь `nodeId`: `10-200`
3. Вызвать:
```
mcp__figma__get_figma_data(fileKey: "XYZ789abc", nodeId: "10-200")
```

**Выход:** Структура и стили указанного узла макета

### Пример 2: MCP не отвечает

**Вход:** Вызов `mcp__figma__get_figma_data` возвращает ошибку соединения

**Действия:**
1. Проверить, запущен ли Figma Desktop
2. В Figma: `Shift+D` -> панель Inspect -> секция MCP server
3. Нажать **Enable desktop MCP server**
4. Повторить вызов

---

## Troubleshooting

| Проблема | Причина | Решение |
|----------|---------|---------|
| MCP не отвечает | Figma Desktop не запущен | Запустить Figma Desktop |
| MCP не отвечает | MCP-сервер не включен | Shift+D -> Enable desktop MCP server |
| Ошибка доступа | Dev Mode выключен | Включить Dev Mode в Figma |
| Нет данных | Неверный nodeId | Проверить формат: `1-1` или `1:1` |

---

## Ограничения

- Не описывает работу с Remote MCP-сервером (облачным)
- Не содержит инструкций по созданию и редактированию макетов в Figma
- Не заменяет ручную работу дизайнера

---

## Документация

- [Guide to the Figma MCP server](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server)
- [Remote server installation](https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/)
- [GitHub: Figma MCP Server Guide](https://github.com/figma/mcp-server-guide)
