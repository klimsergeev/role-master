# Role Creator — project instructions

What this project is and the repository map are in [README.md](README.md).

Do not record the library's contents as numbers. When you need the actual contents, look with `ls`.

## Division of labor — who edits what

This rule takes priority over convenience. The orchestrator coordinates and does not execute the work itself.

| Object | Executor |
|---|---|
| Files in `Roles/`, `Roles.private/` | the `role-master` agent |
| Files in `Skills/`, `Skills.private/` | the `skill-master` agent |
| Commits, branches, `.gitignore` | the `git-ops` agent |
| Plans and reviews in `Updates/` for roles and skills | `role-master`, `skill-master` — each for its own artifacts |
| Other drafts in `Updates/` | the orchestrator directly |
| `Production/` | nobody by hand — only `publish.sh` |

The orchestrator never edits a role or a skill directly, bypassing the master, and does not treat a task being "simple" as a reason to do it itself.

Abbreviations in conversation with the user: **СМ** — the `skill-master` agent, **РМ** — the `role-master` agent, **ВФ** — workflow, the pipeline from `.claude/workflows/`. The user writes them both this way and in Latin letters (SM, RM, WF); they mean the same thing.

## Publishing pipeline

`scripts/publish.sh` is run **by the user manually**. Do not run it yourself without an explicit instruction — including with `--dry`.

The script's flags, what it does, what it excludes, and its pitfalls are in [README.md](README.md), section «Пайплайн публикации».

## Role format

Frontmatter — six required fields and two optional ones, in the same order in every file:

```yaml
name: kebab-case          # matches the file name
description: one line
tools: ...                # optional
skills:                   # optional, block list
  - <name>
model: opus               # in every role without exception
version: 1.0.0            # SemVer
created: YYYY-MM-DD       # set once, never changed
category: assistants|specialists|creative|meta
```

Key order: identity (`name`, `description`) → what the role has at its disposal (`tools`, `skills`) → service fields (`model`, `version`, `created`, `category`). `tools` is an allowlist of tools: with it the role loses everything not on the list, including MCP tools, Skill, and web search; set it only deliberately. There is no `updated` field and it must not be introduced: the edit history lives in git.

**A colon followed by a space inside `description` breaks YAML.** Use a dash instead. The Claude Code parser is lenient and loads such a file, but do not rely on that.

### The `skills:` field — skill preloading

Claude Code preloads the listed skills into the subagent's context at startup.

- **Only `SKILL.md` is injected, not the whole directory.** Lazy loading is preserved: the router arrives, and the subagent reads the procedure files itself. The cost of preloading is the size of one `SKILL.md`.
- **It works only when the role is invoked as a subagent.** With `--agent` (the role as the session agent) skills are not preloaded.
- **A preloaded skill's self-check fires not at startup but when a task falls into its domain.** A skill whose self-check creates directories or `.env` will do so on the first task in its domain.
- **A skill with `disable-model-invocation: true` cannot be preloaded** — preloading draws from the same set as auto-invocation. `skill-skill-refine` and `skill-session-harvest` work this way: they are launched manually.
- Claude Code silently skips a nonexistent or disabled name and writes it to the debug log.

The notation is a block list with a two-space indent.

`publish.sh` does not filter role frontmatter: the field reaches both `Production/Agents/` and `~/.claude/agents/` untouched.

Body: `# [Emoji] Name — tagline` → `Идентичность` (Кто ты / Миссия / Ключевые компетенции) → `Принципы работы` (Как ты работаешь / Правила принятия решений in the ЕСЛИ→ТО form / Формат выдачи) → role-specific sections → `Примеры` (at least two: a typical one and an edge case) → `Ограничения` as the last section. The reference is `Roles/templates/role-template.md`.

Do not treat a "typical size" of a role as a norm — the role's subject determines its length.

## Skill format

The skill format is a **directory**: `Skills/<name>/SKILL.md` plus procedure files. A skill's name starts with `skill-`. We do not write flat skills as a single `.md` file.

`SKILL.md` frontmatter:

```yaml
name: <name>              # matches the directory name
description: >            # folded
when_to_use: >            # required
version: 1.0.0
created: YYYY-MM-DD
```

The combined length of `description` + `when_to_use` is at most 1536 characters. Measure the length with `len()`, do not estimate it by eye.

