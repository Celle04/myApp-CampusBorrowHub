# Campus BorrowHub

A comprehensive web-based system for managing the borrowing and lending of campus equipment at universities. Built with modern technologies including NestJS, TypeORM, JWT authentication, and MySQL.

## 📋 Project Overview

Campus BorrowHub streamlines the process of managing equipment inventory across university campuses. Students can request items, administrators can approve requests, track returns, and manage inventory. The system ensures efficient resource utilization while minimizing equipment loss.

## 🌟 Key Features

### User Management
- Multi-role authentication system (Admin, Staff, Student)
- JWT-based secure authentication
- User registration and login
- Role-based access control

### Equipment Management
- Complete equipment catalog with categories
- Real-time inventory tracking
- Equipment availability checking
- Support for equipment images and detailed descriptions

### Borrow Request Management
- Students can request equipment with date ranges
- Equipment availability validation
- Request status tracking (Pending, Approved, Rejected, Completed)
- Approval and rejection workflows with notes

### Return Management
- Track equipment returns
- Equipment condition reporting
- Damage logging and charges
- Automatic inventory updates

## 🛠 Tech Stack

- **Backend**: NestJS (TypeScript)
- **Database**: MySQL with TypeORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: class-validator, class-transformer
- **Security**: bcrypt for password hashing
- **Testing**: Jest

## 📁 Project Structure

```
my-app-campus-borrowhub/
├── src/                          # Source code
│   ├── config/
│   │   └── database.config.ts    # Database configuration and TypeORM setup
│   ├── entities/                 # Database entities
│   │   ├── user.entity.ts        # User model with roles and authentication
│   │   ├── equipment.entity.ts   # Equipment catalog model
│   │   ├── borrow-request.entity.ts  # Request tracking model
│   │   └── return.entity.ts      # Return processing model
│   ├── modules/
│   │   ├── admin/
│   │   │   ├── admin.controller.ts    # Admin endpoints
│   │   │   ├── admin.service.ts       # Admin business logic
│   │   │   ├── admin.module.ts        # Admin module configuration
│   │   │   └── dto/
│   │   │       └── update-user-role.dto.ts  # User role update DTO
│   │   ├── auth/
│   │   │   ├── auth.controller.ts     # Auth endpoints
│   │   │   ├── auth.service.ts        # Authentication logic
│   │   │   ├── auth.module.ts         # Auth module configuration
│   │   │   ├── decorators/
│   │   │   │   └── roles.decorator.ts # Role-based access decorator
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts  # JWT validation guard
│   │   │   │   └── roles.guard.ts     # Role authorization guard
│   │   │   ├── strategies/
│   │   │   │   └── jwt.strategy.ts    # JWT strategy implementation
│   │   │   └── dto/
│   │   │       ├── login.dto.ts       # Login request validation
│   │   │       ├── register.dto.ts    # Registration validation
│   │   │       ├── forget-password.dto.ts  # Password reset request
│   │   │       └── reset-password.dto.ts   # Password reset confirmation
│   │   ├── equipment/
│   │   │   ├── equipment.controller.ts     # Equipment endpoints
│   │   │   ├── equipment.service.ts        # Equipment business logic
│   │   │   ├── equipment.module.ts         # Equipment module configuration
│   │   │   └── dto/
│   │   │       ├── create-equipment.dto.ts # Equipment creation validation
│   │   │       └── update-equipment.dto.ts # Equipment update validation
│   │   ├── requests/
│   │   │   ├── requests.controller.ts      # Request endpoints
│   │   │   ├── requests.service.ts         # Request business logic
│   │   │   ├── requests.module.ts          # Request module configuration
│   │   │   └── dto/
│   │   │       ├── create-request.dto.ts   # Borrow request validation
│   │   │       ├── update-request.dto.ts   # Request update validation
│   │   │       └── approve-request.dto.ts  # Request approval validation
│   │   └── returns/
│   │       ├── returns.controller.ts       # Return endpoints
│   │       ├── returns.service.ts          # Return business logic
│   │       ├── returns.module.ts           # Return module configuration
│   │       └── dto/
│   │           ├── create-return.dto.ts    # Return creation validation
│   │           └── process-return.dto.ts   # Return processing validation
│   ├── app.controller.ts         # Main app controller
│   ├── app.controller.spec.ts    # Controller unit tests
│   ├── app.service.ts            # Main app service
│   ├── app.module.ts             # Root application module
│   └── main.ts                   # Application entry point
├── test/
│   ├── app.e2e-spec.ts           # End-to-end tests
│   └── jest-e2e.json             # E2E test configuration
├── public/                       # Frontend files
│   ├── index.html                # Login page
│   ├── dashboard.html            # Main dashboard UI
│   ├── app.js                    # Frontend initialization
│   ├── dashboard.js              # Dashboard functionality & Update button
│   └── app.js                    # Main app functionality
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore rules
├── eslint.config.mjs             # ESLint configuration
├── nest-cli.json                 # NestJS CLI configuration
├── package.json                  # Project dependencies
├── tsconfig.json                 # TypeScript configuration
├── tsconfig.build.json           # TypeScript build configuration
├── README.md                     # This file
├── Spec.md                       # Software Requirements Specification
└── Implementation documentation files (various templates)
```

