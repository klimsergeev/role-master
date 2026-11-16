export const meta = {
    name: 'skillmaster',
    description: 'Create, extend or rebuild a skill: questions to the user, framing, research in at most two rounds, plan, writing, one review pass',
    whenToUse: 'A user request to create, extend or rebuild a skill of this project. First call: args is an object with request, what the user said about the skill, and optionally skillName and researchPaths; a plain string is taken as the request. When the result has status questions, show them to the user as a questionnaire and call again as the result says, with answers; otherwise the run has gone to the end.',
    phases: [
        { title: 'Questions', detail: 'first call only: skill-master returns questions to the user for a questionnaire' },
        { title: 'Preparation', detail: 'skill plan skeleton and first-round research assignment, both by skill-master' },
        { title: 'Research round 1', detail: 'one researcher per subject in parallel; skipped for subjects with a ready report' },
        { title: 'Audit', detail: 'extension or rebuild only: skill-master audits the current skill' },
        { title: 'Plan', detail: 'skill-master writes the skill plan and the list of what is missing' },
        { title: 'Research round 2', detail: 'last round, only what is missing; skipped when nothing is' },
        { title: 'Plan revision', detail: 'skill-master brings the plan to the answers' },
        { title: 'Writing', detail: 'skill-master writes the skill and checks its format' },
        { title: 'Review', detail: 'skill-master in a new run, one pass' },
        { title: 'Fix', detail: 'skill-master in a new run, one pass' },
    ],
};

// Order of steps follows Updates/Drafts/skill-workflow/plan-skillmaster-workflow-scheme.md.
// The run opens in two calls of this script, because a running workflow has no user input:
// first call (no args.answers): questions to the user -> if there are any, return them and end;
// second call (args.answers given), or a first call with no questions:
// preparation -> research round 1 (unless ready) -> audit (extension/rebuild only)
// -> plan + list of what is missing -> research round 2 + plan revision (only if something is missing)
// -> writing -> review -> fix -> result for the session.
// The script reads and writes no files: agents do. It passes file paths between steps
// and decides the branches by the agents' structured answers.

// ---------------------------------------------------------------- files for agents

const ASSETS = '.claude/workflows/sm-assets';
const FRAME_FILE = `${ASSETS}/sm-frame.md`;
const ASSIGNMENT_FILE = `${ASSETS}/sm-research-assignment.md`;
const RESEARCH_FILE = `${ASSETS}/sm-research.md`;
const PIPELINE_FILE = `${ASSETS}/sm-pipeline.md`;
const REVIEW_FILE = `${ASSETS}/sm-review.md`;

const SKILL_MASTER = 'skill-master';
const CLAUDE_GUIDE = 'claude-code-guide';
const PLAIN_AGENT = 'general-purpose';

// Research-round sentences the plan requires in the assignments. The limit itself is held
// by the code below: there are exactly two research stages and no research loop.
const ROUNDS_TWO_LEFT = 'Research rounds left: two, and the second is the last.';
const ROUNDS_BEFORE_FIRST = 'Research rounds left: two. The first is the one this assignment prepares; the second comes after it and is the last.';
const ROUNDS_ONE_LEFT = 'Research rounds left: one, and it is the last.';
const ROUNDS_NEXT_IS_LAST = 'The next research round is the last one: no research can be asked for after it.';
const ROUNDS_NONE_LEFT = 'No research rounds are left: ask for no more research.';
const RESEARCHER_LAST_ROUND = 'This is the final research round: no follow-up round will come after this report.';

// ---------------------------------------------------------------- answer schemas

