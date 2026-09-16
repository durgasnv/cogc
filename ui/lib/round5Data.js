import cDebugData from './data/c-debug-questions.json';
import suitcaseData from './data/suitcase-code-questions.json';

export const ROUND5_TIME_LIMIT_SECONDS = 1500; // 25 minutes for Grand Finale
export const ROUND5_PASS_PERCENTAGE = 70;

export const cDebugQuestions = cDebugData;
export const suitcaseQuestions = suitcaseData;

/**
 * Returns all 5 C debugging questions for a specific set (1, 2, 3, or 4)
 */
export function getCDebugSet(setNumber = 1) {
  const sNum = Number(setNumber) || 1;
  return cDebugQuestions.filter((q) => q.set === sNum);
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
 * Returns the 3 C coding questions for the 9-digit suitcase lock for a given set
 */
export function getSuitcaseLockSet(setNumber = 1) {
  const sNum = Number(setNumber) || 1;
  return suitcaseQuestions.find((s) => s.set === sNum) || suitcaseQuestions[0];
}

export const SUITCASE_LOCK_CONFIG = {
  totalDigits: 9,
  segments: [
    { label: 'Code 1 (Digits 1-3)', length: 3, placeholder: '***' },
    { label: 'Code 2 (Digits 4-6)', length: 3, placeholder: '***' },
    { label: 'Code 3 (Digits 7-9)', length: 3, placeholder: '***' },
  ],
  correctCombination: '482719365', // Default Set 1 combination
};
