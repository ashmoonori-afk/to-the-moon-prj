# Style Guide — To the Moon

This guide governs all written content across documentation, UI copy, marketing materials, and internal communications.

## Voice & Tone

### Voice (constant)
- **Direct** — Lead with the point, not the preamble.
- **Confident** — We know our domain. State facts without hedging.
- **Practical** — Every sentence should help the reader do something or understand something.

### Tone (varies by context)

| Context | Tone | Example |
|---------|------|---------|
| Product UI | Concise, neutral | "3 candidates scored" |
| Documentation | Clear, instructional | "Enter a brand keyword to begin collection." |
| Marketing | Energetic, benefit-led | "Find your perfect creator match in minutes." |
| Internal comms | Casual, efficient | "Scoring engine shipped. QA by Thursday." |

## Writing Rules

1. **Short sentences.** Under 25 words when possible.
2. **Active voice.** "The extension collects profiles" not "Profiles are collected by the extension."
3. **No jargon without definition.** If a term is domain-specific, define it on first use.
4. **Numbers over adjectives.** "Scores 200 profiles/minute" not "Scores profiles very quickly."
5. **One idea per paragraph.** If you need a second idea, start a new paragraph.
6. **Bullet points for lists of 3+.** Do not bury lists in prose.

## Terminology

Use these terms consistently across all content.

| Preferred Term | Avoid | Notes |
|---------------|-------|-------|
| Creator | Influencer (in UI) | "Influencer" is acceptable in marketing/SEO contexts |
| Candidate | Lead, prospect | A creator under evaluation |
| Authenticity Score | Fake score, bot score | Measures follower legitimacy (0-100) |
| Brand Fit Score | Relevance score | Measures content alignment with brand keywords (0-100) |
| Ad Saturation | Ad overload, spam flag | Ratio of sponsored to organic posts |
| Collection | Scraping, crawling | User-facing term for account discovery |
| Shortlist | Database, DB | The curated list of reviewed candidates |

## Formatting Standards

### Markdown Documents
- H1 for document title (one per file)
- H2 for major sections
- H3 for subsections
- Tables for structured comparisons
- Code blocks for technical references

### File Naming
- `UPPER_SNAKE_CASE.md` for project-level docs (e.g., `PROJECT_OVERVIEW.md`)
- `kebab-case.md` for feature docs and guides
- `kebab-case.ts/js` for source files

### Commit Messages
- Format: `<type>: <description>`
- Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`
- Keep subject line under 72 characters

## Brand Elements

### Product Name
- **Full**: Influencer Michelin
- **Short**: Michelin (internal only)
- **Never**: IM, Inf. Michelin, influencer michelin (always capitalize)

### Company Name
- **Full**: To the Moon
- **Never**: TTM, ToTheMoon, to the moon (always capitalize)

### Color Palette (reference only)
- Primary: Indigo (`#6366f1`) — used in project branding
- Accent: Amber (`#eab308`) — used for highlights and scoring
- Neutral: Slate grays for text and backgrounds

## Content Review Checklist

Before publishing any content:
- [ ] Follows voice and tone for the context
- [ ] Uses preferred terminology
- [ ] No unsupported claims (data or source required)
- [ ] Formatting matches standards
- [ ] Reviewed by at least one team member
