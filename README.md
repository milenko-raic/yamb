# YAMB · Royal Navy Engineering

A browser-native, local-first Yamb game delivered as a static application. The runtime is designed to deploy directly to GitHub Pages with no framework build step and no application server required for local, AI, hotseat, or friend-to-friend P2P play.

## Runtime capabilities

- Solo paper
- Harbour AI duel with Cadet, Officer and Admiral difficulty profiles
- Local hotseat 1 vs 1
- Local 2 vs 2 team flow with two independent member chances and final team selection
- Online Duel over WebRTC / PeerJS
- Online Team using one device per team
- Online Crew using four devices with seats A1, A2, B1 and B2
- Match target configuration
- Match history with archived papers
- Mount Yamb personal-best ledger
- Local career leaderboard
- Player profiles and career statistics
- Computed achievements
- Multiple manual saved-game snapshots
- Runtime timeline / diagnostics
- JSON game export/import and complete local-data backup/import
- CSV paper export and print surfaces
- Synthesized Web Audio mixer and optional haptics
- IndexedDB persistence with schema migration boundary and SHA-256 backup integrity
- Cryptographically strong local dice source backed by Web Crypto
- PWA manifest, service worker, install support and offline local play
- English / Bosnian / Swedish interface-language foundation
- Reduced-motion and keyboard/focus support

## Deploy to GitHub Pages

The repository contains a Pages workflow. Push the contents to the repository root on `main`, then set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. The workflow runs the release tests first and deploys only the runtime files.

You can also publish from a branch directly because the application is static. `index.html` is the entry point and `.nojekyll` is included.

## Local development

No production build is required. Serve the repository root over HTTP(S) so service workers, WebRTC and installability behave like production. Any simple static server is suitable.

Run release checks with:

```bash
npm test
```

## Data model

The application is local-first. Active runtime state, preferences, local ranking, history, manual saves and diagnostics are stored in IndexedDB. Complete snapshots can be exported and imported; imports are validated and integrity-checked when a digest is present.

## Online trust model

GitHub Pages is static hosting. Online modes therefore use direct WebRTC sessions and are intended for friend / room play. Online Crew uses host-authoritative revisions and exact seat ownership, but the static release does **not** claim cryptographic anti-cheat or an authoritative global ranking service. A trusted ranked service requires a server-side authority; the runtime boundaries are documented in `ARCHITECTURE.md` so such a service can be added without rewriting scoring or UI.

## Product identity

Release: **1.0.0**  
State schema: **1**  
P2P protocol: **1**
