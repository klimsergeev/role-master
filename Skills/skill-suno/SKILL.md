---
name: skill-suno
description: >
  Генерация ready-to-paste промптов для Suno AI (AI-генерация музыки) и полный
  workflow от идеи до финального трека. По описанию пользователя создаёт три поля
  Suno Custom Mode: Style (жанр, темп, инструменты, вокал, продакшн, настроение),
  Lyrics (текст с метатегами структуры и параметризованными секциями), Title.
  Валидирует лимиты символов, проверяет конфликтные дескрипторы, подбирает
  надёжные метатеги, учитывает версию модели (V4.5-All / V5.5) и язык текста
  (включая русский). Покрывает Extend, Song Editor, Covers, Remixes, Album art.
when_to_use: >
  Suno, промпт для Suno, AI music, нейросеть музыка, сделай песню, напиши трек,
  генерация трека, Style prompt, Lyrics metatags, suno prompt, music generation,
  создать песню через ИИ, extend трек, обложка для трека, album art suno,
  аккорды в Suno, chord progression, задать тональность, прогрессия аккордов, гармония трека.
  Примеры: "сгенерируй промпт для Suno", "напиши песню в стиле инди-фолк",
  "создай трек для рекламного ролика", "помоги с промптом для Suno",
  "сделай промпт для песни на русском языке", "как продлить трек в Suno".
version: 1.1.1
created: 2026-06-10
---

# Suno AI

## Назначение

Процедурный скилл с полным workflow генерации музыки в Suno AI: от идеи до финального трека. Основная задача — генерация готовых промптов (Style + Lyrics + Title) для copy-paste в интерфейс Suno. Дополнительно покрывает Extend, Song Editor, Covers, Remixes, Album art и итерационный процесс доведения трека.

## Принципы

- **Custom Mode по умолчанию.** Simple Mode (одно поле, 500 символов) — только для разведки. Все промпты генерируются для Custom Mode с раздельными полями Style / Lyrics / Title
- **Английский для управления, язык текста — по запросу.** Поле Style и метатеги — всегда на английском. Текст песни — на языке пользователя. Для русского языка — особые правила в [lyrics-formatting.md](lyrics-formatting.md)
- **Валидация перед выдачей.** Каждый промпт проверяется на: лимиты символов, запрещённые конструкции (скобки в Style, lyrical contamination), конфликтные пары дескрипторов, надёжность метатегов
- **Недетерминированность — норма.** Даже идеальный промпт даёт ~90% попаданий (оценка сообщества). Нормальный workflow — итерация + Song Editor, а не одна генерация. Предупреждать пользователя об этом
- **Компактность выигрывает.** Style: 100-300 символов (при лимите 1000). Lyrics: 2000-3500 символов (при лимите 5000). Перегруженный промпт даёт «мутный компромисс»

## Таблица маршрутизации

> Читай только те файлы, которые нужны под задачу. Не загружай все сразу.

| Задача | Минимум | Добавить при необходимости |
|---|---|---|
| Сгенерировать промпт для нового трека | [style-reference.md](style-reference.md), [metatags-reference.md](metatags-reference.md) | [lyrics-formatting.md](lyrics-formatting.md), [genre-vocabulary.md](genre-vocabulary.md) |
| Написать текст песни с метатегами | [metatags-reference.md](metatags-reference.md), [lyrics-formatting.md](lyrics-formatting.md) | [genre-vocabulary.md](genre-vocabulary.md) |
| Подобрать стиль / жанр | [style-reference.md](style-reference.md), [genre-vocabulary.md](genre-vocabulary.md) | — |
| Песня на русском языке | [style-reference.md](style-reference.md), [metatags-reference.md](metatags-reference.md), [lyrics-formatting.md](lyrics-formatting.md) | [genre-vocabulary.md](genre-vocabulary.md) |
| Продлить / доработать трек (Extend, Song Editor) | [platform-workflow.md](platform-workflow.md) | [metatags-reference.md](metatags-reference.md) |
| Cover / Remix / Add Vocals | [platform-workflow.md](platform-workflow.md) | [style-reference.md](style-reference.md) |
| Сгенерировать обложку (Album art) | [platform-workflow.md](platform-workflow.md) | — |
| Узнать о тарифах / кредитах / возможностях | [platform-workflow.md](platform-workflow.md) | — |
| Задать тональность / направление гармонии (текстом) | [style-reference.md](style-reference.md) | [metatags-reference.md](metatags-reference.md) |
| Задать конкретную гармонию / точные аккорды | [platform-workflow.md](platform-workflow.md) (аудио-референс, не текстовый тег) | [style-reference.md](style-reference.md) |
| Описать голос по аудиозаписи | [voice-analysis.md](voice-analysis.md) | [style-reference.md](style-reference.md) |
| Вариации промпта (Conservative / Balanced / Experimental) | [style-reference.md](style-reference.md), [metatags-reference.md](metatags-reference.md) | [genre-vocabulary.md](genre-vocabulary.md) |

