# Roadmap

Goal: a real, verifiable product that shows a grounded AI system end to end.
The AI layer comes before nationwide coverage because it is the core of the
project; coverage follows before the public launch.

Last updated: 2026-10-15.

## Milestone 1: beta live on Azure, with MCP server (by 30 Oct 2026)

- [x] Website copy describes AI explanations as planned until they exist
- [x] CI: tests and frontend build on every push
- [x] Beta banner (amounts for Würzburg only)
- [x] Azure as code: Bicep, Container Apps (scale to zero), Storage static website,
      Application Insights, budget, deployment from GitHub Actions via OIDC
- [ ] First deployment (one-time setup in `docs/DEPLOYMENT.md`)
- [ ] Live site shows no sample results before the first check
- [ ] MCP server exposing the eligibility check as a tool, as a second
      Container App, tested from an MCP client
- [ ] Impressum and Datenschutzerklärung

## Milestone 2: AI layer (by 27 Nov 2026)

- [ ] Statute texts filled in the grounding corpus, indexed in Azure AI Search
- [ ] Explanation endpoint on Azure OpenAI, citing only retrieved sources
- [ ] Output guard: any euro figure must equal the engine's result, or the
      explanation is blocked
- [ ] LangGraph workflow: intake → assess → cite → checklist → human approval
- [ ] Fixed evaluation set in CI (groundedness, refusal, number guard)
- [ ] Langfuse tracing, with sensitive fields redacted

## Milestone 3: Germany-wide, public launch (by 18 Dec 2026)

- [ ] Municipality search from the official WoGV Anlage and the Destatis
      municipality register, replacing the Würzburg-only postcode table
- [ ] § 17 WoGG deductions (single parent, severe disability, maintenance)
- [ ] Household sizes 5–12 verified against the official Wohngeldrechner
- [ ] "2027 rules not yet published" state for checks from 1 Jan 2027
- [ ] Remove the beta banner; public launch

## Milestone 4: Wohngeld 2027 (about one week after official publication)

- [ ] New dated rule module once the 2027 figures are in the Bundesgesetzblatt
- [ ] Re-verified against the 2027 Wohngeldrechner

Expected mid to late January 2027. This date depends on the legislative
process: the reform bill still needs the Bundestag and the Bundesrat.
