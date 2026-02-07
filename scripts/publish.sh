#!/bin/bash

# =============================================================================
# publish.sh — Скрипт публикации ролей из /Roles в /Production и Claude Agents
# =============================================================================
#
# Использование:
#   ./scripts/publish.sh          — публикует все роли
#   ./scripts/publish.sh --dry    — показывает что будет скопировано (без изменений)
#
# Назначения:
#   1. /Production — для внешних AI-агентов (read-only library)
#   2. ~/.claude/agents — для Claude Code (формат agent-{name}.md)
#   3. /Dialog — заглушки с инструкцией загрузки роли с GitHub
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
TARGET_DIR="$PROJECT_ROOT/Production"
README_FILE="$TARGET_DIR/README.md"
DIALOG_DIR="$PROJECT_ROOT/Dialog"
AGENTS_DIR="$HOME/.claude/agents"

# Проверка аргументов
DRY_RUN=false
if [[ "$1" == "--dry" ]]; then
    DRY_RUN=true
    echo -e "${YELLOW}🔍 Режим просмотра (dry run) — изменения не будут применены${NC}\n"
fi

echo -e "${BLUE}📦 Публикация ролей${NC}"
echo "   Источник: $SOURCE_DIR"
echo "   Назначение: $TARGET_DIR"
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

# Считаем файлы до синхронизации
BEFORE_COUNT=$(find "$TARGET_DIR" -name "*.md" ! -name "README.md" 2>/dev/null | wc -l | tr -d ' ')

# Список категорий (папок) — без templates (шаблоны не публикуются)
CATEGORIES="meta assistants specialists creative"

echo -e "${BLUE}📁 Синхронизация категорий:${NC}"

for category in $CATEGORIES; do
    SOURCE_CAT="$SOURCE_DIR/$category"
    TARGET_CAT="$TARGET_DIR/$category"
    
    if [[ -d "$SOURCE_CAT" ]]; then
        # Считаем .md файлы в категории
        FILE_COUNT=$(find "$SOURCE_CAT" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
        
        if [[ "$FILE_COUNT" -gt 0 ]]; then
            echo -e "   ${GREEN}✓${NC} /$category — $FILE_COUNT файл(ов)"
            
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
            # Папка пуста в источнике — удаляем из Production если существует
            if [[ -d "$TARGET_CAT" ]]; then
                echo -e "   ${YELLOW}✗${NC} /$category — удаляю пустую папку"
                if [[ "$DRY_RUN" == false ]]; then
                    rm -rf "$TARGET_CAT"
                fi
            else
                echo -e "   ${YELLOW}○${NC} /$category — пропущено (пусто)"
            fi
        fi
    else
        # Папка не существует в источнике — удаляем из Production если существует
        if [[ -d "$TARGET_CAT" ]]; then
            echo -e "   ${YELLOW}✗${NC} /$category — удаляю (нет в источнике)"
            if [[ "$DRY_RUN" == false ]]; then
                rm -rf "$TARGET_CAT"
            fi
        else
            echo -e "   ${YELLOW}○${NC} /$category — пропущено (не существует)"
        fi
    fi
done

# Удаляем папки в Production, которые не входят в CATEGORIES
if [[ -d "$TARGET_DIR" ]]; then
    for dir in "$TARGET_DIR"/*/; do
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
                echo -e "   ${YELLOW}✗${NC} /$dir_name — удаляю (не в списке категорий)"
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

# =============================================================================
# Синхронизация в Claude Agents (~/.claude/agents)
# =============================================================================

# Синхронизирует роли в Claude Agents (формат agent-{name}.md)
sync_to_agents() {
    echo -e "${BLUE}🤖 Синхронизация в Claude Agents:${NC}"
    echo "   Назначение: $AGENTS_DIR"
    echo ""

    # Создаём директорию agents если не существует
    if [[ ! -d "$AGENTS_DIR" ]]; then
        if [[ "$DRY_RUN" == false ]]; then
            mkdir -p "$AGENTS_DIR"
        fi
    fi

    local SYNCED_COUNT=0

    for category in $CATEGORIES; do
        local SOURCE_CAT="$SOURCE_DIR/$category"

        if [[ -d "$SOURCE_CAT" ]]; then
            # Находим все .md файлы и обрабатываем через while read для путей с пробелами
            while IFS= read -r -d '' file; do
                if [[ -n "$file" ]]; then
                    local role_name=$(get_role_name "$file")
                    local agent_file="$AGENTS_DIR/agent-$role_name.md"

                    if [[ "$DRY_RUN" == false ]]; then
                        cp "$file" "$agent_file"
                    fi

                    echo -e "   ${GREEN}✓${NC} $role_name -> agent-$role_name.md"
                    SYNCED_COUNT=$((SYNCED_COUNT + 1))
                fi
            done < <(find "$SOURCE_CAT" -name "*.md" -type f -print0 2>/dev/null)
        fi
    done

    echo ""
    echo "   Синхронизировано: $SYNCED_COUNT агентов"
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
- Загрузи файл роли по ссылке: \`https://raw.githubusercontent.com/klimsergeev/role-master/main/Production/${category}/${filename}\`
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
# Генерация README.md с каталогом ролей
# =============================================================================

generate_readme() {
    local TIMESTAMP=$(date "+%Y-%m-%d %H:%M")
    local TOTAL_ROLES=0
    local ACTIVE_CATEGORIES=""
    
    # Сначала считаем общее количество ролей и собираем активные категории
    for category in $CATEGORIES; do
        TARGET_CAT="$TARGET_DIR/$category"
        if [[ -d "$TARGET_CAT" ]]; then
            local count=$(find "$TARGET_CAT" -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
            if [[ "$count" -gt 0 ]]; then
                TOTAL_ROLES=$((TOTAL_ROLES + count))
                ACTIVE_CATEGORIES="$ACTIVE_CATEGORIES $category"
            fi
        fi
    done
    
    cat << 'HEADER'
# 📚 Production — Библиотека ролей для AI-агентов

> ⚠️ **READ-ONLY LIBRARY** — Эта папка содержит стабильные версии ролей для внешнего использования.

---

## Для AI-агентов из других проектов

| Действие | Разрешено |
|----------|-----------|
| ✅ Читать файлы | Да |
| ❌ Изменять файлы | **Нет** |
| ❌ Создавать файлы | **Нет** |
| ❌ Удалять файлы | **Нет** |

### Как использовать роли

1. **Найди свою роль** в каталоге ниже
2. **Перейди по пути** к файлу `.md`
3. **Прочитай описание** и применяй инструкции

### Если нужны изменения

Изменения в ролях вносятся только через проект **Role Creator**:
- Исходные файлы находятся в `/Roles`
- После изменений запускается скрипт публикации
- Обновлённые роли появляются здесь

---

## 📋 Каталог ролей

HEADER

    local has_roles=false
    
    for category in $CATEGORIES; do
        TARGET_CAT="$TARGET_DIR/$category"
        
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
                        local relative_path="${category}/${filename}"
                        
                        # Извлекаем название из первой строки (# Название)
                        local title=$(head -1 "$file" | sed 's/^#[[:space:]]*//' | sed 's/—.*//' | sed 's/[[:space:]]*$//')
                        
                        # Извлекаем краткое описание (после — в заголовке)
                        local description=$(head -1 "$file" | grep -o '—.*' | sed 's/^—[[:space:]]*//' | sed 's/[[:space:]]*$//')
                        
                        if [[ -z "$description" ]]; then
                            description="—"
                        fi
                        
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
    
    # Генерируем дерево папок только для активных категорий
    echo ""
    echo "---"
    echo ""
    echo "## 📊 Статистика"
    echo ""
    echo "- **Всего ролей:** ${TOTAL_ROLES}"
    echo "- **Последнее обновление:** ${TIMESTAMP}"
    echo ""
    echo "---"
    echo ""
    echo "## Структура папок"
    echo ""
    echo "\`\`\`"
    echo "/Production"
    
    # Показываем только папки с ролями
    local first=true
    local last_category=""
    
    # Определяем последнюю активную категорию для правильного отображения дерева
    for category in $CATEGORIES; do
        TARGET_CAT="$TARGET_DIR/$category"
        if [[ -d "$TARGET_CAT" ]]; then
            local count=$(find "$TARGET_CAT" -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
            if [[ "$count" -gt 0 ]]; then
                last_category="$category"
            fi
        fi
    done
    
    for category in $CATEGORIES; do
        TARGET_CAT="$TARGET_DIR/$category"
        if [[ -d "$TARGET_CAT" ]]; then
            local count=$(find "$TARGET_CAT" -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
            if [[ "$count" -gt 0 ]]; then
                local cat_comment=""
                case "$category" in
                    "meta")        cat_comment="# Мета-роли" ;;
                    "assistants")  cat_comment="# Помощники" ;;
                    "specialists") cat_comment="# Специалисты" ;;
                    "creative")    cat_comment="# Креативные роли" ;;
                    "templates")   cat_comment="# Шаблоны" ;;
                esac
                
                if [[ "$category" == "$last_category" ]]; then
                    echo "└── /${category}    ${cat_comment}"
                else
                    echo "├── /${category}    ${cat_comment}"
                fi
            fi
        fi
    done
    
    echo "\`\`\`"
    
    cat << 'FOOTER'

