# Известные ограничения

## Назначение

Ограничения, зашитые в код Claude Code, которые НЕ решаются через `permissions.allow`.

## Ограничения

### Compound-команды
`cd /path && git status` триггерит security check даже при наличии `Bash(git:*)` в allow.
**Решение:** использовать абсолютные пути вместо `cd`, или `git -C /path`.

### Backslash-экранирование
`/path/with\ spaces/` триггерит security check.
**Решение:** использовать двойные кавычки (`"/path/with spaces/"`).

### Hot reload settings
Изменения в permissions применяются на лету (без перезапуска), КРОМЕ `model` и `outputStyle`. Если разрешение добавлено но не работает -- причина не в hot reload, а в синтаксисе или deny на вышестоящем уровне.
