// Resources inside rg-anspruch. Deployed by main.bicep.
param location string
param staticWebAppLocation string
param githubRepo string
param containerImage string

var tags = { project: 'anspruch' }

// ── Monitoring ──────────────────────────────────────────────────────────────
resource logs 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: 'log-anspruch'
  location: location
  tags: tags
  properties: {
    sku: { name: 'PerGB2018' }
    retentionInDays: 30
    workspaceCapping: { dailyQuotaGb: json('0.1') } // hard cap on ingestion cost
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: 'appi-anspruch'
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logs.id
    DisableIpMasking: false // client IPs are never stored
  }
}

// ── Website ─────────────────────────────────────────────────────────────────
resource web 'Microsoft.Web/staticSites@2023-12-01' = {
  name: 'swa-anspruch'
  location: staticWebAppLocation
  tags: tags
  sku: { name: 'Free', tier: 'Free' }
  properties: {}
}

// ── Backend ─────────────────────────────────────────────────────────────────
resource env 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: 'cae-anspruch'
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logs.properties.customerId
        sharedKey: logs.listKeys().primarySharedKey
      }
    }
  }
}

resource api 'Microsoft.App/containerApps@2024-03-01' = {
  name: 'ca-anspruch-api'
  location: location
  tags: tags
  properties: {
    managedEnvironmentId: env.id
    configuration: {
      ingress: {
        external: true
        targetPort: 8000
        transport: 'auto'
        allowInsecure: false
      }
      secrets: [
        { name: 'appinsights-connection', value: appInsights.properties.ConnectionString }
      ]
    }
    template: {
      containers: [
        {
          name: 'api'
          image: containerImage
          resources: { cpu: json('0.25'), memory: '0.5Gi' }
          env: [
            { name: 'ENVIRONMENT', value: 'prod' }
            // Strict CORS allowlist: only the deployed website.
            { name: 'CORS_ALLOW_ORIGINS', value: '["https://${web.properties.defaultHostname}"]' }
            { name: 'APPLICATIONINSIGHTS_CONNECTION_STRING', secretRef: 'appinsights-connection' }
          ]
        }
      ]
      scale: {
        minReplicas: 0 // scale to zero when idle
        maxReplicas: 1
        rules: [
          { name: 'http', http: { metadata: { concurrentRequests: '20' } } }
        ]
      }
    }
  }
}

// ── GitHub Actions identity (OIDC, no stored secrets) ──────────────────────
resource deployer 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: 'id-anspruch-github'
  location: location
  tags: tags
}

resource githubTrust 'Microsoft.ManagedIdentity/userAssignedIdentities/federatedIdentityCredentials@2023-01-31' = {
  parent: deployer
  name: 'github-main'
  properties: {
    issuer: 'https://token.actions.githubusercontent.com'
    subject: 'repo:${githubRepo}:ref:refs/heads/main' // only the main branch may deploy
    audiences: [ 'api://AzureADTokenExchange' ]
  }
}

var contributorRoleId = 'b24988ac-6180-42a0-ab88-20f7382dd24c'

resource deployerAccess 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(resourceGroup().id, deployer.id, contributorRoleId)
  properties: {
    principalId: deployer.properties.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', contributorRoleId)
  }
}

output deployClientId string = deployer.properties.clientId
output containerAppName string = api.name
output staticWebAppName string = web.name
output websiteUrl string = 'https://${web.properties.defaultHostname}'
output backendUrl string = 'https://${api.properties.configuration.ingress.fqdn}'