// Field names follow the questionnaire the session shows: header, question, options, multiSelect.
const QUESTIONS_SCHEMA = {
    type: 'object',
    required: ['questions'],
    properties: {
        questions: {
            type: 'array',
            description: 'Questions to the user, in the user\'s language, one decision each. Empty array when nothing needs asking.',
            items: {
                type: 'object',
                required: ['header', 'question', 'options', 'multiSelect'],
                properties: {
                    header: { type: 'string', description: 'A short label of one or two words.' },
                    question: { type: 'string', description: 'The question with a sentence or two of context: where it comes from and what depends on it.' },
                    options: {
                        type: 'array',
                        minItems: 2,
                        maxItems: 4,
                        items: {
                            type: 'object',
                            required: ['label', 'description'],
                            properties: {
                                label: { type: 'string', description: 'The answer option, a few words.' },
                                description: { type: 'string', description: 'What changes in the skill when this option is chosen.' },
                            },
                        },
                    },
                    multiSelect: { type: 'boolean', description: 'Whether several options may be chosen at once.' },
                },
            },
        },
    },
};

const FRAME_SCHEMA = {
    type: 'object',
    required: ['planPath', 'entryKind', 'currentSkillPath', 'readyResearch'],
    properties: {
        planPath: {
            type: 'string',
            description: 'Path of the skill plan file you created, relative to the project root: Updates/Drafts/<topic folder>/plan-skill-<working name>.md.',
        },
        entryKind: {
            type: 'string',
            enum: ['new', 'extension', 'rebuild'],
            description: 'new: a skill that does not exist yet; extension: new content added to an existing skill; rebuild: an existing skill restructured.',
        },
        currentSkillPath: {
            type: 'string',
            description: 'Path of the existing skill (its directory, or its .md file for a flat skill) for an extension or a rebuild; empty string for a new skill.',
        },
        readyResearch: {
            type: 'array',
            items: { type: 'string' },
            description: 'Paths of the ready research: reports the request names and those already lying in the topic folder. Empty array when there are none.',
        },
    },
};

const SUBJECT_BASE_PROPERTIES = {
    name: { type: 'string', description: 'The subject: a vendor, a product, a method, a body of knowledge.' },
    questions: {
        type: 'array',
        items: { type: 'string' },
        description: 'The questions in English, in order, the map question first. Phrased about the subject itself: the researcher is told nothing about the skill or what the material is for.',
    },
    sources: { type: 'string', description: 'The allowed sources, copied verbatim from «Охват».' },
    aboutClaude: { type: 'boolean', description: 'True when the subject is about Claude or Claude Code.' },
    reportPath: { type: 'string', description: 'Updates/Drafts/<topic folder>/research-<YYYY-MM-DD>-<subject>.md; with -followup before .md in the second round.' },
};

const ROUND1_SCHEMA = {
    type: 'object',
    required: ['subjects'],
    properties: {
        subjects: {
            type: 'array',
            items: {
                type: 'object',
                required: ['name', 'questions', 'sources', 'aboutClaude', 'reportPath', 'readyReport'],
                properties: {
                    ...SUBJECT_BASE_PROPERTIES,
                    readyReport: {
                        type: 'string',
                        description: 'Path of a ready research report that already covers this subject; then questions is empty and the subject is not researched again. Empty string otherwise.',
                    },
                },
            },
        },
    },
};

const PLAN_SCHEMA = {
    type: 'object',
    required: ['missing', 'subjects'],
    properties: {
        missing: { type: 'boolean', description: 'Whether anything is missing for the plan at all.' },
        subjects: {
            type: 'array',
            description: 'The second-round subjects; empty when nothing is missing.',
            items: {
                type: 'object',
                required: ['name', 'questions', 'bounds', 'sources', 'aboutClaude', 'reportPath', 'earlierReport'],
                properties: {
                    ...SUBJECT_BASE_PROPERTIES,
                    bounds: { type: 'string', description: 'In English: what exactly to find, where the search stops, what not to bring.' },
                    earlierReport: { type: 'string', description: 'Path of the first-round report on the same subject; empty string when there is none.' },
                },
            },
        },
    },
};

const RESEARCH_SCHEMA = {
    type: 'object',
    required: ['reportPath'],
    properties: {
        reportPath: { type: 'string', description: 'Path of the report file you wrote.' },
    },
};

// claude-code-guide cannot write files: it returns the report text.
const GUIDE_SCHEMA = {
    type: 'object',
    required: ['report'],
    properties: {
        report: { type: 'string', description: 'The complete report, as Markdown, in the format the research file describes.' },
    },
};

