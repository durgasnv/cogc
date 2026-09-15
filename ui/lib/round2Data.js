import allSets from './data/round2-sets.json';
import { generateBalancedSet } from './quizGenerator';

/** All 30 predefined sets */
export function getAllSets() {
  return allSets;
}

export function getSetsForPhase(phase) {
  return allSets.filter((s) => s.phase === Number(phase));
}

export function getSetById(setId) {
  return allSets.find((s) => s.id === setId) || null;
}

/**
 * Generates a dynamic balanced set sampled randomly from all questions across all sets,
 * ensuring every category (Python, C, Java, Logic, General Tech, Bonus) is present with equal weight.
 */
export function getBalancedRandomSet(teamIdOrSeed = '') {
  const generated = generateBalancedSet(teamIdOrSeed);
  return {
    id: `RND-${teamIdOrSeed ? teamIdOrSeed.slice(0, 6) : Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    phase: 2,
    group: 1,
    teamsInGroup: 1,
    questions: generated.allQuestions,
    standardQuestions: generated.standardQuestions,
    bonusQuestions: generated.bonusQuestions,
  };
}
