export const meta = {
    name: 'skillmaster',
    description: 'Create, extend or rebuild a skill: questions to the user, framing, audit, research in at most two rounds, plan, writing, one review pass',
    whenToUse: 'A user request to create, extend or rebuild a skill of this project. First call: args is an object with request, what the user said about the skill, and optionally skillName and researchPaths; a plain string is taken as the request. When the result has status questions, show them to the user as a questionnaire and call again with all of nextArgs plus answers, as the result says; otherwise the run has gone to the end.',
    phases: [
        { title: 'Questions', detail: 'first call only: skill-master returns questions to the user for a questionnaire', model: 'sonnet' },
        { title: 'Frame', detail: 'skill-master writes the skeleton of the skill plan with the user\'s bounds', model: 'opus' },
        { title: 'Audit', detail: 'extension or rebuild only: skill-master audits the current skill before any research', model: 'opus' },
        { title: 'Assignment', detail: 'skill-master writes the first-round research assignment', model: 'opus' },
        { title: 'Research round 1', detail: 'at most three researchers in parallel; skipped when ready reports cover every assignment', model: 'sonnet' },
        { title: 'Plan', detail: 'skill-master writes the skill plan and the second-round assignment', model: 'opus' },
        { title: 'Research round 2', detail: 'last round, one researcher, only what is missing; skipped when nothing is', model: 'sonnet' },
        { title: 'Plan revision', detail: 'skill-master brings the plan to the second-round answers', model: 'opus' },
        { title: 'Writing', detail: 'skill-master writes the skill and checks its format', model: 'sonnet' },
        { title: 'Review', detail: 'skill-master in a new run, one pass', model: 'opus' },
        { title: 'Fix', detail: 'skill-master in a new run, one pass', model: 'sonnet' },
    ],
};

// The run opens in two calls of this script, because a running workflow has no user input:
// first call (no args.answers): questions to the user -> if there are any, return them and end;
// second call (args.answers given), or a first call with no questions:
// frame -> audit (extension/rebuild only) -> first-round assignment
// -> research round 1 (at most three assignments without a ready report)
// -> skill plan + second-round assignment
// -> research round 2 + plan revision (only when something is missing)
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

// Step names, verbatim as the sm-assets files name them.
const STEP = {
    questions: 'the questions to the user',
    frame: 'the frame',
    audit: 'the audit of the current skill',
    assignment: 'the first-round research assignment',
    plan: 'the skill plan and the second-round assignment',
    revision: 'the plan revision',
    writing: 'writing the skill',
    review: 'the review pass',
    fix: 'the fixing pass',
};

// Model and effort of every agent launch. No agent() call runs without them.
const RUN = {
    questions: { model: 'sonnet', effort: 'medium' },
    frame: { model: 'opus', effort: 'medium' },
    audit: { model: 'opus', effort: 'medium' },
    assignment: { model: 'opus', effort: 'high' },
    research: { model: 'sonnet', effort: 'medium' },
    saveReport: { model: 'sonnet', effort: 'medium' },
    plan: { model: 'opus', effort: 'high' },
    revision: { model: 'opus', effort: 'medium' },
    writing: { model: 'sonnet', effort: 'medium' },
    review: { model: 'opus', effort: 'medium' },
    fix: { model: 'sonnet', effort: 'medium' },
};

// At most this many first-round assignments are researched; claude-code-guide counts among them.
const ROUND1_LIMIT = 3;

// Research-round sentences the plan requires in the assignments. The limit itself is held
// by the code below: there are exactly two research stages and no research loop.
const ROUNDS_TWO_LEFT = 'Research rounds left: two, and the second is the last.';
const ROUNDS_BEFORE_FIRST = 'Research rounds left: two. The first is the one this assignment prepares; the second comes after it and is the last.';
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
            description: 'Path of the skill plan file you created, relative to the project root: Updates/Drafts/<topic folder>/sm-plan-<skill name>.md.',
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

function topicSchema(round) {
    const first = round === 1;
    return {
        type: 'object',
        required: ['name', 'priority', 'find', 'questions'],
        properties: {
            name: { type: 'string', description: 'The topic.' },
            priority: first
                ? { type: 'string', enum: ['main', 'secondary'], description: 'main: without this topic the skill does not do what «Охват» says it does; secondary: every other topic.' }
                : { type: 'string', enum: ['main'], description: 'Every second-round topic is main.' },
            find: {
                type: 'string',
                description: first
                    ? 'In English: what exactly to find on this topic and where the search stops; for a secondary topic, only the small facts that may be looked up.'
                    : 'In English, the bounds: what to find, where the search stops, what not to bring.',
            },
            questions: {
                type: 'array',
                items: { type: 'string' },
                description: first
                    ? 'The questions in English, in order; the map question first, and only in a main topic. Phrased about the subject itself: the researcher is told nothing about the skill or what the material is for.'
                    : 'The questions in English, each self-contained: no reference to a report or its sections. Phrased about the subject itself: the researcher is told nothing about the skill or what the material is for.',
            },
        },
    };
}

