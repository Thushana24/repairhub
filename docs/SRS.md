# RepairHub: Facility Maintenance Management System

**Software Requirements Specification (SRS), Version 1.1**

- Project type: Industrial Training / Portfolio Project (solo)
- Methodology: Agile (Scrum-style, 4 sprints of 1 week)
- Branching: GitHub Flow (`main` protected, short-lived `feature/*` branches, pull requests)
- Status: Phase 2 (Requirements), revised

---

## 1. Introduction

### 1.1 Purpose
This document defines the functional and non-functional requirements of **RepairHub**, a web-based system for managing maintenance requests in residential and commercial buildings. It is the single source of truth for design, development, and testing.

### 1.2 Problem Statement
In large buildings, repair requests are handled through phone calls and WhatsApp messages. Requests are lost, responsibility is unclear, response times are not measured, and managers have no reporting.

### 1.3 Project Goal
Provide a platform where tenants submit repair requests, supervisors assign technicians, technicians update progress, and administrators monitor performance, with a full audit trail of every change.

### 1.4 Scope
**In scope (MVP):** authentication and RBAC, building and unit management, maintenance request lifecycle, photo upload, assignment, status history, comments, ratings, dashboard, testing, CI, API documentation, deployment.

**Stretch scope:** Arabic/English with RTL, real-time notifications, PDF export.

**Out of scope:** payments, billing, native mobile app, AI features, multi-company (multi-tenant SaaS) support.

### 1.5 Definitions
| Term | Meaning |
|---|---|
| Ticket / Request | A maintenance job raised by a tenant |
| RBAC | Role-Based Access Control |
| SLA | Target time to resolve a request |
| MoSCoW | Priority scale: Must, Should, Could, Won't |
| DoD | Definition of Done |

---

## 2. Overall Description

### 2.1 User Roles
| Role | Description | Key permissions |
|---|---|---|
| **Tenant** | Resident or occupant of a unit | Create and track own requests, comment, rate |
| **Supervisor** | Operations staff | View all requests, assign and reassign technicians, comment |
| **Technician** | Field worker | View assigned jobs, update status, add notes |
| **Admin** | System owner | Manage users, buildings, units, view all reports |

### 2.2 Assumptions and Constraints
- One organization only (single tenant system).
- Free-tier hosting for the demo (so images must use external storage).
- Development time: 4 weeks, solo developer, about 2 to 3 hours per day.
- Stack is fixed: React, TypeScript, Node.js, Express, Prisma, PostgreSQL.

---

## 3. Functional Requirements

Priority uses MoSCoW.

### 3.1 Authentication and User Management
| ID | Requirement | Priority |
|---|---|---|
| FR-1 | Users log in with email and password | Must |
| FR-2 | Tenants join by **invitation**: Admin creates an invite (or a unit code) linked to a specific unit, and the tenant completes registration through it | Must |
| FR-3 | Admin creates Supervisor and Technician accounts with a temporary password; the user must change it on first login | Must |
| FR-4 | The system uses a short-lived JWT access token and a refresh token stored in an httpOnly cookie | Must |
| FR-5 | Every API endpoint enforces role permissions on the server (RBAC middleware) | Must |
| FR-6 | Users can view and edit their profile and change their password | Should |
| FR-7 | Admin can deactivate a user (soft deactivation, no hard delete) | Should |

### 3.2 Buildings and Units
| ID | Requirement | Priority |
|---|---|---|
| FR-8 | Admin can create, edit, and **deactivate** Buildings and Units (soft delete using `isActive`) | Must |
| FR-9 | Admin can link a Tenant to a Unit | Must |

### 3.3 Maintenance Requests
| ID | Requirement | Priority |
|---|---|---|
| FR-10 | Tenant creates a request with title, category, priority, description, and up to 3 photos | Must |
| FR-11 | Tenant views and tracks only their own requests | Must |
| FR-12 | Tenant can cancel a request while its status is Submitted | Should |
| FR-13 | Supervisor and Admin view all requests with **server-side** search, filters (status, priority, building, category, technician), sorting, and pagination | Must |
| FR-14 | Supervisor assigns a request to a Technician | Must |
| FR-15 | Supervisor can reassign a request to another Technician; the change is recorded | Must |
| FR-16 | Technician views assigned jobs and updates status (In Progress, Completed) with notes | Must |
| FR-17 | Status transitions are enforced by a single **state machine** function on the server | Must |
| FR-18 | The system records a **status history** for every change (who, from, to, when, note) | Must |
| FR-19 | Users involved in a request can add comments | Should |
| FR-20 | Tenant rates a completed request (1 to 5 stars) with an optional review | Must |

