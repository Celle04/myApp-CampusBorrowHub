# Invariants

## Data Invariants

- availableQuantity must always be less than or equal to totalQuantity for equipment.
- borrow request quantity must be positive and must not exceed availableQuantity at approval time.

## Business Rules

- Only Staff or Administrator roles may approve or reject borrow requests.
- Students may only create borrow requests and view their own request history.

## Consistency

- Equipment availability must be decremented when a request is approved and incremented when a return is processed.
- A borrow request status must follow a valid transition sequence: Pending → Approved/Rejected/Cancelled → Completed.
