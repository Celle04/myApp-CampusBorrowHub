# Decisions

## Decision Log

- Decision: Use NestJS with TypeORM and JWT-based authentication.
- Date: 2026-04
- Context: existing codebase structure and campus equipment management requirements.
- Alternatives considered: custom Express app, session-based auth.
- Outcome: NestJS chosen for modularity, TypeORM for database consistency, JWT for stateless auth.

## Rationale

- Why this decision was made: the codebase already uses NestJS modules and TypeORM, which supports rapid development and clear separation of concerns.
- Impact: simplifies future feature development and testing, and supports role-based guards.

## Notes

- Follow-up actions: verify request approval and return workflows in code coverage.
- Dependencies: database schema, JWT secret configuration, role guard implementation.