### 3.4 Dashboard and Reports
| ID | Requirement | Priority |
|---|---|---|
| FR-21 | Admin and Supervisor dashboard shows totals, requests by status, by category, and by building | Must |
| FR-22 | Dashboard shows average resolution time, SLA breach count, and technician performance (jobs done, average rating) | Should |
| FR-23 | Technician dashboard shows their open and completed job counts | Could |

### 3.5 Stretch Features
| ID | Requirement | Priority |
|---|---|---|
| FR-24 | Arabic and English interface with RTL layout | Could |
| FR-25 | Real-time notifications for assignment and status changes (Socket.io) | Could |
| FR-26 | Export request reports as PDF | Could |

---

## 4. Business Rules

| ID | Rule |
|---|---|
| BR-1 | Allowed status flow: **Submitted -> Assigned -> In Progress -> Completed**. **Cancelled** is allowed only from Submitted. |
| BR-2 | Statuses cannot be skipped or reversed. |
| BR-3 | Only the currently assigned Technician can update a request's status. |
| BR-4 | A request can be rated only by its Tenant, only once, and only when Completed. |
| BR-5 | Priorities: Low, Medium, High, Urgent. |
| BR-6 | Categories: Plumbing, Electrical, AC/HVAC, Cleaning, Carpentry, Other. |
| BR-7 | SLA targets by priority: Urgent 4 hours, High 24 hours, Medium 72 hours, Low 7 days. |
| BR-8 | Buildings, units, and users are never hard-deleted if they have related requests. |
| BR-9 | A Tenant can create requests only for their own linked unit. |

---

## 5. Acceptance Criteria for Must Stories

Format: Given / When / Then.

**US-1: Tenant creates a request (FR-10)**
- Given I am logged in as a Tenant linked to a unit, when I submit a valid form, then the request is saved with status Submitted and appears in my list.
- Given I upload a file that is not JPG/PNG or is larger than 5 MB, when I submit, then I see a clear validation error and nothing is saved.
- Given I leave a required field empty, when I submit, then the field shows an error message and no API call is made.

**US-2: Role-based access (FR-5)**
- Given I am a Tenant, when I call a Supervisor-only endpoint, then I receive 403 Forbidden.
- Given I am not logged in, when I open a protected page, then I am redirected to login.

**US-3: Supervisor assigns a technician (FR-14, FR-15)**
- Given a request is Submitted, when the Supervisor selects an active Technician and confirms, then the status becomes Assigned and a history entry is created.
- Given a request is Assigned, when the Supervisor reassigns, then the new Technician is stored and the history shows both technicians.

**US-4: Technician updates status (FR-16, FR-17)**
- Given a request is Assigned to me, when I mark it In Progress, then the status changes and a history entry is created.
- Given a request is Submitted, when I try to mark it Completed, then the API rejects it with a 409 error and the status is unchanged.
- Given a request is assigned to another Technician, when I try to update it, then I receive 403 Forbidden.

**US-5: Tenant rates a job (FR-20)**
- Given my request is Completed and not yet rated, when I submit 1 to 5 stars, then the rating is saved.
- Given I already rated it, when I try again, then the API rejects it.

**US-6: Request search (FR-13)**
- Given 100 requests exist, when I filter by status and building, then only matching requests are returned, paginated 10 per page, with a total count.

**US-7: Dashboard (FR-21)**
- Given I am an Admin, when I open the dashboard, then I see totals and charts calculated by the server using aggregate queries.

---

## 6. Non-Functional Requirements

