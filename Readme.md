<div align="center">

<br/>

```
 ___  _                    
/ __|| | ___  ___  ____  ___ 
\__ \| |/ _ \/ _ \|_  / / -_)
|___/|_|\___/\___/ /__| \___|
```

### 🍽️ Internal Food Ordering Platform

**Role-Based · Region-Isolated · Production-Ready**

<br/>

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15.x-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://prisma.io/)

<br/>

> *A full-stack, containerized food ordering system with JWT authentication,  
> role-based access control, and strict multi-region data isolation.*

<br/>

[🚀 Quick Start](#-quick-start) · [🏗️ Architecture](#️-architecture) · [📡 API Reference](#-api-reference) · [👥 Roles & Permissions](#-roles--permissions) · [🌍 Region Isolation](#-region-isolation)

---

</div>

<br/>

## ✨ What is Slooze?

**Slooze** is a secure internal food ordering platform built for organizations operating across multiple geographic regions. Employees discover restaurants, browse menus, and place orders — all within the boundaries of their authorized region.

It's not just a CRUD app. It's a showcase of **enterprise-grade backend architecture**:

- 🔐 **JWT Authentication** with role-embedded claims
- 🛡️ **RBAC** enforced at the guard level (not just the UI)
- 🌍 **Regional data isolation** — cross-region leakage is architecturally impossible
- 🧩 **Modular NestJS** design for maintainability at scale
- 🐳 **One-command Docker deployment**

<br/>

---

## 🗂️ Project Structure

```
slooze/
├── 🐳  docker-compose.yml          # Orchestrates all services
├── 📦  package.json
├── 📄  prisma/                     # Root-level Prisma schema & migrations
│
├── 🖥️  apps/
│   ├── backend/                    # NestJS API Server (port 3001)
│   │   ├── src/
│   │   │   ├── auth/               # JWT auth, guards, strategies
│   │   │   ├── users/              # User management
│   │   │   ├── restaurants/        # Restaurant discovery
│   │   │   ├── menu/               # Menu items
│   │   │   ├── orders/             # Order lifecycle
│   │   │   ├── payments/           # Payment method management
│   │   │   ├── common/             # Shared guards, decorators, pipes
│   │   │   └── prisma/             # Database service
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       └── seed.ts             # Demo data seeder
│   │
│   └── frontend/                   # Next.js App (port 3000)
│       └── src/
│           ├── app/                # App Router pages
│           │   ├── (dashboard)/    # Authenticated layout
│           │   ├── login/
│           │   └── register/
│           ├── components/         # UI components
│           └── lib/                # API client, Zustand store
│
└── 📚  docs/
    └── prd.md                      # Full Product Requirements Document
```

<br/>

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Docker | 24+ |
| Docker Compose | v2+ |

### One-Command Launch

```bash
# Clone the repository
git clone https://github.com/your-org/slooze.git
cd slooze

# Build and start all services
docker compose up --build
```

That's it. The following services will be running:

| Service | URL | Description |
|---------|-----|-------------|
| 🖥️ Frontend | http://localhost:3000 | Next.js web app |
| ⚙️ Backend API | http://localhost:3001 | NestJS REST API |
| 📖 API Docs | http://localhost:3001/api/docs | Swagger UI |
| 🗄️ PostgreSQL | localhost:5432 | Database |

<br/>

> **Database is auto-seeded** with demo users, restaurants, and menu items on first boot.

<br/>

### Local Development (without Docker)

```bash
# Backend
cd apps/backend
npm install
# Set DATABASE_URL in .env
npx prisma migrate dev
npx prisma db seed
npm run start:dev

# Frontend (new terminal)
cd apps/frontend
npm install
npm run dev
```

<br/>

---

## 👥 Roles & Permissions

Slooze implements **three distinct user roles**, each with carefully scoped access:

```
┌─────────────────────────────────────────────────────────────┐
│                    PERMISSION MATRIX                         │
├────────────────────────┬───────┬─────────┬──────────────────┤
│ Feature                │ Admin │ Manager │ Member           │
├────────────────────────┼───────┼─────────┼──────────────────┤
│ View Restaurants       │  ✅   │   ✅    │   ✅             │
│ View Menu Items        │  ✅   │   ✅    │   ✅             │
│ Create Orders          │  ✅   │   ✅    │   ✅             │
│ View Own Orders        │  ✅   │   ✅    │   ✅             │
│ View Region Orders     │  ✅   │   ✅    │   ❌             │
│ View All Orders        │  ✅   │   ❌    │   ❌             │
│ Checkout Orders        │  ✅   │   ✅    │   ❌             │
│ Cancel Orders          │  ✅   │   ✅    │   ❌             │
│ Update Payment Method  │  ✅   │   ❌    │   ❌             │
│ Global Region Access   │  ✅   │   ❌    │   ❌             │
└────────────────────────┴───────┴─────────┴──────────────────┘
```

<br/>

---

## 🌍 Region Isolation

Every user belongs to exactly one region. **Regional boundaries are enforced on the backend** — the frontend cannot bypass them.

```
┌──────────────────────────────────────────────────────────┐
│                      REGIONS                             │
│                                                          │
│  ┌─────────────────────┐   ┌─────────────────────────┐  │
│  │      🇮🇳 INDIA        │   │      🇺🇸 AMERICA          │  │
│  ├─────────────────────┤   ├─────────────────────────┤  │
│  │ 🏪 Delhi Dhaba       │   │ 🍔 American Burgers      │  │
│  │    Butter Chicken    │   │    Cheeseburger          │  │
│  │    Naan              │   │    Fries                 │  │
│  ├─────────────────────┤   ├─────────────────────────┤  │
│  │ 👤 Captain Marvel    │   │ 👤 Captain America       │  │
│  │    (Manager)         │   │    (Manager)             │  │
│  │ 👤 Thanos (Member)   │   │ 👤 Travis (Member)       │  │
│  │ 👤 Thor (Member)     │   │                         │  │
│  └─────────────────────┘   └─────────────────────────┘  │
│                                                          │
│              🌐 GLOBAL — Nick Fury (Admin)               │
│                   sees everything                        │
└──────────────────────────────────────────────────────────┘
```

Region isolation is enforced through:
1. **JWT payload** — `regionId` is embedded at login time
2. **Backend query filters** — Prisma `where` clauses always scope to the user's region
3. **Guard layer** — `RolesGuard` + `JwtAuthGuard` block unauthorized access at the controller level

<br/>

---

## 🔐 Authentication Flow

```
Client                    Backend                     Database
  │                          │                            │
  │──── POST /auth/login ───►│                            │
  │      { email, password } │                            │
  │                          │──── findUnique(email) ────►│
  │                          │◄─── User record ───────────│
  │                          │                            │
  │                          │  bcrypt.compare(password)  │
  │                          │                            │
  │                          │  sign({ sub, email,        │
  │                          │         role, regionId })  │
  │                          │                            │
  │◄─── { access_token } ───│                            │
  │                          │                            │
  │  (subsequent requests)   │                            │
  │──── Bearer <token> ─────►│                            │
  │                          │  JwtStrategy.validate()    │
  │                          │  RolesGuard.canActivate()  │
  │                          │  RegionFilter applied      │
  │◄─── Protected data ──────│                            │
```

<br/>

---

## 🛒 Order Lifecycle

Orders follow a strict state machine:

```
                  ┌──────────────────────────────────────┐
                  │                                      │
  Add items ──► CART ──► PENDING_PAYMENT ──► CONFIRMED ──► DELIVERED
                  │                                      │
                  └──────────────────── CANCELLED ◄──────┘
                                          (any stage
                                       before DELIVERED)
```

| Transition | Who Can Trigger |
|-----------|----------------|
| `CART` → `CONFIRMED` | Admin, Manager (via checkout) |
| Any → `CANCELLED` | Admin, Manager |

<br/>

---

## 📡 API Reference

### Authentication
```http
POST   /auth/register         # Create new account
POST   /auth/login            # Get JWT access token
```

### Restaurants
```http
GET    /restaurants           # List (region-filtered)
GET    /restaurants/:id       # Get with menu items
GET    /restaurants/:id/menu  # Menu items only
```

### Orders
```http
POST   /orders                # Create order from cart
GET    /orders                # List (role + region filtered)
GET    /orders/:id            # Get single order
POST   /orders/:id/checkout   # Confirm order [Admin, Manager]
POST   /orders/:id/cancel     # Cancel order  [Admin, Manager]
```

### Payments
```http
PATCH  /payments/update-method   # Update payment method [Admin only]
```

> 📖 Full interactive documentation at `/api/docs` (Swagger UI)

<br/>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Next.js 15 (App Router)                             │   │
│  │  ├── Zustand (state)                                 │   │
│  │  ├── React Query (server state)                      │   │
│  │  ├── Tailwind CSS + shadcn/ui (styling)              │   │
│  │  └── Axios (HTTP client w/ JWT interceptor)          │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP / REST
┌──────────────────────────▼──────────────────────────────────┐
│                    NestJS API (port 3001)                     │
│  ┌───────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Auth     │  │  Guards      │  │  Modules             │  │
│  │  JWT      │  │  JwtAuth     │  │  restaurants/        │  │
│  │  Passport │  │  Roles       │  │  orders/             │  │
│  │  bcrypt   │  │              │  │  payments/           │  │
│  └───────────┘  └──────────────┘  └──────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Prisma ORM                                          │   │
│  └──────────────────────────┬───────────────────────────┘   │
└──────────────────────────────┼──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│              PostgreSQL 15 (port 5432)                       │
│  Regions · Users · Restaurants · MenuItems                   │
│  Orders · OrderItems · Payments                              │
└─────────────────────────────────────────────────────────────┘
```

<br/>

---

## 🗄️ Database Schema

```
Region ──┬──< Restaurant ──< MenuItem ──< OrderItem >──┐
         │                                              │
         └──< User ──────────────────────< Order >─────┘
                                              │
                                         Payment (1:1)
```

Key design decisions:
- `regionId` on both `User` and `Restaurant` enables clean isolation queries
- `OrderItem.price` is snapshotted at order time (price changes don't affect history)
- `Payment` is cascade-deleted with its `Order`
- `OrderItem` cascade-deletes with its `Order`

<br/>

---

## 🧪 Demo Accounts

All accounts use password: **`password123`**

| Name | Email | Role | Region |
|------|-------|------|--------|
| 🕶️ Nick Fury | `nick.fury@slooze.com` | **Admin** | Global |
| 🦸‍♀️ Captain Marvel | `captain.marvel@slooze.com` | **Manager** | India |
| 🛡️ Captain America | `captain.america@slooze.com` | **Manager** | America |
| 💜 Thanos | `thanos@slooze.com` | **Member** | India |
| ⚡ Thor | `thor@slooze.com` | **Member** | India |
| 🤠 Travis | `travis@slooze.com` | **Member** | America |

<br/>

---

## 🔧 Environment Variables

### Backend (`apps/backend/.env`)
```env
DATABASE_URL=postgresql://slooze:sloozepassword@localhost:5432/sloozedb
JWT_SECRET=your_super_secret_key_here
PORT=3001
```

### Frontend (`apps/frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

<br/>

---

## 📦 Tech Stack

<div align="center">

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15 + TypeScript | React framework with App Router |
| **Styling** | Tailwind CSS + shadcn/ui | Utility-first + component library |
| **State** | Zustand | Lightweight global state |
| **Data Fetching** | React Query (TanStack) | Server state & caching |
| **Backend** | NestJS + TypeScript | Modular Node.js framework |
| **Database** | PostgreSQL 15 | Relational data store |
| **ORM** | Prisma | Type-safe database client |
| **Auth** | Passport.js + JWT | Authentication strategy |
| **Crypto** | bcrypt | Password hashing |
| **API Docs** | Swagger/OpenAPI | Auto-generated docs |
| **Infrastructure** | Docker + Compose | Containerized deployment |

</div>

<br/>

---

## 🔍 Key Implementation Highlights

### Global JWT + Roles Guards
```typescript
// Applied globally — ALL routes require auth by default
{ provide: APP_GUARD, useClass: JwtAuthGuard },
{ provide: APP_GUARD, useClass: RolesGuard },

// Opt-out for public routes
@Public()
@Post('login')
login() { ... }

// Role-specific restriction
@Roles(Role.ADMIN, Role.MANAGER)
@Post(':id/checkout')
checkout() { ... }
```

### Region-Aware Queries
```typescript
// Members see only their own orders
// Managers see all orders in their region
// Admins see everything — no filter
async findAll(user) {
  if (user.role === 'ADMIN') return prisma.order.findMany();
  if (user.role === 'MANAGER') return prisma.order.findMany({
    where: { restaurant: { regionId: user.regionId } }
  });
  return prisma.order.findMany({ where: { userId: user.userId } });
}
```

<br/>

---

<div align="center">

**Built with TypeScript, NestJS, Next.js, PostgreSQL, Prisma & Docker**

*A portfolio-quality demonstration of modern full-stack architecture principles.*

<br/>

⭐ Star this repo if you found it useful!

</div>