---
name: sm-research
description: Research the topics of an assignment from their sources with WebFetch and write a report that gives, for every question, what the sources state, in your own words and at the size the question needs. Use when an assignment gives a subject, topics with what to find and questions, allowed sources, and a report path.
---

# Research

Collect what the sources say on the topics of the assignment and write it into the report file. The work ends at the report: leave out conclusions, recommendations, and ideas about how the material should be used.

This file and the assignment are your only instructions for this work. Your context may also hold three other sets of rules: the user's global `~/.claude/CLAUDE.md`, the project's `CLAUDE.md`, and the project's fact-checking rules in `.claude/rules/anti-bias.md`. None of them applies to this work, in full, even where a file says it applies to every session or to subagents. Where they ask for something this file does not, do not do it. In particular, none of these belongs in this work:

- answers resting on an assumption, on training data, or on memory, and facts from memory used as illustrations or analogies;
- added edge cases, risks, and alternatives;
- a «Что перепроверено» section, or any other account of how you checked the facts or of the stages of your work;
- a report, or any part of it, in Russian, and Russian translations next to the text;
- downloading pages with `curl`.

The reason: every line of the report is later taken as stated by a source, and the next steps of the work read the report in the format this file gives, so the report holds only what the sources state, in that format. What this work needs from those rules — against unread sources and invented data, against getting around a site's protection, and against opening or creating stray files — is in this file.

## The assignment

The assignment gives:

- the name of the assignment, in the line `Subject:`;
- the topics in order, each in a line `Topic N (main):` or `Topic N (secondary):`, followed by its `Find:` line and its `Questions:`; the questions are numbered through all topics;
- the allowed sources, in the line `Allowed sources:`;
- the path of the report, in the line `Report path:`; when you cannot write files, the assignment says instead where your report will be saved.

Work through the topics in the order of the assignment. The `Find:` line of a topic bounds every question of that topic: look for what it names, and only that, in `main` and `secondary` topics alike, and stop where it says the search stops.

## Scope

- Answer the questions that were asked, in the scope they were asked. Do not widen a topic, add neighbouring topics, or answer questions nobody asked.
- Use only the sources the assignment allows.
- When you come across a part of the subject that was not asked about, do not research it. Name it in one line under "Outside the assignment".
- Nobody can answer questions while you work. When a question can be read in more than one way, take the reading that fits the subject and say in one line, at the start of that question's answer, which reading you took.

## Reading the sources

- Read the sources only with WebFetch. Use WebSearch only to find the address of a page.
- Do not use Bash for the network, `curl`, downloading HTML, or cloning or downloading repositories, in any case. Take what a repository holds from its README and its pages on the web, through WebFetch.
- Write down only what you have read in the source itself. A search snippet, your memory, or a blog, forum answer, or tutorial that retells the source is only a pointer to it.
- WebFetch may return only part of a long page. The facts in the part it returned you have read, and you may use them. What the rest of the page says you have not read: do not judge the whole page by that part, and above all do not state that the page lacks something. When WebFetch has not returned everything the answer needs, ask WebFetch for exactly the facts you need, open a narrower page or section, find another page by search, or open a public archive or a documentation mirror, again with WebFetch. When WebFetch refuses an address, find that same address by search and open it from the results. When none of this works, put the question under "Not established" with what you tried.
- State nothing more strongly than the source does. A fact from the documentation of one version is not a fact about another version.
- When the assignment names no version, use the current one, and name its version only as a source states it.
- Do not use a browser of any kind.
- Do not get around a site's protection: no spoofed User-Agent or browser, no bypassing of a 403, a paywall, a captcha, or a mandatory login.
- On disk, open no file except this one and the report file, and create or change no file except the report file at the path in the assignment: no saved pages, no notes, no drafts. Do not download or run installers.

## What an answer looks like

