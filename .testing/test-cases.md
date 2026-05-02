# Тест-кейсы: Рефакторинг ролей и скиллов

Ветка: `feature/role-skill-extraction`
Дата создания: 2026-05-01

---

## 1. publish.sh — Инфраструктура публикации

### TC-001: Флаг --test-dir создаёт структуру в .tmp-publish/

**Компонент:** publish.sh
**Тип:** автоматический
**Предусловия:** Директория `.tmp-publish/` отсутствует или пуста
**Шаги:**
1. Удалить `.tmp-publish/` если существует: `rm -rf .tmp-publish/`
2. Запустить: `bash scripts/publish.sh --test-dir`
3. Проверить существование директорий:
   - `.tmp-publish/production/Agents/`
   - `.tmp-publish/production/Skills/`
   - `.tmp-publish/production/Dialog/`
   - `.tmp-publish/claude/agents/`
   - `.tmp-publish/claude/skills/`
4. Проверить что `~/.claude/agents/` и `~/.claude/skills/` НЕ были изменены (сравнить mtime до и после)
**Ожидаемый результат:** Все директории созданы в `.tmp-publish/`. Реальные `~/.claude/` не затронуты.
**Статус:** [x] пройден

### TC-002: Флаг --test-dir совместим с --dry

**Компонент:** publish.sh
**Тип:** автоматический
**Предусловия:** Директория `.tmp-publish/` отсутствует
**Шаги:**
1. Запустить: `bash scripts/publish.sh --test-dir --dry`
2. Проверить что `.tmp-publish/` НЕ создана
3. Проверить что вывод содержит строки с путями `.tmp-publish/`
**Ожидаемый результат:** Dry run показывает пути `.tmp-publish/`, но не создаёт файлов.
**Статус:** [x] пройден

### TC-003: Cursor полностью исключён из публикации

**Компонент:** publish.sh
**Тип:** автоматический
**Предусловия:** нет
**Шаги:**
1. Запустить: `grep -i cursor scripts/publish.sh`
2. Запустить: `bash scripts/publish.sh --test-dir`
3. Проверить: `find .tmp-publish/ -path "*cursor*" -o -path "*Cursor*" | wc -l`
4. Проверить: `ls ~/.cursor/agents/ 2>/dev/null` — publish.sh не должен создавать/обновлять эту директорию
**Ожидаемый результат:** Слово "cursor" отсутствует в publish.sh. Никаких cursor-директорий в выходных данных. Директория `~/.cursor/` не затрагивается.
**Статус:** [x] пройден

### TC-004: Dialog-заглушки содержат URL raw.githubusercontent.com

**Компонент:** publish.sh
**Тип:** автоматический
**Предусловия:** нет
**Шаги:**
1. Запустить: `bash scripts/publish.sh --test-dir`
2. Проверить любую заглушку: `cat .tmp-publish/production/Dialog/specialists/ux-writer.md`
3. Убедиться что URL начинается с `https://raw.githubusercontent.com/klimsergeev/role-master/`
4. Проверить что URL содержит `?v=` (cache bust параметр)
5. Проверить все заглушки: `grep -r "raw.githubusercontent.com" .tmp-publish/production/Dialog/`
6. Проверить отсутствие бинарного API: `grep -r "api.github.com" .tmp-publish/production/Dialog/ | wc -l`
**Ожидаемый результат:** Все заглушки используют `raw.githubusercontent.com`. Нет ссылок на `api.github.com`. Каждый URL содержит `?v=<timestamp>`.
**Статус:** [x] пройден

### TC-005: Cache bust добавлен к URL в Dialog-заглушках

**Компонент:** publish.sh
**Тип:** автоматический
**Предусловия:** нет
**Шаги:**
1. Запустить: `bash scripts/publish.sh --test-dir`
2. Извлечь значение cache bust из заглушки: `grep -oP '\?v=\K[0-9]+' .tmp-publish/production/Dialog/specialists/ux-writer.md`
3. Запустить publish.sh повторно: `bash scripts/publish.sh --test-dir`
4. Извлечь новое значение cache bust
5. Сравнить значения — они должны отличаться (timestamp)
**Ожидаемый результат:** Значение `?v=` — числовой timestamp (Unix epoch). При повторном запуске publish.sh значение меняется.
**Статус:** [x] пройден

### TC-006: Директории-скиллы копируются в claude/skills/

**Компонент:** publish.sh
**Тип:** автоматический
**Предусловия:** Существует `Skills/skill-editorial-guidelines/SKILL.md` с процедурами
**Шаги:**
1. Запустить: `bash scripts/publish.sh --test-dir`
2. Проверить директорию: `ls .tmp-publish/claude/skills/skill-editorial-guidelines/`
3. Проверить наличие SKILL.md: `test -f .tmp-publish/claude/skills/skill-editorial-guidelines/SKILL.md && echo OK`
4. Проверить наличие процедур: `test -f .tmp-publish/claude/skills/skill-editorial-guidelines/tone.md && echo OK`
5. Проверить полноту — кол-во файлов в источнике и назначении должно совпадать:
   ```
   SRC=$(find Skills/skill-editorial-guidelines/ -type f -name "*.md" | wc -l | tr -d ' ')
   DST=$(find .tmp-publish/claude/skills/skill-editorial-guidelines/ -type f -name "*.md" | wc -l | tr -d ' ')
   [ "$SRC" = "$DST" ] && echo OK
   ```
**Ожидаемый результат:** Директория скопирована целиком: SKILL.md + все файлы-процедуры (tone.md, vocabulary.md, punctuation.md, formatting.md, errors.md, ui-elements.md, links-and-lists.md, naming.md, terminology.md). Количество .md файлов совпадает с источником.
**Статус:** [x] пройден

### TC-007: Файлы-скиллы (.md) по-прежнему копируются в claude/skills/

