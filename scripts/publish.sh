#!/bin/bash

# =============================================================================
# publish.sh — Скрипт публикации ролей, скиллов и заглушек
# =============================================================================
#
# Использование:
#   ./scripts/publish.sh          — публикует все роли и скиллы
#   ./scripts/publish.sh --dry    — показывает что будет скопировано (без изменений)
#
# Структура Production:
#   Production/
#   ├── Agents/       — роли по категориям (assistants, specialists, creative, meta)
#   ├── Dialog/       — заглушки с инструкцией загрузки роли с GitHub
#   ├── Skills/       — скиллы (flat формат, префикс skill-)
#   └── README.md     — каталог ролей и скиллов
#
# Дополнительно:
#   ~/.claude/agents  — агенты для Claude Code (формат agent-{name}.md)
#   ~/.claude/skills  — скиллы для Claude Code (формат skill-{name}/SKILL.md)
#
# =============================================================================

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Определяем корневую директорию проекта
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

SOURCE_DIR="$PROJECT_ROOT/Roles"
SKILLS_SOURCE_DIR="$PROJECT_ROOT/Skills"
TARGET_DIR="$PROJECT_ROOT/Production"
AGENTS_TARGET_DIR="$TARGET_DIR/Agents"
SKILLS_TARGET_DIR="$TARGET_DIR/Skills"
DIALOG_DIR="$TARGET_DIR/Dialog"
README_FILE="$TARGET_DIR/README.md"
CLAUDE_AGENTS_DIR="$HOME/.claude/agents"
CLAUDE_SKILLS_DIR="$HOME/.claude/skills"
PRIVATE_ROLES_DIR="$PROJECT_ROOT/Roles.private"
PRIVATE_SKILLS_DIR="$PROJECT_ROOT/Skills.private"

# GitHub репозиторий для заглушек
GITHUB_REPO="klimsergeev/role-master"
GITHUB_BRANCH="main"

# Проверка аргументов
DRY_RUN=false
TEST_DIR=false
for arg in "$@"; do
    case "$arg" in
        --dry)
            DRY_RUN=true
            ;;
        --test-dir)
            TEST_DIR=true
            ;;
        --help)
            echo "Использование: ./scripts/publish.sh [--dry] [--test-dir] [--help]"
            echo "  --dry       Показать что будет скопировано (без изменений)"
            echo "  --test-dir  Публикация в .tmp-publish/ (тестовый режим)"
            echo "  --help      Показать эту справку"
            exit 0
            ;;
    esac
done

if [[ "$DRY_RUN" == true ]]; then
    echo -e "${YELLOW}🔍 Режим просмотра (dry run) — изменения не будут применены${NC}\n"
fi

# Переопределяем пути для тестового режима
if [[ "$TEST_DIR" == true ]]; then
    echo -e "${YELLOW}⚠️ ТЕСТОВЫЙ РЕЖИМ: публикация в .tmp-publish/${NC}\n"
    TARGET_DIR="$PROJECT_ROOT/.tmp-publish/production"
    AGENTS_TARGET_DIR="$TARGET_DIR/Agents"
    SKILLS_TARGET_DIR="$TARGET_DIR/Skills"
    DIALOG_DIR="$TARGET_DIR/Dialog"
    README_FILE="$TARGET_DIR/README.md"
    CLAUDE_AGENTS_DIR="$PROJECT_ROOT/.tmp-publish/claude/agents"
    CLAUDE_SKILLS_DIR="$PROJECT_ROOT/.tmp-publish/claude/skills"
fi

echo -e "${BLUE}📦 Публикация ролей и скиллов${NC}"
echo "   Роли: $SOURCE_DIR -> $AGENTS_TARGET_DIR"
echo "   Скиллы (Github): $SKILLS_SOURCE_DIR -> $SKILLS_TARGET_DIR"
echo "   Скиллы (Claude): $SKILLS_SOURCE_DIR -> $CLAUDE_SKILLS_DIR"
echo "   Для веб-диалогов: $DIALOG_DIR"
echo ""

# Проверяем существование директорий
if [[ ! -d "$SOURCE_DIR" ]]; then
    echo -e "${RED}❌ Ошибка: Папка $SOURCE_DIR не найдена${NC}"
    exit 1
fi

if [[ ! -d "$TARGET_DIR" ]]; then
    echo -e "${YELLOW}⚠️  Папка $TARGET_DIR не существует, создаю...${NC}"
    if [[ "$DRY_RUN" == false ]]; then
        mkdir -p "$TARGET_DIR"
    fi
fi

if [[ ! -d "$AGENTS_TARGET_DIR" ]]; then
    if [[ "$DRY_RUN" == false ]]; then
        mkdir -p "$AGENTS_TARGET_DIR"
    fi
fi