## 📖 File Documentation

### Core Application Files

#### **src/main.ts**
Entry point of the NestJS application. Bootstraps the AppModule, enables CORS, and starts the server on port 3001 with JSON body size limits configured.

#### **src/app.module.ts**
Root module that imports all feature modules (AuthModule, EquipmentModule, RequestsModule, ReturnsModule, AdminModule) and TypeORM configuration.

#### **src/app.controller.ts**
Main application controller with health check endpoint (`GET /`).

#### **src/app.service.ts**
Main application service providing core utilities and shared functionality.

### Configuration Files

#### **src/config/database.config.ts**
Configures TypeORM connection with MySQL database. Defines:
- Connection pooling
- Entity auto-loading from `/entities` directory
- Automatic schema synchronization
- Query logging for development

### Database Entities

#### **src/entities/user.entity.ts**
Defines the User model with fields:
- `id`, `email`, `password`, `firstName`, `lastName`
- `role` (STUDENT, STAFF, ADMIN)
- `isActive` boolean flag
- Timestamps (`createdAt`, `updatedAt`)

#### **src/entities/equipment.entity.ts**
Defines the Equipment model with:
- `name`, `description`, `category`
- `totalQuantity`, `availableQuantity`
- `imageUrl`, `specifications` (JSON)
- Timestamps

#### **src/entities/borrow-request.entity.ts**
Defines the BorrowRequest model tracking equipment loans:
- Relations: user, equipment
- `requestedQuantity`, `startDate`, `endDate`
- `status` (PENDING, APPROVED, REJECTED, COMPLETED)
- `notes`, `approvalNotes`, `rejectionReason`

#### **src/entities/return.entity.ts**
Defines the Return model for equipment returns:
- Relations: borrowRequest, processor (admin staff)
- `condition` (EXCELLENT, GOOD, FAIR, POOR)
- `damageDescription`, `chargeAmount`
- Timestamps

### Authentication Module

