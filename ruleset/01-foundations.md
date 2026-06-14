# Foundations

## Core Ruleset

A minimal, fully-specified ruleset for emergent galactic narratives.

## Locked Constraints (given)

1. The galaxy is a set of **systems** connected by **hyperlanes**.
2. Movement between systems happens **only** along a hyperlane.
3. A **nation** is a set of systems it owns that form a **connected subgraph** (path exists between any two owned systems using only hyperlanes through systems it also owns).

Everything below is built on top of those three rules.

## Simulation Frame

Discrete turn-based simulation, nations driven by an AI *doctrine* (can also be a human player). One global resource. Deterministic except for a single combat luck roll.

## Resource Model

**Industry (`I`)** — one resource, held per-nation in `T`. It is the universal currency: spent to colonize, build fleets, and fortify. There is deliberately no second resource; specialization and trade emerge from *who controls which rich systems*, not from a resource matrix.
