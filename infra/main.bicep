// Anspruch infrastructure. Subscription scope: creates the resource group,
// everything inside it, and the monthly budget.
//
//   az deployment sub create --location germanywestcentral \
//     --template-file infra/main.bicep --parameters budgetContactEmail=<you@example.com>
//
// See docs/DEPLOYMENT.md for the full first-time setup.
targetScope = 'subscription'

@description('Region for all resources. The Azure for Students policy allows germanywestcentral, austriaeast, spaincentral, denmarkeast and norwayeast.')
param location string = 'germanywestcentral'

param resourceGroupName string = 'rg-anspruch'

@description('GitHub repository allowed to deploy via OIDC, in the subject format GitHub sends: owner@ownerId/repo@repoId. The numeric IDs stop a recreated repo with the same name from matching. Look them up with: gh api repos/OWNER/REPO --jq "[.owner.id, .id]"')
param githubRepo string = 'dvenkataraghuvir@216131688/Anspruch-Benefits-Checker@1419784625'

@description('Backend image. The placeholder is only for the very first deployment; GitHub Actions replaces it. On later runs of this template, pass the current image.')
param containerImage string = 'mcr.microsoft.com/k8se/quickstart:latest'

@description('Monthly budget in the billing currency of the subscription.')
param budgetAmount int = 10

@description('Who gets the budget alerts.')
param budgetContactEmail string

@description('Set to false if the subscription offer does not support budgets.')
param deployBudget bool = true

@description('Budget start, first day of the current month.')
param budgetStartDate string = '${utcNow('yyyy-MM')}-01'

resource rg 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: resourceGroupName
  location: location
  tags: { project: 'anspruch' }
}

module app 'resources.bicep' = {
  name: 'anspruch-resources'
  scope: rg
  params: {
    location: location
    githubRepo: githubRepo
    containerImage: containerImage
  }
}

resource budget 'Microsoft.Consumption/budgets@2023-11-01' = if (deployBudget) {
  name: 'budget-anspruch-monthly'
  properties: {
    category: 'Cost'
    amount: budgetAmount
    timeGrain: 'Monthly'
    timePeriod: { startDate: budgetStartDate }
    notifications: {
      actual80: {
        enabled: true
        operator: 'GreaterThanOrEqualTo'
        threshold: 80
        thresholdType: 'Actual'
        contactEmails: [ budgetContactEmail ]
      }
      forecast100: {
        enabled: true
        operator: 'GreaterThanOrEqualTo'
        threshold: 100
        thresholdType: 'Forecasted'
        contactEmails: [ budgetContactEmail ]
      }
    }
  }
}

output resourceGroup string = rg.name
output tenantId string = tenant().tenantId
output subscriptionId string = subscription().subscriptionId
output deployClientId string = app.outputs.deployClientId
output containerAppName string = app.outputs.containerAppName
output websiteStorageAccount string = app.outputs.websiteStorageAccount
output websiteUrl string = app.outputs.websiteUrl
output backendUrl string = app.outputs.backendUrl
