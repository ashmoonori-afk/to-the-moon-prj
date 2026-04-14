# Security — Influencer Michelin

## Threat Model

Influencer Michelin is a Chrome extension that processes Instagram data client-side. It has no backend server, no user accounts, and no external API calls. The primary threat surface is:

1. **Untrusted DOM data** — content scripts read Instagram pages that could contain crafted content
2. **Extension messaging** — messages between components could be spoofed if permissions are misconfigured
3. **Local storage** — IndexedDB data is accessible to any code running in the extension's origin
4. **Supply chain** — npm dependencies could introduce malicious code

## Security Principles

| Principle | Implementation |
|-----------|---------------|
| **Least privilege** | Extension requests only the permissions it needs (see manifest permissions below) |
| **Defense in depth** | Validate data at every boundary: DOM extraction, message passing, storage read |
| **No secrets in code** | No API keys, tokens, or credentials in source code or extension bundle |
| **Immutable data** | Storage writes create new records; no in-place mutation that could mask corruption |
| **Fail closed** | On extraction error, skip the candidate — never insert partial or unvalidated data |

## Chrome Extension Permissions

The extension should request the minimum permissions required:

| Permission | Purpose | Risk Mitigation |
|------------|---------|-----------------|
| `activeTab` | Access current tab for content script injection | Only activates on user click, not automatically |
| `storage` | Extension settings (small key-value data) | Not used for candidate data (IndexedDB handles that) |
| `scripting` | Inject content scripts into Instagram pages | Host permissions limited to `*://*.instagram.com/*` |

**Permissions NOT requested** (and why):
- `tabs` — not needed; `activeTab` is sufficient
- `webRequest` — no network interception needed
- `<all_urls>` — extension only operates on Instagram
- `cookies` — extension does not read or modify cookies

## Input Validation

### DOM-Extracted Data

All data extracted from Instagram pages is untrusted. Content scripts must:

1. **Sanitize text** — strip HTML tags from bio, captions, and display names before passing to background worker
2. **Validate types** — confirm follower/following/post counts are numbers, not strings or NaN
3. **Enforce length limits** — truncate bio (max 500 chars), captions (max 2000 chars), usernames (max 100 chars)
4. **Reject malformed data** — if a required field is missing or invalid, skip the candidate entirely

### User Input

Keywords, notes, and tags entered by the user:

1. **Sanitize for storage** — escape or strip characters that could cause IndexedDB issues
2. **Enforce length limits** — keywords (max 100 chars), notes (max 5000 chars), tags (max 50 chars each, max 20 tags)
3. **No code execution** — never use `eval()`, `innerHTML`, or `document.write` with user-provided content

### Chrome Messages

All messages between extension components:

1. **Type-check payloads** — validate `message.type` is a known action before processing
2. **Validate payload shape** — confirm required fields exist and have correct types
3. **Ignore unknown messages** — drop messages with unrecognized types silently

## Data Protection

### What We Store

| Data | Location | Sensitivity | Retention |
|------|----------|-------------|-----------|
| Creator profiles (public data) | IndexedDB | Low — public Instagram data | Until user deletes collection |
| User notes and tags | IndexedDB | Medium — user-generated content | Until user deletes |
| Extension settings | chrome.storage | Low — preferences only | Persistent |

### What We Do NOT Store

- Instagram session tokens or cookies
- User's Instagram credentials
- Instagram private/DM data
- Data from non-Instagram pages
- Analytics or telemetry about the user

### Data at Rest

IndexedDB data is stored in Chrome's profile directory, protected by the OS user account. The extension does not add additional encryption because:
- The data is public Instagram profile information
- Chrome's sandboxing prevents other extensions from accessing IndexedDB
- Full-disk encryption (OS-level) is the appropriate layer for protecting local files

## Dependency Security

### npm Dependencies

1. **Minimize dependencies** — fewer packages mean fewer attack vectors
2. **Pin versions** — use exact versions in `package.json`, not ranges
3. **Audit regularly** — run `npm audit` before every release
4. **Review lockfile changes** — treat `package-lock.json` changes in PRs as code changes
5. **No post-install scripts** — disable or audit any package that runs scripts on install

### Build Pipeline

1. **Verify checksums** — CI should verify package integrity
2. **No dynamic code loading** — the extension bundle must be self-contained; no runtime `fetch()` of JavaScript
3. **CSP enforcement** — Content Security Policy in the manifest prohibits inline scripts and remote code

## Vulnerability Reporting

### If You Find a Vulnerability

1. **Do not open a public issue.** Security vulnerabilities must be reported privately.
2. Email the CTO (Alex) directly with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact assessment
   - Suggested fix (if known)
3. Expect acknowledgment within 24 hours and a fix timeline within 72 hours.

### Severity Classification

| Severity | Definition | Response Time |
|----------|------------|---------------|
| **Critical** | Data exfiltration, arbitrary code execution, credential theft | Fix within 24 hours |
| **High** | Privilege escalation, injection that affects stored data | Fix within 72 hours |
| **Medium** | Information disclosure of non-sensitive data, XSS in extension UI | Fix within 1 week |
| **Low** | Cosmetic security issues, best-practice violations | Fix in next release |

## Security Checklist

Before every release:

- [ ] `npm audit` shows no high/critical vulnerabilities
- [ ] No hardcoded secrets in source or bundle
- [ ] All DOM-extracted data is sanitized
- [ ] All user input is validated and length-limited
- [ ] No use of `eval()`, `innerHTML`, or `document.write` with dynamic content
- [ ] Content Security Policy is restrictive (no `unsafe-eval`, no `unsafe-inline`)
- [ ] Extension permissions are minimal
- [ ] `package-lock.json` changes reviewed for unexpected additions
- [ ] Chrome message handlers validate payload types
