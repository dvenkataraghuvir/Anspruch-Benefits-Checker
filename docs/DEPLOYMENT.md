# Deployment (Azure)

| Part | Azure service | Notes |
|---|---|---|
| Website | Storage account, static website | `stanspruch…`, Germany West Central |
| Backend | Container Apps (consumption) | `ca-anspruch-api`, Germany West Central, scales to zero, max 1 replica |
| Backend image | GitHub Container Registry | `ghcr.io/dvenkataraghuvir/anspruch-backend` |
| Monitoring | Application Insights + Log Analytics | 0.1 GB/day ingestion cap, IPs masked |
| Cost control | Monthly budget | alerts at 80% actual and 100% forecast |
| CI login | User-assigned managed identity + OIDC | trusts only `main` of this repo; no secrets in GitHub |

Everything is defined in `infra/main.bicep` and `infra/resources.bicep`.

The Azure for Students policy only allows `germanywestcentral`, `austriaeast`,
`spaincentral`, `denmarkeast` and `norwayeast`. Static Web Apps is not offered in
any of them, so the website is a Storage static website. Deep links such as
`/check` are served through the 404 document (`index.html`), so they work in the
browser but return HTTP 404.
After the one-time setup below, every push to `main` runs tests, builds the
backend image, updates the Container App and uploads the website.

## One-time setup

The commands work in Git Bash and in PowerShell.

**1. Install the Azure CLI**, then open a new terminal.

```
winget install -e --id Microsoft.AzureCLI
```

**2. Log in and check the subscription.**

```
az login
az account show -o table
```

The `Name` column should say *Azure for Students*. If not, run
`az account set --subscription "Azure for Students"`.

**3. Register the resource providers** (new subscriptions start without them).

```
az provider register --wait --namespace Microsoft.App
az provider register --wait --namespace Microsoft.OperationalInsights
az provider register --wait --namespace Microsoft.Insights
az provider register --wait --namespace Microsoft.Storage
az provider register --wait --namespace Microsoft.ManagedIdentity
az provider register --wait --namespace Microsoft.Consumption
```

**4. Make the backend image public**, so Azure can pull it without credentials.
The CI run on `main` has already published it. Open
https://github.com/users/dvenkataraghuvir/packages/container/anspruch-backend/settings,
scroll to *Danger Zone*, choose *Change visibility* and select *Public*.

**5. Deploy the infrastructure.** Replace the e-mail address with yours.

```
az deployment sub create --name anspruch --location germanywestcentral --template-file infra/main.bicep --parameters budgetContactEmail=you@example.com
```

This takes about 5 minutes. Two errors you might see on a student subscription:

- *RequestDisallowedByPolicy* (region not allowed): check the allowed regions with
  `az policy assignment list --query "[].parameters.listOfAllowedLocations.value"`
  and add `location=<one of them>` after the e-mail parameter.
- An error about the budget or the offer type: add `deployBudget=false`. The
  Azure for Students credit has its own hard spending limit, so you are still
  protected.

The budget amount is in your billing currency. Azure for Students usually bills
in US dollars, so 10 means about 10 USD.

**6. Tell GitHub how to log in to Azure.** These are IDs, not secrets.

```
gh variable set AZURE_CLIENT_ID --body "$(az deployment sub show -n anspruch --query properties.outputs.deployClientId.value -o tsv)"
gh variable set AZURE_TENANT_ID --body "$(az deployment sub show -n anspruch --query properties.outputs.tenantId.value -o tsv)"
gh variable set AZURE_SUBSCRIPTION_ID --body "$(az deployment sub show -n anspruch --query properties.outputs.subscriptionId.value -o tsv)"
```

**7. Run the first deployment** and wait for it to finish.

```
gh workflow run ci.yml --ref main
gh run watch
```

**8. Open the website.**

```
az deployment sub show -n anspruch --query properties.outputs.websiteUrl.value -o tsv
```

## Later

- **Code changes:** push to `main`. Nothing else to do.
- **Infrastructure changes:** run step 5 again, but pass the live image so the
  backend is not reset to the placeholder:
  `--parameters budgetContactEmail=you@example.com containerImage=ghcr.io/dvenkataraghuvir/anspruch-backend:latest`
- **Logs and metrics:** Azure Portal → `appi-anspruch` → *Live metrics* or *Transaction search*.
- **Delete everything:** `az group delete -n rg-anspruch` (the budget is removed with
  `az consumption budget delete --budget-name budget-anspruch-monthly`).
