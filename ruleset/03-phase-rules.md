# Phase Rules

Default constants in **02-galaxy-setup.md**; all are tunable.

## Turn Sequence (strict order)

Every turn runs these phases in this exact order. The order matters: for example, combat happens *after* movement, and fragmentation happens *after* combat.

```text
1. PRODUCTION   2. GROWTH   3. DECISION   4. MOVEMENT
5. COMBAT   6. OCCUPATION   7. CONNECTIVITY   8. DIPLOMACY   9. LOG
```

## Phase 1 — Production

Each nation collects income and pays upkeep.

```text
income  = Σ_systems D
upkeep  = u · Σ_fleets S
T      += income − upkeep
```

If `T < 0`, disband fleet strength until `upkeep ≤ income` starting with the weakest fleets, then set `T = 0`. In other words, nations that overbuild their navy are forced to shrink it.

## Phase 2 — Growth

Every **owned** system grows toward its capacity using logistic growth. Unowned systems do not grow.

```text
D ← D + g · D · (1 − D/C)
```

New colonies (`D=1`) slowly ramp up toward `C`, and war-damaged systems recover the same way. In practice, peace creates wealth and war destroys it.

## Phase 3 — Decision (default doctrine; swappable)

Each nation acts in random order and decides how to spend `T`. First set `R = T`, then allocate from that reserve.

Threat for nation `i` is:

```text
threat = max over hostile neighbors j of Π_j / (Π_i + 1)
```

- **If at war or `threat > 1`:** spend `(0.6 + 0.4a)·R` on military:
  - Build fleets at the **frontier** system nearest the threat: `1 I → 1 S`.
  - Fortify frontier systems toward cap: `1 I → +1 F` while `F < D`.
- **Else (secure):** spend on expansion weighted by ambition:
  - While affordable and an unowned system is adjacent and no enemy fleet sits on it, colonize the candidate maximizing `score = C − 0.5·(turns to reach nearest rival)`. Spend up to `e·R`.
  - Bank the remainder (war chest).

Then issue **movement orders** for Phase 4: war fleets head toward the enemy frontier system with the lowest `(S+F)`, idle fleets garrison the frontier system with the highest `C`, and nations never leave the home region defended below `ΣF`.

## Phase 4 — Movement

Each ordered fleet moves **1 hop** along its path. If it enters a system containing hostile forces, meaning an enemy fleet or an enemy-owned system with `F > 0`, it **stops there** and fights in Phase 5. Fleets passing each other on a lane do **not** intercept. Battles happen at systems, which is why chokepoint systems matter so much.

## Phase 5 — Combat (Lanchester square law + one luck roll)

Resolve combat at every system containing forces from nations that are at war.

- **Defender strength** `Def = (F of system if owner present) + Σ(owner & allied fleet S there)`.
- **Attacker strength** `Atk = Σ(hostile fleet S there)`. (If attackers come from non-allied nations, resolve them sequentially largest-first.)

Apply one luck roll per side, then resolve combat with the square law:

```text
A = Atk · m_A ,   B = Def · m_B ,   m ~ Uniform(0.85, 1.15)

if A > B:  attacker wins, surviving S = √(A² − B²), defender destroyed
if B > A:  defender wins, surviving S = √(B² − A²), attacker destroyed
if A = B:  mutual annihilation
```

This square-law model rewards **concentration of force**. A single large fleet beats the same total strength split across multiple smaller fleets, which makes chokepoints decisive. The ±15% luck roll allows occasional upsets.

## Phase 6 — Occupation & War Damage

If, after Phase 5, an enemy fleet is the only surviving force in a system it does not own:

```text
owner ← attacking nation
D     ← D · (1 − δ)        // sacking; δ = 0.5
F     ← 0
```

Capturing a system therefore *destroys half its value* and resets its defenses. Conquest is a slow, destructive way to grow; peaceful colonization is cleaner.

## Phase 7 — Connectivity Resolution (the keystone)

For every nation whose territory changed this turn, recompute its connected components using paths through *its own systems only*:

1. If 1 component → no change.
2. If there is more than 1 component, the component with the **greatest total `D`** keeps the nation's id, treasury, and doctrine. **Each other component immediately becomes a new nation** ("successor state"):
   - inherits those systems as-is,
   - `T = 5` (scraped-together coffers),
   - `a' = min(1, a + 0.2)`, `e' = e` (secession breeds aggression),
   - all opinions reset to `0` except `−40` toward the parent (resentment).

> This is the key fragmentation rule. The goal is not just to take enemy systems, but to take the *right* system and break an empire into pieces. That is what produces successor states, rump states, and internal rivalries.

## Phase 8 — Diplomacy

For each ordered pair `(i, j)`, update opinion and clamp it to `[-100,100]`:

```text
borders        = # of hyperlanes between an i-system and a j-system
shared_enemies = # nations at war with both i and j
O_ij ← O_ij − 2·borders + 5·shared_enemies − sign(O_ij)   // last term: drift to 0
```

If `i` was attacked by `j` this turn, apply a one-time penalty: `O_ij ← O_ij − 50`.

State transitions:
- **Declare war:** `i` → `j` if they share a border, `O_ij < −40`, and `Π_i ≥ Π_j · (1 + (1−a)·0.5)` (aggressive nations need less of an edge).
- **Make peace:** two warring nations make peace if either has lost ≥ 30% of its systems since the war began **or** both treasuries sat near 0 for 3 turns (stalemate). Set `O_ij ← −20`.
- **Alliance:** if `O_ij > 60` and they share ≥ 1 enemy → allied (won't attack each other; allied fleets may sit in each other's systems and add to `Def`, but never *own*, so they never affect connectivity).

## Phase 9 — Log

Record the events needed for the narrative feed: nation births from secession, capital captures, nation deaths, wars declared, peaces, and alliances. This log is the emergent story the simulation produces.
