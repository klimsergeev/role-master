---
name: skill-markup
description: >
  Справочник синтаксиса разметки — Markdown (CommonMark, MultiMarkdown, MDC),
  Confluence Wiki Markup, Jira Text Formatting, LaTeX, MediaWiki Wikitext, Textile,
  разметка Telegram — клиентская (Desktop и macOS) и Rich Markdown / Rich HTML в Bot API,
  а также язык диаграмм Mermaid (flowchart, sequence, class, state, ER, gantt, gitGraph,
  mindmap и другие типы) и его встраивание в Markdown блоком mermaid.
when_to_use: >
  Когда нужно написать или отформатировать текст в Markdown, Confluence, Jira,
  LaTeX, Wikitext или Textile. Синтаксис заголовков, таблиц, списков, кода, ссылок.
  Также когда нужно оформить сообщение в приложении Telegram (какие символы работают
  при наборе, почему разметка не сработала) или rich-сообщение, отправляемое ботом
  через Bot API (Rich Markdown, Rich HTML, sendRichMessage, лимиты).
  Также когда нужно написать код Mermaid: блок-схему, sequence, ER-схему, Ганта,
  git-граф, интеллект-карту; вставить блок mermaid в README или вики; понять, почему
  код Mermaid не отрисовался на GitHub, GitLab, Obsidian или в VS Code.
  Примеры: «нарисуй блок-схему в mermaid», «sequence на mermaid для API»,
  «ER-схема базы в mermaid», «почему mermaid не рендерится в GitLab».
version: 2.4.0
created: 2026-05-02
---

# Markup Reference

## Назначение

Справочный скилл с синтаксисом разметки: Markdown (CommonMark, MultiMarkdown, MDC), Confluence Wiki Markup, Jira Text Formatting Notation, LaTeX, MediaWiki Wikitext, Textile, клиентская разметка Telegram, Rich Markdown / Rich HTML в Telegram Bot API, а также язык диаграмм Mermaid. Подключается к агенту для написания и форматирования текста в нужной разметке и диаграмм кодом.

## Принципы

1. **Один формат на документ** — не смешивай синтаксисы разных форматов в одном документе. Блок Mermaid внутри Markdown-документа — встраивание, а не смешение синтаксисов.
2. **Загружай только нужное** — читай справочник только того формата, который требуется для задачи.
3. **Формат определяет целевая система** — выбирай синтаксис по платформе: GitHub/документация = Markdown, Atlassian Confluence = Confluence Wiki Markup, Atlassian Jira = Jira Formatting, академические документы = LaTeX, Wikipedia/MediaWiki = Wikitext, Redmine/Textpattern = Textile, сообщение в приложении Telegram = клиентская разметка Telegram, rich-сообщение от бота = Telegram Rich Markdown / Rich HTML, диаграмма кодом = Mermaid.

## Таблица маршрутизации

> Читай файлы под задачу, а не скилл целиком. Колонка «Обязательно» — открыть до начала работы. Колонка «Читать, если» — открыть, когда условие выполнено; условие проверяется по задаче, а не по желанию. Файлы с пометкой `(справочник)` устроены как таблицы для точечного поиска — в них допустим поиск нужной строки вместо чтения целиком.

