# Architecture

## Design objective

YAMB is a static, browser-native application with explicit boundaries between deterministic game rules, durable local data, presentation/runtime orchestration, optional network transport and progressive platform features. GitHub Pages is a deployment target, not an architectural constraint on the domain model.

## Layer map

### Entry and boot

`index.html` contains semantic application markup. `assets/js/bootstrap.js` initializes storage before loading the classic runtime surfaces. Startup is fail-safe: if a required local module fails, the loading instrument remains with a recovery message instead of exposing a half-initialized game.

### Deterministic core

`assets/js/core/rules.js` contains pure score calculation and dice validation. UI code and Harbour AI use the same scorer, eliminating divergent rule implementations.

`assets/js/core/random.js` provides rejection-sampled uniform integers. Dice require Web Crypto and use rejection-sampled cryptographic random integers; no pseudorandom gameplay fallback is accepted.

### Persistence

`assets/js/core/storage.js` is the single persistence gateway. It uses IndexedDB, maintains a synchronous in-memory read cache for the rendering runtime, serializes writes, exposes a schema migration boundary and supports atomic batch replacement for snapshot import. Full backups carry a SHA-256 digest when Web Crypto is available.

No gameplay feature should write directly to browser storage outside this gateway.

### Runtime orchestration

`assets/js/runtime/app.js` owns the active game state machine, scoring eligibility, turns, team flow, AI scheduling, match lifecycle, audio synthesis, P2P session state and rendering coordination. Domain scoring and durable storage are delegated to core modules.

Product version, state schema and P2P protocol are separate identifiers. A future schema or protocol change must not be coupled to the marketing/product release number.

### Network transport

PeerJS provides WebRTC signaling/data-channel ergonomics. Three topologies exist:

- Duel: two players / two devices.
- Team: two teams / two devices; each team device executes its two member chances.
- Crew: four players / four devices with fixed seats A1, A2, B1 and B2.

Crew mode uses a host-authoritative revision number. A guest may submit state only when its assigned seat equals the active runtime seat and the proposal is based on the host's current revision. Disconnecting a required crew seat freezes the session until reconnection.

The current transport is intentionally **unranked P2P**. For authoritative competition, replace the network adapter with a server that owns dice generation, command validation, identity and signed results. The scoring core does not need to change.

### Platform features

`assets/js/runtime/features.js` provides local career leaderboards, profiles, achievements, manual saves, settings, backup management and timeline diagnostics. These are derived from completed papers or persistence records rather than duplicating game truth.

### PWA

`manifest.webmanifest`, `sw.js` and `assets/js/core/pwa.js` provide installability and offline local play. The service worker uses network-first same-origin delivery with cached fallback so a static deployment can update without asset hash generation while still surviving loss of connectivity.

## Invariants

1. A score is calculated by the shared rules engine.
2. A completed cell is immutable during the active game.
3. A turn cannot exceed three throws.
4. Team member chances are isolated; only the final selected team proposal is committed.
5. Online input is accepted only from the device/seat that owns the current turn.
6. A Crew proposal based on a stale host revision is rejected.
7. Durable state is written only through the persistence gateway.
8. Import never silently bypasses normalization/validation.
9. Static hosting never masquerades as an authoritative ranked backend.
10. Reduced-motion and local-mode operation remain available even when optional CDN/network dependencies fail.

## Extension boundaries

Safe future additions include an authoritative ranked API, account sync, TURN infrastructure, tournament lobbies, spectating, cloud profiles and server-signed leaderboards. Implement them behind network/persistence adapters; do not put remote-service assumptions into `rules.js`.