const SAVE_SCHEMA = {
    type: 'object',
    required: ['reportPath', 'written'],
    properties: {
        reportPath: { type: 'string' },
        written: { type: 'boolean', description: 'True only when the file exists and its content matches the given text.' },
    },
};

const AUDIT_SCHEMA = {
    type: 'object',
    required: ['sectionWritten'],
    properties: {
        sectionWritten: { type: 'boolean', description: 'Whether the «Аудит текущего скилла» section is written into the plan.' },
    },
};

const REVISION_SCHEMA = {
    type: 'object',
    required: ['planUpdated'],
    properties: {
        planUpdated: { type: 'boolean', description: 'Whether the plan was brought in line with the second-round answers.' },
    },
};

const WRITE_SCHEMA = {
    type: 'object',
    required: ['skillName', 'skillPath', 'version', 'oldSkillPath'],
    properties: {
        skillName: { type: 'string' },
        skillPath: { type: 'string', description: 'Path of the skill directory under Skills/, relative to the project root.' },
        version: { type: 'string' },
        oldSkillPath: { type: 'string', description: 'On a rename, the path of the old skill directory left untouched; empty string otherwise.' },
    },
};

const REVIEW_SCHEMA = {
    type: 'object',
    required: ['reviewPath', 'findings', 'substantive'],
    properties: {
        reviewPath: { type: 'string' },
        findings: { type: 'integer', minimum: 0, description: 'Number of findings in the review file.' },
        substantive: { type: 'integer', minimum: 0, description: 'How many of them are substantive.' },
    },
};

const FIX_SCHEMA = {
    type: 'object',
    required: ['skillName', 'skillPath', 'version', 'oldSkillPath', 'deferred', 'externalReferences'],
    properties: {
        ...WRITE_SCHEMA.properties,
        deferred: { type: 'string', description: 'The full text of the plan section «Отложенное», verbatim, as it stands after the fixes.' },
        externalReferences: { type: 'string', description: 'The full text of the plan section «Ссылки на скилл извне», verbatim, as it stands after the fixes.' },
    },
};

// ---------------------------------------------------------------- helpers

// Joins prompt lines, dropping empty parts, so optional lines can be written inline.
function lines(...parts) {
    return parts.flat().filter((part) => typeof part === 'string' && part !== '').join('\n');
}

function unique(items) {
    return [...new Set(items.filter((item) => typeof item === 'string' && item.trim() !== ''))];
}

function toList(value) {
    if (typeof value === 'string') {
        return value.trim() ? [value.trim()] : [];
    }
    return Array.isArray(value) ? unique(value.map((item) => (typeof item === 'string' ? item.trim() : ''))) : [];
}

function pathList(title, paths) {
    return paths.length ? [title, ...paths.map((path) => `- ${path}`)] : [];
}

function failedList(title, failed) {
    return failed.length ? [title, ...failed.map((subject) => `- ${subject.name}: ${subject.reportPath}`)] : [];
}

// review-skill-<working name>.md next to plan-skill-<working name>.md
function reviewPathFor(planPath) {
    const slash = planPath.lastIndexOf('/');
    const dir = planPath.slice(0, slash + 1);
    const base = planPath.slice(slash + 1).replace(/^plan-/, '');
    return `${dir}review-${base}`;
}

const notes = [];

function note(message) {
    notes.push(message);
    log(message);
}

// ---------------------------------------------------------------- input

const input = typeof args === 'string' ? { request: args } : (args && typeof args === 'object' ? args : {});
const request = typeof input.request === 'string' ? input.request.trim() : '';
if (!request) {
    throw new Error('skillmaster: args.request is required: what the user said about the skill.');
}
const namedSkill = typeof input.skillName === 'string' ? input.skillName.trim() : '';
const namedResearch = toList(input.researchPaths !== undefined ? input.researchPaths : input.researchPath);

