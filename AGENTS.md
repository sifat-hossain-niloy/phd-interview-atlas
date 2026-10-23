# Research Interview Atlas

Independent repository for Md Sifat Hossain's static interview preparation website. Source is `docs/`, published by GitHub Pages from `main:/docs`. No framework or third-party dependencies. Use `npm run dev`, `npm test`, `npm run build`.

- Edit `docs/data/content.json` to expand the question bank. Preserve existing IDs; saved notes and deep links depend on them. Every question needs a concise actual answer and three complete `answerSections` with headings and spoken prose. Do not replace an answer with instructions about what the user should say.
- When using a language-rewriting service, preserve numerical claims, ownership and uncertainty against the source-based draft. Reject paraphrases that invent facts, drop content or change a null result.
- Verify numerical and ownership claims against author sources. Distinguish findings, author records, concepts and proposed work. Each answer needs a source and locator.
- XLAgent is in preparation; use the strict 21 October 2026 revision unless newer evidence is verified. Do not mix older broad-set counts into strict-set results.
- Never equate two-sided edits with correctness or A-ProS gain ratios with final accuracy ratios.
- No em dashes or long dashes in authored text. Sign the author's full name as Md Sifat Hossain.
- Do not copy private application details, contact records, raw experiment logs or anonymous review links into the public site. Personal notes remain browser-local.
- Keep search and UI accessible and static; no external service is needed for searching or practice.
- Run the meaningful search and data tests after changes. Use browser QA for changed interactions or layout. Bump the service-worker cache version for releases that change app resources.
- Work on main and commit and push completed changes in the same session. Do not create a PR unless requested.
