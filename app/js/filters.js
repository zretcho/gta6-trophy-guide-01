// Filtering for the trophy list: kind, grade, earned state, search text
// and the spoiler setting that hides story trophies until they are earned.
export function makeFilter(state) {
  return (trophy, earned) => {
    if (state.kind === 'missable') {
      if (!trophy.missable) return false;
    } else if (state.kind !== 'all' && trophy.kind !== state.kind) {
      return false;
    }
    if (state.tier !== 'all' && trophy.grade !== state.tier) return false;
    if (state.earnedState === 'earned' && !earned.has(trophy.id)) return false;
    if (state.earnedState === 'unearned' && earned.has(trophy.id)) return false;
    if (state.query) {
      const hay = `${trophy.name} ${trophy.description}`.toLowerCase();
      if (!hay.includes(state.query)) return false;
    }
    return true;
  };
}

// A story trophy is a spoiler while the spoiler setting is on and the
// trophy is still unearned: show a mask instead of its name and text.
export function isSpoilerHidden(trophy, spoilersOn, earned) {
  return spoilersOn && trophy.hidden && trophy.kind === 'story' && !earned.has(trophy.id);
}

export const STAGE_NAMES = {
  1: 'Play the story',
  2: 'Stranger strands',
  3: 'Activities',
  4: 'Crime with your partner',
  5: 'Collectibles and cleanup',
  6: '100% and the Platinum',
};

export const STAGE_TEXT = {
  1: 'The story hands you 12 trophies: the opening mission, the four chapter endings, the final mission and five more mission trophies. Play the chapters in order.',
  2: 'Finish the eight qualifying Stranger strands, plus the five side-character finales for Andy, Kenton, Billy, Randy and Tyrone. Those five have their own trophies and do not count toward the eight.',
  3: 'Gold in all 42 Shooting Range challenges, drone races at all 14 locations, 20 different races, all nine activity types, an arcade game, Cal\u2019s fishing challenge and all 18 meditation spots. Do Lucia\u2019s balcony meditation in Chapter 1.',
  4: 'With your partner: five bank vaults, an armored truck, a jewelry store unseen, three shops in a row, one illegal operation per gang, and $250,000 of Marked Bills laundered.',
  5: 'Three card sets of 18, 100 WAiNK scans, 100 vehicles, 250 stunts, 50 Challenges, eight garages, ten Scooter Bros registrations and $100,000 spent, plus the hidden feats.',
  6: 'Finish the 100% checklist after the credits, earn A Long Road, and the Platinum pops right after it.',
};
