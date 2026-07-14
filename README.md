# Chat Control MEP Vote Record

A source-grounded record of how Members of the European Parliament (MEPs) voted in European Parliament plenary decisions concerning EU “Chat Control” proposals.

This repository keeps its evidence Markdown-first and publishes it through a statically generated website. It makes no claims about an MEP’s motives, whereabouts, or reasons for non-participation.

## Scope

- **Institution:** European Parliament.
- **Terms:** every European Parliament term from the first relevant 2021 plenary vote onward. Current MEP profiles distinguish the member's status at the time of each vote from their present membership.
- **Policy area:** the temporary ePrivacy derogation for voluntary CSAM detection (“Chat Control 1.0”) and the permanent Regulation to prevent and combat child sexual abuse (“Chat Control 2.0” / CSAR).
- **Unit of record:** a material roll-call vote or vote session, documented in `votes/`.
- **People:** current MEPs and any former-in-term MEPs who took part in a tracked vote.

## What the record says

Each MEP receives one status per tracked vote:

- `in favor` — voted for the substantive position defined in the vote record as advancing, enabling, extending, or retaining the chat-scanning measure.
- `against` — voted for the substantive position defined in the vote record as opposing the chat-scanning measure or supporting a motion that rejected it.
- `no vote — present` — present in the sitting but did not cast a vote, where official records establish that distinction.
- `no vote — not recorded present` — not recorded as voting and not named in the official attendance register for that sitting. This does not prove physical absence at the ballot or explain the reason.
- `unknown no vote` — reserved for a non-vote that has not yet been matched against an official attendance source. All seven currently tracked ballots have now been matched.
- `abstained` — cast an abstention. It is retained separately rather than relabelled as a non-vote.

The raw roll-call direction is preserved alongside the normalized status. Some parliamentary motions are procedurally inverted: e.g. voting **for** a motion to reject a text can mean being **against** Chat Control. See `METHODOLOGY.md`.

The website’s red/green classification is intentionally semantic rather than procedural: red means the vote advanced the scanning measure; green means it opposed the measure. Each ballot displays what raw **FOR** and **AGAINST** meant before applying that color.

## Repository map

- `votes/` — one Markdown record per tracked vote, including the precise semantic mapping and primary sources.
- `meps/` — reserved for optional per-MEP profiles. The complete published working table is currently `data/meps-current--vote-history-and-contacts.md`; current MEPs receive public contact-route fields and historical MEPs retain an official profile/archive link where available.
- `countries/` — country-level lists, including MEPs who opposed Chat Control at least once but later supported it, abstained, or did not vote.
- `data/` — normalized CSV/JSON source data and generation inputs; each record carries source URLs.
- `sources/` — source ledger and retrieval notes.
- `METHODOLOGY.md` — classification, inclusion, provenance, and correction rules.

## Editorial standard

The project reports public parliamentary records and publicly listed professional contact routes. It does not infer intent from absence, publish private contact information, or call for harassment. Every vote claim must link to a primary European Parliament source when available.

## Current status

The validated release covers seven material European Parliament plenary roll calls from 2021 through 2026 concerning the temporary ePrivacy derogation, with 1,170 MEPs across both relevant terms. The permanent CSA Regulation has no material Parliament-wide plenary roll-call vote in this period; committee-only votes are excluded and documented in `sources/vote-ledger.md`.
