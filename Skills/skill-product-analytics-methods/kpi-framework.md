# KPI Framework

## Назначение

Фреймворки продуктовых метрик: North Star Metric, дерево метрик, guardrail-метрики, AARRR. Процедуры определения, декомпозиции и мониторинга KPI продукта.

## North Star Metric

### Что такое NSM

North Star Metric -- единая метрика, отражающая ключевую ценность продукта для пользователя. Служит фокусом для всей команды.

### Критерии хорошей NSM

| Критерий | Описание | Пример проверки |
|---|---|---|
| Отражает ценность | Рост NSM = больше ценности для пользователя | "Если NSM растёт, пользователи довольны?" |
| Измерима | Можно посчитать из имеющихся данных | "Есть ли данные для расчёта?" |
| Actionable | Команда может влиять на NSM своими действиями | "Что мы можем сделать, чтобы сдвинуть NSM?" |
| Leading | Предсказывает долгосрочный успех (revenue, retention) | "Рост NSM ведёт к росту выручки?" |
| Понятна | Любой в команде может объяснить, что означает | "Менеджер продаж понимает эту метрику?" |

### Примеры NSM по типам продуктов

| Тип продукта | NSM | Почему |
|---|---|---|
| Social network | Daily Active Users (DAU) | Ценность = общение, растёт с числом активных |
| Marketplace | Completed Transactions / week | Ценность = успешная сделка для обеих сторон |
| SaaS (productivity) | Weekly Active [Key Entity] | Ценность = регулярное использование core-объекта |
| SaaS (communication) | Messages Sent / DAU | Ценность = коммуникация |
| E-commerce | Purchases / week | Ценность = покупка нужного товара |
| Media / Content | Total Watch Time (hours) | Ценность = контент, который удерживает внимание |
| Fintech | Active Accounts with balance | Ценность = доверие и активное использование |

### Процедура выбора NSM

1. **Сформулируй ценность продукта** -- одним предложением: "Пользователь получает [X] с помощью [продукта]"
2. **Перечисли кандидатов** -- 3-5 метрик, которые отражают доставку этой ценности
3. **Проверь по критериям** -- каждого кандидата по 5 критериям (таблица выше)
4. **Проверь корреляцию** -- NSM-кандидат должен коррелировать с revenue и retention (если есть исторические данные)
5. **Выбери одну** -- NSM всегда одна; остальные кандидаты станут input-метриками

### Антипаттерны NSM

| Антипаттерн | Проблема | Пример |
|---|---|---|
| Revenue как NSM | Lagging, не отражает ценность для пользователя | "MRR" для consumer-продукта |
| Vanity metric | Растёт сама по себе, не отражает здоровье | "Total registered users" |
| Слишком гранулярная | Не даёт общей картины | "Clicks on button X" |
| Не actionable | Команда не может повлиять | "Market share" |
| Составная метрика | Сложно интерпретировать изменения | "Engagement Score (0-100)" без прозрачной формулы |

## Дерево метрик

### Что такое дерево метрик

Иерархическая декомпозиция NSM на input-метрики (drivers), которыми команда управляет напрямую. Дерево делает связь между работой команды и NSM прозрачной.

### Структура дерева

```
NSM (North Star)
├── Input Metric 1 (lever)
│   ├── Sub-metric 1.1
│   └── Sub-metric 1.2
├── Input Metric 2 (lever)
│   ├── Sub-metric 2.1
│   └── Sub-metric 2.2
└── Input Metric 3 (lever)
    └── Sub-metric 3.1
```

### Процедура построения дерева

#### Шаг 1: Декомпозировать NSM математически

NSM должна раскладываться на input-метрики через формулу:

```
NSM = Input_1 * Input_2 * Input_3
```

или

```
NSM = Input_1 + Input_2 + Input_3
```

Пример (SaaS):
```
Weekly Active Projects = New Users/week * Activation Rate * Projects per Active User
```

Пример (E-commerce):
```
Revenue = Visitors * Conversion Rate * AOV * Purchase Frequency
```

#### Шаг 2: Для каждой input-метрики определить драйверы

| Input Metric | Drivers | Команда/зона ответственности |
|---|---|---|
| New Users/week | Paid acquisition, Organic traffic, Referrals | Marketing, Growth |
| Activation Rate | Onboarding completion, Time to first value | Product, Design |
| Projects per Active User | Feature discovery, Template quality | Product, Content |