# Считаем файлы до синхронизации
BEFORE_COUNT=$(find "$AGENTS_TARGET_DIR" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
BEFORE_SKILLS_COUNT=$(find "$SKILLS_TARGET_DIR" \( -name "*.md" -o -name "*.skill" \) 2>/dev/null | wc -l | tr -d ' ')
BEFORE_CLAUDE_SKILLS_COUNT=$(find "$CLAUDE_SKILLS_DIR" -name "SKILL.md" 2>/dev/null | wc -l | tr -d ' ')

# Список категорий (папок) — без templates (шаблоны не публикуются)
CATEGORIES="meta assistants specialists creative"

echo -e "${BLUE}📁 Синхронизация ролей в Agents/:${NC}"

for category in $CATEGORIES; do
    SOURCE_CAT="$SOURCE_DIR/$category"
    TARGET_CAT="$AGENTS_TARGET_DIR/$category"

    if [[ -d "$SOURCE_CAT" ]]; then
        # Считаем .md файлы в категории
        FILE_COUNT=$(find "$SOURCE_CAT" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')

        if [[ "$FILE_COUNT" -gt 0 ]]; then
            echo -e "   ${GREEN}✓${NC} Agents/$category — $FILE_COUNT файл(ов)"

            if [[ "$DRY_RUN" == false ]]; then
                # Создаём директорию если не существует
                mkdir -p "$TARGET_CAT"

                # Копируем только .md файлы с сохранением структуры
                rsync -av --delete \
                    --include="*/" \
                    --include="*.md" \
                    --exclude="*" \
                    "$SOURCE_CAT/" "$TARGET_CAT/" \
                    > /dev/null 2>&1
            fi
        else
            # Папка пуста в источнике — удаляем из Agents если существует
            if [[ -d "$TARGET_CAT" ]]; then
                echo -e "   ${YELLOW}✗${NC} Agents/$category — удаляю пустую папку"
                if [[ "$DRY_RUN" == false ]]; then
                    rm -rf "$TARGET_CAT"
                fi
            else
                echo -e "   ${YELLOW}○${NC} Agents/$category — пропущено (пусто)"
            fi
        fi
    else
        # Папка не существует в источнике — удаляем из Agents если существует
        if [[ -d "$TARGET_CAT" ]]; then
            echo -e "   ${YELLOW}✗${NC} Agents/$category — удаляю (нет в источнике)"
            if [[ "$DRY_RUN" == false ]]; then
                rm -rf "$TARGET_CAT"
            fi
        else
            echo -e "   ${YELLOW}○${NC} Agents/$category — пропущено (не существует)"
        fi
    fi
done

# Удаляем папки в Agents, которые не входят в CATEGORIES
if [[ -d "$AGENTS_TARGET_DIR" ]]; then
    for dir in "$AGENTS_TARGET_DIR"/*/; do
        if [[ -d "$dir" ]]; then
            dir_name=$(basename "$dir")
            is_valid_category=false

            for category in $CATEGORIES; do
                if [[ "$dir_name" == "$category" ]]; then
                    is_valid_category=true
                    break
                fi
            done

            if [[ "$is_valid_category" == false ]]; then
                echo -e "   ${YELLOW}✗${NC} Agents/$dir_name — удаляю (не в списке категорий)"
                if [[ "$DRY_RUN" == false ]]; then
                    rm -rf "$dir"
                fi
            fi
        fi
    done
fi

echo ""

# =============================================================================
# Функция получения описания категории
# =============================================================================
get_category_desc() {
    case "$1" in
        "meta")        echo "🎭 Мета-роли" ;;
        "assistants")  echo "🤖 Помощники и ассистенты" ;;
        "specialists") echo "🔧 Специалисты" ;;
        "creative")    echo "🎨 Креативные роли" ;;
        *)             echo "$1" ;;
    esac
}

# =============================================================================
# Вспомогательные функции
# =============================================================================

# Извлекает name из frontmatter или использует имя файла
get_role_name() {
    local file="$1"
    local name=""

    # Пробуем извлечь name из frontmatter (между ---)
    if head -1 "$file" 2>/dev/null | grep -q '^---'; then
        name=$(sed -n '2,/^---$/p' "$file" 2>/dev/null | grep '^name:' | sed 's/^name:[[:space:]]*//' | tr -d '\r')
    fi

    # Если не нашли, используем имя файла без расширения
    if [[ -z "$name" ]]; then
        name=$(basename "$file" .md)
    fi

    echo "$name"
}

# Извлекает description из frontmatter (поддерживает однострочные и multiline YAML-значения)
get_role_description() {
    local file="$1"
    local description=""

    # Пробуем извлечь description из frontmatter (между ---)
    if head -1 "$file" 2>/dev/null | grep -q '^---'; then
        # Извлекаем frontmatter (строки между первым и вторым ---)
        local frontmatter
        frontmatter=$(sed -n '2,/^---$/p' "$file" 2>/dev/null | sed '$d')

        # Ищем строку description:
        local desc_line
        desc_line=$(echo "$frontmatter" | grep '^description:')

        if [[ -n "$desc_line" ]]; then
            # Извлекаем значение после "description:"
            local inline_value
            inline_value=$(echo "$desc_line" | sed 's/^description:[[:space:]]*//' | tr -d '\r')

            if [[ "$inline_value" == ">" || "$inline_value" == "|" || -z "$inline_value" ]]; then
                # Multiline YAML (folded > или literal |): собираем строки с отступом после description:
                description=$(echo "$frontmatter" | sed -n '/^description:/,/^[a-zA-Z_-]*:/{ /^description:/d; /^[a-zA-Z_-]*:/d; p; }' | sed 's/^[[:space:]]*//' | tr -d '\r' | tr '\n' ' ' | sed 's/[[:space:]]*$//')
            else
                description="$inline_value"
            fi
        fi
    fi

    # Если не нашли, ставим прочерк
    if [[ -z "$description" ]]; then
        description="—"
    fi

    echo "$description"
}

# =============================================================================
# Синхронизация в Claude Agents (~/.claude/agents)
# =============================================================================

# Копирует .md роли из source_dir → ~/.claude/agents/agent-<name>.md
# Аргументы: source_dir, label ("" или " (private)")
# Использует глобальные: CLAUDE_AGENTS_DIR, DRY_RUN, CATEGORIES
# Изменяет глобальные: _SYNCED_AGENTS_COUNT
process_roles_to_claude() {
    local source_dir="$1"
    local label="$2"

    if [[ ! -d "$source_dir" ]]; then return; fi

    while IFS= read -r -d '' file; do
        if [[ -n "$file" ]]; then
            local role_name=$(get_role_name "$file")
            local agent_file="$CLAUDE_AGENTS_DIR/agent-$role_name.md"

            if [[ "$DRY_RUN" == false ]]; then
                cp "$file" "$agent_file"
            fi

            echo -e "   ${GREEN}✓${NC} $role_name -> agent-$role_name.md${label}"
            _SYNCED_AGENTS_COUNT=$((_SYNCED_AGENTS_COUNT + 1))
        fi
    done < <(find "$source_dir" -name "*.md" -type f -print0 2>/dev/null)
}

# Собирает имена валидных агентов из source_dir в глобальный массив VALID_AGENTS
# Аргументы: source_dir
collect_valid_agents() {
    local source_dir="$1"

    if [[ ! -d "$source_dir" ]]; then return; fi

    while IFS= read -r -d '' file; do
        if [[ -n "$file" ]]; then
            local role_name=$(get_role_name "$file")
            VALID_AGENTS+=("agent-$role_name.md")
        fi
    done < <(find "$source_dir" -name "*.md" -type f -print0 2>/dev/null)
}

# Синхронизирует роли в Claude Agents (формат agent-{name}.md)
sync_to_claude_agents() {
    echo -e "${BLUE}🤖 Синхронизация в Claude Agents:${NC}"
    echo "   Назначение: $CLAUDE_AGENTS_DIR"
    echo ""

    # Создаём директорию agents если не существует
    if [[ ! -d "$CLAUDE_AGENTS_DIR" ]]; then
        if [[ "$DRY_RUN" == false ]]; then
            mkdir -p "$CLAUDE_AGENTS_DIR"
        fi
    fi

    _SYNCED_AGENTS_COUNT=0

    # Публичные роли (по категориям)
    for category in $CATEGORIES; do
        process_roles_to_claude "$SOURCE_DIR/$category" ""
    done

    # Приватные роли
    process_roles_to_claude "$PRIVATE_ROLES_DIR" " (private)"

    # Собираем список валидных агентов для очистки устаревших
    VALID_AGENTS=()
    for category in $CATEGORIES; do
        collect_valid_agents "$SOURCE_DIR/$category"
    done
    collect_valid_agents "$PRIVATE_ROLES_DIR"

    # Удаляем агентов, которых нет в исходниках
    local DELETED_COUNT=0
    if [[ -d "$CLAUDE_AGENTS_DIR" ]]; then
        while IFS= read -r -d '' agent_file; do
            local fname=$(basename "$agent_file")
            local is_valid=false

            for valid_agent in "${VALID_AGENTS[@]}"; do
                if [[ "$fname" == "$valid_agent" ]]; then
                    is_valid=true
                    break
                fi
            done

            if [[ "$is_valid" == false ]]; then
                if [[ "$DRY_RUN" == false ]]; then
                    rm -f "$agent_file"
                fi
                echo -e "   ${YELLOW}✗${NC} $fname (удалён)"
                DELETED_COUNT=$((DELETED_COUNT + 1))
            fi
        done < <(find "$CLAUDE_AGENTS_DIR" -maxdepth 1 -name "agent-*.md" -type f -print0 2>/dev/null)
    fi

    echo ""
    echo "   Синхронизировано: $_SYNCED_AGENTS_COUNT агентов"
    if [[ "$DELETED_COUNT" -gt 0 ]]; then
        echo "   Удалено: $DELETED_COUNT агентов"
    fi
    echo ""
}

# =============================================================================
# Синхронизация в Dialog (заглушки для загрузки ролей с GitHub)
# =============================================================================

# Генерирует файл-заглушку с инструкцией загрузки роли
generate_dialog_file() {
    local category="$1"
    local filename="$2"

    cat << DIALOGEOF
# Project Instructions

## Инициализация разговора

В начале каждого разговора **обязательно** выполни:

### 1. Приложенные файлы проекта
- Прочитай **все** файлы, приложенные к этому проекту
- Примени их инструкции как системные правила на весь разговор

### 2. Загрузка роли
- Загрузи файл роли по ссылке: \`https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/Production/Agents/${category}/${filename}\`
- Прочитай содержимое полностью
- Примени все инструкции из файла как системные правила на весь разговор

### 3. Подтверждение
- Подтверди кратко: «Роль \`[name]\` загружена, версия [version]. Файлы проекта прочитаны.»

Если ссылка недоступна — сообщи пользователю и спроси, предоставить ли роль вручную.

## Приоритет инструкций

1. Инструкции из приложенных файлов проекта
2. Инструкции из загруженной роли
3. Инструкции из этого документа
4. Общие настройки Claude
DIALOGEOF
}

# Синхронизирует заглушки в Dialog (полная синхронизация с удалением)
sync_to_dialog() {
    echo -e "${BLUE}📎 Синхронизация в Dialog (заглушки для Claude):${NC}"
    echo "   Назначение: $DIALOG_DIR"
    echo ""

    # Создаём директорию если не существует
    if [[ ! -d "$DIALOG_DIR" ]]; then
        if [[ "$DRY_RUN" == false ]]; then
            mkdir -p "$DIALOG_DIR"
        fi
    fi

    local SYNCED_COUNT=0

    for category in $CATEGORIES; do
        local SOURCE_CAT="$SOURCE_DIR/$category"
        local DIALOG_CAT="$DIALOG_DIR/$category"

        if [[ -d "$SOURCE_CAT" ]]; then
            local FILE_COUNT=$(find "$SOURCE_CAT" -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')

            if [[ "$FILE_COUNT" -gt 0 ]]; then
                if [[ "$DRY_RUN" == false ]]; then
                    mkdir -p "$DIALOG_CAT"
                fi

                # Генерируем заглушки
                while IFS= read -r -d '' file; do
                    if [[ -n "$file" ]]; then
                        local filename=$(basename "$file")
                        local dialog_file="$DIALOG_CAT/$filename"

                        if [[ "$DRY_RUN" == false ]]; then
                            generate_dialog_file "$category" "$filename" > "$dialog_file"
                        fi

                        echo -e "   ${GREEN}✓${NC} $category/$filename"
                        SYNCED_COUNT=$((SYNCED_COUNT + 1))
                    fi
                done < <(find "$SOURCE_CAT" -name "*.md" -type f -print0 2>/dev/null)

                # Удаляем файлы из Dialog, которых нет в источнике
                if [[ -d "$DIALOG_CAT" && "$DRY_RUN" == false ]]; then
                    while IFS= read -r -d '' dialog_file; do
                        local fname=$(basename "$dialog_file")
                        if [[ ! -f "$SOURCE_CAT/$fname" ]]; then
                            rm -f "$dialog_file"
                            echo -e "   ${YELLOW}✗${NC} $category/$fname (удалён)"
                        fi
                    done < <(find "$DIALOG_CAT" -name "*.md" -type f -print0 2>/dev/null)
                fi
            else
                # Пустая категория — удаляем из Dialog
                if [[ -d "$DIALOG_CAT" ]]; then
                    echo -e "   ${YELLOW}✗${NC} /$category — удаляю пустую папку"
                    if [[ "$DRY_RUN" == false ]]; then
                        rm -rf "$DIALOG_CAT"
                    fi
                fi
            fi
        else
            # Категория не существует — удаляем из Dialog
            if [[ -d "$DIALOG_CAT" ]]; then
                echo -e "   ${YELLOW}✗${NC} /$category — удаляю (нет в источнике)"
                if [[ "$DRY_RUN" == false ]]; then
                    rm -rf "$DIALOG_CAT"
                fi
            fi
        fi
    done

    # Удаляем папки в Dialog, которые не входят в CATEGORIES
    if [[ -d "$DIALOG_DIR" ]]; then
        for dir in "$DIALOG_DIR"/*/; do
            if [[ -d "$dir" ]]; then
                local dname=$(basename "$dir")
                local is_valid=false
                for category in $CATEGORIES; do
                    if [[ "$dname" == "$category" ]]; then
                        is_valid=true
                        break
                    fi
                done
                if [[ "$is_valid" == false ]]; then
                    echo -e "   ${YELLOW}✗${NC} /$dname — удаляю (не в списке категорий)"
                    if [[ "$DRY_RUN" == false ]]; then
                        rm -rf "$dir"
                    fi
                fi
            fi
        done
    fi

    echo ""
    echo "   Синхронизировано: $SYNCED_COUNT файлов"
    echo ""
}

# =============================================================================
# Синхронизация в Claude Skills (~/.claude/skills)
# =============================================================================

# Копирует flat skill-*.md файлы → ~/.claude/skills/<name>/SKILL.md
# Аргументы: source_dir, target_dir, label ("" или " (private)")
# Изменяет глобальные: _SYNCED_SKILLS_COUNT
process_flat_skills_to_claude() {
    local source_dir="$1"
    local target_dir="$2"
    local label="$3"

    if [[ ! -d "$source_dir" ]]; then return; fi

    while IFS= read -r -d '' file; do
        if [[ -n "$file" ]]; then
            local filename=$(basename "$file")

            # Пропускаем шаблон
            if [[ "$filename" == "skill-template.md" ]]; then
                echo -e "   ${YELLOW}○${NC} $filename — пропущено (шаблон)"
                continue
            fi

            # Извлекаем имя скилла (без расширения)
            local skill_name="${filename%.md}"
            local skill_dir="$target_dir/$skill_name"
            local skill_file="$skill_dir/SKILL.md"

            # Создаём папку скилла если не существует
            if [[ ! -d "$skill_dir" ]]; then
                if [[ "$DRY_RUN" == false ]]; then
                    mkdir -p "$skill_dir"
                    echo -e "   ${GREEN}+${NC} $skill_name/ — создана папка"
                else
                    echo -e "   ${GREEN}+${NC} $skill_name/ — будет создана папка"
                fi
            fi

            # Копируем/обновляем только SKILL.md
            if [[ "$DRY_RUN" == false ]]; then
                cp "$file" "$skill_file"
            fi

            echo -e "   ${GREEN}✓${NC} $skill_name/SKILL.md — обновлён${label}"
            _SYNCED_SKILLS_COUNT=$((_SYNCED_SKILLS_COUNT + 1))
        fi
    done < <(find "$source_dir" -maxdepth 1 -name "skill-*.md" -type f -print0 2>/dev/null)
}

# Копирует директории skill-*/SKILL.md → ~/.claude/skills/ (rsync)
# Аргументы: source_dir, target_dir, label ("" или " (private)")
# Изменяет глобальные: _SYNCED_SKILLS_COUNT
process_dir_skills_to_claude() {
    local source_dir="$1"
    local target_dir="$2"
    local label="$3"

    if [[ ! -d "$source_dir" ]]; then return; fi

    while IFS= read -r -d '' skill_src_dir; do
        if [[ -n "$skill_src_dir" ]]; then
            local dir_name=$(basename "$skill_src_dir")

            # Пропускаем шаблон
            if [[ "$dir_name" == "skill-template" ]]; then
                echo -e "   ${YELLOW}○${NC} $dir_name/ — пропущено (шаблон)"
                continue
            fi

            # Проверяем наличие SKILL.md внутри
            if [[ ! -f "$skill_src_dir/SKILL.md" ]]; then
                continue
            fi

            local target_skill_dir="$target_dir/$dir_name"

            if [[ "$DRY_RUN" == false ]]; then
                mkdir -p "$target_skill_dir"
                rsync -a --delete "$skill_src_dir/" "$target_skill_dir/" > /dev/null 2>&1
            fi

            echo -e "   ${GREEN}✓${NC} $dir_name/ — обновлён (директория${label:+,$label})"
            _SYNCED_SKILLS_COUNT=$((_SYNCED_SKILLS_COUNT + 1))
        fi
    done < <(find "$source_dir" -maxdepth 1 -name "skill-*" -type d -print0 2>/dev/null)
}

# Собирает имена валидных скиллов из source_dir в глобальный массив VALID_SKILLS
# (flat .md + директории с SKILL.md, без template)
# Аргументы: source_dir
collect_valid_skills() {
    local source_dir="$1"

    if [[ ! -d "$source_dir" ]]; then return; fi

    # Flat-файлы skill-*.md
    while IFS= read -r -d '' file; do
        local fname=$(basename "$file")
        if [[ "$fname" == "skill-template.md" ]]; then continue; fi
        VALID_SKILLS+=("${fname%.md}")
    done < <(find "$source_dir" -maxdepth 1 -name "skill-*.md" -type f -print0 2>/dev/null)

    # Директории skill-*/SKILL.md
    while IFS= read -r -d '' dir; do
        local dname=$(basename "$dir")
        if [[ "$dname" == "skill-template" ]]; then continue; fi
        if [[ ! -f "$dir/SKILL.md" ]]; then continue; fi
        VALID_SKILLS+=("$dname")
    done < <(find "$source_dir" -maxdepth 1 -name "skill-*" -type d -print0 2>/dev/null)
}

# Синхронизирует скиллы в Claude Skills (формат skill-{name}/SKILL.md)
sync_to_claude_skills() {
    echo -e "${BLUE}📚 Синхронизация скиллов в Claude Skills:${NC}"
    echo "   Назначение: $CLAUDE_SKILLS_DIR"
    echo ""

    # Создаём директорию skills если не существует
    if [[ ! -d "$CLAUDE_SKILLS_DIR" ]]; then
        if [[ "$DRY_RUN" == false ]]; then
            mkdir -p "$CLAUDE_SKILLS_DIR"
        fi
    fi

    _SYNCED_SKILLS_COUNT=0

    # Flat-скиллы: публичные и приватные
    process_flat_skills_to_claude "$SKILLS_SOURCE_DIR" "$CLAUDE_SKILLS_DIR" ""
    process_flat_skills_to_claude "$PRIVATE_SKILLS_DIR" "$CLAUDE_SKILLS_DIR" " (private)"

    # Директории-скиллы: публичные и приватные
    process_dir_skills_to_claude "$SKILLS_SOURCE_DIR" "$CLAUDE_SKILLS_DIR" ""
    process_dir_skills_to_claude "$PRIVATE_SKILLS_DIR" "$CLAUDE_SKILLS_DIR" " private"

    # Очистка устаревших директорий в Claude Skills
    VALID_SKILLS=()
    collect_valid_skills "$SKILLS_SOURCE_DIR"
    collect_valid_skills "$PRIVATE_SKILLS_DIR"

    # Удаляем директории, которых нет в списке валидных
    local DELETED_COUNT=0
    if [[ -d "$CLAUDE_SKILLS_DIR" ]]; then
        for skill_dir in "$CLAUDE_SKILLS_DIR"/*/; do
            if [[ -d "$skill_dir" ]]; then
                local skill_dirname=$(basename "$skill_dir")
                local is_valid=false

                for valid_skill in "${VALID_SKILLS[@]}"; do
                    if [[ "$skill_dirname" == "$valid_skill" ]]; then
                        is_valid=true
                        break
                    fi
                done

                if [[ "$is_valid" == false ]]; then
                    if [[ "$DRY_RUN" == false ]]; then
                        rm -rf "$skill_dir"
                    fi
                    echo -e "   ${YELLOW}✗${NC} $skill_dirname — удалён (устаревший)"
                    DELETED_COUNT=$((DELETED_COUNT + 1))
                fi
            fi
        done
    fi

    echo ""
    echo "   Синхронизировано: $_SYNCED_SKILLS_COUNT скиллов"
    if [[ "$DELETED_COUNT" -gt 0 ]]; then
        echo "   Удалено: $DELETED_COUNT устаревших скиллов"
    fi
    echo ""
}

# =============================================================================
# Фильтрация frontmatter скиллов для веб-версии Claude
# =============================================================================

# Разрешённые ключи для веб-версии Claude
ALLOWED_FRONTMATTER_KEYS="name description license allowed-tools compatibility metadata when_to_use"

# Фильтрует frontmatter, оставляя только разрешённые ключи
# Использование: filter_skill_frontmatter source_file target_file
filter_skill_frontmatter() {
    local source_file="$1"
    local target_file="$2"

    # Проверяем, есть ли frontmatter
    if ! head -1 "$source_file" | grep -q '^---'; then
        # Нет frontmatter — просто копируем
        cp "$source_file" "$target_file"
        return
    fi

    # Находим номер строки закрывающего ---
    local end_line=$(awk 'NR>1 && /^---$/ {print NR; exit}' "$source_file")

    if [[ -z "$end_line" ]]; then
        # Не нашли закрывающий --- — копируем как есть
        cp "$source_file" "$target_file"
        return
    fi

    # Создаём временный файл
    local tmp_file=$(mktemp)

    # Записываем открывающий ---
    echo "---" > "$tmp_file"

    # Извлекаем frontmatter (строки 2 до end_line-1) и фильтруем
    sed -n "2,$((end_line - 1))p" "$source_file" | while IFS= read -r line; do
        # Извлекаем ключ (до первого двоеточия)
        local key=$(echo "$line" | sed -n 's/^\([a-zA-Z_-]*\):.*/\1/p')

        # Проверяем, есть ли ключ в списке разрешённых
        if [[ -n "$key" ]]; then
            for allowed in $ALLOWED_FRONTMATTER_KEYS; do
                if [[ "$key" == "$allowed" ]]; then
                    echo "$line" >> "$tmp_file"
                    break
                fi
            done
        fi
    done

    # Записываем закрывающий ---
    echo "---" >> "$tmp_file"

    # Записываем остальное содержимое файла (после frontmatter)
    tail -n +$((end_line + 1)) "$source_file" >> "$tmp_file"

    # Перемещаем результат
    mv "$tmp_file" "$target_file"
}

# =============================================================================
# Синхронизация Skills
# =============================================================================

sync_skills() {
    echo -e "${BLUE}📚 Синхронизация скиллов в Skills/:${NC}"

    # Создаём директорию если не существует
    if [[ ! -d "$SKILLS_TARGET_DIR" ]]; then
        if [[ "$DRY_RUN" == false ]]; then
            mkdir -p "$SKILLS_TARGET_DIR"
        fi
    fi

    local SYNCED_COUNT=0

    if [[ -d "$SKILLS_SOURCE_DIR" ]]; then
        # Находим все skill-*.md файлы, исключая skill-template.md
        while IFS= read -r -d '' file; do
            if [[ -n "$file" ]]; then
                local filename=$(basename "$file")

                # Пропускаем шаблон
                if [[ "$filename" == "skill-template.md" ]]; then
                    echo -e "   ${YELLOW}○${NC} $filename — пропущено (шаблон)"
                    continue
                fi

                local target_file="$SKILLS_TARGET_DIR/$filename"

                if [[ "$DRY_RUN" == false ]]; then
                    # Фильтруем frontmatter для совместимости с веб-версией Claude
                    filter_skill_frontmatter "$file" "$target_file"
                fi

                echo -e "   ${GREEN}✓${NC} $filename"
                SYNCED_COUNT=$((SYNCED_COUNT + 1))
            fi
        done < <(find "$SKILLS_SOURCE_DIR" -maxdepth 1 -name "skill-*.md" -type f -print0 2>/dev/null)

        # Удаляем файлы из Skills, которых нет в источнике
        if [[ -d "$SKILLS_TARGET_DIR" && "$DRY_RUN" == false ]]; then
            while IFS= read -r -d '' target_file; do
                local fname=$(basename "$target_file")
                if [[ ! -f "$SKILLS_SOURCE_DIR/$fname" ]]; then
                    rm -f "$target_file"
                    echo -e "   ${YELLOW}✗${NC} $fname (удалён)"
                fi
            done < <(find "$SKILLS_TARGET_DIR" -name "*.md" -type f -print0 2>/dev/null)
        fi

        # ==================================================================
        # Директории-скиллы: Skills/skill-name/SKILL.md → .skill архив (zip)
        # ==================================================================
        while IFS= read -r -d '' skill_src_dir; do
            if [[ -n "$skill_src_dir" ]]; then
                local dir_name=$(basename "$skill_src_dir")

                # Пропускаем шаблон
                if [[ "$dir_name" == "skill-template" ]]; then
                    echo -e "   ${YELLOW}○${NC} $dir_name/ — пропущено (шаблон)"
                    continue
                fi

                # Проверяем наличие SKILL.md внутри
                if [[ ! -f "$skill_src_dir/SKILL.md" ]]; then
                    continue
                fi

                local archive_file="$SKILLS_TARGET_DIR/${dir_name}.skill"

                if [[ "$DRY_RUN" == false ]]; then
                    # Удаляем старый архив, чтобы zip не дописывал в него
                    rm -f "$archive_file"
                    # Создаём zip-архив с папкой-обёрткой (skill-name/SKILL.md, ...)
                    local parent_dir=$(dirname "$skill_src_dir")
                    (cd "$parent_dir" && zip -q -r "$archive_file" "$dir_name")
                fi

                echo -e "   ${GREEN}✓${NC} ${dir_name}.skill"
                SYNCED_COUNT=$((SYNCED_COUNT + 1))
            fi
        done < <(find "$SKILLS_SOURCE_DIR" -maxdepth 1 -name "skill-*" -type d -print0 2>/dev/null)

        # Удаляем .skill архивы, для которых нет исходных директорий
        if [[ -d "$SKILLS_TARGET_DIR" && "$DRY_RUN" == false ]]; then
            while IFS= read -r -d '' target_file; do
                local fname=$(basename "$target_file")
                local dir_name="${fname%.skill}"
                if [[ ! -d "$SKILLS_SOURCE_DIR/$dir_name" || ! -f "$SKILLS_SOURCE_DIR/$dir_name/SKILL.md" ]]; then
                    rm -f "$target_file"
                    echo -e "   ${YELLOW}✗${NC} $fname (удалён)"
                fi
            done < <(find "$SKILLS_TARGET_DIR" -name "*.skill" -type f -print0 2>/dev/null)
        fi
    else
        echo -e "   ${YELLOW}○${NC} Папка $SKILLS_SOURCE_DIR не найдена"
    fi

    echo ""
    echo "   Синхронизировано: $SYNCED_COUNT скиллов"
    echo ""
}

# =============================================================================
# Генерация README.md с каталогом ролей и скиллов
# =============================================================================

generate_readme() {
    local TIMESTAMP=$(date "+%Y-%m-%d %H:%M")
    local TOTAL_ROLES=0
    local TOTAL_SKILLS=0
    local ACTIVE_CATEGORIES=""

    # Считаем роли
    for category in $CATEGORIES; do
        TARGET_CAT="$AGENTS_TARGET_DIR/$category"
        if [[ -d "$TARGET_CAT" ]]; then
            local count=$(find "$TARGET_CAT" -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
            if [[ "$count" -gt 0 ]]; then
                TOTAL_ROLES=$((TOTAL_ROLES + count))
                ACTIVE_CATEGORIES="$ACTIVE_CATEGORIES $category"
            fi
        fi
    done

    # Считаем скиллы (flat .md + директории .skill)
    if [[ -d "$SKILLS_TARGET_DIR" ]]; then
        TOTAL_SKILLS=$(find "$SKILLS_TARGET_DIR" \( -name "*.md" -o -name "*.skill" \) -type f 2>/dev/null | wc -l | tr -d ' ')
    fi

    cat << 'HEADER'
# 📚 Production — Библиотека ролей и скиллов для AI-агентов

> ⚠️ **READ-ONLY LIBRARY** — Эта папка содержит стабильные версии для внешнего использования.

---

## Для AI-агентов из других проектов

| Действие | Разрешено |
|----------|-----------|
| ✅ Читать файлы | Да |
| ❌ Изменять файлы | **Нет** |
| ❌ Создавать файлы | **Нет** |
| ❌ Удалять файлы | **Нет** |

### Как использовать

1. **Найди роль или скилл** в каталоге ниже
2. **Перейди по пути** к файлу `.md`
3. **Прочитай описание** и применяй инструкции

### Если нужны изменения

Изменения вносятся только через проект **Role Creator**:
- Роли: `/Roles` → `Production/Agents`
- Скиллы: `/Skills` → `Production/Skills`
- После изменений запускается скрипт публикации

---

## 📋 Каталог ролей (Agents/)

HEADER

    local has_roles=false

    for category in $CATEGORIES; do
        TARGET_CAT="$AGENTS_TARGET_DIR/$category"

        if [[ -d "$TARGET_CAT" ]]; then
            # Находим все .md файлы
            local files=$(find "$TARGET_CAT" -name "*.md" -type f 2>/dev/null | sort)

            if [[ -n "$files" ]]; then
                has_roles=true
                local cat_desc=$(get_category_desc "$category")

                echo ""
                echo "### ${cat_desc}"
                echo ""
                echo "| Роль | Файл | Описание |"
                echo "|------|------|----------|"

                echo "$files" | while read file; do
                    if [[ -n "$file" ]]; then
                        local filename=$(basename "$file")
                        local relative_path="Agents/${category}/${filename}"

                        # Извлекаем название и описание из YAML frontmatter
                        local title=$(get_role_name "$file")
                        local description=$(get_role_description "$file")

                        echo "| **${title}** | \`${relative_path}\` | ${description} |"
                    fi
                done
            fi
        fi
    done

    # Если ролей нет
    if [[ "$has_roles" == false ]]; then
        echo ""
        echo "*Пока нет опубликованных ролей. Добавьте роли в /Roles и запустите publish.sh*"
    fi

    # Секция скиллов
    echo ""
    echo "---"
    echo ""
    echo "## 📚 Каталог скиллов (Skills/)"
    echo ""

    if [[ -d "$SKILLS_TARGET_DIR" ]]; then
        local skills_files=$(find "$SKILLS_TARGET_DIR" \( -name "*.md" -o -name "*.skill" \) -type f 2>/dev/null | sort)

        if [[ -n "$skills_files" ]]; then
            echo "| Скилл | Файл | Описание |"
            echo "|-------|------|----------|"

            echo "$skills_files" | while read file; do
                if [[ -n "$file" ]]; then
                    local filename=$(basename "$file")
                    local relative_path="Skills/${filename}"

                    if [[ "$filename" == *.skill ]]; then
                        # Директория-скилл: читаем метаданные из исходного SKILL.md
                        local dir_name="${filename%.skill}"
                        local source_skill_md="$SKILLS_SOURCE_DIR/$dir_name/SKILL.md"
                        if [[ -f "$source_skill_md" ]]; then
                            local title=$(get_role_name "$source_skill_md")
                            local description=$(get_role_description "$source_skill_md")
                        else
                            local title="$dir_name"
                            local description="—"
                        fi
                    else
                        # Flat-скилл: читаем метаданные напрямую
                        local title=$(get_role_name "$file")
                        local description=$(get_role_description "$file")
                    fi

                    echo "| **${title}** | \`${relative_path}\` | ${description} |"
                fi
            done
        else
            echo "*Пока нет опубликованных скиллов. Добавьте скиллы в /Skills и запустите publish.sh*"
        fi
    else
        echo "*Пока нет опубликованных скиллов. Добавьте скиллы в /Skills и запустите publish.sh*"
    fi

    # Статистика
    echo ""
    echo "---"
    echo ""
    echo "## 📊 Статистика"
    echo ""
    echo "- **Ролей:** ${TOTAL_ROLES}"
    echo "- **Скиллов:** ${TOTAL_SKILLS}"
    echo "- **Последнее обновление:** ${TIMESTAMP}"
    echo ""
    echo "---"
    echo ""
    echo "## Структура папок"
    echo ""
    echo "\`\`\`"
    echo "/Production"
    echo "├── /Agents              # Роли по категориям"

    # Собираем активные категории
    local active_cats=""
    local last_cat=""
    for category in $CATEGORIES; do
        TARGET_CAT="$AGENTS_TARGET_DIR/$category"
        if [[ -d "$TARGET_CAT" ]]; then
            local count=$(find "$TARGET_CAT" -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
            if [[ "$count" -gt 0 ]]; then
                active_cats="$active_cats $category"
                last_cat="$category"
            fi
        fi
    done

    # Показываем категории ролей
    for category in $CATEGORIES; do
        TARGET_CAT="$AGENTS_TARGET_DIR/$category"
        if [[ -d "$TARGET_CAT" ]]; then
            local count=$(find "$TARGET_CAT" -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
            if [[ "$count" -gt 0 ]]; then
                local cat_comment=""
                case "$category" in
                    "meta")        cat_comment="Мета-роли" ;;
                    "assistants")  cat_comment="Помощники" ;;
                    "specialists") cat_comment="Специалисты" ;;
                    "creative")    cat_comment="Креативные роли" ;;
                esac
                if [[ "$category" == "$last_cat" ]]; then
                    echo "│   └── /${category}    # ${cat_comment}"
                else
                    echo "│   ├── /${category}    # ${cat_comment}"
                fi
            fi
        fi
    done

    echo "├── /Dialog              # Загрузчики ролей для диалоговых ассистентов"
    echo "└── /Skills              # Скиллы (справочники)"
    echo "\`\`\`"

    cat << 'FOOTER'

---

## Версионирование

Каждая роль и скилл содержит версию в метаданных:
- **X.0.0** — Мажорные изменения (несовместимые)
- **X.Y.0** — Новые возможности
- **X.Y.Z** — Исправления и улучшения

---

*Источник: Role Creator Project | Обновлено через `scripts/publish.sh`*
FOOTER
}

# Синхронизируем в Claude Agents (~/.claude/agents)
sync_to_claude_agents

# Синхронизируем заглушки в Dialog
sync_to_dialog

# Синхронизируем скиллы в Claude Skills (~/.claude/skills)
sync_to_claude_skills

# Синхронизируем скиллы
sync_skills

# Генерируем README
if [[ "$DRY_RUN" == false ]]; then
    echo -e "${BLUE}📝 Генерация README.md с каталогом ролей и скиллов...${NC}"
    generate_readme > "$README_FILE"
    echo -e "   ${GREEN}✓${NC} README.md обновлён"
    echo ""
fi

# Считаем файлы после синхронизации
if [[ "$DRY_RUN" == false ]]; then
    AFTER_COUNT=$(find "$AGENTS_TARGET_DIR" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
    AFTER_SKILLS_COUNT=$(find "$SKILLS_TARGET_DIR" \( -name "*.md" -o -name "*.skill" \) 2>/dev/null | wc -l | tr -d ' ')
    AFTER_CLAUDE_SKILLS_COUNT=$(find "$CLAUDE_SKILLS_DIR" -name "SKILL.md" 2>/dev/null | wc -l | tr -d ' ')
    echo -e "${GREEN}✅ Публикация завершена!${NC}"
    echo "   Опубликовано агентов: $AFTER_COUNT"
    echo "   Опубликовано скиллов: $AFTER_SKILLS_COUNT"

    if [[ "$BEFORE_COUNT" != "$AFTER_COUNT" ]]; then
        DIFF=$((AFTER_COUNT - BEFORE_COUNT))
        if [[ "$DIFF" -gt 0 ]]; then
            echo -e "   ${GREEN}+$DIFF новых ролей${NC}"
        else
            echo -e "   ${YELLOW}$DIFF ролей удалено${NC}"
        fi
    fi

    if [[ "$BEFORE_SKILLS_COUNT" != "$AFTER_SKILLS_COUNT" ]]; then
        DIFF=$((AFTER_SKILLS_COUNT - BEFORE_SKILLS_COUNT))
        if [[ "$DIFF" -gt 0 ]]; then
            echo -e "   ${GREEN}+$DIFF новых скиллов${NC}"
        else
            echo -e "   ${YELLOW}$DIFF скиллов удалено${NC}"
        fi
    fi

    if [[ "$BEFORE_CLAUDE_SKILLS_COUNT" != "$AFTER_CLAUDE_SKILLS_COUNT" ]]; then
        DIFF=$((AFTER_CLAUDE_SKILLS_COUNT - BEFORE_CLAUDE_SKILLS_COUNT))
        if [[ "$DIFF" -gt 0 ]]; then
            echo -e "   ${GREEN}+$DIFF новых скиллов в Claude${NC}"
        else
            echo -e "   ${YELLOW}$DIFF скиллов удалено из Claude${NC}"
        fi
    fi

else
    echo -e "${YELLOW}🔍 Dry run завершён — изменения не применены${NC}"
    echo "   Запустите без --dry для применения изменений"
fi

echo ""
echo "📍 Production: $TARGET_DIR"
echo "   ├── Agents: $AGENTS_TARGET_DIR"
echo "   ├── Dialog: $DIALOG_DIR"
echo "   └── Skills: $SKILLS_TARGET_DIR"
echo "📍 Claude Agents: $CLAUDE_AGENTS_DIR"
echo "📍 Claude Skills: $CLAUDE_SKILLS_DIR"
