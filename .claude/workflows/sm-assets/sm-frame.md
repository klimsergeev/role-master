---
name: sm-frame
description: The opening of the skill pipeline — the questions to the user before the run and the skeleton of the skill plan with the user's bounds. Use when a pipeline step asks you for questions to the user about a requested skill, or asks you to frame the request into a skill plan.
---

# Opening the skill pipeline

The user describes the skill they want in free speech. You are the author of the skill and from this point everything about it is your responsibility. The pipeline opens in two steps: `the questions to the user`, then `the frame`. The conditions of the pipeline are in [sm-pipeline.md](sm-pipeline.md).

## Questions to the user

This is the step `the questions to the user`. The pipeline cannot talk to the user while it runs. You do not ask the questions yourself: you return them, the session shows them to the user as a questionnaire, and the user answers or skips.

1. Read the request. On an extension or a rebuild, read the source of the current skill in `Skills/` or `Skills.private/` in full.
2. Ask only what changes the skill and cannot be settled from the request and the project's files: what the skill covers and what it leaves out, which versions or products, which sources are allowed.
3. Ask nothing you can decide yourself as the author. When nothing needs asking, return no questions.
4. Write the questions in the user's language. One question is one decision.

Return each question in the form a questionnaire takes:

- a short label of one or two words;
- the question, with a sentence or two of context: where it comes from and what depends on it;
- two to four answer options, each with a short label and a description of what changes in the skill when it is chosen;
- whether several options may be chosen at once.

## The frame

This is the step `the frame`. The assignment gives you the request and a block of questions and answers in one of three forms:

- every question that was asked, with its label, its text, and the user's answer or a mark that the user skipped it;
- one line saying that the user skipped the questions;
- one line saying that no questions were needed.

1. Decide the entry kind: a new skill, an extension of an existing one, or a rebuild. Look for an existing skill only among the sources in `Skills/` and `Skills.private/`, and take only its path: do not read its files. The audit step reads them.
2. Choose the topic folder `Updates/Drafts/[topic folder]/`, named after the subject in Latin lowercase with hyphens, without the word "skill". Research reports already lying in that folder, and those the request names, are ready research.
3. Create the plan file `Updates/Drafts/[topic folder]/sm-plan-[skill name].md`. `[skill name]` is the full name with the `skill-` prefix: on an extension or a rebuild, the name of the current skill; for a new skill, the name you give it now. Later steps do not rename the file, even when they choose another name for the skill.
4. When the chosen folder already holds `sm-plan-[skill name].md`, leave everything in it untouched and choose a new folder whose name specifies the subject further.
5. Write five sections: «Цель», «Охват», «Вопросы и ответы», «Источники», «Этапы».
   - «Охват» holds the user's bounds as rules for every later step: what the skill covers, what it leaves out, which sources are allowed. Write them as the request and the answers state them, neither wider nor narrower. Every topic the answers add goes into «Охват» on a par with the topics of the request.
   - «Вопросы и ответы» holds every question from the assignment with its label, its text, and the user's answer or «пропущено». When the assignment gives one line saying that the user skipped the questions, write the line «Пользователь пропустил вопросы». When no questions were needed, write the line «Вопросов не было».
   - «Источники» lists the ready research and, on an extension or a rebuild, the path of the current skill.
6. For everything the user did not state, in the request or in the answers, apply the defaults and write them into «Охват»:
   - the allowed sources are the official materials of the subject's owner: documentation, product pages, official repositories and blogs;
   - the skill's text names no sources;
   - prose is in your own words, without quotes;
   - no licence is looked into and no `LICENSE` file is created.
7. When the request or the answers ask for verbatim texts from the sources, such as ready-made prompts, templates, or quotations, write into «Охват» that the pipeline brings no verbatim texts of sources, and put this requirement into «Отложенное».
8. Where the questions were skipped or an answer is missing, decide yourself and record the decision in «Открытые вопросы».

Return the path of the plan file, the entry kind, the path of the current skill or nothing for a new one, and the paths of the ready research.
