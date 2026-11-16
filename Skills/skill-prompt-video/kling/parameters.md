# Kling: параметры

## Назначение

Параметры новых и старых адресов API Kling для VIDEO 3.0, VIDEO 3.0 Omni, Kling 4.0 и 4.0 Flash: значения и умолчания по адресам, длина промпта, правила длительности и соотношения сторон и поля, поддержка которых не установлена.

Состояние на 2026-11-16.

## Kling 4.0

| Параметр | `/text-to-video/kling-4.0` | `/image-to-video/kling-4.0` | `/omni-video/kling-4.0` |
|---|---|---|---|
| Промпт | `prompt`, строка, обязателен | элемент `contents` с `"type": "prompt"` | элемент `contents` с `"type": "prompt"`, обязателен |
| Типы материалов в `contents` | — | `first_frame`, `middle_frame`, `last_frame` | `prompt`, `first_frame`, `middle_frame`, `last_frame`, `refer_image`, `feature_video`, `base_video`, `element`, `voice` |
| `settings.resolution` | `720p`, `1080p`; по умолчанию `1080p` | `720p`, `1080p`; по умолчанию `1080p` | `720p`, `1080p`; по умолчанию `1080p` |
| `settings.aspect_ratio` | `21:9`, `16:9`, `9:16`, `1:1`, `4:3`, `3:4`; по умолчанию `16:9` | поля нет, не передавать | `21:9`, `16:9`, `9:16`, `1:1`, `4:3`, `3:4`, `adaptive`; по умолчанию `adaptive` |
| `settings.duration` | целое 3–30 | целое 3–30 | целое 3–30 |
| `settings.audio` | поля нет | поля нет | `native` (по умолчанию) или `original` |
| Отрицательный промпт | отдельного поля нет | отдельного поля нет | отдельного поля нет |
| `options` | `callback_url`, `external_task_id`, `watermark_info.enabled` (по умолчанию `false`) | то же | то же |

## Kling 4.0 Flash

| Параметр | `/text-to-video/kling-4.0-flash` | `/image-to-video/kling-4.0-flash` | `/omni-video/kling-4.0-flash` |
|---|---|---|---|
| Типы материалов в `contents` | — | только `first_frame` | `prompt`, `first_frame`, `refer_image`, `feature_video`, `base_video`, `element` |
| `settings.resolution` | только `720p` | только `720p` | только `720p` |
| `settings.aspect_ratio` | `21:9`, `16:9`, `9:16`, `1:1`, `4:3`, `3:4`; по умолчанию `16:9` | поля нет | те же и `adaptive`; по умолчанию `adaptive` |
| `settings.duration` | целое 3–20 | целое 3–20 | целое 3–20; общая длительность видео на входе — до 20 с |
| `settings.audio` | поля нет | поля нет | `native` или `original` |

## Общие правила Kling 4.0 и 4.0 Flash

- Длина промпта — предел 8000 токенов, в API выражен в символах: только английский текст — до 26 000 символов; только неанглийский — до 11 000; смешанный — должно выполняться `E / 26000 + N / 11000 <= 1`, где `E` — число английских символов, `N` — неанглийских.
- Промпт может содержать положительные и отрицательные описания; отдельного поля отрицательного промпта нет.
- Длительность: переданный `duration` важнее промпта. Если не передан — длительность, явно названная в промпте; если её нет — в адресе Omni длительность `base_video`, округлённая до целого; если и его нет — 10 с.
- Итоговая длительность возвращается в `usage.output_duration`.
- Соотношение в адресе Omni при `adaptive` или без `aspect_ratio`: явное соотношение из промпта → `base_video` → ключевые кадры (приоритет у первого кадра) → `feature_video`, если он один (если несколько — 16:9) → 16:9.
- Лимиты материалов — в [references.md](references.md).

## Kling VIDEO 3.0, новые адреса

| Параметр | `/text-to-video/kling-3.0` | `/image-to-video/kling-3.0` |
|---|---|---|
| Промпт | `prompt`, до 3072 символов, рекомендовано до 2500 | элемент `contents` с `"type": "prompt"`, те же пределы |
| Материалы | — | `first_frame` (обязателен), `last_frame` (необязателен), `element` (до 3) |
| `settings.multi_shot` | `true` или `false`, по умолчанию `true` | то же |
| `settings.audio` | `native` или `off`, по умолчанию `off` | то же |
| `settings.resolution` | `720p`, `1080p`, `4k`; по умолчанию `720p` | то же |
| `settings.aspect_ratio` | `16:9`, `9:16`, `1:1`; по умолчанию `16:9` | поля нет |
| `settings.duration` | целое 3–15, по умолчанию 5 | то же |
| Отрицательный промпт | отдельного поля нет | отдельного поля нет |

## Kling VIDEO 3.0 Omni, новый адрес

| Параметр | `/omni-video/kling-3.0-omni` |
|---|---|
| Промпт | элемент `contents` с `"type": "prompt"`, до 3072 символов, рекомендовано до 2500 |
| Материалы | `first_frame`, `last_frame`, `refer_image`, `feature_video`, `base_video`, `element`; типа `voice` нет |
| `settings.multi_shot` | `true` или `false`, по умолчанию `true`; с `base_video` — передавать `false` явно |
| `settings.audio` | `native`, `original`, `off`; по умолчанию `off`; что делает `original` у этой модели, не установлено |
| `settings.resolution` | `720p`, `1080p`, `4k`; по умолчанию `720p` |
| `settings.aspect_ratio` | `16:9`, `9:16`, `1:1`; по умолчанию `16:9`; обязателен, если нет первого кадра и видео-референса |
| `settings.duration` | целое 3–15, по умолчанию 5 |