#### Шаг 3: Валидировать дерево

- **Полнота** -- сумма/произведение input-метрик = NSM (нет скрытых факторов)
- **Независимость** -- input-метрики не дублируют друг друга
- **Actionable** -- для каждой input-метрики есть команда/человек, ответственный за рост
- **Measurable** -- каждая метрика считается из доступных данных
- **Глубина 2-3 уровня** -- глубже = сложно поддерживать

### Шаблон дерева метрик

```markdown
# Дерево метрик: [Продукт]

## NSM: [Название] = [Формула]

### Level 1: Input Metrics

| Input Metric | Текущее значение | Цель | Owner |
|---|---|---|---|
| [Metric 1] | [X] | [Y] | [Команда] |
| [Metric 2] | [X] | [Y] | [Команда] |
| [Metric 3] | [X] | [Y] | [Команда] |

### Level 2: Drivers (для каждой Input Metric)

**[Metric 1]:**
| Driver | Текущее | Цель | Инициативы |
|---|---|---|---|
| [Driver 1.1] | [X] | [Y] | [Что делаем] |
| [Driver 1.2] | [X] | [Y] | [Что делаем] |
```

## Сопоставимость метрики во времени

Метрики вида «доля пользователей, сделавших X хотя бы раз» зависят от длины окна наблюдения: чем длиннее период, тем выше шанс, что пользователь хоть раз сделает X. Доля визитов (или событий) от длины окна не зависит.

**Следствие:** сравнение календарных месяцев по уникальным систематически занижает короткие периоды -- февраль (28 дней) и незакрытый текущий месяц.

| Как считать | Зависит от длины окна | Когда использовать |
|---|---|---|
| Доля уникальных пользователей за период | Да | Внутри периодов одинаковой длины |
| Доля визитов / событий за период | Нет | Сравнение периодов любой длины |
| Средняя дневная доля (среднее по дням периода) | Нет | Сравнение периодов разной длины |

**Правило:** ЕСЛИ сравниваешь периоды разной длины -> приводи метрику к дневной (средняя дневная доля) или считай по визитам/событиям; доли уникальных напрямую не сравнивай.

Масштаб эффекта: разрыв 2.51% против 2.36% по уникальным за месяц сжимается до 2.11% против 2.09% по средней дневной доле -- почти весь «разрыв» был артефактом длины окна.

## Guardrail-метрики

### Что такое guardrails

Метрики, которые мониторятся, чтобы оптимизация NSM не причинила вред. Guardrails -- ограничения, а не цели: они не должны расти, но не должны падать.

### Типичные guardrails

| Категория | Guardrail-метрика | Что защищает |
|---|---|---|
| Качество продукта | Crash rate, Error rate, Page load time | Техническую стабильность |
| Пользовательский опыт | Support tickets / DAU, NPS, CSAT | Удовлетворённость |
| Монетизация | Revenue per user, Refund rate | Финансовое здоровье |
| Удержание | D7 / D30 retention, Churn rate | Долгосрочную базу пользователей |
| Рост | CAC (Customer Acquisition Cost), LTV/CAC ratio | Устойчивость роста |
| Этика/качество контента | Spam rate, Report rate, False positive rate | Безопасность платформы |

### Правила работы с guardrails

1. **Определи пороги** -- для каждого guardrail: "красная зона" (stop + investigate) и "жёлтая зона" (watch closely)
2. **Мониторь автоматически** -- guardrails проверяются при каждом A/B-тесте и релизе
3. **Guardrail > NSM** -- если инициатива растит NSM, но роняет guardrail -- откатывай
4. **Ревизия раз в квартал** -- состав guardrails обновляется по мере развития продукта

### Шаблон guardrail-дашборда

| Guardrail | Порог (красный) | Порог (жёлтый) | Текущее | Статус |
|---|---|---|---|---|
| Crash rate | > 2% | > 1% | 0.3% | OK |
| P95 load time | > 5s | > 3s | 2.1s | OK |
| Support tickets/DAU | > 0.5% | > 0.3% | 0.25% | OK |
| D30 retention | < 15% | < 20% | 22% | OK |

## AARRR-фреймворк (Pirate Metrics)

### Что такое AARRR

Фреймворк для структурирования метрик продукта по стадиям жизненного цикла пользователя. Предложен Дейвом Мак-Клюром.

