# Governance

This document describes how AgriShield is governed — who makes decisions, how contributions are reviewed, and how the project evolves.

---

## Project Roles

### Maintainer

Maintainers have write access to the repository. They review and merge pull requests, triage issues, cut releases, and set the technical direction.

Current maintainers are listed in [MAINTAINERS.md](MAINTAINERS.md).

**Responsibilities:**
- Review PRs within a reasonable time (aim for 5 business days)
- Ensure CI passes before merging
- Tag releases and update [CHANGELOG.md](CHANGELOG.md)
- Enforce the [Code of Conduct](CODE_OF_CONDUCT.md)
- Keep the [ROADMAP.md](ROADMAP.md) up to date

**How to become a maintainer:**
Consistent, high-quality contributions over time. An existing maintainer nominates you; all current maintainers must agree (no objections within 7 days = approved).

---

### Contributor

Anyone who opens an issue, submits a pull request, improves documentation, or reports a bug is a contributor. Contributors do not have write access but their work shapes the project.

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to get started.

---

### Community Member

Anyone who uses AgriShield, asks questions, or participates in discussions. All community members are expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

---

## Decision Making

### Day-to-day decisions
Minor changes (bug fixes, documentation, dependency bumps, small features) are decided by any single maintainer via PR approval.

### Significant changes
Changes that affect the smart contract ABI, oracle protocol, security model, or overall architecture require:
- An issue or discussion opened describing the change
- At least **2 maintainer approvals** on the PR
- A 48-hour review window after the second approval before merging (to allow objections)

### Breaking changes
Any change that breaks backward compatibility (contract interface, oracle API, config format) requires:
- A GitHub issue tagged `breaking-change` with a migration guide
- All maintainers notified
- Updated in [CHANGELOG.md](CHANGELOG.md) under the next major version

### Disagreements
If maintainers disagree, discussion happens in the PR or issue comments. If no consensus is reached within 7 days, the original project author ([@KarenZita01](https://github.com/KarenZita01)) has the casting vote.

---

## Releases

AgriShield uses [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`.

| Version bump | When |
|---|---|
| `PATCH` | Bug fixes, docs, minor improvements |
| `MINOR` | New features, backward-compatible contract changes |
| `MAJOR` | Breaking contract changes, protocol changes, incompatible migrations |

**Release process:**
1. Update [CHANGELOG.md](CHANGELOG.md) — move `[Unreleased]` to the new version
2. Create a GitHub Release with the version tag (e.g. `v0.2.0`)
3. Announce in the repository Discussions

---

## Code of Conduct Enforcement

Violations of the [Code of Conduct](CODE_OF_CONDUCT.md) are handled by maintainers. Serious or repeated violations may result in a temporary or permanent ban from the project. Reports are kept confidential.

---

## Amendments

Changes to this governance document follow the same process as significant changes above (2 maintainer approvals, 48-hour window).
