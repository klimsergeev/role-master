---
name: sm-pipeline
description: The conditions under which a skill is planned, written, and reviewed inside the skill pipeline, and the layout of the skill plan file the pipeline steps share. Use at every pipeline step that plans, writes, reviews, or fixes a skill.
---

# Working inside the skill pipeline

Do the work by your own practice as the author of skills. The pipeline changes the conditions listed here; where they differ from your usual practice, they take priority for this run.

## Conditions

- Read and write files only inside the project. The planning files are in `Updates/Drafts/`; everything else you work with is skill source in `Skills/` and `Skills.private/`. Do not open `Production/`, `~/.claude/`, published archives, or anything outside the project: inside the pipeline only the source exists. Look for overlapping skills in `Skills/` and `Skills.private/` only.
- The user is asked only once, at the opening step, through the questions you return there. After that nobody answers questions. Decide inside the bounds of the «Охват» section of the skill plan and record each decision in «Открытые вопросы» as question → decision → reason. Put what cannot be decided inside those bounds into «Отложенное» and keep working.
- When a skill with an overlapping task already exists, decide yourself whether to extend it or to draw a boundary between the two, and record the decision. Do not edit other skills: list what would change in them under «Ссылки на скилл извне».
- The assignment of each step says how many research rounds are left. When none are left, ask for no more research.
- Take the data from the research reports as it is. Do not re-check it against the sources and do not add lines with a verification date.
- Leave sources out of the skill's text — addresses, page names, author names — unless «Охват» allows naming them. Create a `LICENSE` file only when «Охват» asks for one.
- Give ready-made blocks and examples from the reports verbatim, in their original language.
- Do not test the skill: no scenario runs, no evals, no checks of the checks.
- On a rename, leave the old skill directory untouched and report its path.
- Do not run git commands or `scripts/publish.sh`.
- Your final message is read by a script. Return what the assignment of the step asks for and nothing more. After writing or fixing a skill, that is its name, its path, its version, and the path of the old directory on a rename. After fixing, it is also the text of «Отложенное» and of «Ссылки на скилл извне», copied verbatim from the plan.

## The skill plan file

The working files of a run are in `Updates/Drafts/[topic folder]/`: the skill plan, the research reports, the review file. The path of the plan is in the assignment.

- After the framing step the plan file exists. Complete your sections in it; do not recreate or rename it, even when the skill's final name differs from the working name in the file name.
- «Цель», «Охват», «Источники», and «Этапы» are written at the framing step. On every later step read them and leave them as they are. «Охват» holds the user's bounds and is the assignment for every step.
- The plan is an instruction for the author of the skill. Keep out edit history, dates of decisions, rejected options, work status, and notes on who decided what.
- After every change, re-read the plan in full and remove contradictions.

Your sections:

| Section | What it holds |
|---|---|
| «Аудит текущего скилла» | Only on an extension or a rebuild: what the skill already covers of the request, where it disagrees with the reports, where the new content goes, whether the layout or the name changes, the measured length of `description` plus `when_to_use` and what to compress |
| «Имя и версия» | The skill's name and version |
| «Состав файлов» | The directory tree and the purpose of each file |
| «Таблица маршрутизации» | A draft of the routing table |
| «Что переносится из ресёрча» | The content of each file as items, each with the report section it comes from |
| «Не переносится» | What is deliberately not taken from the reports, with a one-phrase reason |
| «Что меняется в существующих файлах» | On an extension: the changes for each existing file |
| «Ссылки на скилл извне» | Other skills that mention this skill or its files, and what would change in them |
| «Недостающее» | The questions and bounds for the next research round, or «Нет» |
| «Открытые вопросы» | Question → chosen decision → reason |
| «Отложенное» | What goes to the user at the end: what is not closed or was noticed, which file shows it, what is needed to bring it into the skill |

## Name and version

- The name starts with `skill-` and contains neither `claude` nor `anthropic`.
- A new skill is `1.0.0` until its first publication, however many edits it takes.
- A published skill gets one version for all unpublished work, at the highest level among its changes.
- Renaming an unpublished skill does not change its version. Renaming a published skill is MAJOR.

## Before you finish writing a skill

Besides your own checklist, check that:

- every file of the skill except `LICENSE` and scripts can be reached from the routing table, and every link leads to a file inside the skill's directory;
- the skill holds no traces of drafts: no references to `Updates/`, to the plan or the reports, no report section numbers, no template placeholders, no "TODO", no mention of this project;
- the skill's directory holds no `__pycache__` and no `.DS_Store`.
