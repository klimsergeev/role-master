---
name: sm-research
description: Research the topics of an assignment from their sources with WebFetch and write a report that answers every question in your own words, at the size the question needs. Use when an assignment gives a subject, topics with what to find and questions, allowed sources, and a report path.
---

# Research

Collect what the sources say on the topics of the assignment and write it into the report file. The work ends at the report: leave out conclusions, recommendations, and ideas about how the material should be used.

## The assignment

The assignment gives:

- the name of the assignment, in the line `Subject:`;
- the topics in order, each in a line `Topic N (main):` or `Topic N (secondary):`, followed by its `Find:` line and its `Questions:`; the questions are numbered through all topics;
- the allowed sources, in the line `Allowed sources:`;
- the path of the report, in the line `Report path:`; when you cannot write files, the assignment says instead where your report will be saved.

Work through the topics in the order of the assignment. The `Find:` line of a topic bounds every question of that topic: look for what it names and stop where it says the search stops. In every `secondary` topic, look up only what its `Find:` line names.

## Scope

- Answer the questions that were asked, in the scope they were asked. Do not widen a topic, add neighbouring topics, or answer questions nobody asked.
- Use only the sources the assignment allows.
- When you come across a part of the subject that was not asked about, do not research it. Name it in one line under "Outside the assignment".
- Nobody can answer questions while you work. When a question can be read in more than one way, take the reading that fits the subject and say in one line which reading you took.

## Reading the sources

- Read the sources only with WebFetch. Use WebSearch only to find the address of a page.
- Do not use Bash for the network, `curl`, downloading HTML, or cloning or downloading repositories, in any case. Take what a repository holds from its README and its pages on the web, through WebFetch.
- Write down only what you have read in the source itself. A search snippet, your memory, or a blog, forum answer, or tutorial that retells the source is only a pointer to it.
- When WebFetch has not returned everything the answer needs, ask WebFetch for exactly the facts you need, open a narrower page or section, find another page by search, or open a public archive or a documentation mirror, again with WebFetch. When none of this works, put the question under "Not established" with what you tried.
- State nothing more strongly than the source does. A fact from the documentation of one version is not a fact about another version.
- When the assignment names no version, use the current one and say which it is.
- Do not use a browser of any kind.
- Do not get around a site's protection: no spoofed User-Agent or browser, no bypassing of a 403, a paywall, a captcha, or a mandatory login.
- In the project, open no file except this one, and write only the report file at the path in the assignment. Create no other file: no saved pages, no notes, no drafts. Do not download or run installers.

## What an answer looks like

- An answer is ready when someone can do what the question asks from the answer alone, without opening the source. Leave out everything that is not needed for that.
- Every answer has three parts: what the thing is and how it works, briefly; what it cannot be used without — the steps, parameters, and values the question asks about, exactly those; the conditions and limits — when it does not work.
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

[The answer, in three parts.]

## [Second question, copied verbatim from the assignment]

...

## Not established

- [A question or a part of it] — tried: [what you tried].

## Outside the assignment

- [Name of what you noticed].
```

- Section headings are the questions of the assignment, copied verbatim, without their numbers, in the same order, through all topics.
- Mark with `[inferred]` anything the source does not state directly and you worked out yourself.
- When sources disagree, give every position and do not choose between them.
- When a fact holds only for a particular version or condition, say which.
- Leave out the "Not established" or "Outside the assignment" section when it would be empty.
- The report holds nothing else: no source addresses or source lists, no dates of link checks, no account of how you worked, no references to files on disk.

Two of the project's rules do not apply to this work. The report has no «Что перепроверено» section. Of the fact-checking rules, the instructions to download with `curl` a page cut off at its size limit, or a page a tool refused to open, do not apply: take the WebFetch path from "Reading the sources" instead. The other fact-checking rules apply in full.

## Finishing

Your final message is read by a script, not by a person. Return what the assignment asks you to return and nothing more.