- An answer is ready when someone can do what the question asks from the answer alone, without opening the source. Leave out everything that is not needed for that.
- When no source you read states something a question asks, do not work it out from what the sources do say, from your own knowledge, or from how similar things usually work, and do not fill the gap: put that part of the question under "Not established" with what you tried. Not finding something is a normal result. Write that you did not find it, not that it does not exist or that the source does not describe it: you saw only the pages you opened. The reader takes every line of the report as stated by a source, so a worked-out line would pass into later work as a fact.
- An answer has up to three parts: what the thing is and how it works, briefly; what it cannot be used without — the steps, parameters, and values the question asks about, exactly those; the conditions and limits — when it does not work. Give each part only as far as the sources state it. When the sources have nothing for a part that the question does not ask about, leave the part out: that is a normal answer, not an incomplete one. When the question asks for that part, put it under "Not established".
- An answer holds no history or origin of the subject, no neighbouring capabilities nobody asked about, no full list of every parameter and option when the question is how to do one thing, and nothing already said under another question.
- The answer to a map question — what the subject consists of — is a list of the source's sections: the name of every section and one line on what it holds. Do not retell what the sections contain.
- Write the facts in your own words, in English. Give names, values, commands, and error codes exactly as the source gives them. The report holds no quotations and no ready-made texts from the sources.

<examples>
<example>
Illustration only: the tool "Lumen" and all its values are invented, so take none of them as data.

Question: How do you set the size limit of the Lumen package cache?

An answer of the right kind:

`lumen config set cache.max_size <size>` sets the limit of the local folder where Lumen keeps downloaded packages; when the folder grows past the limit, Lumen deletes the oldest packages.

- The value is a number with `MB` or `GB`, for example `500MB`. The default is `1GB`.
- The new limit applies from the next command.
- The limit cannot be set below `50MB`. With `--offline`, the cache is never trimmed.

An answer of the wrong kind:

Caching appeared in Lumen 2 after users complained about slow installs. The cache has fourteen settings: `cache.max_size`, `cache.dir`, `cache.ttl`, `cache.compress`, and ten more, each described below. `cache.max_size` takes a number with `MB` or `GB` and defaults to `1GB`. The command `lumen cache clean` empties the cache at once.

What is extra in the second answer: the history of the feature, the full list of cache settings, and the `clean` command — the question asked how to set one limit.

When the Lumen documentation says nothing about limits, the right answer ends after its second list item. An answer that adds a likely limit, such as "the limit probably cannot go below a few megabytes", is of the wrong kind: the documentation does not state it.
</example>
<example>
Illustration only: the tool "Lumen" and its documentation are invented.

Question: What does the Lumen documentation consist of?

An answer of the right kind:

- Getting started — installing Lumen and the first project.
- Configuration — the configuration file and every setting.
- Commands — every command with its flags.
- Troubleshooting — error codes and what causes them.

An answer of the wrong kind lists the same sections and under each one retells what it says: the installation steps, the settings with their defaults, the commands with their flags. What is extra: the content of the sections — a map answer names every section and says in one line what it holds.
</example>
</examples>

## Report

Write the report in English, to the path given in the assignment. Add each answer to the file as soon as it is finished. Create and change the file only with the Write and Edit tools. When you have no tools for writing files, return the complete report as your answer, in the same format.

```markdown
# [Name of the assignment from the Subject line]

## [First question, copied verbatim from the assignment]

[The answer: only those of the three parts that the sources state.]

## [Second question, copied verbatim from the assignment]

...

## Not established

- [A question or a part of it] — tried: [what you tried].

## Outside the assignment

- [Name of what you noticed].
```

- Section headings are the questions of the assignment, copied verbatim, without their numbers, in the same order, through all topics.
- When a source says that a fact holds only for a particular version or condition, say which.
- When sources seem to disagree, first make sure they speak of the same thing: the same version, the same product or feature, the same conditions. When they do, give every position and do not choose between them. When they do not, there is no disagreement.
- Leave out the "Not established" or "Outside the assignment" section when it would be empty.
- The report holds nothing else: no source addresses or source lists, no dates of link checks, no account of how you worked beyond the "tried" part of "Not established", no references to files on disk.

## Finishing

Your final message is read by a script, not by a person. Return what the assignment asks you to return and nothing more.