## Рабочий процесс

### Шаг: Определить задачу

Выяснить у пользователя:

- **Тип задачи:** новый трек, extend существующего, cover/remix, album art
- **Описание:** жанр, настроение, назначение (реклама, фон, песня, джингл)
- **Язык текста:** английский (по умолчанию) или другой (русский и др.)
- **Версия/тариф:** Free (V4.5-All) или Pro/Premier (V5.5) — влияет на доступные фичи (Exclude Styles, Voices, Studio)
- **Вокал или инструментал:** если инструментал — отдельная процедура (тумблер Instrumental + Exclude)

**Язык текста — ОБЯЗАТЕЛЬНЫЙ вопрос.** Всегда уточняй язык перед генерацией, даже если всё остальное понятно. Исключение: пользователь явно указал язык в запросе (например, «песня на русском», «english lyrics») или написал текст/описание на целевом языке.

ЕСЛИ пользователь описал задачу достаточно (жанр + настроение или конкретное описание) И язык известен -> переходить к генерации без лишних вопросов.
ЕСЛИ пользователь описал задачу достаточно, НО язык не указан -> уточнить язык текста, затем переходить к генерации.
ЕСЛИ описание слишком абстрактно («сделай песню») -> уточнить жанр, настроение и язык текста.

### Шаг: Сгенерировать промпт

**Style** — по формуле и правилам из [style-reference.md](style-reference.md):
- Формула: `Genre, Subgenre, Tempo/Energy, Key Instruments, Vocal Style, Production Quality, Mood`
- Жанр первым (позиционное взвешивание)
- 4-7 дескрипторов через запятые
- Без скобок, без описательных предложений, без имён артистов; допустимы структурные метки (`Lead vocalist:`, `Chorus:`)
- Тональность (если важна) — рядом с жанром: `A minor key, melancholic` (слово `key` помогает трактовать как тональность, не аккорд). Задаёт лад/направление; точную гармонию текстом не задать — только аудио-референс (см. [platform-workflow.md](platform-workflow.md))
- Проверить на конфликтные пары

**Lyrics** — текст + метатеги по [metatags-reference.md](metatags-reference.md) и [lyrics-formatting.md](lyrics-formatting.md):
- Метатеги на английском, на отдельных строках перед секцией
- Использовать надёжные теги ([Chorus], [Verse], [Bridge])
- Для ненадёжных — замены ([Short Instrumental Intro] вместо [Intro])
- Параметризация для по-секционного контроля: `[Verse: whispered vocals, acoustic guitar only]`
- Завершать `[Outro]`/`[Big Finish]`/`[End]` — иначе трек рвётся или тянется
- ЕСЛИ язык текста русский -> ОБЯЗАТЕЛЬНО после написания текста пройтись по нему и разметить ударения (U+0301) на рискованных словах — сленг, имена, омографы — по правилам из [lyrics-formatting.md](lyrics-formatting.md). Это часть стандартного workflow для русского языка, а не опция; не ждать напоминания пользователя

**Title** — краткое название, 30-60 символов. На звук почти не влияет.

### Шаг: Валидировать промпт

Перед выдачей — обязательная проверка:

