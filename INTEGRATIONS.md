# Growth360 data integration plan

## Implemented provider adapters

### Google PageSpeed Insights / Lighthouse
- Endpoint: `https://www.googleapis.com/pagespeedonline/v5/runPagespeed`
- Purpose: mobile and desktop lab scores for performance, accessibility, best practices and SEO.
- Credential: optional `PAGESPEED_API_KEY` for quota reliability.
- Interpretation: Lighthouse lab results, not actual visitor analytics or a guaranteed user experience.

### DataForSEO Google Ads Keywords Data — Keywords for Site (live)
- Endpoint: `POST https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_site/live`
- Credentials: `DATAFORSEO_LOGIN` and `DATAFORSEO_PASSWORD` (HTTP Basic authentication).
- Returns relevant keyword ideas for the domain, approximate monthly search volume, CPC, paid-search competition and monthly trend data where available.
- Location and language are passed with the request. The default report location is Toronto, Canada; location names must match DataForSEO's supported location catalog.
- This is a billable live API request. Configure rate limits and review DataForSEO pricing before enabling it for public traffic.
- Paid-search competition is not organic SEO keyword difficulty.

### DataForSEO Labs — Google Competitors Domain (live)
- Endpoint: `POST https://api.dataforseo.com/v3/dataforseo_labs/google/competitors_domain/live`
- Credentials: same DataForSEO account.
- Returns domains competing in organic/paid SERPs and metrics such as shared keywords, average position and estimated organic traffic.
- Competitor traffic is third-party modeled data, not the competitor's verified Google Analytics.
- This is also a billable live request.

## Not yet implemented — required before claiming these features are live

### Google Search Console
Use Google's OAuth 2.0 web-server flow and Search Console API after the business owner explicitly authorizes a property. Then report actual clicks, impressions, CTR and average position for that verified property. Store refresh tokens encrypted and allow disconnect/revocation.

### Google Analytics 4
Use OAuth 2.0 and the GA4 Data API after the owner authorizes a GA4 property. Then report actual sessions, users, engagement and conversions for the selected property/date range. Never claim a public website scan can reveal these metrics.

### Similarweb
Requires a suitable API subscription and entitlement. Select the exact API product/endpoint and validate its metrics, geographic granularity, limits and usage terms before integrating. A key alone does not guarantee access.

### Meta Marketing API
Use business-authorized OAuth and required permissions for the client's own ad account. Do not infer competitor ad spend, conversions or targeting from public ad transparency data.

### Opportunity calculator
Build only from sourced keyword demand plus explicit, editable assumptions supplied by the client or agency (click-through rate, lead conversion, close rate, average order/customer value and margin). Label all outputs as scenarios, never guaranteed results.

## Data provenance required in every report

Each metric should carry: `source`, `retrieved_at`, `geography`, `period`, `metric_type` (`observed`, `first_party`, `third_party_estimate`, or `scenario`), and a plain-language caveat. Missing data should remain `unavailable`, not zero.


## OpenAI ad creative generation
Set `OPENAI_API_KEY` and optionally `OPENAI_MODEL` in the service environment. Growth360 calls the OpenAI Responses API only when a user clicks Generate ad concepts for a saved report. The endpoint returns draft Google Search and Meta copy/visual directions; it does not create or publish campaigns. Website title and meta description are treated as untrusted reference text, not instructions.

## Competitor comparison
The DataForSEO Labs Google Competitors Domain endpoint returns estimated organic traffic and keyword metrics, including competitor data for the selected target geography. These figures are third-party estimates, not verified analytics. The endpoint is billable. See https://docs.dataforseo.com/v3/dataforseo_labs-google_competitors_domain-live/ and https://docs.dataforseo.com/v3/dataforseo_labs-google-domain_rank_overview-live/.