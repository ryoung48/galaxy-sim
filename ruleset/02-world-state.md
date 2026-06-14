# World State

## System (graph node)

| Attribute | Symbol | Domain | Meaning |
|---|---|---|---|
| id | — | unique | identity |
| capacity | `C` | integer ≥ 1, fixed at gen | max sustainable development (habitability/wealth) |
| development | `D` | real, `0 ≤ D ≤ C` | current economic level; the only thing that produces resource |
| fortification | `F` | real, `0 ≤ F ≤ D` | static defensive strength |
| owner | — | nation id or `∅` | who controls it |
| neighbors | — | set of system ids | the hyperlane edges from this system |

> A system is the only thing that *generates* resource. A fleet is the only thing that *moves*. Keep that split in mind.

## Hyperlane (graph edge)

An undirected edge `{a, b}` between two systems. No attributes. Traversal cost is uniform: **1 hop = 1 turn** for any fleet. All strategic geography (chokepoints, frontiers, isolation) is emergent from the graph's *shape*, so the edge itself needs no data.

## Nation (agent)

| Attribute | Symbol | Domain | Meaning |
|---|---|---|---|
| id | — | unique | identity |
| treasury | `T` | real ≥ 0 | stockpiled Industry |
| systems | — | set of system ids (connected) | territory |
| aggression | `a` | `[0,1]`, fixed at gen | willingness to start/continue wars |
| ambition | `e` | `[0,1]`, fixed at gen | drive to colonize/expand |
| opinions | `O[j]` | `[-100, 100]` per other nation | diplomatic standing |

Derived (not stored): **capital** = the owned system with the highest `D` (used for narrative labels only). **Power** `Π = Σ(fleet strengths) + Σ(F) + 0.5·Σ(D)`.

## Fleet (mobile force)

| Attribute | Symbol | Domain | Meaning |
|---|---|---|---|
| id | — | unique | identity |
| owner | — | nation id | who commands it |
| strength | `S` | real > 0 | combat power |
| location | — | system id | where it currently sits |
| order | — | path / target system | movement intent |