- Мультикадровый формат промпта VIDEO 3.0 и 3.0 Omni — `shot n, m, words;` (в [prompt-anatomy.md](prompt-anatomy.md)).
- Ограничения `feature_video` и `base_video` — в [references.md](references.md).

## Старые адреса для `kling-v3` и `kling-v3-omni`

| Поле | `/v1/videos/image2video` (`kling-v3`) | `/v1/videos/omni-video` (`kling-v3-omni`) |
|---|---|---|
| `model_name` | `kling-v3` | `kling-v3-omni`; по умолчанию у адреса `kling-video-o1` — передавать явно |
| `prompt` | до 2500 символов | до 2500 символов; ссылки `<<<element_1>>>`, `<<<image_1>>>`, `<<<video_1>>>` |
| `negative_prompt` | до 2500 символов; отрицания рекомендуется писать отрицательными предложениями внутри основного промпта | поля нет |
| Изображения | `image` и `image_tail` (последний кадр) — строки, URL или Base64 без префикса `data:`; хотя бы одно обязательно | `image_list`: `[{"image_url": "…", "type": "first_frame" или "end_frame"}]`; `type` — только у первого и последнего кадров |
| Видео | нет | `video_list`: `[{"video_url": "…", "refer_type": "feature" или "base", "keep_original_sound": "yes" или "no"}]`, не больше одного; `refer_type` по умолчанию `base` |
| Элементы | `element_list`: `[{"element_id": long}]`, до 3 | `element_list`: `[{"element_id": long}]`, лимиты — в [references.md](references.md) |
| Голоса | `voice_list`: `[{"voice_id": "…"}]`, до 2; с `element_list` взаимоисключающие; `sound` — `on` | поля нет |
| `sound` | `on` или `off`, по умолчанию `off` | `on` или `off`, по умолчанию `off`; при видео на входе — только `off` |
| `mode` | `std` (720p), `pro` (1080p), `4k` | `std` (720p), `pro` (1080p), `4k` |
| `aspect_ratio` | поля нет | `16:9`, `9:16`, `1:1` |
| `duration` | строка `"3"`–`"15"` | строка `"3"`–`"15"` |
| Мультикадровость | `multi_shot` (по умолчанию `false`), `shot_type` — `customize` или `intelligence`, `multi_prompt` — `[{"index", "prompt", "duration"}]` | то же |
| Прочее | `watermark_info`, `callback_url`, `external_task_id` | то же |

- `multi_prompt`: до 6 планов, текст плана до 512 символов, длительность плана не меньше 1, сумма равна общей длительности. При `multi_shot: true` поле `prompt` игнорируется, а генерация по первому и последнему кадру не поддерживается.
- `/v1/videos/text2video` с `kling-v3`: `aspect_ratio` — `16:9`, `9:16`, `1:1`; `duration` — 3–15; источники расходятся о голосах: одна позиция — у адреса есть `voice_list` и ссылка `<<<voice_1>>>`; другая — поля `voice_list` у адреса нет; передача голосов через этот адрес не установлена.
- `mode: "4k"`: `kling-v3` — в адресах из текста и из изображения; `kling-v3-omni` — да, с видео-референсом расхождение ниже.

## Расхождения и неустановленное

| Предмет | Одна позиция | Другая позиция |
|---|---|---|
| `cfg_scale` и `camera_control` у `kling-v3` в `/v1/videos/image2video` | у адреса этих полей нет | у адреса есть поля `cfg_scale` (0–1, по умолчанию 0.5, не поддерживается моделями `kling-v2.x`) и `camera_control` (`type` — `simple`, `down_back`, `forward_up`, `right_turn_forward`, `left_turn_forward`); поддержка у `kling-v3` прямо нигде не подтверждена — скилл эти поля не передаёт |
| `mode: "4k"` у `kling-v3-omni` с видео-референсом | 4K — во всех функциях, кроме видео-референса | позже объявлены 4K и видео-референсы до 15 с без уточнения, снято ли исключение |
| 4K у Kling 4.0 | в приложении есть 4K | в API 4K «скоро», значения — `720p` и `1080p` (в [models.md](models.md)) |

## Примеры

### Пример 1: соотношение сторон в image-to-video Kling 4.0

**Вход:** «Kling 4.0 по первому кадру, сделай 9:16».

**Результат:** у `/image-to-video/kling-4.0` поля `aspect_ratio` нет и передавать его нельзя; соотношение не задаётся параметром. ЕСЛИ требуется 9:16, а кадр горизонтальный -> подготовить первый кадр в 9:16; как модель поступит с явным `aspect_ratio`, не совпадающим с кадром, в адресе Omni — не установлено.

### Пример 2: 1080p в Kling 4.0 Flash

**Вход:** «Kling 4.0 Flash, 1080p, 25 секунд».

**Результат:** у 4.0 Flash `resolution` — только `720p`, `duration` — до 20; пользователю сообщается об обоих пределах, в запросе — `"resolution": "720p"`, `"duration": 20` до его решения.
