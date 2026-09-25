# Security and Trust Model

## Local data

YAMB stores gameplay and preferences in IndexedDB. The application does not require an account and does not send local history or profiles to a product backend. Exported backup files may contain player names and full local game history; treat them as personal data when sharing them.

## Import safety

Game imports are normalized before activation. Full persistence snapshots validate schema and record shape and verify their SHA-256 digest when one is present. Snapshot replacement is performed as a single IndexedDB batch.

## Online sessions

Online play uses PeerJS/WebRTC. Room identifiers should be treated as temporary invitation secrets. Crew mode validates assigned seat and host revision before accepting guest state.

This static release is designed for social/unranked P2P play. It does not claim resistance to a malicious modified client. A truly trusted leaderboard requires server-authoritative dice, action validation, identity and signed match results.

## External runtime dependencies

PeerJS and QRCode.js are loaded lazily from pinned CDN versions only when online-room features need them. If those resources are blocked, local, AI and hotseat modes remain fully available; online room transport or QR rendering may degrade independently.

## Reporting

When reporting a security issue, include the affected browser, reproduction steps, whether the issue is local or P2P, and the smallest game-state export that reproduces the problem. Do not attach unrelated personal data.
