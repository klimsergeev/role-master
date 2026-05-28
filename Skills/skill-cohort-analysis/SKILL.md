---
name: skill-cohort-analysis
description: >
  Процедура когортного анализа продуктовых данных -- построение retention-таблиц,
  диагностика кривых удержания (healthy/declining/dying), поиск activation metric
  ("aha moment"), сравнение когорт по типам (acquisition, behavioral, segment).
  Включает формулы N-day и rolling retention, шаблон когортной таблицы,
  алгоритм activation analysis, формат продуктовых рекомендаций.
  Применяется продуктовыми аналитиками и product-менеджерами.
when_to_use: >
  Пользователь просит: провести когортный анализ, построить retention-таблицу,
  проанализировать удержание, найти activation metric, диагностировать retention
  curve, сравнить когорты, найти "aha moment", оценить product-market fit
  через retention. Примеры: "когортный анализ по месяцам регистрации",
  "почему retention падает на второй неделе", "какой activation metric
  у продукта", "сравни retention по каналам привлечения",
  "retention curve flattens or dies".
version: 1.0.0
created: 2026-05-28
---

# Cohort Analysis

## Назначение

Процедура когортного анализа: от выбора типа когорты до продуктовых рекомендаций. Применяется для диагностики удержания, поиска activation metric и отслеживания влияния продуктовых изменений.

## Принципы

1. **Когорта = группа + время** -- когорта без временного измерения бессмысленна; всегда фиксируй момент формирования группы
2. **Retention curve важнее точки** -- отдельное значение Day 7 retention мало что даёт, анализируй форму кривой целиком
3. **Dying curve = PMF-проблема** -- если кривая стремится к нулю, это не проблема привлечения, а отсутствие product-market fit
4. **Activation > Acquisition** -- поведение в первые 7 дней предсказывает долгосрочный retention лучше, чем канал привлечения
5. **Когорты должны быть сопоставимы** -- сравнивай когорты одного размера и возраста; когорта из 50 человек vs 5000 нерелевантна

## Таблица маршрутизации

> Читай только те файлы, которые нужны под задачу. Не загружай все сразу.

| Задача | Минимум | Добавить при необходимости |
|---|---|---|
| Выбрать тип когорты | [cohort-types.md](cohort-types.md) | -- |
| Построить retention-таблицу | [retention-metrics.md](retention-metrics.md) | [cohort-types.md](cohort-types.md) |
| Рассчитать retention-метрики | [retention-metrics.md](retention-metrics.md) | -- |
| Диагностировать retention curve | [curve-diagnosis.md](curve-diagnosis.md) | [retention-metrics.md](retention-metrics.md) |
| Найти activation metric | [curve-diagnosis.md](curve-diagnosis.md) | [cohort-types.md](cohort-types.md) |
| Полный когортный анализ с нуля | [cohort-types.md](cohort-types.md), [retention-metrics.md](retention-metrics.md), [curve-diagnosis.md](curve-diagnosis.md) | -- |
| Сравнить когорты по сегментам | [cohort-types.md](cohort-types.md), [retention-metrics.md](retention-metrics.md) | [curve-diagnosis.md](curve-diagnosis.md) |

## Рабочий процесс

### Шаг 1: Определить тип когорты

Уточнить у пользователя или определить по контексту, какой тип когорты нужен: acquisition (по дате регистрации), behavioral (по действию), segment (по атрибуту). Детали и критерии выбора -- в [cohort-types.md](cohort-types.md).

- ЕСЛИ пользователь не знает, какой тип выбрать -> предложить acquisition как базовый
- ЕСЛИ нужно найти activation metric -> использовать behavioral когорты

### Шаг 2: Выбрать retention-метрику

Определить подходящую метрику: N-day retention (для daily-use продуктов) или rolling retention (для weekly/monthly-use). Формулы и правила выбора -- в [retention-metrics.md](retention-metrics.md).

- ЕСЛИ продукт используется ежедневно (мессенджер, соцсеть) -> N-day retention
- ЕСЛИ продукт используется периодически (e-commerce, travel) -> rolling retention

### Шаг 3: Построить retention-таблицу

Заполнить таблицу по шаблону из [retention-metrics.md](retention-metrics.md). Строки -- когорты, столбцы -- временные периоды. Проверить:

