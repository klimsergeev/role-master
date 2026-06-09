# Genre Vocabulary

## Назначение

Словарь жанров, поджанров и вокальных дескрипторов для поля Style в Suno AI. Надёжность жанров, рекомендации по поджанрам, стек вокальных дескрипторов.

> **Caveat:** Надёжность жанров — оценки на основе наблюдений сообщества (Blake Crosley, Habr, DTF). Причина неравномерности — перекос обучающих данных (~86% жанров Глобального Севера, по оценке сообщества). Чем популярнее жанр в западной музыке, тем надёжнее генерация.

## Жанры по надёжности

### Высокая надёжность

Эти жанры модель генерирует стабильно и качественно.

| Жанр | Ключевые дескрипторы для Style | Характерные инструменты |
|---|---|---|
| **Pop** | pop, synth-pop, dance-pop, indie pop, dream pop, electropop | synth, piano, drum machine, bass |
| **Rock** | rock, alternative rock, indie rock, classic rock, punk rock, garage rock, post-punk | electric guitar, bass, drums, distortion |
| **Hip-Hop / Trap** | hip-hop, trap, boom-bap, lo-fi hip-hop, drill, conscious rap | 808 bass, hi-hats, samples, synth |
| **EDM** | EDM, house, deep house, techno, trance, dubstep, drum and bass | synth, bass, drum machine, pads |
| **R&B** | R&B, neo-soul, contemporary R&B, slow jam | keys, bass, smooth drums, synth pads |
| **Country** | country, americana, country rock, honky-tonk, bluegrass | acoustic guitar, banjo, fiddle, steel guitar, mandolin |
| **Folk** | folk, indie folk, folk rock, acoustic folk, singer-songwriter | acoustic guitar, banjo, harmonica, mandolin |
| **Jazz** | jazz, smooth jazz, bebop, swing, jazz fusion, bossa nova | saxophone, trumpet, upright bass, piano, brushed drums |

### Средняя надёжность

Модель справляется, но с оговорками.

| Жанр | Ключевые дескрипторы для Style | Известные проблемы |
|---|---|---|
| **Metal** | metal, heavy metal, death metal, black metal, metalcore, thrash metal | Экстрим-вокал нестабилен (growl, scream). Лучше с модификатором: `aggressive male vocals, guttural` |
| **Classical** | classical, orchestral, chamber music, baroque, romantic era | Слабый контрапункт. Работает для простых оркестровых аранжировок, не для сложных классических форм |
| **Latin** | latin, reggaeton, salsa, bachata, cumbia, bossa nova | Ритмические паттерны иногда упрощаются |
| **Afrobeats** | afrobeats, afro-pop, afro-fusion, highlife | Может тяготеть к западным интерпретациям |
| **K-Pop / J-Pop** | K-pop, J-pop, city pop, anime soundtrack | Корейский и японский язык хорошо, но стилистические нюансы упрощаются |
| **Reggae / Ska** | reggae, ska, dub, dancehall | Офф-бит гитара иногда нестабильна |
| **Blues** | blues, delta blues, electric blues, blues rock | Хорошо для стандартного блюза, сложнее с нюансами |
| **Gospel** | gospel, contemporary gospel, worship, spiritual | Хоровые партии иногда упрощаются |
| **Funk** | funk, disco, boogie, electro-funk | Грув иногда «прямолинеен» |

### Низкая надёжность

Результат непредсказуем — предупреждать пользователя.

| Жанр | Проблема |
|---|---|
| **Авангард** (avant-garde, noise, experimental, musique concrete) | Модель тяготеет к конвенциональным структурам |
| **Незападный фолк** (gamelan, raga, throat singing, flamenco puro) | Недостаток обучающих данных для аутентичного звучания |
| **Саунд-дизайн** (sound design, foley, ambience) | Модель оптимизирована для музыки, не для звукового дизайна |
| **Микротональная музыка** | Стандартная темперация |
| **Аутентичный фри-джаз** | Модель структурирует то, что должно быть бесструктурным |

## Поджанры и модификаторы

### Модификаторы темпа/энергии

| Дескриптор | BPM (ориентир) | Характер |
|---|---|---|
| very slow, ballad | 50-70 | Медитативный, интимный |
| slow, laid-back | 70-90 | Расслабленный, спокойный |
| mid-tempo, moderate | 90-120 | Уверенный, стабильный |
| upbeat, energetic | 120-140 | Бодрый, танцевальный |
| fast, driving | 140-170 | Агрессивный, напористый |
| very fast, frantic | 170+ | Хаотичный, интенсивный |

