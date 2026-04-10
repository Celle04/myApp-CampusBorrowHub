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
src/
├── config/               # Configuration files
│   └── database.config.ts
├── modules/
│   ├── auth/            # Authentication module
│   ├── equipment/       # Equipment management module
│   ├── requests/        # Borrow request module
│   └── returns/         # Return management module
├── seeds/               # Database seeding
├── app.module.ts
└── main.ts
```

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
