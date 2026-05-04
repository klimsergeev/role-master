# Тест-план: вложенные директории в скиллах

Проверяем, что `publish.sh` корректно обрабатывает скиллы с подпапками (nested structure) — архивация, копирование, очистка, README.

## Тестовая структура

Используем существующий `Skills/skill-test-nested/`:

```
Skills/skill-test-nested/
├── SKILL.md              # Корневой роутер (frontmatter: name, description, version)
└── tools/
    ├── SKILL.md           # Вложенный роутер (без frontmatter)
    └── blender.md         # Контент-файл
```

Эта структура моделирует будущий `skill-3d-artist` — скилл с подпапками для разных инструментов.

## Тест-кейсы

Все команды запускаются из корня проекта. Флаг `--test-dir` перенаправляет вывод в `.tmp-publish/` вместо `~/.claude/` и `Production/`.

### Архивация (.skill в Production/Skills)

| ID | Проверка | Команда | Ожидаемый результат |
|----|----------|---------|---------------------|
| N-01 | .skill архив создаётся | `ls .tmp-publish/production/Skills/skill-test-nested.skill` | Файл существует |
| N-02 | Архив — валидный zip | `file .tmp-publish/production/Skills/skill-test-nested.skill` | `Zip archive data` |
| N-03 | Вложенная структура в архиве | `unzip -l .tmp-publish/production/Skills/skill-test-nested.skill` | Содержит `skill-test-nested/tools/blender.md` и `skill-test-nested/tools/SKILL.md` |
| N-04 | Корневой SKILL.md в архиве | `unzip -l .tmp-publish/production/Skills/skill-test-nested.skill \| grep 'skill-test-nested/SKILL.md'` | Ровно 1 совпадение |
| N-05 | Папка-обёртка в архиве | `unzip -l .tmp-publish/production/Skills/skill-test-nested.skill \| head -10` | Все пути начинаются с `skill-test-nested/` |

### Копирование в Claude Skills (rsync -a)

| ID | Проверка | Команда | Ожидаемый результат |
|----|----------|---------|---------------------|
| N-06 | Директория скопирована | `ls .tmp-publish/claude/skills/skill-test-nested/SKILL.md` | Файл существует |
| N-07 | Подпапка скопирована | `ls .tmp-publish/claude/skills/skill-test-nested/tools/blender.md` | Файл существует |
| N-08 | Вложенный SKILL.md скопирован | `ls .tmp-publish/claude/skills/skill-test-nested/tools/SKILL.md` | Файл существует |
| N-09 | Содержимое совпадает с исходником | `diff -r Skills/skill-test-nested .tmp-publish/claude/skills/skill-test-nested` | Нет различий (exit code 0) |

### README (генерация каталога)

| ID | Проверка | Команда | Ожидаемый результат |
|----|----------|---------|---------------------|
| N-10 | Скилл упомянут в README | `grep 'skill-test-nested' .tmp-publish/production/README.md` | Есть совпадение |
| N-11 | Описание взято из frontmatter | `grep 'Test nested skill structure' .tmp-publish/production/README.md` | Есть совпадение |
| N-12 | Формат файла .skill в README | `grep 'skill-test-nested.skill' .tmp-publish/production/README.md` | Путь `Skills/skill-test-nested.skill` |

### Идемпотентность

| ID | Проверка | Команда | Ожидаемый результат |
|----|----------|---------|---------------------|
| N-13 | Повторный запуск не ломает | `./scripts/publish.sh --test-dir && ./scripts/publish.sh --test-dir` | Exit code 0 оба раза |
| N-14 | Архив пересоздаётся, не дописывается | `stat -f%z .tmp-publish/production/Skills/skill-test-nested.skill` (до и после повторного запуска) | Размер идентичен |
| N-15 | rsync --delete убирает лишнее | Создать `.tmp-publish/claude/skills/skill-test-nested/orphan.txt`, запустить publish, проверить | Файл `orphan.txt` удалён |

