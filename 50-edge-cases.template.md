# Edge Cases

## Edge Case List

- Borrow requests for more units than are available.
- Duplicate or repeated requests for the same equipment item.
- Approval of requests that are already approved or rejected.
- Return of more units than were borrowed.
- Expired or invalid JWT tokens.

## Handling Strategies

- Validate request quantity against current availability and return 400 if invalid.
- Prevent duplicate approvals or rejection transitions with 409 Conflict.
- Reject returns where returnedQuantity exceeds borrowed quantity.
- Require token validation for all protected endpoints and return 401 for invalid tokens.

## Related risks

- Risk 1: inventory inconsistency if approvals or returns are processed twice.
- Risk 2: unauthorized role access if guards are misconfigured.
