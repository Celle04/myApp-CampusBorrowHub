# Campus BorrowHub Explanation Script

## Presentation Script

Good day. Our project is called Campus BorrowHub. It is a campus equipment borrowing management system designed to help schools organize how students request equipment, how staff review those requests, and how administrators monitor overall inventory and user activity.

The main problem this project solves is the difficulty of tracking borrowed equipment manually. In many schools, lending cameras, laptops, tools, or laboratory devices can become messy when requests, approvals, and returns are handled through paper forms or scattered messages. Campus BorrowHub centralizes that process into one system.

From a technical perspective, the project is built using NestJS and TypeScript on the backend. For data management, we use TypeORM with SQLite in the current implementation. Authentication is handled using JWT, and passwords are secured with bcrypt hashing. On the frontend side, the project uses static HTML, CSS, and JavaScript pages served directly by the NestJS application.

The system is organized into several main modules. First is the authentication module, which handles user registration, login, forgot password, and reset password. Second is the equipment module, which manages the equipment catalog including item name, category, description, quantity, specifications, status, and location. Third is the requests module, which allows users to submit borrow requests and allows staff or admins to approve or reject them. Fourth is the returns module, which records returned items, checks condition, and updates inventory. Fifth is the admin module, which gives administrators access to user management and system overview reports.

The application supports three roles. The student role is focused on browsing available equipment, submitting borrow requests, and returning approved items. The staff role can review pending requests, process returns, and maintain equipment records. The admin role has the highest level of access, including user role management, account activation or deactivation, and overview reporting.

In terms of workflow, the process starts when a user registers and logs in. After login, the system issues a JWT access token, which is stored in the browser and used to access protected endpoints. Once authenticated, the user is taken to the dashboard. The dashboard changes depending on the user role.

For equipment borrowing, a student can open the equipment section, view available items, and submit a borrow request with quantity, start date, end date, and notes. At this stage, the request is stored as pending. It is important to note that the available quantity is not reduced yet during submission. The quantity is only reduced once a staff member or administrator approves the request. This helps prevent inventory from being reserved unnecessarily before approval.

When staff or admin users open the pending requests section, they can review the request details and either approve or reject the request. If approved, the system updates the request status to approved, records who approved it and when, and subtracts the requested quantity from the available stock. If rejected, the system saves the rejection reason and any notes without changing inventory.

For returns, a borrower can submit a return only for a request that has already been approved. This creates a return record with the item condition, optional damage description, and notes. However, the inventory is still not increased immediately. The stock is only added back once a staff member or admin processes that return. During processing, the system marks the request as completed, restores the returned quantity to available inventory, and can also add extra charges if needed.

Another important part of the project is the admin overview report. The administrator can view summary data such as total users, active users, total equipment, available units, pending requests, approved requests, completed requests, total returns, and pending returns. The report also highlights low-stock equipment and recent activity across requests and returns. This gives the admin a quick operational view of the whole system.

On the frontend side, there are two main pages: the login and registration page, and the dashboard page. The login page supports sign in, account creation, and forgot password. The dashboard provides role-based sections for overview, equipment, requests, returns, and user management. The interface is simple but functional, and it communicates with the backend through REST API calls.

One strength of this project is that the business logic is clearly separated by module, which makes the system easier to maintain and extend. Another strength is that role-based guards are used to protect sensitive actions, so only authorized users can approve requests, manage equipment, or access administrative features.

At the same time, there are current limitations. The present implementation uses SQLite for local development instead of a production database setup. The forgot password flow currently logs the reset link to the console instead of sending a real email. Also, some user interactions on the dashboard use simple browser prompts, which are functional for demonstration but can still be improved into better form-based modals in a future version.

Overall, Campus BorrowHub demonstrates a complete borrowing lifecycle: authentication, equipment listing, request submission, approval, return submission, return processing, inventory updates, and administrative reporting. The project shows how a campus can manage shared equipment more efficiently, with better accountability, clearer workflows, and role-based access control.

Thank you.

## Short Version

Campus BorrowHub is a role-based campus equipment borrowing system. It was built with NestJS, TypeScript, TypeORM, SQLite, JWT authentication, and a simple static frontend. Students can request equipment, staff can approve requests and process returns, and admins can manage users and monitor system activity. A key part of the system is that stock only decreases after approval and only increases again after return processing, which keeps inventory tracking accurate. The project is modular, secure at the API level, and ready for future improvements such as email integration, stronger UI interactions, and production database deployment.

## Q and A Cues

- What problem does the project solve?
  It replaces manual or scattered borrowing processes with a centralized system for inventory, requests, approvals, and returns.

- Why did you use role-based access?
  Because students, staff, and admins have different responsibilities, and sensitive actions like approvals and user management should be restricted.

- How is inventory controlled?
  Inventory is reduced only when a request is approved and restored only when a return is processed.

- What database is used now?
  The current implementation uses SQLite through TypeORM for local development.

- What is one realistic limitation?
  Password reset currently logs the reset link in the server console instead of sending an email.
