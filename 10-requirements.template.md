# Requirements

## Business Requirements

- Students and staff must be able to request, approve, and return campus equipment through a digital system.
- The system must prevent borrowing of unavailable equipment and provide administrators with inventory oversight.

## Functional Requirements

- User registration and login with role-based access (Student, Staff, Administrator).
- Equipment catalog management: create, read, update, delete equipment items.
- Borrow request submission, approval/rejection workflow, and status tracking.
- Return processing with condition reporting and inventory reconciliation.

## Non-functional Requirements

- Performance: API responses should be responsive for typical campus workloads.
- Security: JWT authentication, password hashing, and role guards for protected operations.
- Usability: clear request and return workflows with validation feedback.
- Reliability: consistent inventory state, request status transitions, and transactional updates on approval/return.
