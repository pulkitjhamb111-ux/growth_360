# Growth360 MVP

A client-facing website health audit and minimal agency report store.

## Current capabilities

- Public website URL submission without client login.
- Website metadata, headings, viewport, image alt text, internal-link, `robots.txt` and sitemap checks.
- Google PageSpeed Insights / Lighthouse mobile and desktop measurements.
- Transparent technical snapshot score (not a business performance score).
- DataForSEO live adapters for domain keyword ideas/search volume/CPC/paid competition and Google organic SERP competitor estimates when credentials are configured.
- SQLite report and lead capture; the Render Blueprint mounts a persistent disk for this single-instance MVP.
- Agency report list endpoint protected by a generated secret token.
- Unavailable metrics remain unavailable; no fabricated traffic, conversions or revenue.
- Basic SSRF defenses and per-IP analysis throttling.

## Local run

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Set a unique random GROWTH360_ADMIN_TOKEN before starting.
set -a; source .env; set +a
uvicorn app:app --reload
```

Open http://localhost:8000.

## Deployment

See [DEPLOY_RENDER.md](DEPLOY_RENDER.md). The `render.yaml` Blueprint creates a Docker web service, a generated agency token and a persistent disk. It is configured for a temporary Render URL; no custom domain is required.

## Agency reports

```bash
curl -H 'X-Growth360-Token: YOUR_TOKEN' https://YOUR-SERVICE.onrender.com/api/admin/reports
```

## Data sources and limitations

- Google PageSpeed Insights: Lighthouse lab measurements, not real user analytics.
- DataForSEO Google Ads Keywords Data: approximate monthly search volumes, CPC and paid-search competition.
- DataForSEO Labs: third-party estimated competitor visibility and organic traffic.
- Google Search Console and GA4: not yet connected; actual first-party clicks, impressions, sessions and conversions require client OAuth authorization.
- Similarweb and Meta Marketing API: not wired into this MVP.

Read [INTEGRATIONS.md](INTEGRATIONS.md) and [SECURITY.md](SECURITY.md) before public promotion. DataForSEO live endpoints are billable; enabling credentials means each public report can incur provider charges.

## API

- `GET /api/health`
- `POST /api/analyze` JSON: `{ "website": "https://example.com", "location": "Toronto, Canada", "industry": "Dental", "email": "" }`
- `GET /api/admin/reports` header: `X-Growth360-Token: <secret>`

## Growth360 v0.2 enhancements
- Competitor comparison chart using DataForSEO Labs organic estimated traffic and keyword counts.
- Editable business opportunity scenario calculator. Outputs depend on client-entered assumptions and are explicitly not forecasts.
- AI draft ad concepts through the OpenAI Responses API. Requires OPENAI_API_KEY and OPENAI_MODEL; generation is user-triggered and no ads are published.