# World State

## System (graph node)

| Attribute | Symbol | Domain | Meaning |
|---|---|---|---|
| id | — | unique | identity |
| capacity | `C` | integer ≥ 1, fixed at gen | the maximum development this system can sustain |
| development | `D` | real, `0 ≤ D ≤ C` | the system's current economic level; this is what produces resource |
| fortification | `F` | real, `0 ≤ F ≤ D` | static defensive strength |
| owner | — | nation id or `∅` | who controls it |
| neighbors | — | set of system ids | the systems directly connected to it by hyperlanes |

> Systems generate value. Fleets move and fight. That split is important.

## Hyperlane (graph edge)

A hyperlane is an undirected edge `{a, b}` between two systems. It has no attributes of its own. Travel is always uniform: **1 hop = 1 turn** for any fleet. Chokepoints, frontiers, and isolated regions come from the shape of the graph, not from special lane properties.

## Nation (agent)

| Attribute | Symbol | Domain | Meaning |
|---|---|---|---|
| id | — | unique | identity |
| treasury | `T` | real ≥ 0 | stored Industry |
| systems | — | set of system ids (connected) | territory |
| aggression | `a` | `[0,1]`, fixed at gen | how willing it is to start or continue wars |
| ambition | `e` | `[0,1]`, fixed at gen | how strongly it wants to expand |
| opinions | `O[j]` | `[-100, 100]` per other nation | diplomatic standing |

Derived values, not stored directly:

- **capital** = the owned system with the highest `D`; this is only used for narrative labeling
- **Power** `Π = Σ(fleet strengths) + Σ(F) + 0.5·Σ(D)`

## Fleet (mobile force)

| Attribute | Symbol | Domain | Meaning |
|---|---|---|---|
| id | — | unique | identity |
| owner | — | nation id | who commands it |
| strength | `S` | real > 0 | combat power |
| location | — | system id | where it currently sits |
| order | — | path / target system | where it is trying to go |
