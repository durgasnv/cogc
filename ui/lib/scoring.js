export const ROUND_SECONDS = 60;

export function pointsForAnswer(isCorrect, bonus) {
  const base = isCorrect ? 100 : -25;
  return bonus ? base * 2 : base;
}

export const PHASE_META = {
  1: { groupSize: 4, numGroups: 10, label: 'Phase 1 · Groups of 4' },
  2: { groupSize: 3, numGroups: 10, label: 'Phase 2 · Groups of 3' },
  3: { groupSize: 2, numGroups: 10, label: 'Phase 3 · Groups of 2' },
};
