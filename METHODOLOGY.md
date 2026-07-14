# Methodology

## Source order

1. European Parliament roll-call-vote annex / XML.
2. European Parliament procedure file, adopted text, minutes, and press material.
3. European Parliament member profile and official contact page.
4. Secondary structured sources, such as HowTheyVote.eu, used for discovery and cross-checking only. Their underlying official source is retained.

## Inclusion rule

A vote is included only when it is a European Parliament plenary vote materially deciding whether to:

- continue or end voluntary/untargeted private-communication scanning;
- limit scanning to judicially authorised suspects;
- exclude encrypted communications from scanning; or
- adopt, reject, or amend the temporary ePrivacy derogation or permanent CSAR text in a way that materially changes those questions.

Procedural votes with no meaningful policy position are documented as context but are not used for an MEP’s “position change” classification.

## Normalization rule

Every vote record states the semantic direction before MEPs are classified. We do not assume that raw `for` means `in favor` of Chat Control.

For example:

| Raw vote | Motion | Normalized status |
| --- | --- | --- |
| For | Motion to reject an extension that permits untargeted scanning | against |
| Against | Motion to reject that extension | in favor |
| For | Amendment restricting scanning to judicially authorised suspects | against |
| Against | Amendment restricting scanning to judicially authorised suspects | in favor |

This table is illustrative only. Each individual vote record is authoritative for its own mapping.

## Non-votes and abstentions

- `abstained` means an abstention appears in the official roll-call result.
- `no vote — present` requires a named entry in an official attendance register for the same sitting.
- `no vote — not recorded present` requires no named roll-call entry and no named entry in the official attendance register for the same sitting. This does not establish physical absence at the precise ballot, the reason for non-voting, or a holiday.
- If a roll-call result omits an MEP and no reliable attendance source resolves it, use `unknown no vote`. All seven currently tracked ballots are matched against their official sitting attendance register.
- Corrections and stated voting intentions are preserved as annotations. They do not change the formally announced vote result.

## Position-change / accountability list

An MEP is included in the country list only if all conditions apply:

1. They have at least one included, material vote normalized as `against` Chat Control.
2. In a later included, material vote they are normalized as `in favor`, `abstained`, `no vote — present`, `no vote — not recorded present`, or `unknown no vote`.
3. The underlying vote records, dates, and semantic mappings are linked on their profile.

The list reports the facts: it does not claim why an MEP was absent or changed position.

## Contact data

Only public, professional routes are included: official European Parliament profile/contact links, publicly listed office email, public X/Twitter account, and official national-party or constituency office route. Contact fields are maintained for current MEPs; historical MEPs retain an official profile/archive link where available. Empty fields are shown as `not publicly listed in reviewed sources`; information is never guessed.

## Corrections

Source errors or updates should be recorded in `sources/corrections.md` with the date, original source, replacement source, and affected files.