**Компонент:** publish.sh
**Тип:** автоматический
**Предусловия:** Существуют файлы-скиллы (например, `Skills/skill-agent-orchestration.md`)
**Шаги:**
1. Запустить: `bash scripts/publish.sh --test-dir`
2. Проверить: `test -f .tmp-publish/claude/skills/skill-agent-orchestration/SKILL.md && echo OK`
3. Убедиться что содержимое идентично: `diff Skills/skill-agent-orchestration.md .tmp-publish/claude/skills/skill-agent-orchestration/SKILL.md`
**Ожидаемый результат:** Файл-скилл скопирован в формате `skill-name/SKILL.md` (обёрнут в директорию). Содержимое идентично.
**Статус:** [x] пройден

### TC-008: .skill архив создаётся для директорий-скиллов

**Компонент:** publish.sh
**Тип:** автоматический
**Предусловия:** Существует `Skills/skill-editorial-guidelines/SKILL.md`
**Шаги:**
1. Запустить: `bash scripts/publish.sh --test-dir`
2. Проверить наличие: `test -f .tmp-publish/production/Skills/skill-editorial-guidelines.skill && echo OK`
3. Проверить что это валидный zip: `file .tmp-publish/production/Skills/skill-editorial-guidelines.skill`
4. Проверить содержимое архива: `unzip -l .tmp-publish/production/Skills/skill-editorial-guidelines.skill`
5. Убедиться что внутри есть папка-обёртка: вывод `unzip -l` должен показывать пути `skill-editorial-guidelines/SKILL.md`, `skill-editorial-guidelines/tone.md` и т.д.
**Ожидаемый результат:** Файл `.skill` — валидный zip-архив. Содержит папку-обёртку `skill-editorial-guidelines/` с SKILL.md и всеми процедурами внутри.
**Статус:** [x] пройден

### TC-009: Файлы-скиллы (.md) копируются в Production/Skills/ с фильтрацией frontmatter

**Компонент:** publish.sh
**Тип:** автоматический
**Предусловия:** Существует файл-скилл с frontmatter, содержащим разрешённые и неразрешённые ключи (например, `version`, `created`)
**Шаги:**
1. Запустить: `bash scripts/publish.sh --test-dir`
2. Проверить наличие: `test -f .tmp-publish/production/Skills/skill-agent-orchestration.md && echo OK`
3. Проверить frontmatter: `head -20 .tmp-publish/production/Skills/skill-agent-orchestration.md`
4. Убедиться что ключи `name`, `description` присутствуют
5. Убедиться что ключи `version`, `created` отфильтрованы (отсутствуют в frontmatter)
6. Проверить `when_to_use` — если есть в источнике, должен быть в результате (ключ в ALLOWED_FRONTMATTER_KEYS)
**Ожидаемый результат:** Frontmatter содержит только разрешённые ключи: `name`, `description`, `license`, `allowed-tools`, `compatibility`, `metadata`, `when_to_use`. Ключи `version`, `created`, `category`, `model` отфильтрованы.
**Статус:** [x] пройден

### TC-010: Миграция — директория-скилл заменяет файл-скилл в Production

**Компонент:** publish.sh
**Тип:** автоматический
**Предусловия:** В Production/Skills/ может остаться старый `skill-editorial-guidelines.md` (файл-формат)
**Шаги:**
1. Создать файл-заглушку: `echo "old" > .tmp-publish/production/Skills/skill-editorial-guidelines.md`
2. Запустить: `bash scripts/publish.sh --test-dir`
3. Проверить что старый .md файл удалён: `test ! -f .tmp-publish/production/Skills/skill-editorial-guidelines.md && echo OK`
4. Проверить что .skill архив создан: `test -f .tmp-publish/production/Skills/skill-editorial-guidelines.skill && echo OK`
**Ожидаемый результат:** Старый `skill-editorial-guidelines.md` удалён (потому что в источнике нет файла `Skills/skill-editorial-guidelines.md`). Вместо него создан `.skill` архив.
**Статус:** [x] пройден

### TC-011: Оба формата скиллов сосуществуют в Production/Skills/

**Компонент:** publish.sh
**Тип:** автоматический
**Предусловия:** В `Skills/` есть и файлы (.md), и директории (skill-name/)
**Шаги:**
1. Запустить: `bash scripts/publish.sh --test-dir`
2. Проверить наличие .md файлов: `ls .tmp-publish/production/Skills/*.md 2>/dev/null | head -5`
3. Проверить наличие .skill файлов: `ls .tmp-publish/production/Skills/*.skill 2>/dev/null | head -5`
4. Подсчитать: кол-во .md в Production == кол-во skill-*.md в источнике (за вычетом шаблона и тех, для которых есть директория)
5. Подсчитать: кол-во .skill в Production == кол-во директорий skill-* в источнике (за вычетом шаблона)
**Ожидаемый результат:** В `Production/Skills/` одновременно лежат `.md` файлы (для файлов-скиллов) и `.skill` архивы (для директорий-скиллов). Количество соответствует источникам.
**Статус:** [x] пройден

### TC-012: Шаблон скилла (skill-template) не публикуется

**Компонент:** publish.sh
**Тип:** автоматический
**Предусловия:** Существует `Skills/skill-template/SKILL.md`
**Шаги:**
1. Запустить: `bash scripts/publish.sh --test-dir`
2. Проверить: `test ! -f .tmp-publish/production/Skills/skill-template.skill && echo OK`
3. Проверить: `test ! -d .tmp-publish/claude/skills/skill-template && echo OK`
4. Проверить вывод: `bash scripts/publish.sh --test-dir 2>&1 | grep "skill-template"` — должно содержать "пропущено"
**Ожидаемый результат:** Шаблон `skill-template` пропущен при публикации. Нет ни `.skill` архива, ни директории в `claude/skills/`.
**Статус:** [x] пройден — publish.sh выводит "skill-template/ — пропущено (шаблон)" для директорий-скиллов. Перепроверено 2026-05-02: skill-template отсутствует в .tmp-publish/production/Skills/ и .tmp-publish/claude/skills/