The key mechanism is lazy loading. `SKILL.md` stays a thin router: a `## Таблица маршрутизации` section with the columns Задача / Обязательно / Читать, если. The «Читать, если» column holds a condition that can be checked against the task, in the form `если <условие>: [file.md](file.md)`; permission-style wordings («при необходимости», «если нужно») are forbidden. Files meant for point lookup are marked `(справочник)`. Above the table there is a quote line, verbatim as in `Skills/skill-template/SKILL.md`. Links are markdown links `[file.md](file.md)`, not backticks.

Body sections: `Назначение` → `Принципы` → `Таблица маршрутизации` → `Рабочий процесс` → `Что НЕ делать` → `Примеры`. The reference is `Skills/skill-template/`.

**Refer only to files inside the skill's directory.** Avoid references to documents outside it — both relative ones (`../../.claude/rules/...`) and references by name: those documents do not exist in `~/.claude/skills/` or inside the `.skill` archive.

### A skill may contain more than Markdown

The project has no ban on companion files of any type, including executable scripts. `publish.sh` does not filter by extension: the whole skill directory goes both into the `.skill` archive and into `~/.claude/skills/`.

- A script the skill cannot work without uses only the standard library: the skill contract does not provide for installing dependencies.
- A script with a third-party dependency (Pillow, Playwright, etc.) is acceptable as an optional enhancement — if its invocation comes with a stated applicability condition ("Pillow is installed") and a fallback path, and the skill is fully functional without the script.
- Do not count on autostart: harness hooks are not skill content.
- For HTTP requests from a skill procedure use the system `curl`: `urllib` from the Python standard library can fail on certificate verification. A script built on `urllib` comes with a fallback path through `curl`.
- Wiring a script in: it is invoked by a markdown link from a procedure file (not from `SKILL.md`), next to it stand an explicit applicability condition and a fallback path for when the condition is not met, and the invocation itself is a numbered step of the procedure. The reference is `Skills/skill-travel-agent/price-sources.md`. A script without a described invocation and without a fallback path is a dead file.

## Versioning

SemVer in the `version` field of roles and skills, starting at `1.0.0`; downgrading is forbidden. MAJOR — a change of purpose or contract; MINOR — a new capability, section, example, or a change in default behavior; PATCH — a fix or rewording. The project has no CHANGELOG files and they must not be created — the history is in git. The project does not use git tags.

## Private contour

`Roles.private/`, `Skills.private/`, `Production/Agents.private/`, `Production/Skills.private/`, and `Production/env/` do not go into git. Versions of private roles and skills are maintained the same way as for public ones. Private artifacts do not go into `Production/README.md`, into `Production/Dialog/`, or to GitHub, but are published to `~/.claude/` on par with public ones.

Never carry the content of private roles and skills into public files, the README, or commits.

Caution: `Production/env/` with the tokens is covered in `.gitignore` not by a dedicated rule but by the general `env/` entry from the Python section. Renaming this directory will silently expose `.env`.

## Git

- Commit and push **only on an explicit instruction** in the task.
- Conventional Commits (`feat:`, `fix:`) are not used in the project.
- The header is built as `<artifact> <version>: <what changed>`. Do not trim it to 50/72 characters — completeness of the list matters more.
- A commit covering several artifacts has a body: a bulleted list of the changes.
- **Do not add a `Co-Authored-By` trailer** — not for Claude, not for any other model, not in your own commits, not in prompts for `git-ops`. Only on the user's explicit request.
- Put changes in `Roles/`/`Skills/` into one commit together with the `publish.sh` result in `Production/`.
- We work directly in `main`; do not create a branch without an explicit request. The remote is `git@github.com:klimsergeev/role-master.git`.
- The repository has no git hooks: no convention is checked automatically.
- In a commit report, state its ID and message.

## The `Updates/` working area

Not in git. Inside: `Drafts/` — raw material and research by topic; `harvests/` — digests of lessons from sessions in the format `harvest-YYYY-MM-DD-<topic>.md`; `known-issues/` — incident write-ups.

Name plans `plan-<short-name>.md`, one plan per task.

## Working rules

- **Pass a mandatory requirement to a subagent as mandatory,** not as a permission.
- **Do not set length limits in subagent prompts** by default. For reviews, plans, and research — no limit.
- **The boundary of a researcher's assignment:** the behavior and specifics of the subject are factual material; prescriptions addressed to us ("what to promise", "what to warn the user about", "what to put in SKILL.md") are not. A quote of someone else's recommendation with attribution is also a fact about the product and stays.

## General

- Answer in Russian if the task is in Russian.
- Do not create files outside the project's working directory (the exception is the `publish.sh` destinations).
