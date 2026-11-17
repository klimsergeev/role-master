---
name: sm-pipeline
description: The conditions of the skill pipeline, what each pipeline step reads, the audit of the current skill, and the layout of the skill plan file the steps share. Use at every step of skill-master in the pipeline, including the questions to the user, the frame, the audit, and the research assignments.
---

# Working inside the skill pipeline

Do the work by your own practice as the author of skills. The pipeline changes the conditions listed here; where they differ from your usual practice, they take priority for this run.

The assignment of every step names the step in the line `Step: <name>.`. This file and the other pipeline files use the same step names.

## Conditions

- Read and write files only inside the project. The planning files are in `Updates/Drafts/`; everything else you work with is skill source in `Skills/` and `Skills.private/`. Do not open `Production/`, `~/.claude/`, published archives, or anything outside the project: inside the pipeline only the source exists. Look for overlapping skills in `Skills/` and `Skills.private/` only.
- The user is asked only once, at the opening step, through the questions you return there. After that nobody answers questions. Decide inside the bounds of the «Охват» section of the skill plan and record each decision in «Открытые вопросы» as question → decision → reason. Put what cannot be decided inside those bounds into «Отложенное» and keep working.
- When a skill with an overlapping task already exists, decide yourself whether to extend it or to draw a boundary between the two, and record the decision. Do not edit other skills: list what would change in them under «Ссылки на скилл извне».
- The assignment of each step says how many research rounds are left. When none are left, ask for no more research.
- Take the data from the research reports as it is. Do not re-check it against the sources and do not add lines with a verification date.
- Leave sources out of the skill's text — addresses, page names, author names — unless «Охват» allows naming them. Create a `LICENSE` file only when «Охват» asks for one.
- The reports hold no verbatim texts of the sources: researchers write the facts in their own words. Do not present your own text as a source's text, and do not reconstruct a source's text from memory. Write the examples in the skill yourself. A missing verbatim text is not a gap and is no reason for a second research round.
- In the pipeline, the condition above replaces these rules of your role: in «Достаточность ресёрча», the gap "no full text of a ready-made block", the request for ready-made texts in full and verbatim, and the answer to the map question "in the source's structure, verbatim and in full"; in «Принцип пересказа», the rule that ready-made blocks come in their original language.
- The run folder holds only the skill plan, the research reports, and the review file. Create no other file in it: no drafts, no notes, no progress log, no saved pages, no copies.
- Do not test the skill: no scenario runs, no evals, no checks of the checks.
- On a rename, leave the old skill directory untouched and report its path.
- Do not run git commands or `scripts/publish.sh`.
- Your final message is read by a script. Return what the assignment of the step asks for and nothing more. After writing or fixing a skill, that is its name, its path, its version, and the path of the old directory on a rename. After fixing, it is also the text of «Отложенное» and of «Ссылки на скилл извне», copied verbatim from the plan.

## What each step reads

Every step reads only what its row names and opens nothing beyond it. The assignment gives the paths of the step's inputs; the other paths a step needs are in the plan.

| Step | What it reads |
|---|---|
| `the questions to the user` | The request; on an extension or a rebuild, the source of the current skill |
| `the frame` | The request and the user's answers |
| `the audit of the current skill` | The source of the current skill and the plan file |
| `the first-round research assignment` | The plan file; of every ready report listed in «Источники», only its section headings |
| `the skill plan and the second-round assignment` | The plan file and every first-round report in full |
| `the plan revision` | The plan file and the second-round report, when it was delivered |
| `writing the skill` | The plan file and the report sections the plan points to; when the assignment gives the path of the current skill, this is an extension or a rebuild, and the step also reads the files of the current skill it rewrites |
| `the review pass` | The skill and the plan file; a report only to check a specific statement, in the section the plan points to |
| `the fixing pass` | The review file, the skill, and the plan file |

## The audit of the current skill

The step `the audit of the current skill` runs on every extension and every rebuild, right after the frame and before any research. Read the source of the current skill in full and the plan file, and write the section «Аудит текущего скилла»:

- for every file of the current skill, what it already covers of «Охват», in enough detail that the research assignment step and the skill plan step do not need to open the skill;
- where the new content goes;
- whether the set of files or the name changes;
- the measured length of `description` and `when_to_use` together, and what to compress.

## The skill plan file

