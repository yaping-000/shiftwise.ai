#!/bin/bash

# Exit on error
set -e

# Load environment variables
source .env

# Variables
RESOURCE_GROUP="shiftwise-rg"
LOCATION="eastus"
APP_NAME="shiftwise"

echo "Creating Resource Group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

echo "Creating Azure PostgreSQL server..."
az postgres server create \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME-db \
    --location $LOCATION \
    --admin-user $AZURE_POSTGRESQL_USER \
    --admin-password $AZURE_POSTGRESQL_PASSWORD \
    --sku-name B_Gen5_1

echo "Creating Azure Storage Account..."
az storage account create \
    --name $APP_NAME"storage" \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --sku Standard_LRS

echo "Creating Azure Function App..."
az functionapp create \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME-functions \
    --storage-account $APP_NAME"storage" \
    --runtime python \
    --runtime-version 3.9 \
    --functions-version 4 \
    --os-type linux

echo "Creating App Service Plan..."
az appservice plan create \
    --name $APP_NAME-plan \
    --resource-group $RESOURCE_GROUP \
    --sku B1 \
    --is-linux

echo "Creating Web App for Django backend..."
az webapp create \
    --resource-group $RESOURCE_GROUP \
    --plan $APP_NAME-plan \
    --name $APP_NAME-api \
    --runtime "PYTHON|3.9" \
    --deployment-local-git

echo "Creating Static Web App for React frontend..."
az staticwebapp create \
    --name $APP_NAME-ui \
    --resource-group $RESOURCE_GROUP \
    --source https://github.com/yourusername/shiftwise.ai \
    --location $LOCATION \
    --branch main \
    --app-location "/frontend" \
    --api-location "/backend" \
    --output-location "build"

echo "Setting up environment variables for Web App..."
az webapp config appsettings set \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME-api \
    --settings \
        AZURE_POSTGRESQL_HOST="$AZURE_POSTGRESQL_HOST" \
        AZURE_POSTGRESQL_NAME="$AZURE_POSTGRESQL_NAME" \
        AZURE_POSTGRESQL_USER="$AZURE_POSTGRESQL_USER" \
        AZURE_POSTGRESQL_PASSWORD="$AZURE_POSTGRESQL_PASSWORD" \
        AZURE_STORAGE_ACCOUNT="$AZURE_STORAGE_ACCOUNT" \
        AZURE_STORAGE_KEY="$AZURE_STORAGE_KEY" \
        AZURE_AD_CLIENT_ID="$AZURE_AD_CLIENT_ID" \
        AZURE_AD_TENANT_ID="$AZURE_AD_TENANT_ID" \
        AZURE_FUNCTION_URL="$AZURE_FUNCTION_URL" \
        AZURE_FUNCTION_KEY="$AZURE_FUNCTION_KEY" \
        DJANGO_SECRET_KEY="$DJANGO_SECRET_KEY" \
        DJANGO_DEBUG="False" \
        ALLOWED_HOSTS="$APP_NAME-api.azurewebsites.net"

echo "Deployment complete!"
echo "Backend API URL: https://$APP_NAME-api.azurewebsites.net"
echo "Frontend URL: https://$APP_NAME-ui.azurestaticapps.net" 