import { UserProgress } from "../types";

/**
 * Checks and updates the user's streak based on the current date (YYYY-MM-DD)
 * and their previous lastActiveDate.
 *
 * Rules:
 * - If lastActiveDate is today: streak is maintained.
 * - If lastActiveDate was yesterday (1 day diff): streak continues.
 *   (If isLearningActivity is true, streak is incremented).
 * - If lastActiveDate was > 1 day ago (missed at least one full day):
 *   streak lapses and resets to 1 (active today).
 * - If no lastActiveDate existed: initializes to today and streak 1.
 */
export function evaluateStreak(
  currentStreak: number,
  lastActiveDateStr: string | undefined,
  isLearningActivity: boolean = false
): { newStreak: number; newActiveDate: string } {
  const today = new Date().toISOString().slice(0, 10);

  if (!lastActiveDateStr) {
    return {
      newStreak: Math.max(1, currentStreak || 1),
      newActiveDate: today,
    };
  }

  if (lastActiveDateStr === today) {
    return {
      newStreak: Math.max(1, currentStreak),
      newActiveDate: today,
    };
  }

  // Parse dates at midnight UTC
  const [y1, m1, d1] = lastActiveDateStr.split("-").map(Number);
  const [y2, m2, d2] = today.split("-").map(Number);
  const lastDate = Date.UTC(y1, m1 - 1, d1);
  const curDate = Date.UTC(y2, m2 - 1, d2);
  const diffDays = Math.round((curDate - lastDate) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Consecutive day
    return {
      newStreak: isLearningActivity ? currentStreak + 1 : currentStreak,
      newActiveDate: today,
    };
  } else if (diffDays > 1) {
    // Missed day(s) -> reset streak
    return {
      newStreak: 1,
      newActiveDate: today,
    };
  }

  // If clock somehow went backwards or same date
  return {
    newStreak: Math.max(1, currentStreak),
    newActiveDate: today,
  };
}

/**
 * Records a learning activity, automatically advancing XP, streak, and updating lastActiveDate.
 */
export function recordLearningActivity(
  prev: UserProgress,
  xpEarned: number,
  updates?: Partial<UserProgress>
): UserProgress {
  const { newStreak, newActiveDate } = evaluateStreak(
    prev.streakDays,
    prev.lastActiveDate,
    true
  );

  return {
    ...prev,
    ...updates,
    xp: Math.max(0, prev.xp + xpEarned),
    streakDays: newStreak,
    lastActiveDate: newActiveDate,
  };
}

/**
 * Toggles a vocabulary item as mastered.
 * Automatically adds or removes the ID from masteredVocabIds,
 * awards +15 XP when mastered or subtracts 15 XP when unmastered,
 * and records streak activity.
 */
export function toggleMasteredVocab(
  prev: UserProgress,
  vocabId: string
): UserProgress {
  const isCurrentlyMastered = prev.masteredVocabIds.includes(vocabId);
  const newMasteredIds = isCurrentlyMastered
    ? prev.masteredVocabIds.filter((id) => id !== vocabId)
    : [...prev.masteredVocabIds, vocabId];

  const xpDelta = isCurrentlyMastered ? -15 : 15;
  const newXP = Math.max(0, prev.xp + xpDelta);

  const { newStreak, newActiveDate } = evaluateStreak(
    prev.streakDays,
    prev.lastActiveDate,
    !isCurrentlyMastered // increment streak when mastering a new word
  );

  return {
    ...prev,
    masteredVocabIds: newMasteredIds,
    xp: newXP,
    streakDays: newStreak,
    lastActiveDate: newActiveDate,
  };
}