| Area | Requirement |
|---|---|
| **Security** | Passwords hashed with bcrypt; JWT expiry; refresh token in httpOnly, Secure, SameSite cookie; Zod validation on every input; rate limiting on auth routes; Helmet and strict CORS; no secrets in the repository |
| **Performance** | Main pages load in under 3 seconds; all lists paginated; database indexes on status, buildingId, assignedToId, createdAt |
| **Usability** | Responsive (mobile and desktop); light and dark theme; loading, empty, and error states on every page; accessible forms with labels |
| **Reliability** | Consistent API error format `{ success, message, errors }`; database transactions for status change plus history; centralized error handler |
| **Maintainability** | TypeScript everywhere; Zod schemas shared between client and server; feature-based folder structure; ESLint and Prettier; conventional commits |
| **Data integrity** | Prisma migrations; foreign keys; soft delete; seed script with demo data |
| **File upload** | JPG/PNG only, max 5 MB, validated on the server, stored in Cloudinary |
| **Observability** | Request logging (morgan or pino); health-check endpoint |
| **Deployment** | Frontend on Vercel, backend on Render, PostgreSQL on Neon or Supabase; environment variables for all config |

---

## 7. Quality Assurance Requirements

| ID | Requirement |
|---|---|
| QA-1 | Unit tests for the status state machine and business rules (Vitest or Jest) |
| QA-2 | API integration tests with Supertest for auth, tickets, and RBAC |
| QA-3 | Minimum 60 percent coverage on backend services |
| QA-4 | GitHub Actions pipeline on every pull request: install, lint, type-check, test, build |
| QA-5 | API documented with Swagger/OpenAPI |
| QA-6 | Seed script creates one demo account per role plus sample buildings and requests, listed in the README |
| QA-7 | A manual test checklist (test cases table) for the main user flows |

---

## 8. Engineering Practices

- **Git workflow (GitHub Flow):** `main` is protected and always deployable. Every change is made on a short-lived `feature/*`, `fix/*`, or `docs/*` branch and merged through a pull request (squash and merge), then the branch is deleted.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).
- **Project board:** GitHub Projects with columns Backlog, Sprint, In Progress, Review, Done. Every user story is an issue with a priority label (`must`, `should`, `could`) and a sprint milestone, linked to its pull request with `Closes #<issue>`.
- **Documentation folder `/docs`:** SRS, ER diagram, architecture notes, API docs, test cases.
- **Definition of Done:** code merged via pull request, validated with Zod, covered by tests where required, CI green, no TypeScript or lint errors, documented if it adds an endpoint.

---

## 9. Sprint Plan (4 weeks)

| Sprint | Week | Goal | Included requirements |
|---|---|---|---|
| **0** | Days 1 to 2 | Setup | Repo, workspaces (client, server, shared), ESLint, Prettier, Prisma, CI skeleton, project board |
| **1** | 1 | Foundation and auth | FR-1 to FR-5, FR-8, FR-9, QA-1 setup, seed script |
| **2** | 2 | Core requests | FR-10 to FR-18, QA-1, QA-2 |
| **3** | 3 | Value features | FR-19 to FR-22, QA-3 to QA-5 |
| **4** | 4 | Delivery | Deployment, README with screenshots and demo link, bug fixing, stretch features (FR-24 to FR-26) if time allows |

**Priority cut rule:** if time is short, drop Could items first, then Should items. Never drop Must items, tests, or deployment.

---

## 10. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Scope creep | Project unfinished | Freeze scope after this document; new ideas go to the backlog |
| Free hosting sleeps or limits | Slow demo | Use health-check pings; mention cold start in the README |
| Image storage on disk is lost on redeploy | Broken photos | Use Cloudinary from day one |
| Time lost on documents | Less code | Keep docs lightweight, maximum 2 to 3 days total |
| Complex features late | Poor quality | Build the state machine and RBAC early (Sprints 1 and 2) |

---

## 11. Traceability (summary)

| Business need | Requirements | Verified by |
|---|---|---|
| Secure access by role | FR-1 to FR-5 | US-2, QA-2 |
| Track repair lifecycle | FR-10 to FR-18 | US-1, US-3, US-4, QA-1 |
| Measure service quality | FR-20 to FR-22 | US-5, US-7 |
| Professional delivery | QA-1 to QA-7, Section 8 | CI pipeline, README |

---

## 12. Approval and Change Log

This SRS is frozen for Sprint 0 once approved. Changes after approval are handled as backlog items and logged below.

| Version | Change |
|---|---|
| 1.0 | First draft |
| 1.1 | Invite-based registration, soft delete, Cloudinary, status history as Must, state machine, QA requirements, acceptance criteria, risks, traceability |
| 1.1 (RepairHub) | Renamed project to RepairHub, switched Git workflow to GitHub Flow (`main` plus short-lived branches) |