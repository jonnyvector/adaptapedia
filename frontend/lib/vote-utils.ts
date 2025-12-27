/**
 * Utility functions for vote calculations
 */

/**
 * Calculate percentage of votes
 */
export function calculateVotePercentage(count: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
}

/**
 * Get consensus label based on vote distribution
 */
export function getConsensusLabel(accurate: number, disagree: number, nuance: number, total: number): string {
  if (total === 0) return 'No votes yet';

  const accuratePct = calculateVotePercentage(accurate, total);
  const disagreePct = calculateVotePercentage(disagree, total);
  const nuancePct = calculateVotePercentage(nuance, total);

  if (accuratePct >= 70) {
    return 'Strong consensus';
  } else if (disagreePct >= 50) {
    return 'Disputed';
  } else if (nuancePct >= 40) {
    return 'Needs nuance';
  } else {
    return 'Mixed';
  }
}

/**
 * Get consensus breakdown string
 */
export function getConsensusBreakdown(accurate: number, disagree: number, nuance: number, total: number): string {
  const accuratePct = calculateVotePercentage(accurate, total);
  const disagreePct = calculateVotePercentage(disagree, total);
  const nuancePct = calculateVotePercentage(nuance, total);

  return `${accuratePct}% · ${nuancePct}% · ${disagreePct}%`;
}