- Все когорты имеют достаточный размер выборки (минимум 100 пользователей)
- Временные периоды соответствуют частоте использования продукта
- Week 0 / Day 0 = 100% для каждой когорты

### Шаг 4: Диагностировать retention curve

Определить форму кривой: healthy (выход на плато), declining (медленное падение), dying (стремится к нулю). Найти точку максимального drop-off. Детали диагностики -- в [curve-diagnosis.md](curve-diagnosis.md).

- ЕСЛИ кривая dying -> зафиксировать PMF-проблему, не рекомендовать увеличение привлечения
- ЕСЛИ кривая declining -> искать точку перелома и причину

### Шаг 5: Провести activation analysis

Сравнить поведение retained vs churned пользователей в первые 7 дней. Найти действия-кандидаты на activation metric. Алгоритм -- в [curve-diagnosis.md](curve-diagnosis.md).

- ЕСЛИ данные о поведении недоступны -> пропустить шаг, зафиксировать в рекомендациях как требующий дополнительных данных
- ЕСЛИ несколько кандидатов -> ранжировать по разнице retention (retained vs churned)

### Шаг 6: Сформулировать рекомендации

Собрать финальный отчёт. Формат рекомендаций -- в [curve-diagnosis.md](curve-diagnosis.md). Обязательные компоненты:

1. Retention-таблица (из Шага 3)
2. Диагноз кривой (из Шага 4)
3. Ключевые точки drop-off с таймингом
4. Activation metric (из Шага 5, если доступен)
5. Продуктовые рекомендации, ранжированные по ожидаемому влиянию на retention

## Что НЕ делать

- Не делать выводы по одной точке retention (Day 7 = 25%) без анализа формы всей кривой
- Не сравнивать когорты разного возраста -- когорта 2 недели назад ещё не "прожила" Week 8
- Не рекомендовать "больше трафика" при dying retention curve -- это PMF-проблема
- Не использовать когорты меньше 100 пользователей для статистически значимых выводов
- Не путать N-day и rolling retention -- они дают разные числа для одних данных
- Не загружать все файлы скилла сразу -- использовать таблицу маршрутизации

## Примеры

### Пример 1: Стандартный когортный анализ по месяцам регистрации

**Запрос:** "Проведи когортный анализ retention по месяцам регистрации за последние 6 месяцев"

**Маршрут:** [cohort-types.md](cohort-types.md), [retention-metrics.md](retention-metrics.md), [curve-diagnosis.md](curve-diagnosis.md)

**Результат:** Acquisition когорты (Jan--Jun). N-day retention таблица (Day 1, 7, 14, 30). Диагноз кривой: healthy -- выход на плато ~18% к Day 30. Тренд: Feb--Jun когорты улучшаются на 2-3 п.п. -> продуктовые изменения работают. Рекомендация: фокус на Day 1->Day 7 drop-off (потеря 55% пользователей).

### Пример 2: Поиск activation metric при падающем retention

**Запрос:** "Retention падает до нуля к 8-й неделе. Что делать?"

**Маршрут:** [curve-diagnosis.md](curve-diagnosis.md), [cohort-types.md](cohort-types.md)

**Результат:** Диагноз: dying curve, PMF-проблема. Activation analysis: пользователи, создавшие первый проект в течение 3 дней, имеют 4x лучший Week 8 retention (32% vs 8%). Кандидат activation metric: "создание первого проекта в первые 3 дня". Рекомендации: (1) упростить создание проекта в onboarding, (2) НЕ увеличивать привлечение до стабилизации retention, (3) провести качественное исследование -- почему 70% не создают проект.

### Пример 3: Сравнение сегментов

**Запрос:** "Какой канал привлечения даёт лучший retention?"

**Маршрут:** [cohort-types.md](cohort-types.md), [retention-metrics.md](retention-metrics.md)

**Результат:** Segment когорты по каналам (organic, paid, referral). Rolling retention таблица (Week 1--8). Referral: плато на 35%. Organic: плато на 22%. Paid: declining, Week 8 = 8%. Рекомендация: перераспределить бюджет с paid на referral-программу; для paid -- проверить, не привлекаются ли нецелевые пользователи.
