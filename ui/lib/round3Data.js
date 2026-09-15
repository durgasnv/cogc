import slots from './data/round3-debug.json';

/** All 10 team debugging slots, WITH secrets (fixedCode/target/combination). Server-only. */
export function getAllRound3SlotsFull() {
  return slots;
}

export function getRound3SlotFull(teamSlot) {
  return slots.find((s) => s.teamSlot === Number(teamSlot)) || null;
}

/**
 * Strip everything a participant shouldn't see: fixedCode, targetDecimal,
 * expectedBinary, and the final combination. Only buggyCode + metadata survive.
 */
export function toParticipantSafe(slot) {
  if (!slot) return null;
  return {
    teamSlot: slot.teamSlot,
    problems: slot.problems.map((p) => ({
      tier: p.tier,
      label: p.label,
      lang: p.lang,
      buggyCode: p.buggyCode,
    })),
  };
}
