#!/bin/bash

# =============================================================================
# publish.sh — Скрипт публикации ролей из /Roles в /Production
# =============================================================================
#
# Использование:
#   ./scripts/publish.sh          — публикует все роли
#   ./scripts/publish.sh --dry    — показывает что будет скопировано (без изменений)
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

# Список категорий (папок)
CATEGORIES="meta assistants specialists creative templates"

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

echo ""

# =============================================================================
# Функция получения описания категории
# =============================================================================
get_category_desc() {
    case "$1" in
        "meta")        echo "🎭 Мета-роли (роли для создания ролей)" ;;
        "assistants")  echo "🤖 Помощники и ассистенты" ;;
        "specialists") echo "🔧 Специалисты (код-ревью, аналитика и т.д.)" ;;
        "creative")    echo "🎨 Креативные роли (копирайтинг, brainstorming)" ;;
        "templates")   echo "📝 Шаблоны для создания новых ролей" ;;
        *)             echo "$1" ;;
    esac
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