| Проверка | Правило | Действие при нарушении |
|---|---|---|
| Длина Style | <= 1000 символов (оптимум 100-300) | Сократить, убрать наименее важные дескрипторы |
| Длина Lyrics | <= 5000 символов (оптимум 2000-3500) | Сократить текст, убрать лишние куплеты (макс. 3) |
| Длина Title | <= 80 символов | Сократить |
| Скобки в Style | Запрещены `[]` | Убрать, перенести в Lyrics как метатеги |
| Lyrical contamination | Производственные указания вне `[]` в Lyrics | Обернуть в метатеги или убрать |
| Конфликтные пары | См. [style-reference.md](style-reference.md) | Убрать один из конфликтующих дескрипторов |
| Надёжность метатегов | См. матрицу в [metatags-reference.md](metatags-reference.md) | Заменить ненадёжные на проверенные аналоги |
| Кириллица в метатегах | Нет кириллицы внутри `[]` (regex: `\[[^\]]*[а-яА-ЯёЁ][^\]]*\]`) | Перевести содержимое тега на английский |
| Ударения (русский текст) | Рискованные слова размечены (U+0301) | Пройтись по тексту, разметить сленг, имена, омографы |
| Количество куплетов | Макс. 3 (при 4-5 модель пропускает часть) | Сократить |

### Шаг: Рекомендовать параметры

На основе задачи предложить настройки слайдеров:

| Параметр | Коммерческое / фоновое | Авторское / экспериментальное |
|---|---|---|
| Weirdness | Low (Safe) | Medium-High (к Chaos) |
| Style Influence | Strong | Loose-Medium |
| Exclude Styles | Убрать нежелательное (до 5 пунктов) | Минимум исключений |

ЕСЛИ тариф Free -> слайдеры и Exclude Styles недоступны, не упоминать.
ЕСЛИ инструментал -> рекомендовать тумблер Instrumental + «vocals» в Exclude Styles (Pro/Premier) или «no vocals, instrumental» в Style (Free).

### Шаг: Выдать результат

По умолчанию — одна вариация (Balanced). ЕСЛИ пользователь запросил вариации -> генерировать три:

| Вариация | Style | Lyrics | Weirdness |
|---|---|---|---|
| Conservative | Точный жанр, стандартные инструменты, проверенная структура | Только надёжные теги, классическая структура Verse-Chorus-Verse-Chorus-Bridge-Chorus | Low |
| Balanced | Жанр + 1-2 неожиданных дескриптора | Надёжные + средние теги, параметризованные секции | Medium |
| Experimental | Жанровый гибрид, нестандартные инструменты | Расширенные теги, нестандартная структура, звуковые эффекты | High |

### Шаг: Итерировать после прослушивания

После того как пользователь послушал результат в Suno:

- ЕСЛИ «почти хорошо, но одна секция плохая» -> рекомендовать Song Editor (inpainting), детали в [platform-workflow.md](platform-workflow.md)
- ЕСЛИ «трек короткий, нужно длиннее» -> рекомендовать Extend, детали в [platform-workflow.md](platform-workflow.md)
- ЕСЛИ «звук не тот» -> скорректировать Style (дескрипторы, порядок, конфликты)
- ЕСЛИ «структура/текст не тот» -> скорректировать Lyrics (метатеги, параметризация)
- ЕСЛИ «хочу этот стиль, но другую мелодию/аранжировку» -> Cover или Remix, детали в [platform-workflow.md](platform-workflow.md)
- ЕСЛИ «нужна обложка» -> промпт для Album art, детали в [platform-workflow.md](platform-workflow.md)

**Предупреждение о «качелях»:** модель легко перелетает цель (шансон → блатняк → поп-панк). Менять **1-2 дескриптора за итерацию**, иначе непонятно, что сработало.

**Ручки подстройки:** к каждой версии промпта прикладывать ручки в обе стороны («слишком X → замени A на B; слишком Y → замени C на D»), чтобы пользователь мог корректировать сам без повторного обращения.

## Формат выдачи

```
**Title:**
[готовый текст]

**Style:**
[готовый текст]

**Exclude Styles:** (если Pro/Premier)
[список через запятые]

**Lyrics:**
[готовый текст]

**Параметры:** (если Pro/Premier)
- Weirdness: [рекомендация]
- Style Influence: [рекомендация]
- Vocal Gender: [если применимо]

**Ручки подстройки:** (если итерация)
- Слишком [X] → замени [A] на [B]
- Слишком [Y] → замени [C] на [D]

---
Символов: Style [N]/1000 | Lyrics [N]/5000 | Title [N]/100
Модель: [V4.5-All / V5.5]
```

