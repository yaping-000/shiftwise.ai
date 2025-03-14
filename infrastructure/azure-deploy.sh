#!/bin/bash

# Exit on error
set -e

# Load environment variables
source ../.env

# Variables
RESOURCE_GROUP="shiftwise-ai-rg"
LOCATION="eastus"
APP_NAME="shiftwise-ai"

echo "Creating Resource Group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

echo "Creating PostgreSQL Server..."
az postgres server create \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME-db \
    --location $LOCATION \
    --admin-user $AZURE_POSTGRESQL_USER \
    --admin-password $AZURE_POSTGRESQL_PASSWORD \
    --sku-name B_Gen5_1

echo "Creating Storage Account..."
az storage account create \
    --name ${APP_NAME}storage \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --sku Standard_LRS

echo "Creating Function App..."
az functionapp create \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME-func \
    --storage-account ${APP_NAME}storage \
    --runtime python \
    --runtime-version 3.9 \
    --os-type linux \
    --consumption-plan-location $LOCATION

echo "Creating App Service Plan..."
az appservice plan create \
    --name $APP_NAME-plan \
    --resource-group $RESOURCE_GROUP \
    --sku B1 \
    --is-linux

echo "Creating Web App for Backend..."
az webapp create \
    --resource-group $RESOURCE_GROUP \
    --plan $APP_NAME-plan \
    --name $APP_NAME-api \
    --runtime "PYTHON|3.9" \
    --deployment-local-git

echo "Creating Static Web App for Frontend..."
az staticwebapp create \
    --name $APP_NAME-ui \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --source frontend \
    --app-location "/" \
    --output-location "build" \
    --login-with-github

echo "Setting up Web App Configuration..."
az webapp config appsettings set \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME-api \
    --settings \
    AZURE_POSTGRESQL_HOST="$APP_NAME-db.postgres.database.azure.com" \
    AZURE_POSTGRESQL_NAME="$AZURE_POSTGRESQL_NAME" \
    AZURE_POSTGRESQL_USER="$AZURE_POSTGRESQL_USER" \
    AZURE_POSTGRESQL_PASSWORD="$AZURE_POSTGRESQL_PASSWORD" \
    AZURE_STORAGE_ACCOUNT="${APP_NAME}storage" \
    AZURE_STORAGE_KEY="$(az storage account keys list --account-name ${APP_NAME}storage --resource-group $RESOURCE_GROUP --query '[0].value' -o tsv)" \
    AZURE_FUNCTION_URL="https://$APP_NAME-func.azurewebsites.net" \
    AZURE_FUNCTION_KEY="$(az functionapp keys list --name $APP_NAME-func --resource-group $RESOURCE_GROUP --query 'functionKeys.default' -o tsv)" \
    DJANGO_DEBUG="False" \
    ALLOWED_HOSTS="$APP_NAME-api.azurewebsites.net"

echo "Deployment completed successfully!"
echo "Backend API URL: https://$APP_NAME-api.azurewebsites.net"
echo "Frontend URL: https://$APP_NAME-ui.azurestaticapps.net" 