| Задача | Обязательно | Читать, если |
|---|---|---|
| Написать/отформатировать в Markdown | [markdown.md](markdown.md) (справочник) | если текст уйдёт сообщением в приложение Telegram: [telegram.md](telegram.md); если его отправит бот через Bot API: [telegram-bot-api.md](telegram-bot-api.md); если в документе нужна диаграмма Mermaid: [mermaid.md](mermaid.md) |
| Написать MDC / компонент в Markdown | [markdown.md](markdown.md) (справочник) | — |
| MultiMarkdown (сноски, метаданные, расширенные таблицы) | [markdown.md](markdown.md) (справочник) | если в документе есть математические формулы: [latex.md](latex.md) (справочник) |
| Написать/отформатировать в Confluence | [confluence.md](confluence.md) (справочник) | — |
| Написать/отформатировать в Jira | [jira.md](jira.md) (справочник) | — |
| Написать/отформатировать в LaTeX | [latex.md](latex.md) (справочник) | — |
| Написать/отформатировать в Wikitext | [wikitext.md](wikitext.md) (справочник) | — |
| Написать/отформатировать в Textile | [textile.md](textile.md) (справочник) | — |
| Оформить сообщение в приложении Telegram | [telegram.md](telegram.md) | если то же сообщение отправляет бот через Bot API, а не человек в клиенте: [telegram-bot-api.md](telegram-bot-api.md) |
| Отправить rich-сообщение ботом через Bot API | [telegram-bot-api.md](telegram-bot-api.md) | если тот же текст набирают руками в приложении Telegram: [telegram.md](telegram.md); если в сообщении есть формулы — их источник обрабатывается как сырой LaTeX: [latex.md](latex.md) (справочник) |
| Перевести текст из одного формата в другой | файлы обоих форматов — исходного и целевого, по строкам выше | если в исходнике есть блок mermaid: [mermaid-platforms.md](mermaid-platforms.md) (справочник) |
| Встроить диаграмму Mermaid в документ или на площадку / выбрать тип диаграммы Mermaid | [mermaid.md](mermaid.md), [mermaid-platforms.md](mermaid-platforms.md) (справочник) | если документ — Markdown: [markdown.md](markdown.md) (справочник) |
| Mermaid: блок-схема `flowchart` / `graph`, дорожки `swimlane-beta`, блочная диаграмма `block` | [mermaid.md](mermaid.md), [mermaid-flowchart.md](mermaid-flowchart.md) (справочник) | если названа площадка, где диаграмму отрисуют: [mermaid-platforms.md](mermaid-platforms.md) (справочник); если задаются тема, переменные темы, look, layout или `click`: [mermaid-config.md](mermaid-config.md) (справочник); если в подписи формула: [latex.md](latex.md) (справочник) |
| Mermaid: последовательность `sequenceDiagram`, `zenuml` | [mermaid.md](mermaid.md), [mermaid-sequence.md](mermaid-sequence.md) (справочник) | если названа площадка, где диаграмму отрисуют: [mermaid-platforms.md](mermaid-platforms.md) (справочник); если задаются тема, переменные темы, look, layout или `click`: [mermaid-config.md](mermaid-config.md) (справочник); если в подписи формула: [latex.md](latex.md) (справочник) |
| Mermaid: `classDiagram`, `stateDiagram-v2`, `erDiagram`, `requirementDiagram`, `usecase-beta` | [mermaid.md](mermaid.md), [mermaid-uml.md](mermaid-uml.md) (справочник) | если названа площадка, где диаграмму отрисуют: [mermaid-platforms.md](mermaid-platforms.md) (справочник); если задаются тема, переменные темы, look, layout или `click`: [mermaid-config.md](mermaid-config.md) (справочник) |
| Mermaid: `gantt`, `timeline`, `journey`, `gitGraph`, `kanban` | [mermaid.md](mermaid.md), [mermaid-timeline.md](mermaid-timeline.md) (справочник) | если названа площадка, где диаграмму отрисуют: [mermaid-platforms.md](mermaid-platforms.md) (справочник); если задаются тема, переменные темы, look, layout или `click`: [mermaid-config.md](mermaid-config.md) (справочник) |
| Mermaid: `pie`, `quadrantChart`, `xychart`, `sankey`, `radar-beta`, `treemap-beta`, `venn-beta` | [mermaid.md](mermaid.md), [mermaid-charts.md](mermaid-charts.md) (справочник) | если названа площадка, где диаграмму отрисуют: [mermaid-platforms.md](mermaid-platforms.md) (справочник); если задаются тема, переменные темы, look, layout или `click`: [mermaid-config.md](mermaid-config.md) (справочник) |
| Mermaid: `architecture-beta`, C4, `packet`, `mindmap`, `treeView-beta`, `ishikawa-beta` | [mermaid.md](mermaid.md), [mermaid-systems.md](mermaid-systems.md) (справочник) | если названа площадка, где диаграмму отрисуют: [mermaid-platforms.md](mermaid-platforms.md) (справочник); если задаются тема, переменные темы, look, layout или `click`: [mermaid-config.md](mermaid-config.md) (справочник) |
| Mermaid: `wardley-beta`, `cynefin-beta`, `eventmodeling`, railroad, `agentflow-beta` | [mermaid.md](mermaid.md), [mermaid-frameworks.md](mermaid-frameworks.md) (справочник) | если названа площадка, где диаграмму отрисуют: [mermaid-platforms.md](mermaid-platforms.md) (справочник); если задаются тема, переменные темы, look, layout или `click`: [mermaid-config.md](mermaid-config.md) (справочник) |

