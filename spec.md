# Campus BorrowHub - System Specification

## 1. Introduction

### 1.1 Purpose
Campus BorrowHub is a comprehensive web-based system designed to streamline the management of equipment borrowing and lending processes at university campuses. The system facilitates efficient resource utilization, reduces equipment loss, and provides a user-friendly interface for students, staff, and administrators to interact with the equipment inventory.

### 1.2 Scope
The system covers:
- User authentication and authorization with role-based access control
- Equipment catalog management with detailed item information
- Borrow request submission, approval, and tracking
- Equipment return processing and condition reporting
- Real-time inventory tracking and availability checking
- Administrative oversight and reporting capabilities

### 1.3 Target Users
- **Students**: Can browse equipment, submit borrow requests, and return items
- **Staff**: Can approve/reject requests, manage equipment, and oversee operations
- **Administrators**: Full system access including user management, system configuration, and reporting

## 2. System Architecture

### 2.1 Technology Stack
- **Backend Framework**: NestJS (Node.js)
- **Programming Language**: TypeScript
- **Database**: MySQL with TypeORM ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: class-validator and class-transformer
- **Security**: bcrypt for password hashing
- **Testing Framework**: Jest
- **API Documentation**: Swagger/OpenAPI (planned)

### 2.2 System Components
- **Authentication Module**: Handles user registration, login, and JWT token management
- **Equipment Module**: Manages equipment catalog, inventory, and item details
- **Requests Module**: Processes borrow requests, approvals, and status tracking
- **Returns Module**: Handles equipment return processing and condition assessment
- **Core Module**: Application configuration, database connections, and shared services

## 3. Functional Requirements

### 3.1 User Management
#### 3.1.1 User Registration
- Students and staff can register with email, password, and basic profile information
- Email verification for account activation
- Role assignment during registration or by administrators

#### 3.1.2 Authentication
- Secure login with email/password
- JWT token-based session management
- Password reset functionality
- Automatic logout on token expiration

#### 3.1.3 Authorization
- Role-based access control (Student, Staff, Administrator)
- Permission-based feature access
- API endpoint protection with guards

### 3.2 Equipment Management
#### 3.2.1 Equipment Catalog
- Add, update, delete equipment items
- Equipment categories and subcategories
- Detailed item descriptions, specifications, and images
- Quantity tracking and availability status

#### 3.2.2 Inventory Control
- Real-time stock level monitoring
- Low stock alerts for administrators
- Equipment status tracking (Available, Borrowed, Maintenance, Lost)

#### 3.2.3 Equipment Search and Filtering
- Search by name, category, or keywords
- Filter by availability, category, or location
- Advanced search with multiple criteria

### 3.3 Borrow Request Management
#### 3.3.1 Request Submission
- Students can browse available equipment
- Request form with date range selection
- Quantity specification for bulk requests
- Request validation against availability

#### 3.3.2 Request Processing
- Automatic availability checking
- Request status: Pending, Approved, Rejected, Cancelled
- Staff approval workflow with comments
- Email notifications for status changes

#### 3.3.3 Request Tracking
- Request history for users
- Status updates and timeline
- Request modification and cancellation

### 3.4 Return Management
#### 3.4.1 Return Processing
- Return request submission by borrowers
- Equipment condition assessment
- Damage reporting and documentation
- Return confirmation and inventory update

#### 3.4.2 Condition Reporting
- Pre-defined condition categories (Excellent, Good, Fair, Poor)
- Detailed damage description and photos
- Automatic charge calculation for damages
- Maintenance request generation for damaged items

### 3.5 Administrative Features
#### 3.5.1 User Management
- View all users and their roles
- Role modification and account deactivation
- Bulk user operations

#### 3.5.2 System Reporting
- Equipment utilization reports
- Borrow request statistics
- User activity logs
- Inventory status reports

#### 3.5.3 System Configuration
- Equipment categories management
- System settings and policies
- Notification templates

## 4. Data Models

