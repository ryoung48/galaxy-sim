# Design Notes

## Mechanic → Narrative Map

| Rule | Story it generates |
|---|---|
| Hyperlane-only movement + Delaunay gen | Chokepoint fortresses, isolated refuges, expansion corridors |
| Logistic growth, no investment needed | Golden ages of peace that end in being a fat target |
| Lanchester square law | Decisive doomstacks; "hold the chokepoint" last stands |
| Conquest halves `D` | Pyrrhic wars; victors inherit ruins; colonization rushes |
| **Connectivity → secession** | Empires shattered by a single key conquest; successor wars; resentful rump states |
| Doctrine `a`/`e` from gen | Distinct national characters without scripting |
| Opinion from shared borders | Friction-driven rivalries; "shared enemy" alliances |
| Forced disbandment at `T<0` | Overreaching empires whose navies evaporate |

## Optional Levers (off by default, to keep v1 simple)

- **Invest-to-grow:** let a nation spend `I` to add to `D` directly (turns growth into a choice).
- **Lane interception:** fleets swapping along the same lane fight in transit (makes lanes as contested as systems).
- **Unrest:** systems far (in hops) from the capital lose a little `D`/turn, pressuring sprawling empires and making secession more likely.
- **Lane variety:** give some lanes traversal cost 2 to create strategic distance.

Add at most one at a time — each new rule should buy a *category* of story the graph + one resource can't already produce.
