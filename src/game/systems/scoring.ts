/** Score rules shared by the game and its regression tests. */
export function pickupScore(score: number): number { return score + 10; }
export function correctScore(score: number): number { return score + 20; }
export function wrongScore(score: number, alreadyPenalized: boolean): number { return alreadyPenalized ? score : Math.max(0, score - 10); }
export function completionScore(score: number): number { return score + 50; }
export function accuracyPercent(correct: number, attempts: number): number { return attempts > 0 ? Math.round(correct / attempts * 100) : 0; }