function subjectProperties(round) {
    return {
        name: { type: 'string', description: 'The name of the research assignment.' },
        topics: {
            type: 'array',
            items: topicSchema(round),
            description: round === 1
                ? 'The topics in order of priority, main topics first. Empty when readyReport is set.'
                : 'The topics in order; every one is main.',
        },
        sources: { type: 'string', description: 'The allowed sources, copied verbatim from «Охват».' },
        aboutClaude: { type: 'boolean', description: 'True only when every topic of the assignment is about Claude or Claude Code.' },
        reportPath: {
            type: 'string',
            description: round === 1
                ? 'Updates/Drafts/<topic folder>/sm-research-<subject>.md, where <subject> is the assignment name in Latin lowercase with hyphens.'
                : 'Updates/Drafts/<topic folder>/sm-followup-<subject>.md, where <subject> is the assignment name in Latin lowercase with hyphens.',
        },
    };
}

const ROUND1_SCHEMA = {
    type: 'object',
    required: ['subjects'],
    properties: {
        subjects: {
            type: 'array',
            description: 'The first-round research assignments.',
            items: {
                type: 'object',
                required: ['name', 'topics', 'sources', 'aboutClaude', 'reportPath', 'readyReport'],
                properties: {
                    ...subjectProperties(1),
                    readyReport: {
                        type: 'string',
                        description: 'Path of a ready research report that covers the whole assignment; then topics is empty and the assignment is not researched. Empty string otherwise.',
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
        missing: { type: 'boolean', description: 'Whether any question with a justification is missing for the plan.' },
        subjects: {
            type: 'array',
            maxItems: 1,
            description: 'The single second-round assignment; empty when nothing is missing.',
            items: {
                type: 'object',
                required: ['name', 'topics', 'sources', 'aboutClaude', 'reportPath'],
                properties: subjectProperties(2),
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

// Names are the assignment names from the assignment step: the plan step finds their questions
// in «Задание исследователям» by these names.
function failedList(title, failed) {
    return failed.length ? [title, ...failed.map((subject) => `- ${subject.name}: ${subject.reportPath}`)] : [];
}

function readLine(files) {
    return files.length === 1
        ? `Read ${files[0]} in full and follow it.`
        : `Read ${files.slice(0, -1).join(', ')} and ${files[files.length - 1]} in full and follow them.`;
}

function stepLine(name) {
    return `Step: ${name}.`;
}

function questionsOf(topic) {
    return Array.isArray(topic.questions)
        ? topic.questions.filter((question) => typeof question === 'string' && question.trim() !== '')
        : [];
}

function questionCount(subject) {
    return (Array.isArray(subject.topics) ? subject.topics : []).reduce((sum, topic) => sum + questionsOf(topic).length, 0);
}

function hasReadyReport(subject) {
    return typeof subject.readyReport === 'string' && subject.readyReport.trim() !== '';
}

const notes = [];

function note(message) {
    notes.push(message);
    log(message);
}

// sm-review-<skill name>.md next to sm-plan-<skill name>.md
const PLAN_PREFIX = 'sm-plan-';
const REVIEW_PREFIX = 'sm-review-';

function reviewPathFor(planPath) {
    const slash = planPath.lastIndexOf('/');
    const dir = planPath.slice(0, slash + 1);
    const base = planPath.slice(slash + 1);
    if (base.startsWith(PLAN_PREFIX)) {
        return `${dir}${REVIEW_PREFIX}${base.slice(PLAN_PREFIX.length)}`;
    }
    note(`The plan file name does not start with ${PLAN_PREFIX}: ${planPath}. The review file is ${dir}${REVIEW_PREFIX}${base}.`);
    return `${dir}${REVIEW_PREFIX}${base}`;
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

// args.askedQuestions: the questions the first call returned, carried in nextArgs.
const askedQuestions = input.askedQuestions === undefined ? [] : input.askedQuestions;
if (!Array.isArray(askedQuestions) || askedQuestions.some((item) => !item || typeof item !== 'object'
    || typeof item.question !== 'string' || (item.header !== undefined && typeof item.header !== 'string'))) {
    throw new Error('skillmaster: args.askedQuestions must be an array of {header, question}, as the first call returned it in nextArgs.');
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

function questionLine(index, header, question, answer) {
    const shownAnswer = answer === ANSWERS_SKIPPED ? 'skipped by the user' : answer;
    return `${index + 1}. ${header ? `${header}: ` : ''}${question || ''}\n   Answer: ${shownAnswer}`;
}

function answerLines() {
    if (!isSecondCall) {
        return ['No questions to the user were needed.'];
    }
    if (input.answers === ANSWERS_SKIPPED || !input.answers.length) {
        if (!askedQuestions.length) {
            return ['The user skipped the questions.'];
        }
        return [
            'The questions to the user; the user skipped every one of them:',
            ...askedQuestions.map((item, index) => questionLine(index, item.header, item.question, ANSWERS_SKIPPED)),
        ];
    }
    if (askedQuestions.length && input.answers.length !== askedQuestions.length) {
        note(`Questions: ${askedQuestions.length} were asked, but ${input.answers.length} answers came; the answers are passed to the frame as they are.`);
    }
    return [
        'The user\'s answers to the questions:',
        ...input.answers.map((item, index) => {
            const asked = askedQuestions[index] || {};
            if (typeof item === 'string') {
                return questionLine(index, asked.header, asked.question, item);
            }
            const answerItem = item && typeof item === 'object' ? item : {};
            return questionLine(
                index,
                answerItem.header || asked.header,
                answerItem.question || asked.question,
                answerItem.answer,
            );
        }),
    ];
}

const state = {
    planPath: '',
    reviewPath: '',
    researchReports: [],
    missingReports: [],
};

function stop(step, reason) {
    note(`Stopped at the ${step} step: ${reason || 'it returned no answer'}.`);
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
    let number = 0;
    const topicLines = [];
    subject.topics.filter((topic) => questionsOf(topic).length).forEach((topic, index) => {
        topicLines.push(
            `Topic ${index + 1} (${topic.priority}): ${topic.name}`,
            `Find: ${topic.find}`,
            'Questions:',
            ...questionsOf(topic).map((question) => {
                number += 1;
                return `${number}. ${question}`;
            }),
        );
    });
    return lines(
        `Read ${RESEARCH_FILE} in full and follow it.`,
        `Subject: ${subject.name}`,
        topicLines,
        `Allowed sources: ${subject.sources}`,
        forGuide
            ? `You cannot write files, so do not create the report file. Return the complete report, in the format that file describes, in the "report" field; it will be saved unchanged to ${subject.reportPath}.`
            : `Report path: ${subject.reportPath}`,
        round === 2 ? RESEARCHER_LAST_ROUND : '',
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

// One researcher per assignment, all in parallel, each into its own report file.
// An assignment about Claude or Claude Code goes to claude-code-guide, whose text a general-purpose agent saves.
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
                ...RUN.research,
            })
            : agent(researcherPrompt(subject, round, false), {
                label: `research ${round}: ${subject.name}`,
                phase: phaseTitle,
                agentType: PLAIN_AGENT,
                schema: RESEARCH_SCHEMA,
                ...RUN.research,
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
                ...RUN.saveReport,
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
        readLine([PIPELINE_FILE, FRAME_FILE]),
        stepLine(STEP.questions),
        requestLines(),
        ROUNDS_TWO_LEFT,
        'Return the questions, or an empty list when nothing needs asking.',
    ), { label: 'skill-master: questions to the user', phase: 'Questions', agentType: SKILL_MASTER, schema: QUESTIONS_SCHEMA, ...RUN.questions });

    if (!asked) {
        return stop('questions to the user');
    }

    // Branch "there are questions": end this call and hand them to the session.
    if (asked.questions.length) {
        return {
            status: 'questions',
            questions: asked.questions,
            nextArgs: {
                ...callArgs,
                askedQuestions: asked.questions.map((item) => ({ header: item.header, question: item.question })),
            },
            then: 'Show all the questions to the user as one questionnaire, in this order. Then run skillmaster again with all of nextArgs, unchanged, plus answers: an array of {header, question, answer} in the same order, where answer is the label of the chosen option, the labels joined by "; " when several were chosen, or the user\'s own text, and "skipped" for a question the user skipped. When the user skipped the whole questionnaire, pass answers: "skipped".',
        };
    }
    log('No questions to the user: the run goes on in this call.');
}

// ================================================================ 1. Frame

phase('Frame');
const frame = await agent(lines(
    readLine([PIPELINE_FILE, FRAME_FILE]),
    stepLine(STEP.frame),
    requestLines(),
    answerLines(),
    ROUNDS_TWO_LEFT,
    'Return the plan path, the entry kind, the current skill path and the ready research reports.',
), { label: 'skill-master: frame', phase: 'Frame', agentType: SKILL_MASTER, schema: FRAME_SCHEMA, ...RUN.frame });

if (!frame) {
    return stop('frame');
}

state.planPath = frame.planPath;
const isNewSkill = frame.entryKind === 'new';
const currentSkill = isNewSkill ? '' : frame.currentSkillPath.trim();
if (!isNewSkill && !currentSkill) {
    return stop('frame', `the entry kind is ${frame.entryKind}, but no current skill path was returned`);
}
state.reviewPath = reviewPathFor(frame.planPath);
const readyResearch = unique(frame.readyResearch);
state.researchReports = readyResearch.slice();
log(`Entry: ${frame.entryKind}; plan: ${frame.planPath}; ready reports: ${readyResearch.length}.`);

// ================================================================ 2. Audit (extension or rebuild only), before any research

if (!isNewSkill) {
    phase('Audit');
    const audit = await agent(lines(
        readLine([PIPELINE_FILE]),
        stepLine(STEP.audit),
        `Skill plan: ${state.planPath}`,
        `Current skill: ${currentSkill}`,
        ROUNDS_TWO_LEFT,
        'Return whether the section «Аудит текущего скилла» is written.',
    ), { label: 'skill-master: audit of the current skill', phase: 'Audit', agentType: SKILL_MASTER, schema: AUDIT_SCHEMA, ...RUN.audit });
    if (!audit || !audit.sectionWritten) {
        note('Audit: the section «Аудит текущего скилла» was not confirmed; the assignment step goes on without it.');
    }
}

// ================================================================ 3. First-round research assignment

phase('Assignment');
const round1 = await agent(lines(
    readLine([PIPELINE_FILE, ASSIGNMENT_FILE]),
    stepLine(STEP.assignment),
    `Skill plan: ${state.planPath}`,
    ROUNDS_BEFORE_FIRST,
    'Return the subjects.',
), { label: 'skill-master: first-round assignment', phase: 'Assignment', agentType: SKILL_MASTER, schema: ROUND1_SCHEMA, ...RUN.assignment });

if (!round1) {
    return stop('first-round assignment');
}

// ================================================================ 4. Research, round 1

// Branch "research already exists": an assignment with a ready report is not researched.
const coveredSubjects = round1.subjects.filter(hasReadyReport);
coveredSubjects
    .filter((subject) => subject.topics.length)
    .forEach((subject) => note(`Research round 1: a ready report covers ${subject.name}, so its topics are not researched.`));
state.researchReports = unique([...state.researchReports, ...coveredSubjects.map((subject) => subject.readyReport.trim())]);

const researchable = round1.subjects.filter((subject) => !hasReadyReport(subject) && questionCount(subject) > 0);
round1.subjects
    .filter((subject) => !hasReadyReport(subject) && questionCount(subject) === 0)
    .forEach((subject) => note(`Research round 1: ${subject.name} has neither a ready report nor a question; it is not researched.`));

// The limit of three: the first three in the order of the answer; the rest count as undelivered.
const round1Subjects = researchable.slice(0, ROUND1_LIMIT);
const overLimit = researchable.slice(ROUND1_LIMIT);
if (overLimit.length) {
    note(`Research round 1: over the limit of ${ROUND1_LIMIT}, not launched: ${overLimit.map((subject) => subject.name).join(', ')}.`);
    state.missingReports = [...state.missingReports, ...overLimit.map((subject) => subject.reportPath)];
}

let round1Failed = [];
if (round1Subjects.length) {
    if (coveredSubjects.length) {
        log(`Research round 1: ready reports cover ${coveredSubjects.map((subject) => subject.name).join(', ')}.`);
    }
    round1Failed = (await runResearchRound(round1Subjects, 1)).failed;
} else {
    note(round1.subjects.length
        ? 'Research round 1 skipped: no assignment without a ready report has a question.'
        : 'Research round 1 skipped: the assignment named no subjects.');
}
const round1Reports = state.researchReports.slice();
const round1Undelivered = [...round1Failed, ...overLimit];

// ================================================================ 5. Skill plan and the second-round assignment

phase('Plan');
const plan = await agent(lines(
    readLine([PIPELINE_FILE, ASSIGNMENT_FILE]),
    stepLine(STEP.plan),
    `Skill plan: ${state.planPath}`,
    pathList('First-round research reports:', round1Reports),
    failedList('First-round assignments whose reports were not delivered, including those not launched because of the limit of three (name: report path):', round1Undelivered),
    ROUNDS_NEXT_IS_LAST,
    'Return whether anything is missing and the second-round subjects.',
), { label: 'skill-master: skill plan', phase: 'Plan', agentType: SKILL_MASTER, schema: PLAN_SCHEMA, ...RUN.plan });

if (!plan) {
    return stop('plan');
}

// ================================================================ 6. Research, round 2 (the last) and plan revision

// Branch "something is missing". This is the second and last research call in the script:
// whatever skill-master returns after it goes to «Отложенное», not to a researcher.
if (plan.subjects.length > 1) {
    note(`Plan: ${plan.subjects.length} second-round subjects were returned; only the first is researched.`);
}
const round2Candidate = plan.subjects[0];
const round2Subject = plan.missing && round2Candidate && questionCount(round2Candidate) > 0 ? round2Candidate : null;
if (!plan.missing && plan.subjects.length) {
    note('Plan: nothing is missing, but a subject was returned; it is not researched.');
}
if (plan.missing && !round2Subject) {
    note('Plan: something is missing, but no subject with a question was returned; research round 2 and plan revision skipped.');
}

if (round2Subject) {
    const round2 = await runResearchRound([round2Subject], 2);

    phase('Plan revision');
    const revision = await agent(lines(
        readLine([PIPELINE_FILE]),
        stepLine(STEP.revision),
        `Skill plan: ${state.planPath}`,
        round2.written.length ? `Second-round report: ${round2.written[0]}` : '',
        failedList('Second-round assignment whose report was not delivered (name: report path):', round2.failed),
        ROUNDS_NONE_LEFT,
        'Return whether the plan is updated.',
    ), { label: 'skill-master: plan revision', phase: 'Plan revision', agentType: SKILL_MASTER, schema: REVISION_SCHEMA, ...RUN.revision });
    if (!revision || !revision.planUpdated) {
        note('Plan revision: not confirmed; writing goes on by the plan as it stands.');
    }
} else if (!plan.missing) {
    log('Nothing is missing: research round 2 and plan revision skipped.');
}

// ================================================================ 7. Writing and format self-check

phase('Writing');
const written = await agent(lines(
    readLine([PIPELINE_FILE]),
    stepLine(STEP.writing),
    `Skill plan: ${state.planPath}`,
    currentSkill ? `Current skill: ${currentSkill}` : '',
    ROUNDS_NONE_LEFT,
    'Return the skill name, its path, its version, and on a rename the path of the old skill directory.',
), { label: 'skill-master: writing the skill', phase: 'Writing', agentType: SKILL_MASTER, schema: WRITE_SCHEMA, ...RUN.writing });

if (!written) {
    return stop('writing');
}

// ================================================================ 8. Review, one pass (new run)

phase('Review');
const review = await agent(lines(
    readLine([PIPELINE_FILE, REVIEW_FILE]),
    stepLine(STEP.review),
    `Skill: ${written.skillPath}`,
    `Skill plan: ${state.planPath}`,
    `Review file: ${state.reviewPath}`,
    ROUNDS_NONE_LEFT,
    'Return the review file path, the number of findings and how many of them are substantive.',
), { label: 'skill-master: review', phase: 'Review', agentType: SKILL_MASTER, schema: REVIEW_SCHEMA, ...RUN.review });

// ================================================================ 9. Fix by the review, one pass (new run)

let fixed = null;
if (!review) {
    note('Review: no answer; the fixing pass skipped. «Отложенное» and «Ссылки на скилл извне» are in the plan file.');
} else {
    state.reviewPath = review.reviewPath || state.reviewPath;
    log(`Review: ${review.findings} findings, ${review.substantive} substantive.`);
    phase('Fix');
    fixed = await agent(lines(
        readLine([PIPELINE_FILE, REVIEW_FILE]),
        stepLine(STEP.fix),
        `Review file: ${state.reviewPath}`,
        `Skill plan: ${state.planPath}`,
        `Skill: ${written.skillPath}`,
        ROUNDS_NONE_LEFT,
        'Return the skill name, its path, its version, on a rename the path of the old skill directory, and the full text of the plan sections «Отложенное» and «Ссылки на скилл извне» as they stand after your fixes.',
    ), { label: 'skill-master: fix by the review', phase: 'Fix', agentType: SKILL_MASTER, schema: FIX_SCHEMA, ...RUN.fix });
    if (!fixed) {
        note('Fix: no answer; the skill is as written. «Отложенное» and «Ссылки на скилл извне» are in the plan file.');
    }
}

// ================================================================ 10. Result for the session

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
