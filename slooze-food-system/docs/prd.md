# Product Requirements Document (PRD)

## Slooze Food Ordering System

---

# 1. Product Overview

Slooze is an internal web-based **food ordering platform** designed for employees across multiple regions.

The system allows users to:

* Discover restaurants
* Browse menus
* Create food orders
* Manage order lifecycle

The platform enforces strict:

* **Role-Based Access Control (RBAC)**
* **Regional Data Isolation**

This ensures that employees can only interact with resources and orders **within their authorized scope**.

---

# 2. Product Vision

To build a **secure, scalable internal food ordering platform** that demonstrates modern backend architecture principles including:

* RBAC authorization
* Multi-tenant regional data isolation
* Modular backend architecture
* Type-safe full-stack development

---

# 3. Target Users

The system has three user roles.

| Role    | Description                     |
| ------- | ------------------------------- |
| Admin   | Global system administrator     |
| Manager | Regional operations manager     |
| Member  | Regular employee placing orders |

---

# 4. Regions

The system operates across **multiple geographic regions**.

Initial regions:

| Region  |
| ------- |
| India   |
| America |

Each user belongs to **exactly one region**.

---

# 5. Personas

Example users used in seed data.

| User            | Role    | Region  |
| --------------- | ------- | ------- |
| Nick Fury       | Admin   | Global  |
| Captain Marvel  | Manager | India   |
| Captain America | Manager | America |
| Thanos          | Member  | India   |
| Thor            | Member  | India   |
| Travis          | Member  | America |

---

# 6. Role-Based Access Control (RBAC)

Permissions are enforced through **NestJS Guards and JWT claims**.

| Feature               | Admin | Manager | Member |
| --------------------- | ----- | ------- | ------ |
| View Restaurants      | ✅     | ✅       | ✅      |
| View Menu             | ✅     | ✅       | ✅      |
| Create Order          | ✅     | ✅       | ✅      |
| Checkout Order        | ✅     | ✅       | ❌      |
| Cancel Order          | ✅     | ✅       | ❌      |
| Update Payment Method | ✅     | ❌       | ❌      |

---

# 7. Regional Data Isolation

Managers and Members can only access data belonging to **their region**.

Example:

India users cannot see:

* America restaurants
* America orders
* America users

Admin users have **global access**.

Isolation is enforced through:

* JWT region claim
* Backend query filtering
* Prisma ORM constraints

---

# 8. Core Functional Features

## 8.1 Authentication

Users authenticate using:

* Email
* Password

Authentication uses:

* JWT tokens
* bcrypt password hashing

JWT payload contains:

```
userId
role
region_id
```

---

# 8.2 Restaurant Discovery

Users can view available restaurants within their region.

Information displayed:

* Restaurant name
* Available menus
* Menu items
* Price

---

# 8.3 Menu Browsing

Users can browse:

* Restaurant menus
* Menu items
* Pricing

Menu items include:

* Name
* Price
* Availability

---

# 8.4 Cart Management

Users can add items to a **cart before placing an order**.

Supported operations:

* Add item
* Remove item
* Update quantity
* View total price

---

# 8.5 Order Creation

Users create orders by selecting menu items.

Order contains:

* Order items
* Total price
* Order status

---

# 8.6 Checkout

Only **Admin and Manager** roles can checkout orders.

Checkout performs:

* Payment confirmation
* Order status update

---

# 8.7 Order Cancellation

Orders can be cancelled before completion.

Permissions:

| Role    | Cancel Order |
| ------- | ------------ |
| Admin   | Yes          |
| Manager | Yes          |
| Member  | No           |

---

# 9. Order Lifecycle

Orders follow a defined state machine.

```
CART
   ↓
PENDING_PAYMENT
   ↓
CONFIRMED
   ↓
DELIVERED
```

Cancellation state:

```
CANCELLED
```

---

# 10. Non-Functional Requirements

## 10.1 Security

Security features include:

* JWT authentication
* RBAC authorization
* Region-based access control
* Password hashing using bcrypt

---

## 10.2 Data Integrity

Data integrity is ensured through:

* relational database constraints
* Prisma schema relations
* strict TypeScript typing

---

## 10.3 Observability

The system logs critical events including:

* Order creation
* Order cancellation
* Checkout actions
* Unauthorized access attempts

---

## 10.4 API Documentation

All APIs are documented using:

```
Swagger / OpenAPI
```

Accessible at:

```
/api/docs
```

---

# 11. Technical Architecture

The application follows a **modular full-stack architecture**.

```
Client (Next.js)
      │
      ▼
NestJS API Server
      │
      ▼
PostgreSQL Database
```

---

# 12. Technology Stack

| Layer             | Technology           |
| ----------------- | -------------------- |
| Frontend          | Next.js (TypeScript) |
| Backend           | NestJS (TypeScript)  |
| Database          | PostgreSQL           |
| ORM               | Prisma               |
| Authentication    | JWT                  |
| Styling           | TailwindCSS          |
| UI Components     | Shadcn UI            |
| State Management  | Zustand              |
| API Data Fetching | React Query          |
| Infrastructure    | Docker               |

---

# 13. Backend Module Architecture

Backend follows **NestJS modular design**.

```
backend/src

auth
users
restaurants
menu
orders
payments
common
prisma
```

Each module contains:

```
controller
service
dto
```

---

# 14. Database Schema Overview

Main database entities:

| Entity      | Purpose             |
| ----------- | ------------------- |
| Regions     | Geographic regions  |
| Roles       | User roles          |
| Users       | Platform users      |
| Restaurants | Food providers      |
| MenuItems   | Restaurant menu     |
| Orders      | Customer orders     |
| OrderItems  | Items inside orders |
| Payments    | Payment details     |

---

# 15. API Endpoints

### Auth

```
POST /auth/register
POST /auth/login
```

---

### Restaurants

```
GET /restaurants
GET /restaurants/:id
GET /restaurants/:id/menu
```

---

### Orders

```
POST /orders
GET /orders
GET /orders/:id
POST /orders/:id/checkout
POST /orders/:id/cancel
```

---

### Payments

```
PATCH /payments/update-method
```

(Admin only)

---

# 16. Frontend Architecture

Frontend uses **Next.js App Router**.

Main pages:

```
/login
/restaurants
/restaurants/[id]
/cart
/checkout
/orders
/admin
```

Reusable components:

```
Navbar
Sidebar
RestaurantCard
MenuItemCard
CartDrawer
OrderTable
```

---

# 17. Infrastructure & DevOps

The system runs in **Docker containers**.

Services include:

```
frontend
backend
postgres
```

Containers are orchestrated using:

```
docker-compose
```

---

# 18. Development Environment

Developers run the system using:

```
docker compose up --build
```

This starts:

* Next.js frontend
* NestJS backend
* PostgreSQL database

---

# 19. Success Criteria

The project is considered complete when the following are implemented:

| Category                  | Points |
| ------------------------- | ------ |
| Full Stack Implementation | 12     |
| RBAC Logic                | 8      |
| Relational Access Model   | 10     |

Total:

```
30 points
```

---

# 20. Expected Outcomes

This project demonstrates:

* Full-stack TypeScript development
* RBAC implementation
* Multi-tenant data isolation
* Production-ready backend architecture
* Containerized deployment

The system serves as a **portfolio-quality backend architecture project**.