> BPM как цифра (`128 BPM`) в Style работает лучше слов, но воспринимается как ориентир, не метроном.

### Модификаторы продакшна

| Дескриптор | Описание |
|---|---|
| polished production | Чистый, профессиональный звук |
| raw production | Необработанный, «живой» |
| lo-fi production | Намеренно «грязный», тёплый |
| analog production | Аналоговое звучание, tape warmth |
| minimal production | Минимум обработки и инструментов |
| lush production | Богатый, многослойный звук |
| vintage production | Ретро-звучание определённой эпохи |
| atmospheric production | Пространственный, эмбиентный |

### Модификаторы настроения

| Категория | Дескрипторы |
|---|---|
| Позитивные | fun, playful, joyful, euphoric, uplifting, hopeful, warm, carefree |
| Негативные | melancholic, dark, somber, haunting, ominous, brooding, lonely |
| Нейтральные | dreamy, nostalgic, atmospheric, hypnotic, meditative, ethereal |
| Энергичные | powerful, epic, triumphant, anthemic, defiant, aggressive, intense |
| Интимные | intimate, vulnerable, tender, wistful, bittersweet, sincere |

## Вокальные дескрипторы

Стек из **2-3 дескрипторов** — оптимум. Больше — конфликтуют.

### Пол

| Дескриптор | Описание |
|---|---|
| male vocals | Мужской голос |
| female vocals | Женский голос |
| androgynous vocals | Амбивалентный тембр |
| duet | Дуэт |
| choir | Хор |

### Тон

| Дескриптор | Описание |
|---|---|
| warm | Тёплый, мягкий тембр |
| bright | Яркий, звонкий |
| dark | Тёмный, глубокий |
| breathy | Придыхание |
| smooth | Гладкий, ровный |
| rich | Насыщенный |
| airy | Воздушный, лёгкий |

### Техника

| Дескриптор | Описание |
|---|---|
| raspy | Хрипловатый |
| falsetto | Фальцет |
| belt | Мощная подача, «пробивающая» |
| whisper | Шёпот |
| vibrato | Вибрато |
| growl | Рычание (metal, blues) |
| croon | Мягкое напевное пение (jazz, lounge) |
| yodel | Йодль (folk, country) |
| scatting | Скэт (jazz) |

### Стиль

| Дескриптор | Описание |
|---|---|
| soulful | Душевный (R&B, soul) |
| operatic | Оперный |
| spoken word | Речитатив, декламация |
| rap | Рэп |
| storytelling | Нарративный, повествовательный |
| ethereal | Неземной, потусторонний |
| powerful | Мощный |
| gentle | Нежный |

### Обработка

| Дескриптор | Описание |
|---|---|
| dry | Без обработки |
| auto-tuned | С авто-тюном |
| reverb-heavy | С большим реверб-хвостом |
| distorted | Перегруженный (lo-fi, alternative) |
| layered | Многослойные наложения |
| harmonized | С гармониями |

### Примеры вокальных стеков

| Жанр | Вокальный стек |
|---|---|
| Pop ballad | `warm female vocals, powerful belt` |
| Indie folk | `gentle male vocals, breathy, acoustic` |
| R&B | `smooth female vocals, soulful, layered` |
| Trap | `aggressive male rap, auto-tuned` |
| Jazz | `sultry female vocals, smoky, croon` |
| Metal | `aggressive male vocals, guttural, raw` |
| Dream pop | `ethereal female vocals, airy, reverb-heavy` |
| Country | `warm male vocals, storytelling, twang` |

## Инструменты: дескрипторы для Style

### Струнные

`acoustic guitar`, `electric guitar`, `bass guitar`, `banjo`, `mandolin`, `ukulele`, `violin`, `cello`, `upright bass`, `sitar`, `harp`

### Клавишные

`piano`, `electric piano`, `organ`, `synthesizer`, `synth pads`, `Rhodes`, `harpsichord`, `accordion`

### Духовые

`saxophone`, `trumpet`, `trombone`, `flute`, `clarinet`, `harmonica`, `brass section`, `woodwinds`

### Ударные

`drums`, `drum machine`, `808 bass`, `hi-hats`, `brushed drums`, `percussion`, `tabla`, `congas`, `bongos`, `tambourine`

### Электронные

`synth`, `synth bass`, `synth pads`, `arpeggiator`, `vocoder`, `glitch`, `sample`