## Рабочий процесс

### Шаг 1: Определить целевой формат

По запросу пользователя или контексту задачи определи нужный формат разметки. Если формат не указан явно — уточни. Для диаграммы — тип по каталогу в [mermaid.md](mermaid.md) и площадку рендера, если она известна.

### Шаг 2: Загрузить справочник

По таблице маршрутизации загрузи справочник нужного формата.

### Шаг 3: Применить синтаксис

Используй загруженный справочник для написания или форматирования текста. Следуй правилам и ограничениям конкретного формата.

### Шаг 4: Оформить результат

- **Форматирование** — готовый код разметки
- **Ответ на вопрос о синтаксисе** — пример с пояснением
- **Создание документа** — полный документ в целевом формате

## Что НЕ делать

- Не загружать все справочники сразу — только нужные
- Не смешивать синтаксисы разных форматов в одном документе; блок Mermaid, встроенный в Markdown, смешением не считается
- Не изобретать свой синтаксис — строго по справочнику формата
- Не использовать Confluence-разметку для Jira и наоборот (похожи, но различаются)
- Не использовать типы Mermaid с суффиксом `-beta` и конструкции новее версии Mermaid площадки, если площадка их не поддерживает
- Не писать синтаксис Mermaid по памяти — только по файлам раздела Mermaid

## Примеры

### Пример 1: Форматирование таблицы в Confluence

**Запрос:** Создай таблицу с заголовками в Confluence Wiki Markup

**Маршрут:** [confluence.md](confluence.md)

**Результат:** Код разметки с `||Заголовок||` для заголовков и `|Ячейка|` для данных, по правилам справочника.

### Пример 2: Формула в LaTeX

**Запрос:** Напиши формулу интеграла в LaTeX

**Маршрут:** [latex.md](latex.md)

**Результат:** Формула с `\int_{a}^{b}` в окружении `equation`, с указанием необходимого пакета `amsmath`.

### Пример 3: Конвертация между форматами

**Запрос:** Перепиши этот Markdown-текст в Jira-формате

**Маршрут:** [markdown.md](markdown.md), [jira.md](jira.md)

**Результат:** Загружаются оба справочника — исходный для понимания структуры, целевой для корректного форматирования. Текст переписывается в синтаксисе Jira.

### Пример 4: Блок-схема процесса в README для GitHub

**Запрос:** Нарисуй в README блок-схему процесса оформления заказа, репозиторий на GitHub.

**Маршрут:** [mermaid.md](mermaid.md) и [mermaid-flowchart.md](mermaid-flowchart.md) — обязательное чтение по строке «Mermaid: блок-схема…»; плюс [mermaid-platforms.md](mermaid-platforms.md), потому что выполнилось условие «названа площадка, где диаграмму отрисуют».

**Результат:** fenced-блок ```` ```mermaid ```` с блок-схемой `flowchart` внутри Markdown-документа, синтаксис — по файлу группы, с учётом того, что документация GitHub версию Mermaid не называет и предлагает проверить её блоком `info`.

### Пример 5 (edge-case): README с диаграммой переводят в Jira

**Запрос:** Перепиши этот README в Jira-формате; в нём есть блок mermaid.

**Маршрут:** [markdown.md](markdown.md) и [jira.md](jira.md) — по строке «Перевести текст из одного формата в другой»; плюс [mermaid-platforms.md](mermaid-platforms.md), потому что выполнилось условие «в исходнике есть блок mermaid».

**Результат:** текст в разметке Jira и явное указание, что своего рендера Mermaid в Jira нет: диаграмму отрисует только приложение Marketplace, иначе её вставляют картинкой, отрисованной заранее, а исходник Mermaid сохраняют блоком кода.