### TC-013: Удаление скилла из источника удаляет его из Production

**Компонент:** publish.sh
**Тип:** автоматический
**Предусловия:** нет
**Шаги:**
1. Создать фиктивный скилл-файл: `echo "---\nname: skill-test-delete\n---\nTest" > Skills/skill-test-delete.md`
2. Запустить: `bash scripts/publish.sh --test-dir`
3. Проверить: `test -f .tmp-publish/production/Skills/skill-test-delete.md && echo EXISTS`
4. Удалить фиктивный скилл: `rm Skills/skill-test-delete.md`
5. Запустить: `bash scripts/publish.sh --test-dir`
6. Проверить: `test ! -f .tmp-publish/production/Skills/skill-test-delete.md && echo DELETED`
**Ожидаемый результат:** При отсутствии исходного файла скилл удаляется из Production.
**Статус:** [x] пройден

### TC-014: Удаление .skill архива при удалении директории-скилла

**Компонент:** publish.sh
**Тип:** автоматический
**Предусловия:** нет
**Шаги:**
1. Создать фиктивную директорию-скилл:
   ```
   mkdir -p Skills/skill-test-dir-delete
   echo "---\nname: skill-test-dir-delete\n---\nTest" > Skills/skill-test-dir-delete/SKILL.md
   ```
2. Запустить: `bash scripts/publish.sh --test-dir`
3. Проверить: `test -f .tmp-publish/production/Skills/skill-test-dir-delete.skill && echo EXISTS`
4. Удалить директорию: `rm -rf Skills/skill-test-dir-delete/`
5. Запустить: `bash scripts/publish.sh --test-dir`
6. Проверить: `test ! -f .tmp-publish/production/Skills/skill-test-dir-delete.skill && echo DELETED`
**Ожидаемый результат:** При удалении директории-скилла из источника, .skill архив удаляется из Production.
**Статус:** [x] пройден

### TC-015: GITHUB_BRANCH используется в Dialog URL

**Компонент:** publish.sh
**Тип:** автоматический
**Предусловия:** В publish.sh установлена переменная `GITHUB_BRANCH`
**Шаги:**
1. Запустить: `bash scripts/publish.sh --test-dir`
2. Извлечь ветку из URL заглушки: `grep -oP 'role-master/\K[^/]+' .tmp-publish/production/Dialog/specialists/ux-writer.md`
3. Извлечь значение GITHUB_BRANCH из publish.sh: `grep '^GITHUB_BRANCH=' scripts/publish.sh`
4. Сравнить — должны совпадать
**Ожидаемый результат:** URL в Dialog-заглушках использует ветку из переменной `GITHUB_BRANCH` (сейчас `feature/role-skill-extraction`).
**Статус:** [x] пройден

### TC-016: Приватные скиллы публикуются только локально

**Компонент:** publish.sh
**Тип:** автоматический
**Предусловия:** Существует `Skills/private/` с хотя бы одним скиллом (или создать тестовый)
**Шаги:**
1. Создать тестовый приватный скилл:
   ```
   mkdir -p Skills/private
   echo "---\nname: skill-private-test\n---\nPrivate test" > Skills/private/skill-private-test.md
   ```
2. Запустить: `bash scripts/publish.sh --test-dir`
3. Проверить локальную копию: `test -f .tmp-publish/claude/skills/skill-private-test/SKILL.md && echo LOCAL_OK`
4. Проверить отсутствие в Production: `test ! -f .tmp-publish/production/Skills/skill-private-test.md && echo PROD_OK`
5. Удалить тестовый файл: `rm Skills/private/skill-private-test.md`
**Ожидаемый результат:** Приватный скилл есть в `claude/skills/`, но отсутствует в `production/Skills/`.
**Статус:** [x] пройден

### TC-017: Флаг --help показывает справку

**Компонент:** publish.sh
**Тип:** автоматический
**Предусловия:** нет
**Шаги:**
1. Запустить: `bash scripts/publish.sh --help`
2. Проверить код возхода: `echo $?` — должен быть 0
3. Проверить что вывод содержит `--dry`, `--test-dir`, `--help`
**Ожидаемый результат:** Справка выводится, код возврата 0, перечислены все три флага.
**Статус:** [x] пройден

### TC-018: when_to_use сохраняется в frontmatter при публикации

**Компонент:** publish.sh (filter_skill_frontmatter)
**Тип:** автоматический
**Предусловия:** Скилл `skill-editorial-guidelines/SKILL.md` содержит `when_to_use` в frontmatter
**Шаги:**
1. Проверить что `when_to_use` есть в ALLOWED_FRONTMATTER_KEYS: `grep "when_to_use" scripts/publish.sh`
2. Создать тестовый файл-скилл с when_to_use:
   ```
   cat > /tmp/test-skill.md << 'EOF'
   ---
   name: test
   description: Test skill
   when_to_use: When user asks about testing
   version: 1.0.0
   created: 2026-01-01
   ---
   # Content
   EOF
   ```
3. Проверить фильтрацию: в результате должны остаться `name`, `description`, `when_to_use`. Должны быть удалены `version`, `created`.
**Ожидаемый результат:** Ключ `when_to_use` включён в `ALLOWED_FRONTMATTER_KEYS` и сохраняется после фильтрации frontmatter.
**Статус:** [x] пройден

---

## 2. Скилл-маршрутизатор (skill-editorial-guidelines)

### TC-101: SKILL.md содержит валидный YAML frontmatter

**Компонент:** skill-editorial-guidelines
**Тип:** автоматический
**Предусловия:** Файл `Skills/skill-editorial-guidelines/SKILL.md` существует
**Шаги:**
1. Проверить наличие обязательных полей в frontmatter:
   - `name: skill-editorial-guidelines`
   - `description:` (непустое)
   - `when_to_use:` (непустое)
   - `version:` (формат X.Y.Z)
   - `created:` (формат YYYY-MM-DD)
