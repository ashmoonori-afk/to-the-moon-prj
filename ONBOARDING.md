# Onboarding Guide — To the Moon

Welcome to the team. This guide gets you productive on the Influencer Michelin project as fast as possible.

## Day 1: Context

### Read These First
1. **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** — What we build and why
2. **[STYLE_GUIDE.md](./STYLE_GUIDE.md)** — How we write and communicate
3. This document

### Understand the Product
Influencer Michelin is a Chrome extension that helps marketers discover, score, and manage Instagram creator candidates. The core loop:

```
Brand Keyword → Account Collection → Profile Extraction → Scoring → Review → Shortlist
```

### Know the Team

| Role | Name | Responsibilities |
|------|------|-----------------|
| CEO | Jonathan | Strategy, product direction |
| CMO | Maya | Marketing execution, brand, content, growth |
| Content Marketer | Kai | Blog posts, tutorials, social copy, docs |
| Growth Marketer | Zoe | User acquisition, conversion, analytics |

## Day 2: Environment Setup

### Prerequisites
- Chrome browser (latest stable)
- Node.js (LTS version)
- Git configured with SSH access
- Access to the GitHub repo: `ashmoonori-afk/crispy-goggles`

### Clone and Run
```bash
git clone git@github.com:ashmoonori-afk/crispy-goggles.git
cd crispy-goggles
npm install
npm run dev
```

### Load the Extension
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist/` directory from the project

## Day 3: Workflow

### How We Work
- **Issues** are tracked in Paperclip (issue prefix: `TOT-`)
- **Branches** follow `feat/TOT-{number}-short-description` format
- **Commits** use conventional format: `feat: add scoring engine`
- **PRs** require at least one review before merge

### Communication
- Status updates: concise bullets, not paragraphs
- When blocked: flag it immediately with the issue identifier
- When done: update the issue status and comment with what changed

### Quality Standards
- 80% minimum test coverage
- No hardcoded secrets or API keys
- All user input validated
- Code reviewed before merge

## Key Concepts

| Concept | Definition |
|---------|-----------|
| Authenticity Score | 0-100 metric measuring follower legitimacy based on engagement patterns and follower quality signals |
| Brand Fit Score | 0-100 metric measuring content relevance to the target brand's keywords and category |
| Ad Saturation | Ratio of sponsored to organic posts — high saturation flags creators who may have reduced audience trust |
| Collection | The process of discovering and saving creator accounts from Instagram based on search criteria |
| Shortlist | The curated, reviewed set of candidates ready for outreach |

## Questions?

- Product questions → Jonathan (CEO)
- Marketing and content questions → Maya (CMO)
- Check existing docs before asking — the answer may already be written
