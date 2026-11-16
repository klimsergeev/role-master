---
name: sm-research
description: Research a subject from its sources and write a report of facts and verbatim material that answers the questions of an assignment. Use when an assignment gives a subject, questions, allowed sources, and a report path.
---

# Research

Collect what the sources say about the subject and write it into the report file. The work ends at the report: leave out conclusions, recommendations, and ideas about how the material should be used.

## Scope

- Answer the questions that were asked, in the scope they were asked. Do not widen the subject, add neighbouring topics, or answer questions nobody asked.
- Use only the sources the assignment allows.
- When the assignment gives an earlier report, add to it instead of repeating it.
- When you come across a part of the subject that was not asked about, do not research it. Name it in one line under "Outside the assignment".
- Nobody can answer questions while you work. When a question can be read in more than one way, take the reading that fits the subject and say in one line which reading you took.

## A question about what the subject consists of

Answer with the source's own structure, copied verbatim and in full: the table of contents of the documentation, the chapter list of a book, the menu or feature list of a product. Do not summarise it. When the subject has several sources, give the structure of each under its name.

## Sources

- Write down only what you have read in the source itself. A search snippet, your memory, or a blog, forum answer, or tutorial that retells the source is only a pointer to it.
- Take verbatim texts, numbers, names, and exact wording from the raw text of the page, downloaded with `curl`. WebFetch returns a retelling of the page, not its text.
- When a tool returns a page cut off at its size limit, download the whole document and find the section in it.
- State nothing more strongly than the source does. A fact from the documentation of one version is not a fact about another version.
- When the assignment names no version, use the current one and say which it is.
- Use WebFetch, WebSearch, and `curl`. Do not use a browser of any kind.
- When a page is blocked or a tool refuses its address, try a public archive, a documentation mirror, a search for verbatim phrases from the page, or opening the page from search results. Do not get around a site's protection: no spoofed User-Agent or browser, no bypassing of a 403, a paywall, a captcha, or a mandatory login.
- When something cannot be established, say so under "Not established" and name what you tried.
- Read and write files only inside the project. Read the output of `curl` directly; when a page must be saved to search it, save it next to the report and leave it there. Do not clone repositories and do not download or run installers.

## Report

Write the report in English, to the path given in the assignment. Add each answer to the file as soon as it is finished. Create and change the file only with the Write and Edit tools. When you have no tools for writing files, return the complete report as your answer, in the same format.

```markdown
# [Subject]

## [First question, copied verbatim from the assignment]

[The answer, in whatever size and form the question needs: prose, a list, a table, a set of prompts.]

[Verbatim material from the source, as a block, in full, in its original language.]

## [Second question, copied verbatim from the assignment]

...

## Not established

- [A question or a part of it] — tried: [what you tried].

## Outside the assignment

- [Name of what you noticed].
```

- Section headings are the questions of the assignment, copied verbatim and in the same order.
- Put the source's own text in a quote block or a fenced block, apart from your words. Give ready-made texts such as prompts, templates, and configuration examples in full, in their original language, untranslated, with a line above saying what the text is and what it belongs to.
- Mark with `[inferred]` anything the source does not state directly and you worked out yourself.
- When sources disagree, give every position and do not choose between them.
- When a fact holds only for a particular version or condition, say which.
- Leave out the "Not established" or "Outside the assignment" section when it would be empty.
- The report holds nothing else: no source addresses or source lists, no dates of link checks, no account of how you worked, no references to files on disk.

Two general rules of this project do not apply to this report: foreign-language quotes are given without a Russian translation, and the report has no «Что перепроверено» section. The fact-checking rules themselves apply in full: check every fact against its source before writing it down, and never invent data.

## Finishing

Your final message is read by a script, not by a person. Return what the assignment asks you to return and nothing more.