2. Проверить длину `description` + `when_to_use` суммарно не более 1536 символов
**Ожидаемый результат:** Все обязательные поля присутствуют. Суммарная длина description + when_to_use <= 1536 символов.
**Статус:** [x] пройден

### TC-102: Таблица маршрутизации ссылается на существующие файлы

**Компонент:** skill-editorial-guidelines
**Тип:** автоматический
**Предусловия:** нет
**Шаги:**
1. Извлечь все markdown-ссылки из SKILL.md: `grep -oP '\[([^\]]+\.md)\]\(\1\)' Skills/skill-editorial-guidelines/SKILL.md`
2. Для каждого файла проверить существование в `Skills/skill-editorial-guidelines/`:
   - tone.md
   - vocabulary.md
   - punctuation.md
   - formatting.md
   - errors.md
   - ui-elements.md
   - links-and-lists.md
   - naming.md
   - terminology.md
3. Проверить что нет «мёртвых» ссылок — каждый файл, указанный в таблице, существует
**Ожидаемый результат:** Все 9 файлов-процедур существуют. Нет битых ссылок в таблице маршрутизации.
**Статус:** [x] пройден

### TC-103: Файлы-процедуры не содержат YAML frontmatter

**Компонент:** skill-editorial-guidelines
**Тип:** автоматический
**Предусловия:** нет
**Шаги:**
1. Для каждого файла-процедуры (tone.md, vocabulary.md и т.д.) проверить:
   ```
   for f in Skills/skill-editorial-guidelines/*.md; do
     [ "$(basename "$f")" = "SKILL.md" ] && continue
     head -1 "$f" | grep -q '^---' && echo "FAIL: $f has frontmatter"
   done
   ```
**Ожидаемый результат:** Ни один файл-процедура не содержит YAML frontmatter (только SKILL.md имеет frontmatter).
**Статус:** [x] пройден

### TC-104: Ссылки в SKILL.md используют markdown-формат, не backtick

**Компонент:** skill-editorial-guidelines
**Тип:** автоматический
**Предусловия:** нет
**Шаги:**
1. Проверить наличие markdown-ссылок: `grep -c '\[.*\.md\](.*\.md)' Skills/skill-editorial-guidelines/SKILL.md` — должно быть > 0
2. Проверить отсутствие backtick-ссылок на файлы: `grep -P '`[a-z-]+\.md`' Skills/skill-editorial-guidelines/SKILL.md` — должно быть пусто (если найдено — это backtick вместо markdown-ссылки)
**Ожидаемый результат:** Все ссылки на файлы-процедуры оформлены как `[file.md](file.md)`, а не как `` `file.md` ``.
**Статус:** [x] пройден

### TC-105: Каждая задача в таблице маршрутизации имеет хотя бы один файл в колонке "Минимум"

**Компонент:** skill-editorial-guidelines
**Тип:** автоматический
**Предусловия:** нет
**Шаги:**
1. Извлечь строки таблицы маршрутизации из SKILL.md
2. Для каждой строки проверить что колонка "Минимум" не пуста и не содержит только "---"
**Ожидаемый результат:** Каждая задача имеет минимум один файл-процедуру. Нет строк с пустым "Минимум".
**Статус:** [x] пройден

### TC-106: Содержимое SKILL.md включает все обязательные секции

