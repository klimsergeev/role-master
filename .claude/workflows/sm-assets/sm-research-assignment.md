---
name: sm-research-assignment
description: How research assignments are built inside the skill pipeline — topics marked main or secondary and merged into at most three assignments in the first round, one assignment of justified, self-contained questions in the second, and what to return to the script. Use at the steps the first-round research assignment and the skill plan and the second-round assignment.
---

# Research assignments in the pipeline

Prepare the research assignments by your own practice as the author of skills. The rules below take priority where they differ from it. Each research assignment goes to one researcher. The script calls an assignment a subject: the `subjects` you return, the `Subject:` line the researcher gets.

## Every assignment, in both rounds

- Write every question and every "what to find" in English, whatever the language of the request and of the skill. The researcher writes the report in English and uses your questions, copied verbatim, as its section headings.
- The researcher is told nothing about the skill. No question and no "what to find" mentions the skill, its files, or what the material is for.
- Copy the allowed sources verbatim from «Охват».
- Ask for facts, values, steps, and conditions. Ask for no ready-made text verbatim: the researchers read pages with WebFetch, which returns no long verbatim text.
- The second round is the last one.
- In the pipeline these rules replace three rules of your role's «Достаточность ресёрча»: the map question goes first only in a main topic of the first round, not in every subject; ready-made texts are not requested in full and verbatim; a second-round question does not name the report section it refines, because the second-round researcher does not get the report.

## First round

This is the step `the first-round research assignment`.

1. Read only the plan file: «Охват», «Вопросы и ответы», «Источники», and on an extension or a rebuild «Аудит текущего скилла». Do not open the current skill. Do not ask the researcher about anything the audit says the current skill already holds.
2. Of every ready report listed in «Источники», read only its section headings: they are the questions the report answers. A topic those headings cover is not researched again.
3. Mark every topic from «Охват» and «Вопросы и ответы» as main or secondary. A main topic is one without which the skill does not do what «Охват» says it does; every other topic is secondary.
4. Merge topics close in meaning into one assignment. Make at most three assignments. Do not split an assignment by tools or by sources. Put the topics about Claude or Claude Code into an assignment of their own; it counts among the three.
5. Inside every assignment, order the topics by priority, main topics first.
6. For every topic, write what to find: which facts are needed and where the search on the topic stops, so that the researcher does not search everything down to the last detail. For every secondary topic, name the small facts that may be looked up, and only those.
7. Put the map question — what the subject consists of — first, and only in a main topic. A secondary topic gets no map question. The map question asks for a list of the source's sections with one line about each, not for the whole table of contents.
8. Write the assignments into the plan as the section «Задание исследователям»: for every assignment, its name; its topics, each marked главная or второстепенная, with what to find and its questions; the allowed sources; the report path, or the path of the ready report that covers it.

Return to the script, for every assignment:

- its name;
- its topics in order, each with its name, the priority `main` or `secondary`, what to find, and its questions;
- the allowed sources;
- whether the assignment is about Claude or Claude Code: true only when every topic in it is;
- the report path `Updates/Drafts/[topic folder]/sm-research-[subject].md`, where `[subject]` is the assignment's name in Latin lowercase with hyphens;
- the path of a ready report when one covers the whole assignment, and then no topics; otherwise an empty path.

## Second round

This is the step `the skill plan and the second-round assignment`. Prepare the second-round assignment after the skill plan sections are written.

1. A question goes into the list of what is missing only when without its answer a part of the skill on a main topic cannot be written: a whole file, or a step of a procedure without which the skill does not do what «Охват» says it does.
2. These go to «Отложенное» instead of the list: secondary topics; refinements and small details on a main topic; what the skill can leave as a "not established" line and still work; what a researcher noticed outside the assignment.
3. For every question in the list, write its justification: which file of the skill and which step in it cannot be written without the answer. A question without a justification does not go into the list. The justification stays in the plan and does not go into the assignment.
4. These criteria replace the gap criteria of your role's «Достаточность ресёрча» wherever those are wider: a part of the map that «Охват» needs, what a report could not establish, and what it noticed outside the assignment go into the list only with a justification.
5. The assignment may give a list of first-round assignments whose reports were not delivered, including those not launched because of the limit of three. For every assignment in that list, take its questions from «Задание исследователям» by its name. Every such question passes the same criterion: with a justification it goes into the list, without one it goes to «Отложенное».
6. All questions of the list go to one researcher, in one assignment. Mark the assignment as about Claude or Claude Code only when every question in it is; otherwise the questions about Claude go to the same researcher with the rest.
7. The second-round researcher gets no first-round report. Make every question self-contained: it does not refer to a report or its sections, and it states itself what is already known and needed for the search.
8. For every topic, write the bounds as its "what to find": what to find, where the search stops, what not to bring. Mark every topic `main`. The second round has no map question.
9. Write the list, with the bounds and the justification of every question, into «Недостающее». When no question has a justification, write «Нет» there.

Return to the script whether anything is missing, and one assignment or none. The assignment has the same fields as in the first round, without the path of a ready report, and with the report path `Updates/Drafts/[topic folder]/sm-followup-[subject].md`. When nothing is missing, return no assignment.