#### **src/modules/auth/auth.controller.ts**
Exposes endpoints:
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/forget-password` - Password reset request
- `POST /auth/reset-password` - Password reset with token

#### **src/modules/auth/auth.service.ts**
Handles authentication logic:
- User registration with password hashing
- JWT token generation
- Credential validation
- Password reset flow

#### **src/modules/auth/strategies/jwt.strategy.ts**
Implements Passport JWT strategy for extracting and validating JWT tokens from requests.

#### **src/modules/auth/guards/jwt-auth.guard.ts**
Guard that enforces JWT authentication. Applied globally to protect all routes except login and registration.

#### **src/modules/auth/guards/roles.guard.ts**
Guard that checks user roles. Works with `@Roles()` decorator to enforce role-based access control.

#### **src/modules/auth/decorators/roles.decorator.ts**
Custom decorator to specify required roles for route handlers. Example: `@Roles(UserRole.ADMIN)`

#### **src/modules/auth/dto/**
- `login.dto.ts` - Validates email and password
- `register.dto.ts` - Validates user registration data
- `forget-password.dto.ts` - Validates email for password reset
- `reset-password.dto.ts` - Validates new password and reset token

#### **src/modules/auth/auth.module.ts**
Configures the authentication module with JWT strategy and Passport integration.

### Equipment Module

#### **src/modules/equipment/equipment.controller.ts**
Exposes endpoints:
- `GET /equipment` - List all equipment
- `GET /equipment/:id` - Get equipment details
- `POST /equipment` - Create equipment (STAFF/ADMIN only)
- `PUT /equipment/:id` - Update equipment (STAFF/ADMIN only)
- `DELETE /equipment/:id` - Delete equipment (ADMIN only)

#### **src/modules/equipment/equipment.service.ts**
Manages equipment operations:
- CRUD operations
- Availability checking
- Inventory tracking

#### **src/modules/equipment/dto/**
- `create-equipment.dto.ts` - Validates name, description, category, quantities
- `update-equipment.dto.ts` - Allows partial updates to equipment fields

### Requests Module

#### **src/modules/requests/requests.controller.ts**
Exposes endpoints:
- `GET /requests` - User's own requests
- `GET /requests/pending` - Pending requests (STAFF/ADMIN)
- `POST /requests` - Create borrow request
- `PUT /requests/:id/cancel` - Cancel request
- `PUT /requests/:id/approve` - Approve request (STAFF/ADMIN)
- `PUT /requests/:id/reject` - Reject request (STAFF/ADMIN)

#### **src/modules/requests/requests.service.ts**
Handles request workflow:
- Request creation with availability validation
- Status transitions (PENDING → APPROVED/REJECTED/COMPLETED)
- Request approval and rejection logic
- Equipment quantity reservations

#### **src/modules/requests/dto/**
- `create-request.dto.ts` - Validates equipment ID, quantity, dates, notes
- `update-request.dto.ts` - For request modifications
- `approve-request.dto.ts` - Validates approval notes

### Returns Module

#### **src/modules/returns/returns.controller.ts**
Exposes endpoints:
- `GET /returns` - User's own returns
- `GET /returns/pending` - Pending returns (STAFF/ADMIN)
- `POST /returns` - Submit equipment return
- `PUT /returns/:id/process` - Process return (STAFF/ADMIN)

#### **src/modules/returns/returns.service.ts**
Manages return workflow:
- Return submission
- Return processing with condition reporting
- Damage charge calculation
- Inventory restoration

#### **src/modules/returns/dto/**
- `create-return.dto.ts` - Validates return data (condition, notes)
- `process-return.dto.ts` - Validates processing (condition, damage, charges)

### Admin Module

#### **src/modules/admin/admin.controller.ts**
Exposes endpoints (ADMIN only):
- `GET /admin/users` - List all users
- `PUT /admin/users/:id/role` - Update user role and status
- `GET /admin/reports/overview` - Dashboard statistics

#### **src/modules/admin/admin.service.ts**
Provides admin operations:
- User management and role updates
- Overview reports with statistics:
  - User counts and roles
  - Equipment inventory stats
  - Request and return metrics
  - Recent activity logs

#### **src/modules/admin/dto/**
- `update-user-role.dto.ts` - Validates new role and active status

### Frontend Files

#### **public/index.html**
Login page with form for user authentication. Links to NestJS backend for token generation.

#### **public/dashboard.html**
Main dashboard UI with sections for:
- Overview statistics
- Equipment management
- Borrow requests
- Return tracking
- User management (admin)

#### **public/app.js**
Frontend initialization and configuration. Handles page routing and theme setup.

#### **public/dashboard.js**
Main dashboard functionality including:
- API communication with NestJS backend
- Dynamic table rendering
- Form handling and validation
- **Update button functionality** - Enables admins to update user roles and status via `saveUserRole()` function with error handling
- Message display system
- Token refresh and session management

### Testing Files

#### **test/app.e2e-spec.ts**
End-to-end tests covering:
- Application bootstrap
- API endpoint functionality
- Authentication flows
- CRUD operations

#### **jest-e2e.json**
Jest configuration for E2E tests.

### Configuration Files

#### **package.json**
Defines dependencies:
- NestJS framework and modules
- TypeORM and MySQL
- Class validation and transformation
- JWT and Passport
- Development tools (TypeScript, ESLint, Jest)

#### **tsconfig.json** & **tsconfig.build.json**
TypeScript compiler configuration for development and production builds.

#### **eslint.config.mjs**
Code quality and style enforcement rules.

#### **nest-cli.json**
NestJS CLI configuration for code generation and project management.



## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- npm v8+
- MySQL 5.7+

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment variables**
```bash
cp .env.example .env
```

3. **Create MySQL database**
```bash
mysql -u root -p
CREATE DATABASE campus_borrowhub;
```

4. **Start the application**
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

## 📚 Full Documentation

See [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) for:
- Complete installation instructions
- Database setup
- Detailed API endpoints with examples
- Testing procedures
- Troubleshooting guide

## 📝 Specification

See [Spec.md](Spec.md) for the complete Software Requirements Specification.

## 🔄 Available Scripts

- `npm run start` - Start the application
- `npm run start:dev` - Development mode with auto-reload
- `npm run build` - Build for production
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests

## 🔐 Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT token-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Input validation and sanitization
- ✅ CORS configuration

## 📄 License

UNLICENSED - Campus Project (2026)