// args.answers marks the second call: an array of answers, or 'skipped' for a skipped questionnaire.
const ANSWERS_SKIPPED = 'skipped';
const isSecondCall = input.answers !== undefined;
if (isSecondCall && input.answers !== ANSWERS_SKIPPED && !Array.isArray(input.answers)) {
    throw new Error('skillmaster: args.answers must be an array of {header, question, answer} or the string "skipped".');
}

// The same args the second call repeats, without answers.
const callArgs = {
    request,
    ...(namedSkill ? { skillName: namedSkill } : {}),
    ...(namedResearch.length ? { researchPaths: namedResearch } : {}),
};

function requestLines() {
    return [
        'User request, verbatim, between the lines <<<REQUEST and REQUEST>>>:',
        '<<<REQUEST',
        request,
        'REQUEST>>>',
        namedSkill ? `Existing skill named by the user: ${namedSkill}` : '',
        ...pathList('Ready research named by the user:', namedResearch),
    ];
}

function answerLines() {
    if (!isSecondCall) {
        return ['No questions to the user were needed.'];
    }
    if (input.answers === ANSWERS_SKIPPED || !input.answers.length) {
        return ['The user skipped the questions.'];
    }
    return [
        'The user\'s answers to the questions:',
        ...input.answers.map((item, index) => (typeof item === 'string'
            ? `${index + 1}. ${item}`
            : `${index + 1}. ${item.header ? `${item.header}: ` : ''}${item.question || ''}\n   Answer: ${item.answer === ANSWERS_SKIPPED ? 'skipped by the user' : item.answer}`)),
    ];
}

const state = {
    planPath: '',
    reviewPath: '',
    researchReports: [],
    missingReports: [],
};

function stop(step) {
    note(`Stopped: the ${step} step returned no answer.`);
    return {
        status: 'stopped',
        stoppedAt: step,
        planPath: state.planPath,
        reviewPath: state.reviewPath,
        researchReports: state.researchReports,
        missingReports: state.missingReports,
        notes,
    };
}

// ---------------------------------------------------------------- research stage

function researcherPrompt(subject, round, forGuide) {
    const lastRound = round === 2;
    return lines(
        forGuide
            ? `Read ${RESEARCH_FILE} in full and follow it, with one difference: you cannot write files, so do not create the report file. Return the complete report, in the format that file describes, in the "report" field; it will be saved unchanged to ${subject.reportPath}.`
            : `Read ${RESEARCH_FILE} in full and follow it.`,
        `Subject: ${subject.name}`,
        'Questions, in order:',
        subject.questions.map((question, index) => `${index + 1}. ${question}`),
        `Allowed sources: ${subject.sources}`,
        lastRound ? `Bounds: ${subject.bounds}` : '',
        lastRound && subject.earlierReport ? `Earlier report on this subject: ${subject.earlierReport}` : '',
        forGuide ? '' : `Report path: ${subject.reportPath}`,
        lastRound ? RESEARCHER_LAST_ROUND : '',
        forGuide ? 'Return the report.' : 'Return the report path.',
    );
}

function saverPrompt(text, reportPath) {
    return lines(
        `Create the file ${reportPath} (relative to the project root) with exactly the text between the lines <<<REPORT and REPORT>>> below as its content.`,
        'Do not change the text in any way: no edits, no summary, no translation, no reformatting. Overwrite the file if it exists.',
        'Then read the file back and check that its content matches the text.',
        'Return the path and whether the file is written.',
        '<<<REPORT',
        text,
        'REPORT>>>',
    );
}