### 4.1 User Entity
```typescript
{
  id: number;
  email: string;
  password: string; // hashed
  firstName: string;
  lastName: string;
  role: UserRole; // STUDENT, STAFF, ADMIN
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.2 Equipment Entity
```typescript
{
  id: number;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  totalQuantity: number;
  availableQuantity: number;
  imageUrl?: string;
  specifications: object; // JSON object
  location: string;
  status: EquipmentStatus; // AVAILABLE, MAINTENANCE, RETIRED
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.3 BorrowRequest Entity
```typescript
{
  id: number;
  userId: number;
  equipmentId: number;
  requestedQuantity: number;
  startDate: Date;
  endDate: Date;
  status: RequestStatus; // PENDING, APPROVED, REJECTED, CANCELLED, COMPLETED
  approvedBy?: number; // staff/admin user id
  approvedAt?: Date;
  rejectionReason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.4 Return Entity
```typescript
{
  id: number;
  borrowRequestId: number;
  returnedQuantity: number;
  returnDate: Date;
  condition: EquipmentCondition; // EXCELLENT, GOOD, FAIR, POOR
  damageDescription?: string;
  damagePhotos?: string[]; // array of URLs
  charges?: number;
  processedBy: number; // staff/admin user id
  notes?: string;
  createdAt: Date;
}
```

## 5. API Endpoints

### 5.1 Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Token refresh
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset confirmation

### 5.2 Equipment Endpoints
- `GET /equipment` - List equipment with filtering/pagination
- `GET /equipment/:id` - Get equipment details
- `POST /equipment` - Create new equipment (Staff/Admin)
- `PUT /equipment/:id` - Update equipment (Staff/Admin)
- `DELETE /equipment/:id` - Delete equipment (Admin)
- `GET /equipment/categories` - Get equipment categories

### 5.3 Request Endpoints
- `GET /requests` - List user's requests
- `GET /requests/:id` - Get request details
- `POST /requests` - Create new request
- `PUT /requests/:id/cancel` - Cancel request
- `GET /requests/pending` - List pending requests (Staff/Admin)
- `PUT /requests/:id/approve` - Approve request (Staff/Admin)
- `PUT /requests/:id/reject` - Reject request (Staff/Admin)

### 5.4 Return Endpoints
- `GET /returns` - List user's returns
- `POST /returns` - Submit return request
- `PUT /returns/:id/process` - Process return (Staff/Admin)
- `GET /returns/pending` - List pending returns (Staff/Admin)

### 5.5 Administrative Endpoints
- `GET /admin/users` - List all users
- `PUT /admin/users/:id/role` - Update user role
- `GET /admin/reports/*` - Various system reports

## 6. User Stories

### 6.1 Student User Stories
- As a student, I want to browse available equipment so I can see what's available to borrow
- As a student, I want to submit a borrow request with specific dates so I can reserve equipment
- As a student, I want to track my request status so I know when my request is approved
- As a student, I want to submit a return request so I can return borrowed equipment
- As a student, I want to view my borrowing history so I can see past activities

### 6.2 Staff User Stories
- As staff, I want to review pending requests so I can approve or reject them
- As staff, I want to add new equipment to the system so the catalog stays current
- As staff, I want to process returns and assess equipment condition so I can maintain inventory accuracy
- As staff, I want to generate reports on equipment utilization so I can make informed decisions

### 6.3 Administrator User Stories
- As an administrator, I want to manage user roles so I can control system access
- As an administrator, I want to configure equipment categories so the system stays organized
- As an administrator, I want to view comprehensive system reports so I can monitor overall usage
- As an administrator, I want to manage system settings so I can customize the application

## 7. Non-Functional Requirements

### 7.1 Performance
- Response time < 2 seconds for API calls
- Support for 1000+ concurrent users
- Database queries optimized for large datasets
- Image upload and processing within acceptable time limits

### 7.2 Security
- Password hashing with bcrypt
- JWT tokens with appropriate expiration
- Input validation and sanitization
- SQL injection prevention through ORM
- CORS configuration for web client access
- Rate limiting for API endpoints

### 7.3 Usability
- Intuitive user interface design
- Responsive design for mobile and desktop
- Clear error messages and validation feedback
- Multi-language support (future enhancement)
- Accessibility compliance (WCAG 2.1)

### 7.4 Reliability
- 99.9% uptime target
- Comprehensive error handling
- Database transaction management
- Automated backup procedures
- Graceful degradation during system failures

### 7.5 Maintainability
- Modular architecture with clear separation of concerns
- Comprehensive test coverage (unit, integration, e2e)
- Code documentation and API documentation
- Version control with Git
- CI/CD pipeline for automated testing and deployment

## 8. Future Enhancements

### 8.1 Planned Features
- Mobile application development
- Barcode/QR code integration for equipment tracking
- Integration with campus calendar systems
- Automated reminder notifications
- Advanced analytics and predictive maintenance
- Multi-campus support
- Equipment reservation system
- Integration with learning management systems

### 8.2 Technical Improvements
- Microservices architecture migration
- GraphQL API implementation
- Real-time notifications with WebSockets
- Advanced caching strategies
- Machine learning for demand prediction
- Containerization with Docker/Kubernetes

## 9. Test Case Templates

### 9.1 Unit Test Template

**Test Name**: [Descriptive name of what is being tested]

**Component**: [e.g., ItemsService, AuthService, EquipmentController]

**Input**: [Sample data or parameters passed to the function]

**Expected Result**: [What should happen - return value, state change, or error]

**Steps**:
1. [Set up test fixtures and mock dependencies]
2. [Call the function or method with input parameters]
3. [Assert the expected output or behavior]

**Example**:
```typescript
describe('EquipmentService', () => {
  describe('findById', () => {
    it('should return equipment when valid id is provided', () => {
      // Arrange
      const equipmentId = 1;
      const expectedEquipment = { id: 1, name: 'Laptop', category: 'Electronics' };
      
      // Act
      const result = equipmentService.findById(equipmentId);
      
      // Assert
      expect(result).toEqual(expectedEquipment);
    });
  });
});
```

### 9.2 Integration Test Template

**Test Name**: [Descriptive name of the API interaction being tested]

**Endpoint**: [e.g., POST /equipment, GET /requests/:id]

**Input**: [Request payload or query parameters]

**Expected Result**: [Response status code, response body structure, data validation]

**Steps**:
1. [Set up test database state]
2. [Make HTTP request to the endpoint with provided input]
3. [Verify response status code]
4. [Validate response body structure and data]
5. [Verify side effects (database changes, etc.)]

**Example**:
```typescript
describe('Equipment API Integration', () => {
  describe('POST /equipment', () => {
    it('should create equipment and return 201 status', async () => {
      // Arrange
      const createEquipmentDto = {
        name: 'Projector',
        category: 'Electronics',
        totalQuantity: 5
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/equipment')
        .send(createEquipmentDto)
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Projector');
    });
  });
});
```

### 9.3 End-to-End (E2E) Test Template

**Test Name**: [Descriptive name of the user journey]

**Scenario**: [User journey description - what the user is trying to accomplish]

**Steps**:
1. [User action - e.g., Navigate to login page]
2. [User action - e.g., Enter credentials and submit]
3. [System response - e.g., Redirect to dashboard]
4. [User action - e.g., Browse equipment catalog]
5. [User action - e.g., Submit borrow request]
6. [System response and validation]

**Expected Result**: [Final state - what should be displayed, data persisted, etc.]

**Example**:
```typescript
describe('Student Borrow Equipment Flow (E2E)', () => {
  it('should allow student to borrow equipment successfully', async () => {
    // Step 1: Student logs in
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'student@university.edu');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Step 2: Wait for dashboard
    await page.waitForURL('http://localhost:3000/dashboard');
    
    // Step 3: Student browses equipment
    await page.click('a[href="/equipment"]');
    const equipmentCount = await page.locator('.equipment-card').count();
    expect(equipmentCount).toBeGreaterThan(0);
    
    // Step 4: Student submits borrow request
    await page.click('.equipment-card:first-child');
    await page.fill('input[name="startDate"]', '2026-05-15');
    await page.fill('input[name="endDate"]', '2026-05-22');
    await page.fill('input[name="quantity"]', '1');
    await page.click('button:has-text("Request Equipment")');
    
    // Step 5: Verify success message
    const successMessage = await page.locator('.success-message');
    await expect(successMessage).toContainText('Request submitted successfully');
    
    // Step 6: Verify request appears in history
    await page.click('a[href="/my-requests"]');
    const requestRow = await page.locator('table tbody tr:first-child');
    await expect(requestRow).toContainText('Pending');
  });
});
```

## 10. Conclusion

Campus BorrowHub aims to revolutionize equipment management on university campuses by providing a robust, user-friendly platform that serves all stakeholders. The system is designed with scalability, security, and usability in mind, ensuring it can grow with the institution's needs while maintaining high standards of reliability and performance.

This specification serves as the foundation for development and will be updated as the project evolves and new requirements emerge.