### Очистка устаревших (collect_valid_skills)

| ID | Проверка | Команда | Ожидаемый результат |
|----|----------|---------|---------------------|
| N-16 | Удалённый скилл чистится из Claude | Переименовать `Skills/skill-test-nested` -> `Skills/skill-test-nested-bak`, запустить publish, проверить `.tmp-publish/claude/skills/skill-test-nested/` | Директория удалена |
| N-17 | Удалённый .skill чистится из Production | После N-16: `ls .tmp-publish/production/Skills/skill-test-nested.skill` | `No such file or directory` |
| N-18 | Валидные скиллы не затронуты при очистке | После N-16: `ls .tmp-publish/claude/skills/skill-ubuntu/SKILL.md` (или другой валидный) | Файл на месте |

## Порядок выполнения

### Setup

```bash
# Убедиться что skill-test-nested существует
ls Skills/skill-test-nested/SKILL.md Skills/skill-test-nested/tools/blender.md

# Очистить предыдущие артефакты
rm -rf .tmp-publish
```

### Тесты: основной прогон

```bash
# 1. Запуск publish в тестовом режиме
./scripts/publish.sh --test-dir

# 2. Архивация: N-01..N-05
ls .tmp-publish/production/Skills/skill-test-nested.skill
file .tmp-publish/production/Skills/skill-test-nested.skill
unzip -l .tmp-publish/production/Skills/skill-test-nested.skill

# 3. Копирование: N-06..N-09
ls .tmp-publish/claude/skills/skill-test-nested/SKILL.md
ls .tmp-publish/claude/skills/skill-test-nested/tools/blender.md
ls .tmp-publish/claude/skills/skill-test-nested/tools/SKILL.md
diff -r Skills/skill-test-nested .tmp-publish/claude/skills/skill-test-nested

# 4. README: N-10..N-12
grep 'skill-test-nested' .tmp-publish/production/README.md
grep 'Test nested skill structure' .tmp-publish/production/README.md
grep 'skill-test-nested.skill' .tmp-publish/production/README.md
```

### Тесты: идемпотентность

```bash
# N-13: повторный запуск
./scripts/publish.sh --test-dir
echo "exit code: $?"

# N-14: размер архива стабилен
SIZE1=$(stat -f%z .tmp-publish/production/Skills/skill-test-nested.skill)
./scripts/publish.sh --test-dir
SIZE2=$(stat -f%z .tmp-publish/production/Skills/skill-test-nested.skill)
[ "$SIZE1" = "$SIZE2" ] && echo "PASS: размер стабилен ($SIZE1)" || echo "FAIL: $SIZE1 != $SIZE2"

# N-15: rsync --delete убирает лишнее
touch .tmp-publish/claude/skills/skill-test-nested/orphan.txt
./scripts/publish.sh --test-dir
[ ! -f .tmp-publish/claude/skills/skill-test-nested/orphan.txt ] && echo "PASS: orphan удалён" || echo "FAIL: orphan остался"
```

### Тесты: очистка

```bash
# N-16..N-18: очистка устаревших
mv Skills/skill-test-nested Skills/skill-test-nested-bak
./scripts/publish.sh --test-dir
[ ! -d .tmp-publish/claude/skills/skill-test-nested ] && echo "PASS N-16" || echo "FAIL N-16"
[ ! -f .tmp-publish/production/Skills/skill-test-nested.skill ] && echo "PASS N-17" || echo "FAIL N-17"
# N-18: проверяем что другие скиллы живы (skill-ubuntu как reference)
[ -f .tmp-publish/claude/skills/skill-ubuntu/SKILL.md ] && echo "PASS N-18" || echo "FAIL N-18"
```

### Teardown

```bash
# Восстановить тестовый скилл (если переименовывали)
[ -d Skills/skill-test-nested-bak ] && mv Skills/skill-test-nested-bak Skills/skill-test-nested

# Удалить тестовые артефакты
rm -rf .tmp-publish
```
