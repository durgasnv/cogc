import cDebugData from './data/c-debug-questions.json';
import suitcaseData from './data/suitcase-code-questions.json';

export const ROUND5_TIME_LIMIT_SECONDS = 1500; // 25 minutes for Grand Finale
export const ROUND5_PASS_PERCENTAGE = 70;

function safeStr(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val.value !== undefined) return safeStr(val.value);
  if (Array.isArray(val)) return val.map(safeStr).join('\n');
  return String(val);
}

export const cDebugQuestions = (cDebugData || []).map((q) => ({
  ...q,
  buggyCode: safeStr(q.buggyCode),
  solutionCode: safeStr(q.solutionCode),
  input: safeStr(q.input),
  expectedOutput: safeStr(q.expectedOutput),
  explanation: safeStr(q.explanation),
}));
export const suitcaseQuestions = suitcaseData;

/**
 * Returns all 5 C debugging questions for a specific set (1, 2, 3, or 4) without answers/solutions
 */
export function getCDebugSet(setNumber = 1) {
  const sNum = Number(setNumber) || 1;
  return cDebugQuestions
    .filter((q) => q.set === sNum)
    .map((q) => ({
      set: q.set,
      q: q.q,
      difficulty: q.difficulty,
      title: q.title,
      topic: q.topic,
      buggyCode: q.buggyCode,
    }));
}

/**
 * Returns all 20 C debugging questions across all sets
 */
export function getAllCDebugQuestions() {
  return cDebugQuestions;
}

/**
 * Returns a specific question by set and question number
 */
export function getCDebugQuestion(setNumber, questionNumber) {
  return cDebugQuestions.find((q) => q.set === Number(setNumber) && q.q === Number(questionNumber)) || null;
}

/**
 * Returns the 3 C coding questions for the 9-digit suitcase lock without answers/keys
 */
export function getSuitcaseLockSet(setNumber = 1) {
  const sNum = Number(setNumber) || 1;
  const s = suitcaseQuestions.find((item) => item.set === sNum) || suitcaseQuestions[0];
  return {
    set: s.set,
    keys: s.keys.map((k) => ({
      keyNumber: k.keyNumber,
      segment: k.segment,
      title: k.title,
      code: k.code,
    })),
  };
}

export const SUITCASE_LOCK_CONFIG = {
  totalDigits: 9,
  segments: [
    { label: 'Code 1 (Digits 1-3)', length: 3, placeholder: '***' },
    { label: 'Code 2 (Digits 4-6)', length: 3, placeholder: '***' },
    { label: 'Code 3 (Digits 7-9)', length: 3, placeholder: '***' },
  ],
};