The files of a run are in `Updates/Drafts/[topic folder]/`. The path of the plan is in the assignment.

- The skill plan is `sm-plan-[skill name].md`. `[skill name]` is the full name with the `skill-` prefix given at the frame. Do not recreate or rename the file, even when the skill's final name differs from the name in the file name; the final name is in «Имя и версия».
- A first-round report is `sm-research-[subject].md`, a second-round report is `sm-followup-[subject].md`. `[subject]` is the name of the research assignment in Latin lowercase with hyphens.
- The review file is `sm-review-[skill name].md`, with the same `[skill name]` as the plan.
- «Цель», «Охват», «Вопросы и ответы», «Источники», and «Этапы» are written at the frame. On every later step read them and leave them as they are. «Охват» holds the user's bounds and is the assignment for every step.
- Keep the plan short. It says what goes where, and for every file of the skill it names the report path and the section heading the content comes from. Do not copy facts, values, or text from the reports into the plan: the step `writing the skill` reads those report sections.
- The plan is an instruction for the author of the skill. Keep out edit history, dates of decisions, rejected options, work status, and notes on who decided what.

The sections the steps write besides «Цель», «Охват», «Источники», and «Этапы»:

| Section | Written at | What it holds |
|---|---|---|
| «Вопросы и ответы» | `the frame` | Every question that was asked, with its label, its text, and the user's answer or «пропущено»; or the line «Пользователь пропустил вопросы»; or the line «Вопросов не было» |
| «Аудит текущего скилла» | `the audit of the current skill` | Only on an extension or a rebuild: what every file of the current skill already covers of «Охват», where the new content goes, whether the set of files or the name changes, the measured length of `description` plus `when_to_use` and what to compress |
| «Задание исследователям» | `the first-round research assignment` | The research assignments: for every assignment its name, its topics marked главная or второстепенная with what to find and the questions, the allowed sources, the report path or the path of the ready report that covers it |
| «Имя и версия» | `the skill plan and the second-round assignment` | The skill's name and version |
| «Состав файлов» | `the skill plan and the second-round assignment` | The directory tree and the purpose of each file |
| «Таблица маршрутизации» | `the skill plan and the second-round assignment` | A draft of the routing table |
| «Что переносится из ресёрча» | `the skill plan and the second-round assignment` | The items of content of every file of the skill, each with the report path and the section heading it comes from, without the facts themselves |
| «Не переносится» | `the skill plan and the second-round assignment` | What is deliberately not taken from the reports, with a one-phrase reason |
| «Что меняется в существующих файлах» | `the skill plan and the second-round assignment` | On an extension: the changes for each existing file |
| «Ссылки на скилл извне» | `the skill plan and the second-round assignment` | Other skills that mention this skill or its files, and what would change in them |
| «Недостающее» | `the skill plan and the second-round assignment` | The questions for the second round, the bounds of each, and the justification of each question: the file of the skill and the step in it; or «Нет» |
| «Открытые вопросы» | Every step that decides one | Question → chosen decision → reason |
| «Отложенное» | Every step that leaves something open | What goes to the user at the end: what is not closed or was noticed, which file shows it, what is needed to bring it into the skill. The frame adds the requirement of verbatim texts. The skill plan step adds the questions that did not pass the second-round criterion. The plan revision adds the second-round questions left unanswered, the questions of an undelivered second-round report (taken from «Недостающее»), and what the second-round report lists outside the assignment |

The step `the plan revision` brings every section written at the skill plan step in line with the second-round answers.

## Name and version

- The name starts with `skill-` and contains neither `claude` nor `anthropic`.
- A new skill is `1.0.0` until its first publication, however many edits it takes.
- A published skill gets one version for all unpublished work, at the highest level among its changes.
- Renaming an unpublished skill does not change its version. Renaming a published skill is MAJOR.

## Before you finish writing a skill

Besides your own checklist, check that:

- every file of the skill except `LICENSE` and scripts can be reached from the routing table, and every link leads to a file inside the skill's directory;
- the skill holds no traces of drafts: no references to `Updates/`, to the plan or the reports, no names of the run files `sm-plan-`, `sm-research-`, `sm-followup-`, `sm-review-`, no report section numbers, no template placeholders, no "TODO", no mention of this project;
- the skill's directory holds no `__pycache__` and no `.DS_Store`.
