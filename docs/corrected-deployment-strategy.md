📱 _ShiftWise.ai - Hackathon Deployment Strategy_

_Updated Deployment Approach:_

1. _Frontend (React):_ Azure Static Web Apps
   • Auto-deploys from GitHub
   • Free SSL/CDN
   • Built-in authentication support

2. _Backend (Django):_ Azure App Service
   • Supports full Django functionality
   • Easy deployment from GitHub
   • Connects to PostgreSQL and Azure Storage

_Architecture:_ 🏗️

```
Frontend (Azure Static Web Apps)
↓
Backend API (Azure App Service)
↓
Azure Services:
- PostgreSQL (Database)
- Storage (Documents)
- Functions (AI Processing)
```

_Deployment Steps:_ 🚀

1. _Backend (Django)_

```bash
# Create App Service
az webapp create \
  --name shiftwiseai-api \
  --resource-group shiftwise-rg \
  --plan shiftwiseai-plan \
  --runtime "PYTHON|3.9"
```

2. _Frontend (React)_

```bash
# Create Static Web App
az staticwebapp create \
  --name shiftwiseai-web \
  --resource-group shiftwise-rg \
  --location eastus
```

_Environment Variables:_ 🔑

Backend (App Service):

```
DJANGO_SECRET_KEY
DATABASE_URL
AZURE_STORAGE_CONNECTION_STRING
AZURE_AD_CLIENT_ID
AZURE_AD_TENANT_ID
ALLOWED_HOSTS
```

Frontend (Static Web App):

```
REACT_APP_API_URL=https://shiftwiseai-api.azurewebsites.net
REACT_APP_AZURE_AD_CLIENT_ID
REACT_APP_AZURE_AD_TENANT_ID
```

_GitHub Actions:_ 👨‍💻
We'll need two workflows:

1. Frontend deployment to Static Web Apps
2. Backend deployment to App Service

_Local Development:_ 💻
Still the same:

```bash
# Frontend
cd frontend
npm start

# Backend
cd backend
python manage.py runserver
```

_URLs After Deployment:_ 🌐
• Frontend: https://shiftwiseai-web.azurestaticapps.net
• Backend API: https://shiftwiseai-api.azurewebsites.net

_Cost Optimization:_ 💰
• Frontend: Free tier of Static Web Apps
• Backend: Basic App Service plan (can use free tier for hackathon)
• Scale up only if needed

_Next Steps:_ 📋

1. Create Azure resources (App Service + Static Web App)
2. Set up GitHub Actions workflows
3. Configure environment variables
4. Deploy and test

_Need Help?_ 🤝
• Azure Static Web Apps docs: https://docs.microsoft.com/azure/static-web-apps
• Azure App Service docs: https://docs.microsoft.com/azure/app-service/configure-language-python
• Ping me for questions!
