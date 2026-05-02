---
name: skill-seo-reference
description: SEO-справочники — E-E-A-T, Schema.org, keyword research, technical SEO, readability, internal linking, GEO. Для аудита, оптимизации и создания SEO-контента.
when_to_use: Используй при SEO-аудите, анализе мета-тегов, работе со структурированными данными, исследовании ключевых слов, написании SEO-текстов, оптимизации контента, технической SEO-проверке, оптимизации под AI Overviews и генеративный поиск.
version: 1.0.0
created: 2026-05-01
---

# SEO Reference

## Назначение

Справочный скилл с SEO-знаниями: E-E-A-T, Schema.org, keyword research, featured snippets, technical SEO, internal linking, readability, GEO. Подключается к агенту для аудита, оптимизации и создания SEO-контента.

## Принципы

1. **Только проверенные практики** — рекомендации основаны на официальных гайдах Google, Яндекса и подтверждённых кейсах. Не экспериментальные техники.
2. **Конкретика вместо теории** — каждая рекомендация содержит пример, числа или чеклист. Не «возможно улучшит», а «увеличит CTR на ~20%».
3. **Адаптация под тип сайта** — справочники универсальны, но при применении учитывай специфику: e-commerce, медиа, SaaS, локальный бизнес.

## Таблица маршрутизации

> Читай только те файлы, которые нужны под задачу. Не загружай все сразу.

| Задача | Минимум | Добавить при необходимости |
|---|---|---|
| SEO-аудит страницы (полный) | [technical-seo.md](technical-seo.md) | [schema-org.md](schema-org.md), [eeat.md](eeat.md) |
| Структурированные данные | [schema-org.md](schema-org.md) | [technical-seo.md](technical-seo.md) |
| SEO-статья / оптимизация контента | [keyword-strategy.md](keyword-strategy.md), [readability.md](readability.md) | [featured-snippets.md](featured-snippets.md), [eeat.md](eeat.md) |
| Keyword research / семантическое ядро | [keyword-strategy.md](keyword-strategy.md) | — |
| Оптимизация под featured snippets / AI Overviews | [featured-snippets.md](featured-snippets.md) | [readability.md](readability.md), [eeat.md](eeat.md) |
| Оценка E-E-A-T | [eeat.md](eeat.md) | — |
| Аудит внутренней перелинковки | [internal-linking.md](internal-linking.md) | [technical-seo.md](technical-seo.md) |
| Проверить мета-теги | [technical-seo.md](technical-seo.md) | — |
| Чеклист перед публикацией | [readability.md](readability.md), [technical-seo.md](technical-seo.md) | [eeat.md](eeat.md) |
| Конкурентный анализ SEO | [technical-seo.md](technical-seo.md), [schema-org.md](schema-org.md), [keyword-strategy.md](keyword-strategy.md) | [internal-linking.md](internal-linking.md) |
| Оптимизация под генеративный поиск (GEO) | [featured-snippets.md](featured-snippets.md), [eeat.md](eeat.md) | [schema-org.md](schema-org.md), [readability.md](readability.md) |
| Core Web Vitals / техническая производительность | [technical-seo.md](technical-seo.md) | — |

## Рабочий процесс

### Шаг 1: Определить тип задачи

По запросу пользователя определи категорию: аудит, оптимизация контента, keyword research, работа со структурированными данными, техническая проверка.

### Шаг 2: Загрузить нужные файлы

По таблице маршрутизации загрузи минимально необходимые файлы. Если задача комплексная — добавь дополнительные.

### Шаг 3: Применить справочные данные

Используй загруженные справочники для анализа, рекомендаций или создания контента. Адаптируй под тип сайта (e-commerce, медиа, SaaS, локальный бизнес).

### Шаг 4: Оформить результат

- **Аудит** — таблица с приоритетами (Critical / High / Medium / Low)
- **Рекомендация по коду** — пример с пояснением
- **Контентная задача** — keyword brief, структура, мета-теги, чеклист
- **Консультация** — структурированный ответ с примерами

## Что НЕ делать

- Не загружать все файлы сразу — только те, что нужны под задачу
- Не давать устаревшие рекомендации (FID вместо INP, HowTo rich results и т.д.)
- Не обещать гарантий позиций — «улучшит видимость», не «попадёт в топ-3»
- Не смешивать рекомендации для разных типов сайтов без адаптации

## Примеры

### Пример 1: SEO-аудит страницы

**Запрос:** Проведи SEO-аудит страницы товара в интернет-магазине

**Маршрут:** [technical-seo.md](technical-seo.md), затем [schema-org.md](schema-org.md)

**Результат:** Таблица с приоритетами — проверка мета-тегов, canonical, Schema.org (Product), Core Web Vitals. Рекомендации с примерами кода.

### Пример 2: Оптимизация под AI Overviews

**Запрос:** Как оптимизировать статью, чтобы её цитировал AI?

**Маршрут:** [featured-snippets.md](featured-snippets.md), [eeat.md](eeat.md), [readability.md](readability.md)

**Результат:** 5 факторов цитирования в AI Overviews, рекомендации по структуре контента (самодостаточные блоки 134-167 слов), чеклист E-E-A-T, FAQPage schema.

### Пример 3: Запрос вне scope

**Запрос:** Настрой мне Google Ads кампанию

**Маршрут:** — (скилл не покрывает контекстную рекламу)

**Результат:** Сообщить, что контекстная реклама вне scope SEO-справочника. Предложить SEO-аудит посадочной страницы как альтернативу.
