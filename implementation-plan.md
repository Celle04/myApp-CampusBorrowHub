# Implementation Plan

## Overview

Implement the Campus BorrowHub specification by enhancing the existing NestJS backend with complete authentication, equipment management, borrow request workflows, and return processing.

## Steps

1. Review current modules and entities in `src/modules/`.
2. Confirm and extend DTO validation for auth, equipment, requests, and returns.
3. Implement or verify role-based guards in `auth/guards` for Student, Staff, and Admin actions.
4. Add or refine equipment service logic to enforce inventory and availability.
5. Add borrow request service logic to validate requested quantity, set pending status, and allow staff approval/rejection.
6. Add return service logic to validate returned quantity, record conditions, and update inventory.
7. Write or update unit tests for auth, equipment, request, and return flows.
8. Run end-to-end tests and manual API verification against the core workflows.

## Verification Steps

- Run `npm test` to verify unit tests pass.
- Run `npm run test:e2e` to verify end-to-end request and return workflows.
- Manually verify these flows using authenticated API calls:
  - register/login
  - add equipment
  - submit borrow request
  - approve request
  - submit return
- Confirm inventory updates correctly after approval and return.
