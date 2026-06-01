# Assessment & Quiz System

> As-built. Describes the quiz system that shipped on CourseKit (`core/js/quiz.js` + `core/js/storage.js`) and the authoring bar for question banks. The graduate outcomes being assessed come from `01-vision-scope.md`; the per-chapter objectives from `02-curriculum.md`. `CLAUDE.md` is the canonical quick reference.

## 1. Quiz format

- **Type:** single-answer multiple choice only ("กากบาท"); 4 options labelled A/B/C/D (ก/ข/ค/ง in Thai — the UI prepends the label; data options are plain strings).
- **Bank vs draw:** each chapter ships a bank of **≥18 questions**; each attempt **draws 15** (`config.quizSize`).
- **Shuffling:** both **question order and option order are shuffled every attempt**, and the correct index is remapped accordingly (`core/js/quiz.js`). So a learner can't memorise "the answer is always C" or rely on question position across retries.
- **Pass threshold:** **≥80% = ≥12/15** (`config.passThreshold = 80`).
- **Retries:** unlimited, no penalty; a submitted quiz forces a fresh draw on retry. Best score, attempt count, and passed-flag persist per chapter.
- **No gating:** passing does **not** unlock anything — **chapters are open and may be taken in any order** (`storage.isUnlocked()` is always `true`). Quizzes are a mastery checkpoint, not a lock. (Rationale: `01-vision-scope.md`.)
- **No timer.** Depth over speed.

## 2. Question design — hinge questions

A good question is a **hinge question**: a checkpoint that reveals genuine understanding, not recall. It targets **one** concept, uses **realistic misconceptions** as distractors (not implausible filler), requires reasoning over keyword-matching, and exposes a gap that would cause a real Wire bug.

**Anti-patterns to avoid:**
- *Trivial recall* — "What does DI stand for?" tests vocabulary, not comprehension.
- *Fake trick* — "Wire compiles at runtime, T/F?" — distractors are just "the opposite", revealing no specific misconception.
- *Multi-concept* — "When would you use `wire.Bind` with a factory provider and cleanup?" conflates three concepts; a wrong answer tells you nothing.

**Distractor discipline:** each wrong option should encode a distinct, real misconception — e.g. confusing Wire with runtime/Spring-style DI; expecting implicit interface→concrete conversion (forgetting `wire.Bind`); assuming FIFO cleanup; thinking Wire has a global singleton scope.

**Bloom distribution per ≥18-question bank** (matches the curriculum's per-chapter levels in `02-curriculum.md`):
- Remember 10–15% (≈2–3) · Understand 30–40% (≈6–7) · Apply 25–35% (≈5–6) · Analyze 15–20% (≈3–4). Advanced chapters add Evaluate/Create.

## 3. Question data schema (as-built)

Questions are per-locale, **one file per chapter**, augmenting the global (see `04-architecture.md` §4):

```js
(window.QUESTIONS_EN ||= {}).ch05 = [ /* questions */ ];
```

Each question object:

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | unique, e.g. `wire-ch05-q01` |
| `difficulty` | `"easy"\|"medium"\|"hard"` | |
| `bloomLevel` | `remember\|understand\|apply\|analyze\|evaluate\|create` | |
| `question` | string | the stem (may include prose; long code goes in `code`) |
| `code` | string? | optional Go snippet shown in a code block (`lang: go`) |
| `options` | string[4] | **plain strings, no A/B/C/D prefix** — the UI adds it |
| `correctAnswerIndex` | 0–3 | index into `options` (before shuffle) |
| `explanation` | string | why the answer is right; inline `<b>`/`<code>` allowed |

Translations keep `id` / `correctAnswerIndex` / structure identical to the base locale; only `question` / `options` / `explanation` are translated, and **Go code stays identical** (English comments) across locales.

### Real exemplar (shipped, `data/i18n/en/chapters/questions-ch05.js`)

```js
{
  id: "wire-ch05-q01",
  difficulty: "easy",
  bloomLevel: "remember",
  question: "What is wire.Bind used for in Google Wire?",
  options: [
    "Telling Wire which concrete type to use when a dependency requires a given interface",
    "Automatically generating a concrete type from an interface",
    "Binding a provider to a package so Wire can locate it faster",
    "Forcing Wire to always use pointer types instead of value types"
  ],
  correctAnswerIndex: 0,
  explanation: "<b>wire.Bind</b> tells Wire: \"when a dependency needs interface X, use concrete type Y\". Because Wire matches dependencies by exact type, <code>Logger</code> (interface) and <code>*ConsoleLogger</code> (concrete) are different keys for Wire, so the binding must be declared explicitly."
}
```

Note the distractors: each is a plausible-but-wrong mental model (auto-generation, a perf hint, a pointer rule), not random filler.

## 4. Scoring & persistence (as-built)

`score = round(correct / 15 × 100)`; **PASS if `score ≥ 80`** (≥12/15), else FAIL with a retry. There is no per-concept breakdown screen in the shipped product (the results view shows score + pass/fail + per-question explanations).

State lives in **versioned `localStorage`, prefixed by `config.courseId` (`wire:`)** — there is no `userId` (state is per-browser). `core/js/storage.js` records, per chapter: best score, attempt count, passed-flag; plus `setCurrent`/`getCurrent` for lesson resume. No server, no cross-device sync (by design).

## 5. Quiz density per chapter

**Rule (shipped):** every chapter (Ch01–Ch10) ships **≥18 questions**, draws **15**, passes at **≥12/15 (80%)**. Across 10 chapters the banks total **207 questions** (well above the ≥180 floor), all adversarially **Wire-accuracy reviewed**.

| Chapter | Bank (min) | Drawn | Pass |
|---------|-----------|-------|------|
| Ch01–Ch10 (each) | ≥18 | 15 | ≥12/15 (80%) |

**Why ≥18 drawn-15, not a fixed short quiz:** 80% on a 5-question quiz means one miss = fail (luck-sensitive); drawing 15 of ≥18 with shuffling makes the threshold genuinely earned, defeats positional memorisation on retries, and neutralises any skew in a bank's correct-answer positions. Random guessing on 15 four-option MCQs passes far below 1%.

## 6. Authoring quality bar (check before shipping a question)

1. **Misconception authenticity** — does each wrong option reflect a real mistake learners make?
2. **One concept** — does the question test exactly one objective?
3. **Code accuracy** — is every Go/Wire snippet correct? **Validate with `golang-pro`; never guess** (`CLAUDE.md` MANDATORY rules). The shipped banks went through an adversarial Wire-accuracy pass (41 fixes).
4. **Explanation completeness** — does it say why the right answer is right (and ideally why the tempting wrong one is wrong)?
5. **Earned 80%** — would a learner who truly understood the chapter pass reliably, while a skimmer would not?
6. **Shape** — exactly 4 options, valid `correctAnswerIndex`, varied correct positions across the bank, no A/B/C/D prefix in the strings. Validate with the `node -e` shape check in `CLAUDE.md`.

---

## Summary

Multiple-choice mastery checkpoints: **≥18-question banks, 15 drawn and shuffled, pass ≥80%**, unlimited no-penalty retries, **chapters open (no gating)**, state in per-browser `localStorage`. Rigor comes from hinge questions with authentic-misconception distractors and Wire-accurate, `golang-pro`-validated code — so 80% reflects real understanding, not lucky guessing.
