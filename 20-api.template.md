# API

## API Overview

- API purpose: provide authenticated equipment borrowing, approval, and return management for campus users.
- Base URL: http://localhost:3000

## Endpoints

### `POST /auth/register`
- Description: register a new user with role information.
- Request: `{ email, password, firstName, lastName, role }`
- Response: `{ id, email, firstName, lastName, role }`

### `POST /auth/login`
- Description: authenticate a user and return a JWT.
- Request: `{ email, password }`
- Response: `{ accessToken }`

### `GET /equipment`
- Description: list available equipment items.
- Request: optional query filters for category or availability.
- Response: list of equipment objects.

### `POST /equipment`
- Description: add a new equipment item (Staff/Admin only).
- Request: `{ name, description, category, totalQuantity, location, status }`
- Response: created equipment object.

### `POST /requests`
- Description: submit a borrow request for equipment.
- Request: `{ equipmentId, requestedQuantity, startDate, endDate, notes }`
- Response: created borrow request object.

### `PATCH /requests/:id/approve`
- Description: approve a pending borrow request (Staff/Admin only).
- Request: `{}`
- Response: updated request object.

### `POST /returns`
- Description: submit return details for a borrowed item.
- Request: `{ borrowRequestId, returnedQuantity, condition, damageDescription }`
- Response: created return record and updated equipment availability.

## Authentication

- Auth method: JWT bearer tokens
- Headers: `Authorization: Bearer <token>`

## Error handling

- Common errors: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict
- Response format: `{ statusCode, message, error }`