// One researcher per subject, all in parallel, each into its own report file.
// A Claude or Claude Code subject goes to claude-code-guide, whose text a general-purpose agent saves.
async function runResearchRound(subjects, round) {
    const phaseTitle = `Research round ${round}`;
    phase(phaseTitle);
    const paths = await pipeline(
        subjects,
        (subject) => (subject.aboutClaude
            ? agent(researcherPrompt(subject, round, true), {
                label: `research ${round} (claude-code-guide): ${subject.name}`,
                phase: phaseTitle,
                agentType: CLAUDE_GUIDE,
                schema: GUIDE_SCHEMA,
            })
            : agent(researcherPrompt(subject, round, false), {
                label: `research ${round}: ${subject.name}`,
                phase: phaseTitle,
                agentType: PLAIN_AGENT,
                schema: RESEARCH_SCHEMA,
            })),
        async (answer, subject) => {
            if (!answer) {
                return null;
            }
            if (!subject.aboutClaude) {
                return answer.reportPath || subject.reportPath;
            }
            if (!answer.report || !answer.report.trim()) {
                return null;
            }
            const saved = await agent(saverPrompt(answer.report, subject.reportPath), {
                label: `save report: ${subject.name}`,
                phase: phaseTitle,
                agentType: PLAIN_AGENT,
                schema: SAVE_SCHEMA,
                effort: 'low',
            });
            return saved && saved.written ? (saved.reportPath || subject.reportPath) : null;
        },
    );
    const written = [];
    const failed = [];
    subjects.forEach((subject, index) => {
        if (paths[index]) {
            written.push(paths[index]);
        } else {
            failed.push(subject);
        }
    });
    if (failed.length) {
        note(`Research round ${round}: no report for ${failed.map((subject) => subject.name).join(', ')}.`);
    }
    state.researchReports = unique([...state.researchReports, ...written]);
    state.missingReports = [...state.missingReports, ...failed.map((subject) => subject.reportPath)];
    return { written, failed };
}

// ================================================================ 0. Questions to the user (first call only)

if (!isSecondCall) {
    phase('Questions');
    const asked = await agent(lines(
        `Read ${PIPELINE_FILE} and ${FRAME_FILE} in full and follow them.`,
        'Step: the questions to the user.',
        requestLines(),
        ROUNDS_TWO_LEFT,
        'Return the questions, or an empty list when nothing needs asking.',
    ), { label: 'skill-master: questions to the user', phase: 'Questions', agentType: SKILL_MASTER, schema: QUESTIONS_SCHEMA });

    if (!asked) {
        return stop('questions to the user');
    }

    // Branch "there are questions": end this call and hand them to the session.
    if (asked.questions.length) {
        return {
            status: 'questions',
            questions: asked.questions,
            nextArgs: callArgs,
            then: 'Show all the questions to the user as one questionnaire, in this order. Then run skillmaster again with nextArgs plus answers: an array of {header, question, answer} in the same order, where answer is the label of the chosen option, the labels joined by "; " when several were chosen, or the user\'s own text, and "skipped" for a question the user skipped. When the user skipped the whole questionnaire, pass answers: "skipped".',
        };
    }
    log('No questions to the user: the run goes on in this call.');
}

// ================================================================ 1. Preparation

phase('Preparation');

// 1a. skill-master: bounds and the skeleton of the skill plan, entry kind, ready research.
const frame = await agent(lines(
    `Read ${PIPELINE_FILE} and ${FRAME_FILE} in full and follow them.`,
    'Step: the frame.',
    requestLines(),
    answerLines(),
    ROUNDS_TWO_LEFT,
    'Return the plan path, the entry kind, the current skill path and the ready research reports.',
), { label: 'skill-master: frame', phase: 'Preparation', agentType: SKILL_MASTER, schema: FRAME_SCHEMA });

if (!frame) {
    return stop('frame');
}

state.planPath = frame.planPath;
state.reviewPath = reviewPathFor(frame.planPath);
const isNewSkill = frame.entryKind === 'new';
const currentSkill = isNewSkill ? '' : frame.currentSkillPath;
const readyResearch = unique(frame.readyResearch);
state.researchReports = readyResearch.slice();
log(`Entry: ${frame.entryKind}; plan: ${frame.planPath}; ready reports: ${readyResearch.length}.`);

