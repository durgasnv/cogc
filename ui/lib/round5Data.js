import cDebugData from './data/c-debug-questions.json';

export const ROUND5_TIME_LIMIT_SECONDS = 600; // 10 minutes for fast-paced 90m finale
export const ROUND5_PASS_PERCENTAGE = 70;

export const cDebugQuestions = cDebugData;

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
 * Suitcase 9-digit combination lock verification placeholder.
 * (Standing by for user's final test lock data / 3 C codes)
 */
export const SUITCASE_LOCK_CONFIG = {
  totalDigits: 9,
  segments: [
    { label: 'Code 1 (Digits 1-3)', length: 3, placeholder: '***' },
    { label: 'Code 2 (Digits 4-6)', length: 3, placeholder: '***' },
    { label: 'Code 3 (Digits 7-9)', length: 3, placeholder: '***' },
  ],
  // Default master unlock code (will be updated when user provides lock data)
  correctCombination: '000000000',
};

export function verifySuitcaseLock(enteredCode) {
  const cleaned = String(enteredCode || '').trim().replace(/\D/g, '');
  if (cleaned.length !== 9) return { valid: false, error: 'Code must be exactly 9 digits.' };
  return {
    valid: cleaned === SUITCASE_LOCK_CONFIG.correctCombination,
    entered: cleaned,
  };
}
