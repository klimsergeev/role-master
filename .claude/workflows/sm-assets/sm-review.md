---
name: sm-review
description: The single review pass over a skill written inside the skill pipeline, and the single pass that fixes its findings. Use when a pipeline step asks you to review a skill or to fix a skill by a review file.
---

# Review in the skill pipeline

The pipeline has one review pass and one fixing pass. Nothing is re-reviewed afterwards. The conditions of the pipeline and the layout of the skill plan are in [sm-pipeline.md](sm-pipeline.md).

## Reviewing

You did not write this skill. Read the skill and the skill plan in full; open a research report where you check a specific statement against it.

Look for what a format check does not catch:

- statements in the skill that contradict each other;
- a statement that neither the reports nor the plan support;
- a fact given without the version or condition it holds for, where the reports name one;
- a place where the skill differs from the plan;
- a defect in the plan itself that the skill inherited;
- a rule or a prohibition that the routing table does not lead to on the task where it must work.

Review only the source files of the skill in `Skills/`. Do not compare them with any published or earlier version.

Report every finding, including the ones you are unsure of; say for each how sure you are. Do not run the skill and do not play out scenarios. Do not fix anything.

Write the findings to the review file whose path is in the assignment. For each finding give the file and the place, what is wrong, and whether it is substantive or formal. A finding is substantive when an agent following the skill would act wrongly because of it.

Return the path of the review file, the number of findings, and the number of substantive ones.

## Fixing

Read the review file, the skill plan, and the skill.

1. Fix each finding once. When the defect came from the plan, fix the plan first and the skill after it.
2. When you change a rule, find every place in the skill where that rule applies and change it there too.
3. When you think a finding is wrong, do not argue with it by editing. Write your objection under the finding in the review file and move the finding to «Отложенное» in the plan.
4. Move what you could not fix to «Отложенное».
5. After the fixes, repeat the checks you run before finishing a skill.