**Компонент:** skill-editorial-guidelines
**Тип:** автоматический
**Предусловия:** нет
**Шаги:**
1. Проверить наличие секций (заголовков ## или ###):
   - `## Назначение`
   - `## Принципы`
   - `## Таблица маршрутизации`
   - `## Рабочий процесс`
   - `## Что НЕ делать`
2. Проверить: `grep -c "^##" Skills/skill-editorial-guidelines/SKILL.md`
**Ожидаемый результат:** Все обязательные секции шаблона маршрутизатора присутствуют.
**Статус:** [x] пройден

### TC-107: .skill архив содержит корректную структуру для claude.ai

**Компонент:** skill-editorial-guidelines
**Тип:** автоматический
**Предусловия:** Запущен `publish.sh --test-dir`
**Шаги:**
1. Запустить: `bash scripts/publish.sh --test-dir`
2. Распаковать архив во временную директорию:
   ```
   mkdir -p /tmp/test-skill-archive
   unzip -o .tmp-publish/production/Skills/skill-editorial-guidelines.skill -d /tmp/test-skill-archive/
   ```
3. Проверить структуру:
   - `/tmp/test-skill-archive/skill-editorial-guidelines/SKILL.md` существует
   - `/tmp/test-skill-archive/skill-editorial-guidelines/tone.md` существует
   - Всего 10 .md файлов (1 SKILL.md + 9 процедур)
4. Проверить что нет лишних файлов (например, .DS_Store): `find /tmp/test-skill-archive/ -name ".DS_Store"`
5. Очистить: `rm -rf /tmp/test-skill-archive`
**Ожидаемый результат:** Архив содержит папку-обёртку `skill-editorial-guidelines/` с 10 файлами .md. Нет мусорных файлов.
**Статус:** [x] пройден

---

## 3. Dialog-агенты и проверка скиллов

### TC-201: Dialog-заглушка ux-writer содержит корректный URL

**Компонент:** Dialog / ux-writer
**Тип:** автоматический
**Предусловия:** Запущен `publish.sh --test-dir`
**Шаги:**
1. Запустить: `bash scripts/publish.sh --test-dir`
2. Прочитать: `cat .tmp-publish/production/Dialog/specialists/ux-writer.md`
3. Проверить URL: содержит `raw.githubusercontent.com/klimsergeev/role-master/`
4. Проверить путь: содержит `Production/Agents/specialists/ux-writer.md`
5. Проверить cache bust: содержит `?v=` с числовым значением
**Ожидаемый результат:** URL полный, корректный, содержит cache bust. Формат: `https://raw.githubusercontent.com/klimsergeev/role-master/<branch>/Production/Agents/specialists/ux-writer.md?v=<timestamp>`.
**Статус:** [x] пройден

### TC-202: Роль ux-writer содержит инструкцию самопроверки скилла

**Компонент:** ux-writer (роль)
**Тип:** автоматический
**Предусловия:** нет
**Шаги:**
1. Проверить наличие секции: `grep "## Самопроверка при запуске" Roles/specialists/ux-writer.md`
2. Проверить упоминание скилла: `grep "skill-editorial-guidelines" Roles/specialists/ux-writer.md`
3. Проверить инструкцию "Если скилл установлен": `grep -A2 "Если скилл установлен" Roles/specialists/ux-writer.md`
4. Проверить инструкцию "Если скилл НЕ установлен": `grep -A5 "Если скилл НЕ установлен" Roles/specialists/ux-writer.md`
5. Проверить наличие URL для скачивания .skill: `grep "\.skill" Roles/specialists/ux-writer.md`
**Ожидаемый результат:** Роль содержит секцию самопроверки с двумя ветками (скилл есть / скилла нет), URL для скачивания .skill файла, инструкцию установки через Customize.
**Статус:** [x] пройден

### TC-203: URL .skill файла в роли ux-writer доступен

**Компонент:** ux-writer (роль)
**Тип:** ручной
**Предусловия:** Ветка `feature/role-skill-extraction` запушена в GitHub
**Шаги:**
1. Извлечь URL .skill из роли: `grep -oP 'https://[^\s)]+\.skill[^\s)]*' Roles/specialists/ux-writer.md`
2. Скачать файл: `curl -sL -o /tmp/test-download.skill "<URL>"`
3. Проверить что файл не пустой: `test -s /tmp/test-download.skill && echo OK`
4. Проверить что это zip: `file /tmp/test-download.skill`
5. Очистить: `rm /tmp/test-download.skill`
**Ожидаемый результат:** URL доступен, файл скачивается, является валидным zip-архивом.
**Статус:** [x] ручной, пройден — HTTP 200, файл скачивается, валидный zip-архив (Zip archive data). URL роли ux-writer также доступен (HTTP 200).

### TC-204: Dialog-агент ux-writer — тест БЕЗ скилла (ручной)

**Компонент:** Dialog / ux-writer
**Тип:** ручной
**Предусловия:** Скилл `skill-editorial-guidelines` НЕ установлен в claude.ai. Dialog-заглушка актуальна.
**Шаги:**
1. Открыть claude.ai
2. Создать проект, добавить Dialog-заглушку ux-writer как Project Knowledge
3. Начать новый чат в проекте
4. Дождаться инициализации агента
5. Проверить что агент:
   - Загружает роль по URL из заглушки
   - Обнаруживает отсутствие скилла
   - Подгружает скилл по ссылке для текущего чата
   - Сообщает пользователю о возможности глобальной установки с инструкцией и ссылкой
**Ожидаемый результат:** Агент корректно определяет отсутствие скилла, подгружает его для чата и предлагает установить глобально.
**Статус:** [x] ручной, пройден

### TC-205: Dialog-агент ux-writer — тест СО скиллом (ручной)

**Компонент:** Dialog / ux-writer
**Тип:** ручной
**Предусловия:** Скилл `skill-editorial-guidelines` установлен в claude.ai (через Customize → Skills → Upload)
**Шаги:**
1. Открыть claude.ai
2. Начать чат в проекте с Dialog-заглушкой ux-writer
3. Дождаться инициализации агента
4. Проверить что агент:
   - Загружает роль
   - Определяет что скилл установлен
   - Подтверждает: "Скилл skill-editorial-guidelines подключён"
   - НЕ предлагает скачивание/установку
**Ожидаемый результат:** Агент видит установленный скилл и подтверждает подключение без лишних действий.
**Статус:** [x] ручной, пройден

### TC-206: Dialog-заглушки генерируются для всех категорий

**Компонент:** publish.sh / Dialog
**Тип:** автоматический
**Предусловия:** нет
**Шаги:**
1. Запустить: `bash scripts/publish.sh --test-dir`
2. Проверить директории:
   - `.tmp-publish/production/Dialog/meta/` содержит файлы
   - `.tmp-publish/production/Dialog/assistants/` содержит файлы
   - `.tmp-publish/production/Dialog/specialists/` содержит файлы
   - `.tmp-publish/production/Dialog/creative/` содержит файлы
3. Подсчитать файлы Dialog vs файлы Agents — количество должно совпадать:
   ```
   AGENTS=$(find .tmp-publish/production/Agents/ -name "*.md" | wc -l | tr -d ' ')
   DIALOG=$(find .tmp-publish/production/Dialog/ -name "*.md" | wc -l | tr -d ' ')
   [ "$AGENTS" = "$DIALOG" ] && echo OK
   ```
**Ожидаемый результат:** Каждая роль в Agents/ имеет соответствующую заглушку в Dialog/. Количество файлов совпадает.
**Статус:** [x] пройден

### TC-207: Роль без скиллов не содержит секцию самопроверки

**Компонент:** Роли (шаблон)
**Тип:** автоматический
**Предусловия:** нет
**Шаги:**
1. Выбрать роль, которая не использует скиллы (например, `Roles/assistants/data-aggregator.md`)
2. Проверить: `grep "Самопроверка при запуске" Roles/assistants/data-aggregator.md` — должно быть пусто
3. Проверить шаблон роли (`Roles/templates/role-template.md`): секция самопроверки помечена как опциональная
**Ожидаемый результат:** Роли без скиллов не содержат секцию самопроверки. Шаблон явно указывает что секция опциональна.
**Статус:** [x] пройден

---

## 4. Обратная совместимость

### TC-301: Файлы-скиллы и директории-скиллы сосуществуют в источнике

**Компонент:** Skills/
**Тип:** автоматический
**Предусловия:** нет
**Шаги:**
1. Подсчитать файлы-скиллы: `find Skills/ -maxdepth 1 -name "skill-*.md" -type f | wc -l | tr -d ' '`
2. Подсчитать директории-скиллы: `find Skills/ -maxdepth 1 -name "skill-*" -type d | wc -l | tr -d ' '`
3. Проверить что оба счётчика > 0
4. Запустить: `bash scripts/publish.sh --test-dir` — без ошибок
5. Проверить код возврата: `echo $?` — должен быть 0
**Ожидаемый результат:** publish.sh корректно обрабатывает оба формата за один запуск. Код возврата 0.
**Статус:** [x] пройден

### TC-302: Один и тот же скилл не существует одновременно как файл и как директория

**Компонент:** Skills/
**Тип:** автоматический
**Предусловия:** нет
**Шаги:**
1. Получить список файлов-скиллов: `find Skills/ -maxdepth 1 -name "skill-*.md" -type f -exec basename {} .md \;`
2. Получить список директорий-скиллов: `find Skills/ -maxdepth 1 -name "skill-*" -type d -exec basename {} \;`
3. Сравнить списки — пересечение должно быть пустым
**Ожидаемый результат:** Нет скилла, который существует одновременно и как файл `.md`, и как директория. Форматы не конфликтуют.
**Статус:** [x] пройден

### TC-303: Все роли из Roles/ публикуются в Agents/

**Компонент:** publish.sh
**Тип:** автоматический
**Предусловия:** нет
**Шаги:**
1. Подсчитать роли в источнике (без templates/ и private/):
   ```
   SRC=$(find Roles/meta Roles/assistants Roles/specialists Roles/creative -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
   ```
2. Запустить: `bash scripts/publish.sh --test-dir`
3. Подсчитать роли в Agents/:
   ```
   DST=$(find .tmp-publish/production/Agents/ -name "*.md" -type f | wc -l | tr -d ' ')
   ```
4. Сравнить: `[ "$SRC" = "$DST" ] && echo OK`
**Ожидаемый результат:** Количество ролей в источнике (по категориям) равно количеству в Production/Agents/.
**Статус:** [x] пройден

### TC-304: Агенты в claude/agents/ имеют префикс agent-

**Компонент:** publish.sh
**Тип:** автоматический
**Предусловия:** нет
**Шаги:**
1. Запустить: `bash scripts/publish.sh --test-dir`
2. Проверить что все файлы в claude/agents/ имеют префикс `agent-`:
   ```
   find .tmp-publish/claude/agents/ -name "*.md" -type f | while read f; do
     basename "$f" | grep -q '^agent-' || echo "FAIL: $f"
   done
   ```
**Ожидаемый результат:** Все файлы в `claude/agents/` начинаются с `agent-`. Нет файлов без этого префикса.
**Статус:** [x] пройден

### TC-305: README.md генерируется и содержит все роли и скиллы

**Компонент:** publish.sh
**Тип:** автоматический
**Предусловия:** нет
**Шаги:**
1. Запустить: `bash scripts/publish.sh --test-dir`
2. Проверить существование: `test -f .tmp-publish/production/README.md && echo OK`
3. Проверить что содержит таблицу ролей: `grep -c "^|" .tmp-publish/production/README.md`
4. Проверить что упомянуты все категории: `grep -c "Мета-роли\|Помощники\|Специалисты\|Креативные" .tmp-publish/production/README.md`
5. Проверить секцию статистики: `grep "Ролей:" .tmp-publish/production/README.md`
**Ожидаемый результат:** README.md существует, содержит таблицы ролей и скиллов, статистику, все категории.
**Статус:** [x] пройден

---

## 5. Edge-cases

### TC-401: Директория-скилл без SKILL.md игнорируется

**Компонент:** publish.sh
**Тип:** автоматический
**Предусловия:** нет
**Шаги:**
1. Создать пустую директорию:
   ```
   mkdir -p Skills/skill-empty-test
   echo "# Not a SKILL" > Skills/skill-empty-test/readme.md
   ```
2. Запустить: `bash scripts/publish.sh --test-dir`
3. Проверить: `test ! -f .tmp-publish/production/Skills/skill-empty-test.skill && echo SKIPPED`
4. Проверить: `test ! -d .tmp-publish/claude/skills/skill-empty-test && echo SKIPPED`
5. Очистить: `rm -rf Skills/skill-empty-test`
**Ожидаемый результат:** Директория без SKILL.md полностью игнорируется. Нет архива, нет копии.
**Статус:** [x] пройден

### TC-402: Полностью пустая директория-скилл игнорируется

**Компонент:** publish.sh
**Тип:** автоматический
**Предусловия:** нет
**Шаги:**
1. Создать пустую директорию: `mkdir -p Skills/skill-completely-empty`
2. Запустить: `bash scripts/publish.sh --test-dir`
3. Проверить: `test ! -f .tmp-publish/production/Skills/skill-completely-empty.skill && echo SKIPPED`
4. Проверить: `test ! -d .tmp-publish/claude/skills/skill-completely-empty && echo SKIPPED`
5. Очистить: `rmdir Skills/skill-completely-empty`
**Ожидаемый результат:** Пустая директория игнорируется. Скрипт не падает.
**Статус:** [x] пройден

### TC-403: publish.sh корректно работает с путями содержащими пробелы

**Компонент:** publish.sh
**Тип:** автоматический
**Предусловия:** Корень проекта содержит пробел в пути (`Cursor Projects/Role creator`)
**Шаги:**
1. Запустить: `bash scripts/publish.sh --test-dir`
2. Проверить код возврата: `echo $?`
3. Проверить что все файлы созданы корректно
**Ожидаемый результат:** Скрипт корректно обрабатывает путь с пробелами. Код возврата 0.
**Статус:** [x] пройден

### TC-404: Скилл-файл с невалидным frontmatter не ломает publish.sh

**Компонент:** publish.sh
**Тип:** автоматический
**Предусловия:** нет
**Шаги:**
1. Создать скилл с некорректным frontmatter:
   ```
   cat > Skills/skill-broken-fm.md << 'EOF'
   ---
   name: broken
   description missing colon
   ---
   # Content
   EOF
   ```
2. Запустить: `bash scripts/publish.sh --test-dir`
3. Проверить код возврата: `echo $?` — должен быть 0 (скрипт не падает)
4. Проверить что остальные скиллы опубликованы
5. Очистить: `rm Skills/skill-broken-fm.md`
**Ожидаемый результат:** publish.sh не падает на невалидном frontmatter. Файл копируется (возможно, без полной фильтрации). Остальные скиллы не затронуты.
**Статус:** [x] пройден

### TC-405: Скилл без frontmatter публикуется как есть

**Компонент:** publish.sh
**Тип:** автоматический
**Предусловия:** нет
**Шаги:**
1. Создать скилл без frontmatter:
   ```
   echo "# Simple skill\n\nNo frontmatter here." > Skills/skill-no-fm.md
   ```
2. Запустить: `bash scripts/publish.sh --test-dir`
3. Проверить: `test -f .tmp-publish/production/Skills/skill-no-fm.md && echo OK`
4. Проверить содержимое идентично: `diff Skills/skill-no-fm.md .tmp-publish/production/Skills/skill-no-fm.md`
5. Очистить: `rm Skills/skill-no-fm.md`
**Ожидаемый результат:** Файл без frontmatter копируется как есть, без ошибок.
**Статус:** [x] пройден

### TC-406: .skill архив не содержит .DS_Store

**Компонент:** publish.sh
**Тип:** автоматический
**Предусловия:** В `Skills/skill-editorial-guidelines/` может быть `.DS_Store` (macOS)
**Шаги:**
1. Запустить: `bash scripts/publish.sh --test-dir`
2. Проверить: `unzip -l .tmp-publish/production/Skills/skill-editorial-guidelines.skill | grep -c ".DS_Store"`
**Ожидаемый результат:** Архив не содержит `.DS_Store`. Результат grep — 0. Если содержит — нужно добавить `-x "*.DS_Store"` в команду zip.
**Статус:** [x] пройден

### TC-407: Повторный запуск publish.sh идемпотентен

**Компонент:** publish.sh
**Тип:** автоматический
**Предусловия:** нет
**Шаги:**
1. Запустить: `bash scripts/publish.sh --test-dir`
2. Записать md5 всех файлов:
   ```
   find .tmp-publish/production/Agents .tmp-publish/production/Skills -name "*.md" -exec md5 {} \; | sort > /tmp/run1.txt
   ```
3. Запустить повторно: `bash scripts/publish.sh --test-dir`
4. Записать md5 повторно:
   ```
   find .tmp-publish/production/Agents .tmp-publish/production/Skills -name "*.md" -exec md5 {} \; | sort > /tmp/run2.txt
   ```
5. Сравнить: `diff /tmp/run1.txt /tmp/run2.txt`
**Ожидаемый результат:** Содержимое .md файлов Agents/ и Skills/ идентично между запусками. Dialog-заглушки могут отличаться (cache bust), это ожидаемо.
**Статус:** [x] пройден

### TC-408: Недоступный URL в роли — агент корректно обрабатывает (ручной)

**Компонент:** Dialog / ux-writer
**Тип:** ручной
**Предусловия:** Сломать URL роли в Dialog-заглушке (например, указать несуществующую ветку)
**Шаги:**
1. Создать модифицированную заглушку с некорректным URL (несуществующая ветка)
2. Загрузить как Project Knowledge в claude.ai
3. Начать чат
4. Проверить что агент сообщает об ошибке загрузки и просит предоставить роль вручную
**Ожидаемый результат:** Агент не падает, а корректно обрабатывает ошибку: сообщает что ссылка недоступна и предлагает альтернативу.
**Статус:** [x] ручной, пройден — агент получил 404, не галлюцинировал, корректно сообщил об ошибке и предложил 3 варианта действий: проверить ссылку, вставить роль вручную, дать актуальную ссылку.

### TC-409: GITHUB_BRANCH="main" до мержа — публикация работает

**Компонент:** publish.sh
**Тип:** автоматический
**Предусловия:** Текущее значение `GITHUB_BRANCH="feature/role-skill-extraction"` в publish.sh
**Шаги:**
1. Запомнить текущее значение
2. Временно изменить на `GITHUB_BRANCH="main"` в publish.sh
3. Запустить: `bash scripts/publish.sh --test-dir`
4. Проверить что Dialog-заглушки содержат `/main/` в URL
5. Вернуть исходное значение
**Ожидаемый результат:** Скрипт работает с любым значением GITHUB_BRANCH. URL в заглушках корректно формируются.
**Статус:** [x] пройден

### TC-410: Скилл-маршрутизатор с процедурой, ссылающейся на несуществующий файл

**Компонент:** skill-editorial-guidelines (или шаблон)
**Тип:** автоматический
**Предусловия:** нет
**Шаги:**
1. Проверить все ссылки вида `[file.md](file.md)` в SKILL.md
2. Также проверить ссылки внутри файлов-процедур (если процедура ссылается на другую):
   ```
   for f in Skills/skill-editorial-guidelines/*.md; do
     grep -oP '\[([^\]]+\.md)\]\(\1\)' "$f" | while read link; do
       ref=$(echo "$link" | grep -oP '\(([^\)]+)\)' | tr -d '()')
       [ ! -f "Skills/skill-editorial-guidelines/$ref" ] && echo "BROKEN: $f -> $ref"
     done
   done
   ```
**Ожидаемый результат:** Нет битых ссылок ни в SKILL.md, ни в файлах-процедурах.
**Статус:** [x] пройден

### TC-411: publish.sh --test-dir не оставляет файлов в Production/ при повторном запуске без --test-dir

**Компонент:** publish.sh
**Тип:** автоматический
**Предусловия:** нет
**Шаги:**
1. Запустить: `bash scripts/publish.sh --test-dir`
2. Проверить что `.tmp-publish/` существует
3. Запустить без флага: `bash scripts/publish.sh --dry`
4. Проверить что dry-run показывает пути `~/.claude/` и `Production/`, а не `.tmp-publish/`
**Ожидаемый результат:** Без флага `--test-dir` скрипт работает с реальными путями. Тестовый режим полностью изолирован.
**Статус:** [x] пройден

---

## 6. Пост-мерж проверки (Этап 2b cleanup)

### TC-501: GITHUB_BRANCH возвращён на "main" перед мержем

**Компонент:** publish.sh
**Тип:** автоматический
**Предусловия:** Перед мержем в main
**Шаги:**
1. Проверить: `grep '^GITHUB_BRANCH=' scripts/publish.sh`
2. Значение должно быть `"main"`
**Ожидаемый результат:** `GITHUB_BRANCH="main"`.
**Статус:** [!] не пройден — ожидаемо: GITHUB_BRANCH="feature/role-skill-extraction". Cleanup перед мержем ещё не выполнен.

### TC-502: Cache bust убран из URL в publish.sh

**Компонент:** publish.sh
**Тип:** автоматический
**Предусловия:** Перед мержем в main
**Шаги:**
1. Проверить: `grep 'CACHE_BUST' scripts/publish.sh` — строка с `CACHE_BUST=$(date +%s)` должна быть удалена или закомментирована
2. Проверить: `grep '?v=' scripts/publish.sh` — не должно быть в generate_dialog_file()
**Ожидаемый результат:** Cache bust убран из publish.sh. URL в Dialog-заглушках не содержат `?v=`.
**Статус:** [!] не пройден — ожидаемо: CACHE_BUST и ?v= ещё присутствуют. Cleanup перед мержем ещё не выполнен.

### TC-503: URL .skill в роли ux-writer указывает на main

**Компонент:** ux-writer (роль)
**Тип:** автоматический
**Предусловия:** Перед мержем в main
**Шаги:**
1. Проверить: `grep "feature/role-skill-extraction" Roles/specialists/ux-writer.md` — должно быть пусто
2. Проверить: `grep "raw.githubusercontent.com.*main.*\.skill" Roles/specialists/ux-writer.md`
**Ожидаемый результат:** URL .skill файла в роли указывает на ветку `main`, а не `feature/role-skill-extraction`. Cache bust `?v=` убран.
**Статус:** [!] не пройден — ожидаемо: URL в роли ux-writer ссылается на feature/role-skill-extraction. Cleanup перед мержем ещё не выполнен.

### TC-504: Шаблон роли содержит инструкцию самопроверки скиллов

**Компонент:** role-template
**Тип:** автоматический
**Предусловия:** нет
**Шаги:**
1. Проверить: `grep "Самопроверка при запуске" Roles/templates/role-template.md`
2. Проверить: шаблон содержит пометку что секция опциональна (только для ролей со скиллами)
3. Проверить: шаблон содержит пример сообщения о подключении и инструкцию установки
**Ожидаемый результат:** Шаблон содержит секцию самопроверки с пометкой об опциональности и примерами.
**Статус:** [x] пройден

---

## Сводная таблица

| Группа | Авто | Ручные | Всего |
|--------|------|--------|-------|
| 1. publish.sh | 18 | 0 | 18 |
| 2. Скилл-маршрутизатор | 7 | 0 | 7 |
| 3. Dialog-агенты | 5 | 2 | 7 |
| 4. Обратная совместимость | 5 | 0 | 5 |
| 5. Edge-cases | 10 | 1 | 11 |
| 6. Пост-мерж | 4 | 0 | 4 |
| **Итого** | **49** | **3** | **52** |

---

## Результаты прогона

**Дата:** 2026-05-01
**Ветка:** `feature/role-skill-extraction`
**Окружение:** macOS Darwin 25.2.0, bash, zsh

### Сводка

| Статус | Количество |
|--------|-----------|
| [x] Пройден | 49 |
| [!] Не пройден | 3 |
| [-] Ручной, пропущен | 0 |
| **Итого** | **52** |

### Не пройденные тесты

**TC-501: GITHUB_BRANCH не возвращён на "main"**
- Severity: N/A (ожидаемо)
- Текущее значение: `GITHUB_BRANCH="feature/role-skill-extraction"` -- корректно для текущей ветки
- Действие: cleanup перед мержем в main

**TC-502: Cache bust не убран из publish.sh**
- Severity: N/A (ожидаемо)
- CACHE_BUST и ?v= присутствуют -- нужны для работы с feature-веткой
- Действие: cleanup перед мержем в main

**TC-503: URL .skill в роли ux-writer не указывает на main**
- Severity: N/A (ожидаемо)
- URL ссылается на feature/role-skill-extraction -- корректно для текущей ветки
- Действие: cleanup перед мержем в main

### Ручные тесты (пройдены)

- **TC-203**: URL .skill файла в роли ux-writer доступен -- HTTP 200, валидный zip
- **TC-204**: Dialog-агент ux-writer без скилла -- проверен вручную в claude.ai
- **TC-205**: Dialog-агент ux-writer со скиллом -- проверен вручную в claude.ai
- **TC-408**: Недоступный URL в роли -- агент получил 404, не галлюцинировал, корректно сообщил об ошибке и предложил 3 варианта действий

### Найденные баги

Нет открытых багов. TC-012 исправлен (publish.sh теперь выводит "skill-template/ — пропущено (шаблон)").
