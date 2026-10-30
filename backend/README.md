# Anonymous visit counter

The public portfolio stays on GitHub Pages. Its counter runs separately as a Cloudflare Worker + D1 database deployed via Sites.

Current service: https://felix-wang-portfolio.wjddidi7831.chatgpt.site

- `POST /api/collect`: one page view, JSON `{eventId: UUIDv4, path: '/' | '/index.html' | '/profile.html'}`. The allowed browser origin is `https://wjddidi-1.github.io`.
- `GET /api/analytics?days=30|90|365|all`: public aggregate totals, daily counts and country counts.
- Dates use Asia/Shanghai. Cumulative totals include earlier days even if a shorter display period is selected.
- Missing country metadata is `XX` and is not plotted as a guessed location.
- All-time totals include unknown origins; country counts exclude unknown origins.
- Daily dates before the first measured event are not fabricated.

## Data

`analytics_events` stores random one-page submission IDs (not visitor IDs), day and country. Events older than two days are removed on subsequent accepted page views. `analytics_daily` retains aggregate day/country counts. A schema migration installs an insert trigger so repeat event submissions do not increase aggregates. Both insert and cleanup use a database transaction.

No IP address, precise coordinate, referral URL, cookie, browser storage or stable visitor identifier is used. Client and server respect DNT/GPC; obvious bot user agents are ignored. Counts are page views, not unique visitors. Public counters remain susceptible to scripted traffic; origin checks and UUID deduplication are basic controls, not a guarantee against deliberate inflation.

Country data uses Cloudflare request metadata. If the platform does not supply it, it remains unknown. Marker coordinates come from a static Natural Earth representative-point file, not from the visitor.

## Tests and migration

Use Node.js 24 or newer for the `node:sqlite` in-memory D1-compatible test adapter:

```sh
node --test tests/*.test.mjs
```

Install the declared development tools only when changing the schema, then generate migrations with `npm run db:generate`. Keep applied SQL and journal entries immutable. `0001_analytics_rollup.sql` is a generated custom migration containing a schema trigger. No runtime DDL is used.

## Portability

The Worker exports `fetch(request, env)`, using `env.DB` as a D1 binding. It can be moved to another Cloudflare account by provisioning D1, applying both SQL migrations, configuring the binding and deploying the Worker. No platform credential is embedded in these files. Change the `service` URL in `analytics.js` if the endpoint moves.

The Sites identity is retained in `.openai/hosting.json` to avoid accidentally creating a duplicate service. The deployed service preserves the historical Site's homepage while exposing its counter API. GitHub Pages does not execute files in this folder.

Use the homepage's CSV export for accessible aggregate data backups. Code backups alone do not contain the hosted database. Availability of this counter is separate from the static portfolio; an outage does not block the portfolio.
