/**
 * Cook or Get Cooked — Round 2
 * Type definitions for quiz-data.json / quiz-questions-flat.json
 */

export type SetId =
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H'
  | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O';

export type OptionId = 'A' | 'B' | 'C' | 'D';

export type Category =
  | 'Python'
  | 'C'
  | 'Java'
  | 'Logic'
  | 'General Tech'
  | 'Bonus';

export interface AnswerOption {
  /** 'A' | 'B' | 'C' | 'D' — stable, matches Question.correctOptionId */
  id: OptionId;
  /** Display text. May contain inline code wrapped in backticks. */
  text: string;
}

export interface Question {
  /** Globally unique, e.g. 'A01', 'O35'. Safe as a React key. */
  id: string;
  set: SetId;
  /** 1–35, position within its set */
  number: number;
  category: Category;
  isBonus: boolean;
  /** May contain inline code wrapped in backticks. */
  question: string;
  /** Always exactly 4, ids A–D, no duplicate texts. */
  options: AnswerOption[];
  /** Source of truth for grading. */
  correctOptionId: OptionId;
  /**
   * Display string for the answer. Occasionally more descriptive than the
   * matching option's text — never string-compare it to grade.
   */
  correctAnswer: string;
  timeLimitSeconds: number;
  /** 2 for standard questions, 4 for bonus. */
  points: number;
}

export interface QuizSet {
  id: SetId;
  label: string;
  /** true for sets A–E (the original round), false for the new sets F–O */
  isOriginal: boolean;
  questions: Question[];
}

export interface Scoring {
  correct: number;
  incorrect: number;
  skipped: number;
  bonusMultiplier: number;
}

export interface QuizMeta {
  title: string;
  subtitle: string;
  format: 'multiple-choice';
  optionsPerQuestion: number;
  timePerQuestionSeconds: number;
  totalSets: number;
  questionsPerSet: number;
  totalQuestions: number;
  categories: Category[];
  categoryCounts: Record<Category, number>;
  scoring: Scoring;
  notes: string;
}

/** Shape of quiz-data.json */
export interface QuizData {
  meta: QuizMeta;
  sets: QuizSet[];
}

/** Shape of quiz-questions-flat.json */
export type FlatQuestions = Question[];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export function isCorrect(q: Question, chosen: OptionId | null): boolean {
  return chosen === q.correctOptionId;
}

/** Points earned for one answer, given the quiz-level scoring config. */
export function scoreAnswer(
  q: Question,
  chosen: OptionId | null,
  scoring: Scoring,
): number {
  if (chosen === null) return scoring.skipped;
  const base = chosen === q.correctOptionId ? scoring.correct : scoring.incorrect;
  return q.isBonus ? base * scoring.bonusMultiplier : base;
}

/** Strip backticks if you'd rather not render inline code as <code>. */
export function plainText(s: string): string {
  return s.replace(/`/g, '');
}

/** Split a string into alternating plain / code segments for rendering. */
export function segments(s: string): Array<{ code: boolean; text: string }> {
  return s.split(/`([^`]*)`/g).map((text, i) => ({ code: i % 2 === 1, text }));
}
