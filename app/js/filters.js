// Filter rules for the tracker: kind, grade, missable flag, search text, and the
// spoiler rule (hidden trophies stay masked until earned).
export const KIND_LABELS = {
  all: 'All kinds',
  story: 'Story',
  side: 'Side quests',
  collectibles: 'Collectibles',
  activities: 'Activities',
  robbery: 'Robberies',
  exploration: 'Exploration',
  money: 'Money',
  platinum: 'Platinum path',
};

export const KIND_ORDER = ['all', 'story', 'side', 'collectibles', 'activities', 'robbery', 'exploration', 'money', 'platinum'];

export function trophyIsSpoilerHidden(trophy, earned, spoilersOn) {
  return spoilersOn && trophy.hidden && !earned.has(trophy.name);
}

export function trophyMatches(trophy, filters, earned) {
  if (filters.kind !== 'all' && trophy.kind !== filters.kind) return false;
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.missableOnly && !trophy.missable) return false;
  if (filters.hideEarned && earned.has(trophy.name)) return false;
  if (filters.query) {
    const hay = `${trophy.name} ${trophy.description} ${trophy.guide} ${trophy.kind}`.toLowerCase();
    if (!hay.includes(filters.query)) return false;
  }
  return true;
}
