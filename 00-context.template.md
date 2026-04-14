# Context

## Overview

- Project name: Campus BorrowHub
- Stakeholders: university students, campus staff, equipment managers, administrators
- Audience: campus equipment borrowers and operations staff
- Business problem: manual equipment loans and return tracking lead to inventory errors, lost items, and slow approval workflows

## Background

- Existing systems: spreadsheets, email approvals, manual sign-out sheets
- Domain context: university campus equipment lending for students and staff, including labs, media, and event resources
- Constraints: NestJS backend, TypeORM data persistence, JWT authentication, role-based access control, MySQL/SQLite compatible database

## Goals

- Primary goal: deliver reliable borrow-request and return workflows with accurate inventory status
- Secondary goals: enforce role-based security, enable equipment management, and reduce manual processing
- Success criteria: working authenticated API endpoints, correct request approval flow, accurate inventory updates, and passing automated tests