### Стадии AARRR

| Стадия | Вопрос | Ключевые метрики | Инструменты анализа |
|---|---|---|---|
| **A**cquisition | Откуда приходят пользователи? | Visitors, Sign-ups, CAC, Channel mix | Аналитика трафика, UTM |
| **A**ctivation | Получают ли они ценность? | Activation rate, Time to value, Onboarding CR | Воронки, когорты |
| **R**etention | Возвращаются ли? | D1/D7/D30 retention, DAU/MAU, Stickiness | Когортный анализ |
| **R**evenue | Платят ли? | ARPU, LTV, Conversion to paid, MRR | RFM, revenue metrics |
| **R**eferral | Приводят ли других? | Referral rate, Viral coefficient, NPS | Реферальная воронка |

### Процедура аудита по AARRR

#### Шаг 1: Заполнить таблицу текущего состояния

Для каждой стадии:

| Стадия | Primary Metric | Значение | Бенчмарк | Оценка |
|---|---|---|---|---|
| Acquisition | [Метрика] | [X] | [Y] | Good/Needs work/Critical |
| Activation | [Метрика] | [X] | [Y] | Good/Needs work/Critical |
| Retention | [Метрика] | [X] | [Y] | Good/Needs work/Critical |
| Revenue | [Метрика] | [X] | [Y] | Good/Needs work/Critical |
| Referral | [Метрика] | [X] | [Y] | Good/Needs work/Critical |

#### Шаг 2: Определить "узкое горлышко"

Стадия с оценкой Critical или с максимальным gap vs бенчмарк -- приоритет для оптимизации.

Правило приоритизации:
```
Retention > Activation > Acquisition > Revenue > Referral
```

**Почему Retention первый:** нет смысла привлекать новых, если текущие уходят. Retention -- фундамент.

#### Шаг 3: Для приоритетной стадии

- Построить воронку (если Activation/Acquisition) -> [funnel-analysis.md](funnel-analysis.md)
- Провести когортный анализ (если Retention) -> skill-cohort-analysis
- Сегментировать базу (если Revenue/Referral) -> [segmentation.md](segmentation.md)
- Сформулировать гипотезы и A/B-тесты -> skill-ab-test-analysis

### Связь AARRR с другими методами

| Стадия AARRR | Метод анализа | Скилл |
|---|---|---|
| Acquisition | Воронка привлечения | [funnel-analysis.md](funnel-analysis.md) |
| Activation | Воронка онбординга | [funnel-analysis.md](funnel-analysis.md) |
| Retention | Когортный анализ | skill-cohort-analysis |
| Revenue | RFM-сегментация | [segmentation.md](segmentation.md) |
| Referral | Реферальная воронка | [funnel-analysis.md](funnel-analysis.md) |
| Любая стадия (эксперимент) | A/B-тест | skill-ab-test-analysis |

## Примеры

### Пример 1: Дерево метрик для e-commerce

**Вход:** Онлайн-магазин одежды, NSM = Weekly Purchases.

**Результат:**
```
Weekly Purchases = Weekly Visitors * Browse-to-Cart Rate * Cart-to-Purchase Rate
├── Weekly Visitors (Marketing)
│   ├── Organic Search Traffic
│   ├── Paid Traffic
│   └── Referral Traffic
├── Browse-to-Cart Rate (Product/UX)
│   ├── Search Relevance
│   ├── Product Page Quality
│   └── Price Competitiveness
└── Cart-to-Purchase Rate (Checkout)
    ├── Checkout Completion Rate
    ├── Payment Success Rate
    └── Delivery Options Satisfaction
```

Guardrails: Refund rate < 5%, P95 load time < 3s, CSAT > 4.0.

### Пример 2: AARRR-аудит выявил retention как bottleneck

**Вход:** SaaS-продукт. Acquisition хорошая (10K sign-ups/month), Activation ок (40%), но D30 retention 8%.

**Результат:**
- Bottleneck: Retention (8% при бенчмарке 20-30% для категории).
- Acquisition и Activation в норме -- лить больше трафика бессмысленно.
- Следующий шаг: когортный анализ (skill-cohort-analysis) для диагностики кривой retention.
- Гипотеза: пользователи не находят повторной ценности после активации -- нужен анализ D2-D7 поведения.