ЕСЛИ пользователь на Free-тарифе -> секции «Exclude Styles» и «Параметры» не выводить.
ЕСЛИ инструментал -> добавить пометку «Включите тумблер Instrumental в интерфейсе Suno».
ЕСЛИ был анализ голоса -> добавить секцию «Голос вокалиста» с дескрипторами и пометкой из какой метрики получены.
Опциональные вставки (бонус-куплеты) помечать: куда вставлять + условие («если трек >3:30 — замени, а не добавляй»).

## Что НЕ делать

- НЕ использовать квадратные скобки `[]` в поле Style — они вызывают артефакты; скобки только в Lyrics
- НЕ ставить имена реальных артистов в Style — ненадёжно и фильтруется; заменять описанием стиля
- НЕ писать описательные предложения в Style — допустимы структурные метки (`Lead vocalist:`, `Chorus:`)
- НЕ оставлять производственные указания в Lyrics вне метатегов — модель споёт их как текст (lyrical contamination)
- НЕ генерировать более 3 куплетов — модель пропускает 4-й и 5-й
- НЕ использовать метатеги на русском/другом языке — только английский
- НЕ генерировать русскоязычный текст без разметки ударений на рискованных словах — это обязательный шаг, а не опция
- НЕ обещать точный результат — Suno недетерминирован, предупреждать пользователя
- НЕ забывать завершающий тег ([Outro], [Big Finish], [End]) — без него трек рвётся или тянется до лимита
- НЕ выдавать промпт без подсчёта символов — всегда указывать длину Style и Lyrics
- НЕ рекомендовать слайдеры и Exclude Styles пользователям Free-тарифа — эти фичи недоступны
- НЕ использовать технические термины сведения в Style (sidechain compression, EQ) — модель их игнорирует
- НЕ ставить конфликтные пары дескрипторов (Very Slow + High Energy, Minimal + Orchestral и др.)
- НЕ ставить буквенные аккорды в Lyrics вне `[]` — модель споёт их как текст (lyrical contamination)
- НЕ обещать точное следование текстовой прогрессии аккордов — текст задаёт направление, не конкретные аккорды/инверсии. Для точной гармонии — только аудио-референс с высоким Audio Influence (75–90%, оценка комьюнити)

## Примеры

### Пример: Инди-фолк трек на английском (типовой сценарий)

**Запрос:** "Сделай промпт для Suno: мечтательная инди-фолк песня о дороге, женский вокал, акустика"

**Маршрут:** [style-reference.md](style-reference.md), [metatags-reference.md](metatags-reference.md)

**Результат:**

```
**Title:**
Open Roads

**Style:**
Indie folk, mid-tempo, acoustic guitar and mandolin. Lead vocalist: warm female vocals, breathy. Lo-fi production, dreamy and wistful

**Exclude Styles:**
electronic, synth, drum machine

**Lyrics:**
[Short Instrumental Intro]

[Verse 1]
Gravel roads beneath my worn-out shoes
Morning light is painting golden hues
Every mile I leave a piece behind
Every turn reveals a different kind

[Chorus]
Take me where the rivers slowly bend
Where the sky and rolling hills descend
I am moving, I am finally free
Every road is calling out to me

[Verse 2]
Campfire smoke and stories left untold
Strangers sharing warmth against the cold
Nothing but the wind to guide my way
Nothing but the dawn of one more day

[Chorus]
Take me where the rivers slowly bend
Where the sky and rolling hills descend
I am moving, I am finally free
Every road is calling out to me

[Bridge: stripped down, fingerpicking only, vulnerable vocals]
Maybe home is not a place at all...
Maybe home is just the open call...

[Chorus: full band, soaring vocals]
Take me where the rivers slowly bend
Where the sky and rolling hills descend
I am moving, I am finally free
Every road is calling out to me

[Big Finish]

**Параметры:**
- Weirdness: Low
- Style Influence: Strong

**Ручки подстройки:**
- Слишком «бардовское» → убери fingerpicking, добавь full strumming
- Слишком «попсовое» → замени polished на lo-fi, убери drum machine из Exclude

---
Символов: Style 121/1000 | Lyrics 867/5000 | Title 10/100
Модель: V5.5
```

