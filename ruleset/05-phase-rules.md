# Phase Rules

Default constants in **03-galaxy-setup.md**; all are tunable.

## Phase 1 — Production

For each nation: collect income, pay upkeep.

```text
income  = Σ_systems D
upkeep  = u · Σ_fleets S
T      += income − upkeep
```

If `T < 0`: disband fleet strength until `upkeep ≤ income` (weakest fleets first), then set `T = 0`. (Overreach forcibly corrects itself — empires that overbuild collapse their navy.)

## Phase 2 — Growth

Every **owned** system grows logistically toward capacity. Unowned systems do not grow.

```text
D ← D + g · D · (1 − D/C)
```

Seed colonies (`D=1`) climb a logistic S-curve to near-`C`; war-damaged systems recover by the same rule. **Peace compounds wealth; war erases it.** A long-peaceful nation becomes rich *and* a target — a self-loading narrative gun.

## Phase 3 — Decision (default doctrine; swappable)

Each nation, in random order, spends `T`. First reserve `R = T` then allocate:

**Threat** for nation `i`: `threat = max over hostile neighbors j of Π_j / (Π_i + 1)`.

- **If at war or `threat > 1`:** spend `(0.6 + 0.4a)·R` on military:
  - Build fleets at the **frontier** system nearest the threat: `1 I → 1 S`.
  - Fortify frontier systems toward cap: `1 I → +1 F` while `F < D`.
- **Else (secure):** spend on expansion weighted by ambition:
  - While affordable and an unowned system is adjacent and no enemy fleet sits on it, colonize the candidate maximizing `score = C − 0.5·(turns to reach nearest rival)`. Spend up to `e·R`.
  - Bank the remainder (war chest).

Then issue **movement orders** (Phase 4 targets): war fleets route toward the lowest-`(S+F)` enemy frontier system; idle fleets garrison the highest-`C` frontier system; never leave the home region undefended below `ΣF`.

## Phase 4 — Movement

Each ordered fleet advances **1 hop** along its path. A fleet entering a system that contains hostile forces (enemy fleet or enemy-owned with `F>0`) **stops there** and will fight in Phase 5. Fleets passing each other on a lane do **not** intercept — battles happen at systems, which is what makes *chokepoint systems*, not lanes, the battlegrounds.

## Phase 5 — Combat (Lanchester square law + one luck roll)

At every system containing forces of nations at war:

- **Defender strength** `Def = (F of system if owner present) + Σ(owner & allied fleet S there)`.
- **Attacker strength** `Atk = Σ(hostile fleet S there)`. (If attackers come from non-allied nations, resolve them sequentially largest-first.)

Apply one luck roll per side, then the square law:

```text
A = Atk · m_A ,   B = Def · m_B ,   m ~ Uniform(0.85, 1.15)

if A > B:  attacker wins, surviving S = √(A² − B²), defender destroyed
if B > A:  defender wins, surviving S = √(B² − A²), attacker destroyed
if A = B:  mutual annihilation
```

The square law rewards **concentration of force** (a doomstack beats equal force split in two), which is exactly why chokepoints — where defenders force attackers to fight piecemeal — are decisive. The ±15% roll lets a slightly weaker force occasionally win → upsets → stories.

## Phase 6 — Occupation & War Damage

If, after Phase 5, an enemy fleet is the only surviving force at a system it does not own:

```text
owner ← attacking nation
D     ← D · (1 − δ)        // sacking; δ = 0.5
F     ← 0
```

Capturing a system therefore *destroys half its value* and resets its defenses — conquest is a slow, depreciating way to grow, while colonizing virgin systems is clean. This biases the map toward expansion races early and grinding attrition wars late.

## Phase 7 — Connectivity Resolution (the keystone)

For every nation whose territory changed this turn, recompute connected components (paths through *own* systems only):

1. If 1 component → no change.
2. If >1 component → the component with the **greatest total `D`** keeps the nation's id, treasury, and doctrine. **Each other component immediately becomes a NEW nation** ("successor state"):
   - inherits those systems as-is,
   - `T = 5` (scraped-together coffers),
   - `a' = min(1, a + 0.2)`, `e' = e` (secession breeds aggression),
   - all opinions reset to `0` except `−40` toward the parent (resentment).

> This is the rule that converts your connectivity constraint into narrative. You don't just want to take an enemy's systems — you want to take the *right* system (the cut-vertex) to **shatter them into pieces** that may then fight each other. Empires fragment; rump states claw back; former provinces become rivals.

## Phase 8 — Diplomacy

For each ordered pair `(i, j)`, update opinion, clamped to `[-100,100]`:

```text
borders        = # of hyperlanes between an i-system and a j-system
shared_enemies = # nations at war with both i and j
O_ij ← O_ij − 2·borders + 5·shared_enemies − sign(O_ij)   // last term: drift to 0
```

On being attacked this turn: `O_ij ← O_ij − 50` toward the attacker (one-time).

State transitions:
- **Declare war:** `i` → `j` if they share a border, `O_ij < −40`, and `Π_i ≥ Π_j · (1 + (1−a)·0.5)` (aggressive nations need less of an edge).
- **Make peace:** two warring nations make peace if either has lost ≥ 30% of its systems since the war began **or** both treasuries sat near 0 for 3 turns (stalemate). Set `O_ij ← −20`.
- **Alliance:** if `O_ij > 60` and they share ≥ 1 enemy → allied (won't attack each other; allied fleets may sit in each other's systems and add to `Def`, but never *own*, so they never affect connectivity).

## Phase 9 — Log

Record events for the narrative feed: nation births (secessions), capital captures (loss of a nation's max-`D` system), nation deaths (0 systems), wars declared, peaces, alliances. This log *is* the emergent story.
