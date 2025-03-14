# ShiftWise.ai

AI-powered ROI Analysis Tool for document processing and analysis.

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
└── infrastructure/     # Azure deployment scripts
```

## Technology Stack

- Backend:

  - Django 4.2
  - Django REST Framework
  - PostgreSQL (Azure)
  - Azure Blob Storage
  - Azure Functions

- Frontend:
  - React 18
  - Material-UI
  - Azure AD B2C Authentication
  - Chart.js

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
cp .env.example .env
# Edit .env with your configuration
```

3. Start the development server:

```bash
npm start
```

## Azure Deployment

1. Install Azure CLI and log in:

```bash
az login
```

2. Run the deployment script:

```bash
cd infrastructure
chmod +x azure-deploy.sh
./azure-deploy.sh
```

## API Documentation

- Swagger UI: `/api/swagger/`
- ReDoc: `/api/redoc/`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