// 1b. skill-master: research assignment for the first round, the map question first.
const round1 = await agent(lines(
    `Read ${PIPELINE_FILE} and ${ASSIGNMENT_FILE} in full and follow them.`,
    'Step: the research assignment for the first round.',
    `Skill plan: ${state.planPath}`,
    currentSkill ? `Current skill: ${currentSkill}` : '',
    pathList('Ready research reports:', readyResearch),
    readyResearch.length ? 'For a subject a ready report already covers, set readyReport to its path and leave questions empty.' : '',
    ROUNDS_BEFORE_FIRST,
    'Return the subjects.',
), { label: 'skill-master: first-round assignment', phase: 'Preparation', agentType: SKILL_MASTER, schema: ROUND1_SCHEMA });

if (!round1) {
    return stop('first-round assignment');
}

// ================================================================ 2. Research, round 1

// Branch "research on the subject already exists": subjects with a ready report are not researched.
const coveredSubjects = round1.subjects.filter((subject) => subject.readyReport);
const round1Subjects = round1.subjects.filter((subject) => !subject.readyReport && subject.questions.length);
state.researchReports = unique([...state.researchReports, ...coveredSubjects.map((subject) => subject.readyReport)]);

let round1Failed = [];
if (round1Subjects.length) {
    if (coveredSubjects.length) {
        log(`Research round 1: ready reports cover ${coveredSubjects.map((subject) => subject.name).join(', ')}.`);
    }
    round1Failed = (await runResearchRound(round1Subjects, 1)).failed;
} else {
    note(round1.subjects.length
        ? 'Research round 1 skipped: ready reports cover every subject.'
        : 'Research round 1 skipped: the assignment named no subjects.');
}
const round1Reports = state.researchReports.slice();

// ================================================================ 3. Audit (extension or rebuild only)

if (!isNewSkill) {
    phase('Audit');
    const audit = await agent(lines(
        `Read ${PIPELINE_FILE} in full and follow it.`,
        'Step: the audit of the current skill, taking the research into account.',
        `Skill plan: ${state.planPath}`,
        `Current skill: ${currentSkill}`,
        pathList('Research reports:', round1Reports),
        ROUNDS_ONE_LEFT,
        'Return whether the section «Аудит текущего скилла» is written.',
    ), { label: 'skill-master: audit of the current skill', phase: 'Audit', agentType: SKILL_MASTER, schema: AUDIT_SCHEMA });
    if (!audit || !audit.sectionWritten) {
        note('Audit: the section «Аудит текущего скилла» was not confirmed; the plan step goes on without it.');
    }
}

// ================================================================ 4. Plan and the list of what is missing

phase('Plan');
const plan = await agent(lines(
    `Read ${PIPELINE_FILE} and ${ASSIGNMENT_FILE} in full and follow them.`,
    'Step: the skill plan, then the full list of what is missing and the research assignment for the second round.',
    `Skill plan: ${state.planPath}`,
    currentSkill ? `Current skill: ${currentSkill}` : '',
    pathList('Research reports:', round1Reports),
    failedList('First-round reports that were not produced, so their questions are unanswered:', round1Failed),
    ROUNDS_NEXT_IS_LAST,
    'Return whether anything is missing and the second-round subjects.',
), { label: 'skill-master: skill plan', phase: 'Plan', agentType: SKILL_MASTER, schema: PLAN_SCHEMA });

if (!plan) {
    return stop('plan');
}

// ================================================================ 5. Research, round 2 (the last) and plan revision

// Branch "something is missing". This is the second and last research call in the script:
// whatever skill-master returns after it goes to «Отложенное», not to a researcher.
const round2Subjects = plan.missing ? plan.subjects.filter((subject) => subject.questions.length) : [];
if (!plan.missing && plan.subjects.length) {
    note('Plan: nothing is missing, but subjects were returned; they are ignored.');
}
if (plan.missing && !round2Subjects.length) {
    note('Plan: something is missing, but no subject with questions was returned; research round 2 and plan revision skipped.');
}