### Пример: Русскоязычная поп-песня (edge-case: русский язык)

**Запрос:** "Нужен промпт для весёлой поп-песни на русском, мужской вокал, для TikTok"

**Маршрут:** [style-reference.md](style-reference.md), [metatags-reference.md](metatags-reference.md), [lyrics-formatting.md](lyrics-formatting.md)

**Результат:**

```
**Title:**
Танцуй

**Style:**
Pop, upbeat, synth-driven, catchy hooks, polished production, fun and playful. Lead vocalist: energetic male vocals, youthful

**Exclude Styles:**
rock, acoustic, ballad

**Lyrics:**
[Short Instrumental Intro]

[Verse 1]
Утро начинается с улыбки
Кофе, солнце, музыка в наушниках
Город просыпается, и мне не до ошибки
Этот день как будто создан в лучших снах

[Pre-Chorus]
Три, два, один — и поехали!

[Chorus: full energy, catchy melody]
Танцуй, не думай ни о чём!
Мы зажигаем этот дом!
Пускай весь мир подождёт —
Сегодня наш черёд!

[Verse 2]
Телефон звонит, но я не отвечаю
Этот ритм ведёт меня вперёд
Каждый шаг как будто я летаю
Каждый миг — невероятный поворот

[Pre-Chorus]
Три, два, один — и поехали!

[Chorus: full energy, catchy melody]
Танцуй, не думай ни о чём!
Мы зажигаем этот дом!
Пускай весь мир подождёт —
Сегодня наш черёд!

[Bridge: stripped down, claps only]
О-о-о, о-о-о
(Танцуй!)
О-о-о, о-о-о

[Chorus: maximum energy, layered vocals]
Танцуй, не думай ни о чём!
Мы зажигаем этот дом!
Пускай весь мир подождёт —
Сегодня наш черёд!

[End]

**Параметры:**
- Weirdness: Low
- Style Influence: Strong
- Vocal Gender: Male

**Ручки подстройки:**
- Слишком «детское» → замени youthful на mature and confident
- Слишком «электронное» → замени synth-driven на live band, добавь acoustic drums

---
Символов: Style 104/1000 | Lyrics 815/5000 | Title 7/100
Модель: V5.5
Язык: русский (метатеги на английском, текст на русском)
```

**Особенности русскоязычного промпта:**
- Style и метатеги — на английском
- Текст песни — на русском
- Вокализации (О-о-о) помогают модели с мелодией
- Скобки `(Танцуй!)` — бэк-вокал
- Строки выровнены по слоговой длине внутри секций

### Пример: Инструментал для видео (edge-case: без вокала)

**Запрос:** "Фоновая музыка для YouTube-видео, спокойная электроника, без вокала, у меня бесплатный тариф"

**Маршрут:** [style-reference.md](style-reference.md), [metatags-reference.md](metatags-reference.md), [platform-workflow.md](platform-workflow.md)

**Результат:**

```
**Title:**
Quiet Signals

**Style:**
Ambient electronic, slow tempo, soft synth pads, gentle piano, no vocals, instrumental, calm and meditative, lo-fi production

**Lyrics:**
[Short Instrumental Intro]

[Verse 1]
...

[Chorus]
!! . !! . ! . !! .

[Verse 2]
...

[Bridge: minimal, piano only]
...

[Chorus]
!! . !! . ! . !! .

[Big Finish]

---
Символов: Style 101/1000 | Lyrics 152/5000 | Title 14/100
Модель: V4.5-All (Free)
Включите тумблер Instrumental в интерфейсе Suno.
```

**Особенности инструментального промпта:**
- «no vocals, instrumental» в Style — для Free-тарифа (Exclude Styles недоступен)
- Тумблер Instrumental — главный механизм, Style подкрепляет
- Многоточия (`...`) в инструментальных секциях — контролируемая импровизация
- Восклицания и точки (`!! . !! .`) — ритмический паттерн для модели
- Секции «Exclude Styles» и «Параметры» не выводятся — Free-тариф
