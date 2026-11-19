# Leonida Trophy Guide — GTA VI

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/zretcho/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/zretcho/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Leonida Trophy Guide** is an offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI — every official name, description and grade as PlayStation publishes them, a guide to each in our own words that cites its sources, a roadmap to the platinum, and a checklist that saves in your browser. It runs entirely from static files: no build step, no network requests, no account.

## What is in the guide

- **All 55 trophies, verified** — 1 platinum, 2 gold, 6 silver, 46 bronze (28 hidden on PSN). Names, descriptions, grades and PSN progress counts checked 19 November 2026 against Exophase and PSNProfiles, which agree on every entry.
- **A guide to every trophy** — what to do, where and how, and when it can be missed, written in our own words with the source named beside each one (mostly Output Lag's launch-day list, drawing on PowerPyx's roadmap). Where no source pins a step down, the guide says so instead of inventing one.
- **Roadmap to the platinum** — six stages built from the official descriptions: story, side strands, collectibles, activities, robberies & money, then the 100% cleanup.
- **One missable trophy, flagged** — Positive Mental Attitude: the Chapter 1 balcony meditation disappears after that chapter. The guide also says plainly that no other trophy is confirmed missable yet.
- **Tracker** — tick trophies off and they stay ticked (localStorage), with export to a JSON file and import back, filters by kind (story, side quests, collectibles, activities, robberies, exploration, money, platinum path) and by grade, text search, and a spoiler setting that hides hidden trophies' names and descriptions until you earn them.
- **Offline** — every file the page loads lives under `app/`; it makes no network request at run time.

## How to run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. No build step, no install. To hand the entry in:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Structure

The source is plain ES modules under `app/`, one job per file: `index.html` (page, roadmap, missables and sources sections), `style.css`, `app.js` (boot, render and events), `js/store.js` (localStorage progress, export and import), `js/filters.js` (kind, grade, search and spoiler rules), and `data/trophies.json` (the 55 trophies with their official fields, guides and source keys).

## Sources

- Official trophy list: [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) and [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi), cross-checked with [Planet GTA 6](https://www.planetgta6.com/en/gta-6-trophies/)
- Launch-day guide detail: [Output Lag](https://outputlag.com/guides/gta-6-trophy-list/)

An unofficial, fan-made guide. Grand Theft Auto and GTA are trademarks of Take-Two Interactive; this guide uses no Rockstar logo, artwork or game screenshots.

<sub>Entered on [make.fun](https://make.fun/?ref=dbwh3rf9&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
