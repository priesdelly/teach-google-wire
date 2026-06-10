# Plan 01 — Product Vision & Scope

> The foundation the rest of the plan derives from. `02-curriculum.md` starts from the **end goal** stated here and works backward into chapters; `03-assessment.md` turns these outcomes into quizzes. Read `00-onboarding.md` first. **Source of truth for as-built behavior is `CLAUDE.md`** — this doc states intent, not implementation.

## Problem & vision

Most Go developers meet dependency injection through runtime/reflection frameworks (Spring-style) or avoid it entirely with sprawling manual wiring in `main.go`. **Google Wire** is different — it is a **compile-time** code generator — and that difference is exactly what trips people up. Existing material is reference-style (the official docs) or shallow (blog posts); there is no guided, from-zero-to-expert path in **Thai**.

**Vision:** an interactive, bilingual (ไทย · English) course that takes a working Go developer from "what is DI?" to confidently applying Wire in a production service — providers, sets, interface binding, field injection, cleanup, scoping, and HTTP/gRPC integration — with every concept checked by a quiz that can only be passed by genuine understanding.

## Target learner

- **Go level:** basic-to-intermediate developers who already write Go but have **no prior Wire knowledge** (start from zero). Source copy: `audience.level.desc` in `data/i18n/<loc>/ui-strings.js`.
- **Assumed prerequisites** (`audience.prereq.items`): basic Go syntax (`var`/`func`/`struct`/methods); interfaces & the type system; pointers and value-vs-pointer; the `(T, error)` error pattern; Go modules & basic commands (`go build`/`run`/`install`); splitting packages / structuring a project.
- **Not for:** absolute programming beginners, or developers wanting a runtime-DI/Spring-style tool.

## Definition of success (graduate outcomes)

A graduate can, **without copying from docs**:
1. Explain *why* Wire is compile-time and how that differs from runtime/reflection DI, and judge when DI is and isn't worth it.
2. Write correct providers (incl. `(T, error)` and cleanup signatures), compose them with `wire.NewSet`, and bind interfaces with `wire.Bind`.
3. Use `wire.Struct` field injection appropriately and know its limits (exported fields only).
4. Reason about cleanup **LIFO** order and mid-initialization error behavior.
5. Design multiple injectors and **per-request scoping** correctly (Wire has no runtime scope).
6. Wire a real HTTP/gRPC service end-to-end with no manual constructor calls in `main.go`, and read the generated `wire_gen.go` to trace the graph.

These six outcomes are the backward-design seed for `02-curriculum.md`.

## Scope

**In scope:** the Wire concept set above (Chapters 1–10, ending in a capstone); a self-paced web course with per-chapter mastery quizzes; full TH + EN content; offline-capable static delivery.

**Out of scope:** teaching Go itself; runtime DI frameworks (covered only as contrast); video/audio; user accounts or a backend; code execution / an in-browser Go playground; non-Latin scripts beyond TH/EN (RTL/CJK deferred — see `05-i18n-seo.md`).

## Pedagogical approach

- **Backwards design** — chapters derived from the graduate outcomes, foundation → mechanics → integrated practice.
- **Mastery-based** — each chapter ends with a multiple-choice quiz; **pass = ≥80%**. Questions target real misconceptions, not vocabulary (see `03-assessment.md`).
- **Self-paced & open** — learners may take chapters in any order; **chapters are not gated** (progress/scores persist per browser so they can resume). Mastery is encouraged, not enforced by locks.
- **Bilingual, English-default** — identical content in TH + EN; Go code is shared (English comments), only prose/options/explanations are translated.

## Product principles (the fixed constraints)

These are requirements, not implementation detail (the *how* lives in `04-architecture.md` + `05-i18n-seo.md`):

- **Zero infrastructure** — plain HTML + JS + CSS; **no backend, framework, bundler, or build step**. Must run from a static host, **GitHub Pages**, and `file://`.
- **State is local** — all progress/scores/locale in `localStorage`, per browser, no account.
- **Discoverable** — good SEO without a build step (real per-page URLs, static metadata).
- **Accessible on phones** — usable down to 320px.
- **Technically accurate, always** — Wire behavior is never fabricated; every snippet is validated (see `CLAUDE.md` MANDATORY rules).

## Non-goals

No certificates/credentials; no analytics backend; no community/forum; no monetization; no attempt to teach DI theory beyond what Wire requires.

## Success criteria

- All 10 chapters + capstone authored in TH and EN, every quiz bank ≥18 questions, Wire-accuracy reviewed.
- A motivated learner can finish unaided and pass every quiz at ≥80%.
- Site scores well on SEO and works offline / on 320px screens with no horizontal overflow.

## Status

**Shipped & browser-verified.** All outcomes above are realized: 10 chapters, 207 reviewed questions, fully bilingual (EN default), SEO multi-page, runs on the in-house engine (`core/`). See `CLAUDE.md` for current behavior. This doc is the retained statement of *why* the course is shaped the way it is.
