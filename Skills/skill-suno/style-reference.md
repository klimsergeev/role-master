# Style Reference

## Назначение

Справочник по полю Style в Suno AI: формула построения, правила, дескрипторы, конфликтные пары, негативный промптинг. Все данные для построения и валидации Style-промпта.

## Лимиты поля Style

| Параметр | Значение |
|---|---|
| Жёсткий лимит | 1000 символов |
| Оптимум (консенсус сообщества) | 100-300 символов |
| Количество дескрипторов | 4-7 штук |
| Менее 4 дескрипторов | Модель «заливает» дефолтами |
| Более 7-10 дескрипторов | Конфликтуют, «мутный компромисс» |
| Текст сверх лимита | Обрезается молча — критичные дескрипторы ставить в начало |

> **Источники:** Blake Crosley, HookGenius, MusicSmith, gist jsadeli, smithery suno-song — кросс-подтверждено 5+ источниками. На старых моделях (V4 и ниже) Style обрезался до ~200 символов — отсюда расхождения в старых руководствах.

## Формула Style

Основная формула (кросс-подтверждённая):

```
Genre, Subgenre, Tempo/Energy, Key Instruments, Vocal Style, Production Quality, Mood
```

Альтернативная формула GMIV (более краткая):

```
Genre, Mood, Instruments, Vocals
```

Русскоязычная схема (из Habr):

```
жанр, настроение, язык, тип вокала, темп, инструменты, назначение, характер припева
```

Все формулы сводятся к одному: **жанр первым, затем по убыванию важности**.

## Позиционное взвешивание

Первый дескриптор влияет сильнее остальных. По оценкам сообщества — до 30-60% веса приходится на первый тег (источники расходятся в точных цифрах, но единогласны в принципе: порядок имеет значение).

**Правило:** жанр — всегда первый дескриптор. Далее — по убыванию важности для конкретного запроса.

**Пример влияния порядка:**

| Style | Результат |
|---|---|
| `Jazz, electronic elements, smooth` | Джазовый трек с электронными вставками |
| `Electronic, jazz influences, smooth` | Электронный трек с джазовым оттенком |

## Правила поля Style

### Обязательные

- Только ключевые слова через запятые — без предложений, без слов-наполнителей
- Квадратные скобки `[]` запрещены — вызывают артефакты/игнор; скобки только в Lyrics
- Жанр — первый дескриптор
- BPM как цифра (`128 BPM`) работает лучше слов (`fast-paced`), но воспринимается как ориентир, не метроном
- Style и метатеги — всегда на английском, даже если текст песни на другом языке

### Запрещённые приёмы

| Приём | Почему плохо | Замена |
|---|---|---|
| Имена артистов (`like Adele`) | Ненадёжно, фильтруется | Описание стиля: `powerful female vocal, piano-driven pop ballad` |
| Предложения (`a song that sounds like...`) | Модель ожидает ключевые слова | Ключевые слова через запятые |
| Квадратные скобки (`[rock]`) | Артефакты в генерации | Без скобок: `rock` |
| Технические термины сведения (`sidechain compression`, `EQ boost`) | Модель игнорирует | Описание результата: `punchy bass, crisp highs` |
| Негации без поддержки (`no drums` на V3/V4) | Работает только с v4.5+ | На старых моделях — Exclude Styles или тумблер |

## Конфликтные пары дескрипторов

ЕСЛИ два дескриптора из одной пары присутствуют в Style -> убрать один, оставить более важный для задачи.

| Дескриптор A | Дескриптор B | Почему конфликт |
|---|---|---|
| Very Slow | High Energy | Противоречие темпа и энергии |
| Minimal | Orchestral | Минимализм vs максимум инструментов |
| Acoustic | Heavy Electronic | Физический звук vs синтетический |
| Lo-fi | Crystal Clear Production | Грязь vs чистота |
| Whisper vocals | Powerful belt | Тихий vs громкий вокал |
| Gentle / Soft | Aggressive / Intense | Мягкость vs агрессия |

## Негативный промптинг

### Exclude Styles (Pro/Premier)

Выделенное поле в Advanced Options. Исключает инструменты, стили, тип вокала.

- До ~5 исключений — дальше выход «худеет»
- Формат: ключевые слова (отображаются с префиксом `-`, например `-piano`)
- Исключения — «руководство, не запрет»: модель учитывает, но не гарантирует

**Паттерны использования:**

| Задача | Exclude Styles |
|---|---|
| Убрать пианино | `piano` |
| Чистый инструментал | `vocals` (+ тумблер Instrumental) |
| Женский вокал без мужского | `male vocals` |
| Убрать электронику | `synth, electronic, EDM` |

### Негации в Style (`no X`)

Работают с v4.5+, но Exclude Styles надёжнее. Для Free-тарифа (без Exclude) — единственный вариант.

**Пример:** `Indie rock, mid-tempo, no piano, no synth, raw guitar, raspy male vocals`

### Инструментал

Для чистого инструментала — комбинация:
- Тумблер Instrumental в интерфейсе (главный механизм)
- `no vocals, instrumental` в Style (подкрепление)
- `vocals` в Exclude Styles (Pro/Premier, дополнительная гарантия)

## Слайдеры

> **Caveat:** Suno не публикует числовые шкалы слайдеров. Рекомендации ниже — на основе наблюдений сообщества.

### Weirdness (Safe <-> Chaos)

| Значение | Когда использовать |
|---|---|
| Low (Safe) | Коммерческая музыка, фоновая, джинглы, стандартные жанры |
| Medium | Авторские треки, лёгкие эксперименты |
| High (Chaos) | Жанровые гибриды, авангард, экспериментальная музыка |

### Style Influence (Loose <-> Strong)

| Значение | Когда использовать |
|---|---|
| Strong | Точный промпт, знаешь чего хочешь |
| Medium | Промпт задаёт направление, детали на усмотрение модели |
| Loose | Нужен сюрприз, промпт как намёк |

### Audio Influence

Степень влияния загруженного референс-аудио. Актуально для Covers, Remixes, Add Vocals/Instrumentals.

## Примеры Style-промптов

### Pop

```
Synth-pop, upbeat, 120 BPM, catchy synth hooks, bright female vocals, polished production, fun and carefree
```

### Rock

```
Alternative rock, mid-tempo, distorted electric guitar and driving drums, raspy male vocals, raw production, melancholic and defiant
```

### Hip-Hop

```
Trap, aggressive, 140 BPM, heavy 808 bass, hi-hats, confident male rap, dark and intense
```

### Инди-фолк

```
Indie folk, slow tempo, acoustic guitar and banjo, warm female vocals, lo-fi production, intimate and nostalgic
```

### Электроника

```
Deep house, groovy, 122 BPM, warm synth pads, deep bass, no vocals, instrumental, hypnotic and atmospheric
```

### Джаз

```
Smooth jazz, relaxed, saxophone and upright bass, sultry female vocals, warm production, late-night mood
```

### Русский рок

```
Russian rock, mid-tempo, electric guitar and bass, gritty male vocals, raw production, emotional and sincere
```

> Для русского рока текст в Lyrics — на русском, Style и метатеги — на английском. Подробнее — в [lyrics-formatting.md](lyrics-formatting.md).

### Кинематографический инструментал

```
Cinematic orchestral, epic, slow build, strings and brass, no vocals, powerful drums, grand and heroic
```

### Колыбельная

```
Lullaby, very slow, gentle acoustic guitar, soft female vocals, minimal production, warm and soothing
```
