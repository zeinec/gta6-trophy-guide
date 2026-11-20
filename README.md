# Leonida Trophy Guide — GTA VI

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/zeinec/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/zeinec/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![owner](https://img.shields.io/badge/owner-zeinec-ff2e88)](https://github.com/zeinec)
[![repo](https://img.shields.io/badge/repo-gta6--trophy--guide-7b2ff7)](https://github.com/zeinec/gta6-trophy-guide)
[![make.fun referral](https://img.shields.io/badge/make.fun-ha8nyspb-2de2c5)](https://make.fun)

An offline, single-page trophy guide for **Grand Theft Auto VI** (PlayStation 5) — all 55 trophies, every guide step cited, with a roadmap to the platinum, a missables matrix, a full source bibliography and a stylized map of Leonida.

## What it is

- **Tracker** — a checklist of all 55 trophies with a big X/55 progress bar, per-grade and per-stage counters, search, filters (PSN-hidden, Disputed, Not earned, Watch, Unconfirmed, Missable), three sort orders, a spoiler toggle (on by default) and export/import of the checklist as JSON. Every trophy has its own step-by-step guide with per-step citations, a Pro tip, its sources, and a location pin on the Leonida map.
- **Roadmap** — ~200 hours, difficulty 4/10, 1 playthrough, 0 online, 0 glitched. Five stages with their own hour estimates (70 / 15 / 35 / 45 / 35), a Next Up list in roadmap order, a Missable Watch panel, a counted-trophies table (trophy target vs 100% checklist target) and a "100% and the platinum" section.
- **Missables** — a 19-row matrix of story-gated trophies across Chapters 1–5 and post-game, story gates per chapter, and the counts table. The one possibly missable trophy (Positive Mental Attitude) is shown two-sided and honestly: some sources flag a Chapter 1 balcony-meditation risk, others say no reliable missable list exists yet.
- **Sources** — a bibliography of the 6 source pages actually read on 20 November 2026 (filter by type and reliability, sort most-used first), a 55 × 6 Trophy × Source matrix, and a disputes section for the 5 points where the sources disagree.

## Audit (computed from this guide's own data)

- 148 guide steps, all cited — 87 of them cite 2+ sources
- 55/55 guides cite sources; 0 guides rely on a single source
- 5 disputed points shown two-sided; 5 unconfirmed methods flagged
- 6 source pages read, from 6 sites, on 20 November 2026
- 55 trophies: 1 platinum, 2 gold, 6 silver, 46 bronze · 28 hidden · 1 possibly missable

## Theme

GTA VI key art: a Leonida sunset (pink → purple → orange), comic panels, wanted stars and Vice City neon. Each tab carries an original cartoon character drawn for this guide — Lucia on the Tracker, Jason on the Roadmap, Lucia & Jason on Missables, Cal on Sources. All character art is original cartoon illustration, not photos and not Rockstar artwork.

## Run it

```sh
node serve.ts   # then open http://localhost:8080
```

Fully offline: the app loads no fonts, scripts, images or data from the network. The checklist is stored in the browser's localStorage only.

## Entry

Built for the make.fun bounty **gta6-trophy-guide-01** ("Build the best GTA 6 trophy guide") as **@sunny-comet-67**. Guide text is written in the author's own words; trophy names, descriptions and grades are the official PlayStation list. Unofficial fan guide, not affiliated with Rockstar Games.

## License

MIT — see [LICENSE](LICENSE).
