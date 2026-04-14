# Acceptance Criteria

## Acceptance Criteria

- Users can register, authenticate, and receive a JWT token.
- Staff/Admin users can add and manage equipment items.
- Students can submit borrow requests and view request status.
- Staff/Admin users can approve or reject pending borrow requests.
- Returned equipment updates inventory and records condition.
- Requests are rejected when equipment is not available.

## Testing

- Test case 1: successful user registration and login returns a valid token.
- Test case 2: equipment CRUD operations are allowed only for authorized roles.
- Test case 3: borrow request approval decreases available quantity.
- Test case 4: return processing increases available quantity and stores condition data.

## Definition of Done

- Delivered features: auth, equipment management, request workflow, returns workflow.
- Verification steps:
  1. Run `npm test` and confirm unit tests pass.
  2. Run `npm run test:e2e` and confirm end-to-end coverage for core flows.
  3. Manually verify API flows using authenticated requests.
