# 🩸 BloodConnect - Blood Donation Support System

A comprehensive web application for managing blood donation requests, matching donors with recipients, and facilitating the blood donation process. Built with modern technologies and deployed on AWS.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)

## ✨ Features

### Core Functionality
- **User Management**: Registration, authentication, and profile management with AWS Cognito
- **Blood Request Management**: Create, view, and manage blood donation requests
- **Donor Matching**: Intelligent matching system based on blood type, location, and compatibility
- **Donor Management**: Register as donor, manage availability, and track donation history
- **Match Management**: Accept/decline matches, track match status
- **Location Services**: Find nearby donors based on geographic coordinates
- **Role-Based Access**: Admin, Staff, and Member roles with different permissions

### User Roles
- **Admin**: Full system access and user management
- **Staff**: Manage requests, create matches, and contact donors
- **Member**: Create requests, view matches, and manage donor profile

## 🛠 Tech Stack

### Frontend
- **React 19.2** - UI library
- **Vite 7.2** - Build tool and dev server
- **TailwindCSS 4.1** - Utility-first CSS framework
- **React Router 6.30** - Client-side routing
- **Axios 1.13** - HTTP client

### Backend
- **.NET 8.0** - Web API framework
- **Clean Architecture** - Domain-Driven Design
- **MediatR** - CQRS pattern implementation
- **Entity Framework Core** - ORM
- **AWS Cognito** - Authentication and user management
- **Swagger/OpenAPI** - API documentation

### Infrastructure
- **AWS Services**:
  - Cognito (Authentication)
  - EC2 (Application hosting)
  - RDS (Database)
  - CloudFront (CDN)

## 📁 Project Structure

```
AWS-Blood-Donation-Support/
├── Frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   ├── contexts/        # React contexts
│   │   ├── guards/          # Route guards
│   │   └── router/          # Routing configuration
│   ├── public/              # Static assets
│   └── package.json
│
└── Backend/                 # .NET backend application
    └── BloodDonationSupport/
        ├── BloodDonationSupport.WebAPI/      # API layer
        ├── BloodDonationSupport.Application/ # Application layer (CQRS)
        ├── BloodDonationSupport.Domain/      # Domain layer
        └── BloodDonationSupport.Infrastructure/ # Infrastructure layer
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **.NET 8.0 SDK**
- **AWS Account** with Cognito configured
- **SQL Server** or compatible database

### Frontend Setup

1. Navigate to the Frontend directory:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional):
```env
VITE_API_URL=https://api.bloodconnect.cloud/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

1. Navigate to the Backend directory:
```bash
cd Backend/BloodDonationSupport/BloodDonationSupport.WebAPI
```

2. Configure `appsettings.json`:
```json
{
  "AWS": {
    "Cognito": {
      "UserPoolId": "your-user-pool-id",
      "ClientId": "your-client-id",
      "ClientSecret": "your-client-secret"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "your-database-connection-string"
  }
}
```

3. Restore packages:
```bash
dotnet restore
```

4. Run the application:
```bash
dotnet run
```

The API will be available at `http://localhost:5000` (or configured port)

5. Access Swagger UI:
```
http://localhost:5000/swagger
```

## 📚 API Documentation

### Base URL
- **Production**: `https://api.bloodconnect.cloud/api`
- **Development**: `http://localhost:5000/api`

### Main Endpoints

#### Authentication
- `POST /Users/register` - Register new user
- `POST /Users/login` - User login
- `POST /Users/confirm-email` - Confirm email with verification code
- `POST /Users/resend-confirmation-code` - Resend confirmation code
- `POST /Users/forgot-password` - Request password reset
- `POST /Users/reset-password` - Reset password with code

#### Requests
- `GET /Requests` - Get all requests (paginated)
- `GET /Requests/{id}` - Get request by ID
- `POST /Requests` - Create new request
- `POST /Requests/{id}/cancel` - Cancel request

#### Donors
- `GET /Donors/me` - Get current user's donor profile
- `POST /Donors/register` - Register as donor
- `GET /Donors/nearby` - Find nearby donors (requires Latitude, Longitude, RadiusKm)
- `PUT /Donors/{id}` - Update donor information

#### Matches
- `GET /Matches` - Get all matches
- `GET /Matches/me` - Get current user's matches
- `GET /Matches?requestId={id}` - Get matches for a request
- `POST /Matches` - Create new match
- `PUT /Matches/{id}/accept` - Accept a match
- `PUT /Matches/{id}/decline` - Decline a match
- `PUT /Matches/{id}/contact` - Mark match as contacted

### Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## 🌐 Deployment

### Frontend Deployment
The frontend is deployed at: `https://bloodconnect.cloud`

### Backend Deployment
The API is deployed at: `https://api.bloodconnect.cloud`

### Environment Configuration

#### Frontend
- Production API URL: `https://api.bloodconnect.cloud/api`
- Uses relative paths for same-domain deployment

#### Backend
- Configure AWS Cognito credentials
- Set up database connection string
- Configure CORS for frontend domain

## 🔐 Security Features

- JWT-based authentication via AWS Cognito
- Role-based access control (RBAC)
- HTTPS enforcement
- Input validation and sanitization
- Secure password reset flow

## 📝 Key Features Implementation

### Donor Matching Algorithm
- Calculates compatibility score based on blood type compatibility
- Considers geographic distance
- Filters by donor availability and readiness status

### Location Services
- Uses latitude/longitude coordinates
- Calculates distance between request location and donors
- Supports configurable search radius

### Match Workflow
1. Staff creates match between request and donor
2. Donor receives notification
3. Donor can accept or decline
4. Staff can mark as contacted
5. Status tracking throughout the process

## 🧪 Testing

### Frontend
```bash
cd Frontend
npm run lint
```

### Backend
```bash
cd Backend/BloodDonationSupport
dotnet test
```

## 📄 License

This project is proprietary software.

## 👥 Contributors

- Development Team

## 📞 Support

For issues and questions, please contact the development team.

---

**Made with ❤️ for saving lives through blood donation**
