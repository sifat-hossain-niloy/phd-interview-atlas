# Research Interview Atlas

A static interview preparation field guide for Md Sifat Hossain, covering LLM-ProS, A-ProS and XLAgent, with 262 complete structured practice answers and 51 glossary entries.

**[Open the website](https://sifat-hossain-niloy.github.io/phd-interview-atlas/)**

## Use the guide

- Search question titles, spoken answers, deeper explanations, limitations and follow-up prompts. All keywords must match; quoted phrases, exclusions, related terms and small typos are supported.
- Filter by subject, topic, depth or essential questions.
- Open the [separate Evident discussion pack](https://sifat-hossain-niloy.github.io/phd-interview-atlas/#interview/evident) for 45 selected answers, title defenses, an OJ/Eva comparison, an interactive caller-context example and a 60-minute rehearsal plan.
- Open each project for an overview, a spoken pitch, contribution notes, diagrams, numerical results and caveats. Every question opens a complete answer with three titled sections, written as an actual explanation or first-person response rather than coaching instructions.
- Use the practice room for randomized sessions, a timer, answer reveal and self-assessed confidence.
- Save questions and add private notes. Export and import browser study data from Sources & accuracy.
- Prepare questions for professors about research, funding, applications, supervision and lab culture.

Search runs entirely in the browser. There are no APIs, accounts, analytics, external fonts or runtime dependencies. A service worker caches the guide after the first successful visit for offline use. Personal notes are local to this browser and origin, so export a backup before switching devices or clearing browser storage. The website and source repository are public; a noindex request discourages indexing but is not access control.

## Local development

Requires Node.js 20 or newer; no dependency installation is necessary.

```sh
npm run dev
# http://127.0.0.1:4173
npm test
npm run build
# optional: preview build output
node scripts/serve.mjs --dist
```

`docs/` is the source of truth and the GitHub Pages publishing directory. `dist/` is an ignored build copy for verification or another static host. All asset paths are relative so the project works under the GitHub repository path.

## Content and source policy

Edit `docs/data/content.json`. Each question has a stable ID, subject, topic, difficulty, a short spoken answer, three `answerSections` with headings and full paragraphs, a caveat, source ID, source locator, keywords and follow-up prompts. Keep IDs stable because links and personal study records use them. `essential` in the tags marks a useful starting question.

The guide distinguishes paper findings, author-provided ownership records, conceptual illustrations and proposed directions. The answers are complete rehearsal scripts. Proposed experiments and engineering designs use prospective language and do not claim implementation. Professor-question entries provide exact questions and follow-ups without inventing the professor's response.

The original 208 expanded drafts, comprising 32,469 input words, were processed through 16 WriteHuman MCP batches. Returned paraphrases sometimes changed numbers, omitted content or lost headings. Factual claims and the section structure were checked against the source-based drafts; unsafe changes were rejected or repaired. Only wording changes that preserved the technical meaning were retained. A detector score was not treated as a factual-quality metric.

The original paper review was completed on 23 October 2026. On 4 November, 54 manually written, source-reviewed answers were added: 18 title/claim defenses and 36 Evident/formal-analysis answers. These additions did not use a rewriting service. The revised Evident v2 evaluation is kept separate from the earlier version, and all proposed experiments remain explicitly unimplemented.

Source snapshots:

- LLM-ProS: local 8-page paper, methods, results and validity discussion. ICSE 2025 LLM4Code workshop, not the ICSE main track.
- A-ProS: local 39-page manuscript, including Tables 6, 7, 11 and 12. The 39-to-90 result is on 167 ICPC tasks, not the entire 367-task benchmark. The 47-task memory solve-rate comparison is inconclusive statistically.
- XLAgent: current local LaTeX manuscript, compiled and visually reviewed. Uses the 21 October strict revision: 31 fixes, 12 localization tasks and 5 executable repair tasks. Null graph effects and lack of established correctness improvement are explicit. The manuscript is under review, based on the author status record checked 4 November. This status update does not change the frozen experimental results.
- Evident revised v2 paper, official Eva documentation and source-reviewed technical notes. Caller examples are synthetic reasoning aids, not actual Eva runs.
- PhD-Journey author profile and contribution record. Private contacts and personal family details are excluded.

SHA-256 digests of reviewed technical sources are recorded in `reviewedDigests` for provenance. Full papers, anonymous review URLs, experiment logs and private application records are not redistributed. Source locators refer to the reviewed documents, not to local paths on the deployed website.

## Hosting

GitHub Pages publishes `main:/docs`. An empty `.nojekyll` disables Jekyll processing. Every push to `main` updates the site through GitHub's Pages build and deployment. There is no custom Actions workflow or build dependency to maintain.

For setup and publishing details, see [GitHub's Pages guide](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

## Verification

`npm test` verifies content integrity, durable IDs, source references, factual caveats, full-text retrieval, aliases, typos, phrases, exclusions, composed filters and search latency. Browser QA covers search, answer navigation, saved state, notes, practice, desktop/mobile layouts and deployment under the repository path.

Confidence ratings are self-assessment, not correctness grading. Update the guide when source evidence changes, and keep historical and current results distinct.
