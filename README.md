# ShiftWise.AI

A modern web application for intelligent shift scheduling and management.

## Project Structure

```
shiftwise.ai/
├── backend/              # Django REST API
│   ├── api/             # API app
│   ├── config/          # Project settings
│   └── requirements.txt # Python dependencies
├── frontend/            # React frontend
│   ├── src/            # Source code
│   ├── public/         # Static files
│   └── package.json    # Node.js dependencies
└── .github/            # GitHub Actions workflows
    └── workflows/      # CI/CD pipeline definitions
```

## Technology Stack

### Backend

- Django 4.2
- Django REST Framework
- PostgreSQL (Azure)
- Azure Blob Storage
- Azure Functions
- Azure App Service

### Frontend

- React 18
- Material-UI
- Azure AD Authentication
- Chart.js
- Azure Static Web Apps

## Local Development Setup

### Backend

1. Create and activate a virtual environment:

   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Run migrations:

   ```bash
   python manage.py migrate
   ```

5. Create a superuser:

   ```bash
   python manage.py createsuperuser
   ```

6. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend

1. Install dependencies:

   ```bash
   cd frontend
   npm install
   ```

2. Set up environment variables:

   ```bash
   cp .env.example .env.development
   # Edit .env.development with your configuration
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Deployment Process

### GitHub Actions to Azure Deployment

The application uses GitHub Actions for continuous deployment to Azure. There are two main deployment workflows:

1. **Frontend Deployment** (Azure Static Web Apps)

   - Location: `.github/workflows/frontend-deploy.yml`
   - Triggered on:
     - Push to `main` branch
     - Pull requests targeting `main`
   - Environment Variables:
     ```
     REACT_APP_API_URL: Backend API URL
     REACT_APP_AZURE_AD_CLIENT_ID: Azure AD App Registration Client ID
     REACT_APP_AZURE_AD_TENANT_ID: Azure AD Tenant ID
     REACT_APP_REDIRECT_URI: Authentication redirect URI
     ```
   - Build Output: `frontend/build`
   - Azure Service: Static Web Apps
   - URL: `https://mango-hill-05428050f.6.azurestaticapps.net`

2. **Backend Deployment** (Azure App Service)
   - Location: `.github/workflows/backend-deploy.yml`
   - Triggered on:
     - Push to `main` branch
   - Environment Variables:
     ```
     AZURE_WEBAPP_NAME: Name of the Azure Web App
     AZURE_WEBAPP_PACKAGE_PATH: Backend application path
     PYTHON_VERSION: Python runtime version
     ```
   - Build Output: `backend/`
   - Azure Service: App Service
   - URL: `https://shiftwiseai-api.azurewebsites.net`

### Prerequisites

1. Azure Account with active subscription
2. Azure AD App Registration for authentication
3. GitHub repository secrets configured:
   - `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - `AZURE_WEBAPP_PUBLISH_PROFILE`
   - Other environment-specific secrets

### Deployment Configuration

1. **Azure Static Web Apps**

   ```yaml
   app_location: "frontend"
   api_location: ""
   output_location: "build"
   ```

2. **Azure App Service**
   ```yaml
   runtime: "python"
   startup_command: "gunicorn backend.wsgi:application"
   ```

### Manual Deployment Steps

If you need to deploy manually:

1. Frontend:

   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. Backend:
   ```bash
   cd backend
   python -m pip install -r requirements.txt
   python manage.py collectstatic
   ```

### Troubleshooting

1. **Frontend Build Issues**

   - Verify all environment variables are set
   - Check build output in GitHub Actions logs
   - Ensure `package.json` dependencies are up to date

2. **Backend Deployment Issues**

   - Verify Python version compatibility
   - Check `requirements.txt` for missing dependencies
   - Review App Service logs for startup errors

3. **Authentication Issues**
   - Verify Azure AD app registration configuration
   - Check redirect URIs in Azure portal
   - Ensure environment variables match Azure AD settings

### Monitoring

- Frontend: Azure Static Web Apps analytics
- Backend: Azure App Service monitoring
- Application Insights for detailed telemetry

## API Documentation

- Swagger UI: `/api/swagger/`
- ReDoc: `/api/redoc/`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support

For deployment issues:

1. Check GitHub Actions run logs
2. Review Azure portal deployment center
3. Contact repository maintainers

## License

[MIT License](LICENSE)
