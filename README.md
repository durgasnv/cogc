# Cook or Get Cooked — Round 2 · Quiz Data Pack

Everything an AI needs to build a quiz platform/UI from this question bank.

## Files

| File | What it is | Use it for |
|---|---|---|
| `quiz-data.json` | Nested: `meta` + 15 sets, each with 35 questions | The main import. Best when the UI picks a set and runs it |
| `quiz-questions-flat.json` | Flat array of all 525 question objects | Seeding a DB, filtering by category, random-mix modes |
| `quiz-types.ts` | TypeScript interfaces matching the JSON | Drop into a TS/React project for type safety |
| `cook-or-get-cooked-round2-mcq.md` | Human-readable version with answers | Printing, host sheets, manual review |

## Data shape

`quiz-data.json`:

```
{
  "meta": { ...quiz-level config... },
  "sets": [
    {
      "id": "A",
      "label": "Set A",
      "isOriginal": true,
      "questions": [ Question, ... ]
    }
  ]
}
```

A `Question`:

```json
{
  "id": "A01",
  "set": "A",
  "number": 1,
  "category": "Python",
  "isBonus": false,
  "question": "What keyword is used to define a function in Python?",
  "options": [
    { "id": "A", "text": "def" },
    { "id": "B", "text": "func" },
    { "id": "C", "text": "function" },
    { "id": "D", "text": "define" }
  ],
  "correctOptionId": "A",
  "correctAnswer": "def",
  "timeLimitSeconds": 30,
  "points": 2
}
```

### Field notes

- `id` is globally unique (`set letter` + 2-digit number), safe as a React key or DB primary key.
- `correctOptionId` is the source of truth. `correctAnswer` is a display string and is occasionally more descriptive than the matching option text (e.g. option `Pacific`, answer `Pacific Ocean`) — never string-compare the two to grade.
- `options` is always exactly 4, always ids `A`–`D`, no duplicate texts within a question.
- Correct answers are evenly spread across A/B/C/D (roughly 131 each), so you do **not** have to shuffle. If you do shuffle, shuffle `options` and track the moved `correctOptionId`.
- Inline code is wrapped in backticks inside `question` and sometimes in option text (`` `print(2 ** 3)` ``). Render it as `<code>` or strip the backticks — don't leave them raw in the UI.
- Some option/answer text contains superscripts and symbols (`2¹⁰`, `3 × 10⁸ m/s`, `&&`, `->`). The files are UTF-8; serve them as UTF-8.
- `points`: 2 for standard questions, 4 for bonus. `isBonus` is true only for the `Bonus` category.

### Counts

- 15 sets (A–O), 35 questions each, 525 total
- Per set: Python 7, C 6, Java 6, Logic 5, General Tech 6, Bonus 5
- Sets A–E are `isOriginal: true`; F–O are new

## Suggested rules (from `meta.scoring`)

- 30 seconds per question, auto-advance on timeout
- +2 correct, −1 incorrect, 0 skipped
- Bonus questions double; good as tie-breakers

---

## Prompt to paste into your AI builder

> Build a quiz web app using the attached `quiz-data.json`.
>
> **Data:** 15 sets (A–O) of 35 multiple-choice questions each, 4 options per question. `correctOptionId` is the source of truth for grading. Question text may contain inline code wrapped in backticks — render those as monospace `<code>` spans. Content is UTF-8 with superscripts and symbols.
>
> **Flow:**
> 1. Home screen — pick a set (show set letter, question count, and category breakdown), or a "Random Mix" mode that samples 35 questions across all sets.
> 2. Question screen — one question at a time, 4 tappable option cards, a 30-second countdown ring, and a progress indicator (`Q 7 / 35`). Show the current category as a chip.
> 3. On answer: lock the options, highlight the chosen one green if correct and red if wrong, and always highlight the correct option green. Pause ~1.5s, then auto-advance. On timeout, mark as skipped and advance.
> 4. Results screen — final score, accuracy percentage, per-category breakdown, and a review list of every question showing the user's answer versus the correct one. Offer "Retry set" and "Back to sets".
>
> **Scoring:** +2 correct, −1 incorrect, 0 skipped. Bonus-category questions (`isBonus: true`) are worth double. Read defaults from `meta.scoring` rather than hardcoding.
>
> **Requirements:**
> - Mobile-first, works well on a phone held in one hand; large tap targets.
> - Keyboard support on desktop: keys 1–4 (or A–D) select an option, Enter advances.
> - Persist in-progress state and past results in localStorage so a refresh doesn't lose the run.
> - No backend — load the JSON as a static import.
> - Energetic, competitive visual style (it's a live college fest round), but keep contrast accessible and never rely on colour alone to signal correct/incorrect — pair it with an icon.
>
> Also add a **host mode**: a view that shows the question big on screen with the answer hidden behind a toggle, for running the round live from a projector.