if (round2Subjects.length) {
    const round2 = await runResearchRound(round2Subjects, 2);

    phase('Plan revision');
    const revision = await agent(lines(
        `Read ${PIPELINE_FILE} in full and follow it.`,
        'Step: bring the skill plan in line with the second-round answers. What stays unanswered and what the reports list outside the assignment goes to «Отложенное».',
        `Skill plan: ${state.planPath}`,
        currentSkill ? `Current skill: ${currentSkill}` : '',
        pathList('Second-round reports:', round2.written),
        pathList('First-round reports:', round1Reports),
        failedList('Second-round reports that were not produced, so their questions are unanswered:', round2.failed),
        ROUNDS_NONE_LEFT,
        'Return whether the plan is updated.',
    ), { label: 'skill-master: plan revision', phase: 'Plan revision', agentType: SKILL_MASTER, schema: REVISION_SCHEMA });
    if (!revision || !revision.planUpdated) {
        note('Plan revision: not confirmed; writing goes on by the plan as it stands.');
    }
} else if (!plan.missing) {
    log('Nothing is missing: research round 2 and plan revision skipped.');
}

// ================================================================ 6. Writing and format self-check

phase('Writing');
const written = await agent(lines(
    `Read ${PIPELINE_FILE} in full and follow it.`,
    isNewSkill
        ? 'Step: write the skill by the plan, then check its format before finishing.'
        : 'Step: rewrite the current skill by the plan, then check its format before finishing.',
    `Skill plan: ${state.planPath}`,
    currentSkill ? `Current skill: ${currentSkill}` : '',
    pathList('Research reports:', state.researchReports),
    ROUNDS_NONE_LEFT,
    'Return the skill name, its path, its version, and on a rename the path of the old skill directory.',
), { label: 'skill-master: writing the skill', phase: 'Writing', agentType: SKILL_MASTER, schema: WRITE_SCHEMA });

if (!written) {
    return stop('writing');
}

// ================================================================ 7. Review, one pass (new run)

phase('Review');
const review = await agent(lines(
    `Read ${PIPELINE_FILE} and ${REVIEW_FILE} in full and follow them.`,
    'Step: the review pass.',
    `Skill: ${written.skillPath}`,
    `Skill plan: ${state.planPath}`,
    pathList('Research reports:', state.researchReports),
    `Review file: ${state.reviewPath}`,
    ROUNDS_NONE_LEFT,
    'Return the review file path, the number of findings and how many of them are substantive.',
), { label: 'skill-master: review', phase: 'Review', agentType: SKILL_MASTER, schema: REVIEW_SCHEMA });

// ================================================================ 8. Fix by the review, one pass (new run)

let fixed = null;
if (!review) {
    note('Review: no answer; the fixing pass skipped. «Отложенное» and «Ссылки на скилл извне» are in the plan file.');
} else {
    state.reviewPath = review.reviewPath || state.reviewPath;
    log(`Review: ${review.findings} findings, ${review.substantive} substantive.`);
    phase('Fix');
    fixed = await agent(lines(
        `Read ${PIPELINE_FILE} and ${REVIEW_FILE} in full and follow them.`,
        'Step: the fixing pass.',
        `Review file: ${state.reviewPath}`,
        `Skill plan: ${state.planPath}`,
        `Skill: ${written.skillPath}`,
        ROUNDS_NONE_LEFT,
        'Return the skill name, its path, its version, on a rename the path of the old skill directory, and the full text of the plan sections «Отложенное» and «Ссылки на скилл извне» as they stand after your fixes.',
    ), { label: 'skill-master: fix by the review', phase: 'Fix', agentType: SKILL_MASTER, schema: FIX_SCHEMA });
    if (!fixed) {
        note('Fix: no answer; the skill is as written. «Отложенное» and «Ссылки на скилл извне» are in the plan file.');
    }
}

// ================================================================ 9. Result for the session

const final = fixed || written;
return {
    status: 'ready',
    skillName: final.skillName,
    skillPath: final.skillPath,
    version: final.version,
    planPath: state.planPath,
    reviewPath: review ? state.reviewPath : '',
    deferred: fixed ? fixed.deferred : null,
    externalReferences: fixed ? fixed.externalReferences : null,
    oldSkillPath: final.oldSkillPath,
    researchReports: state.researchReports,
    missingReports: state.missingReports,
    notes,
};