---

## Версионирование

Каждая роль содержит версию в метаданных:
- **X.0.0** — Мажорные изменения (несовместимые)
- **X.Y.0** — Новые возможности
- **X.Y.Z** — Исправления и улучшения

---

*Источник: Role Creator Project | Обновлено через `scripts/publish.sh`*
FOOTER
}

# Синхронизируем в Claude Agents
sync_to_agents

# Синхронизируем заглушки в Dialog
sync_to_dialog

# Генерируем README
if [[ "$DRY_RUN" == false ]]; then
    echo -e "${BLUE}📝 Генерация README.md с каталогом ролей...${NC}"
    generate_readme > "$README_FILE"
    echo -e "   ${GREEN}✓${NC} README.md обновлён"
    echo ""
fi

# Считаем файлы после синхронизации
if [[ "$DRY_RUN" == false ]]; then
    AFTER_COUNT=$(find "$TARGET_DIR" -name "*.md" ! -name "README.md" 2>/dev/null | wc -l | tr -d ' ')
    
    echo -e "${GREEN}✅ Публикация завершена!${NC}"
    echo "   Опубликовано ролей: $AFTER_COUNT"
    
    if [[ "$BEFORE_COUNT" != "$AFTER_COUNT" ]]; then
        DIFF=$((AFTER_COUNT - BEFORE_COUNT))
        if [[ "$DIFF" -gt 0 ]]; then
            echo -e "   ${GREEN}+$DIFF новых${NC}"
        else
            echo -e "   ${YELLOW}$DIFF удалено${NC}"
        fi
    fi
else
    echo -e "${YELLOW}🔍 Dry run завершён — изменения не применены${NC}"
    echo "   Запустите без --dry для применения изменений"
fi

echo ""
echo "📍 Production: $TARGET_DIR"
echo "📍 Claude Agents: $AGENTS_DIR"
echo "📍 Dialog: $DIALOG_DIR"
