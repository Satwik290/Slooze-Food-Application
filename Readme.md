<div align="center">

<br/>

```
 ___  _                    
/ __|| | ___  ___  ____  ___ 
\__ \| |/ _ \/ _ \|_  / / -_)
|___/|_|\___/\___/ /__| \___|
```

### 🍽️ Internal Food Ordering Platform

**Role-Based · Region-Isolated · Real-Time · Production-Ready**

<br/>

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15.x-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://prisma.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-WebSockets-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)

<br/>

> *A full-stack, containerized food ordering system with JWT authentication,  
> role-based access control, strict multi-region data isolation, and real-time  
> collaborative ordering via WebSockets.*

<br/>

[🚀 Quick Start](#-quick-start) · [🏗️ Architecture](#️-architecture) · [📡 API Reference](#-api-reference) · [👥 Roles & Permissions](#-roles--permissions) · [🌍 Region Isolation](#-region-isolation) · [🛒 Shared Cart](#-shared-cart--real-time-collaboration)

---

</div>

<br/>

## ✨ What is Slooze?

**Slooze** is a secure internal food ordering platform built for organizations operating across multiple geographic regions. Employees discover restaurants, browse menus, and place collaborative orders — all within the boundaries of their authorized region.

It's not just a CRUD app. It's a showcase of **enterprise-grade backend architecture**:

- 🔐 **JWT Authentication** with role-embedded claims
- 🛡️ **RBAC** enforced at the guard level (not just the UI)
- 🌍 **Regional data isolation** — cross-region leakage is architecturally impossible
- 🛒 **Shared collaborative cart** — entire region orders together in real-time
- ⚡ **WebSocket-powered** — live cart updates via Socket.io room-scoped broadcasts
- 🔗 **Cart sharing via link** — invite teammates to join any active cart
- 🍽️ **Multi-restaurant cart** — mix items from different restaurants in one order
- 🧩 **Modular NestJS** design for maintainability at scale
- 🐳 **One-command Docker deployment**

<br/>

---

## 🗂️ Project Structure

```
slooze/
├── 🐳  docker-compose.yml          # Orchestrates all services
├── 📦  package.json
│
├── 🖥️  apps/
│   ├── backend/                    # NestJS API Server (port 3001)
│   │   ├── src/
│   │   │   ├── auth/               # JWT auth, guards, strategies
│   │   │   ├── users/              # User management
│   │   │   ├── restaurants/        # Restaurant discovery
│   │   │   ├── menu/               # Menu items
│   │   │   ├── orders/             # Order lifecycle
│   │   │   │   ├── cart.gateway.ts # WebSocket gateway (Socket.io)
│   │   │   │   ├── orders.service.ts
│   │   │   │   └── orders.controller.ts
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
│           │   ├── (dashboard)/
│           │   │   ├── cart/
│           │   │   │   ├── page.tsx        # Shared cart (WebSocket)
│           │   │   │   └── join/page.tsx   # Cart join via shared link
│           │   │   ├── orders/page.tsx     # Multi-restaurant order view
│           │   │   ├── restaurants/
│           │   │   └── admin/
│           │   ├── login/
│           │   └── register/
│           ├── components/
│           │   ├── CartConflictDialog.tsx  # Multi-restaurant conflict UX
│           │   ├── MenuItemCard.tsx
│           │   └── ...
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
| ⚡ WebSocket | ws://localhost:3001/cart | Socket.io cart namespace |
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
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
# Set DATABASE_URL in .env
npx prisma migrate dev
npx prisma db seed
npm run start:dev

# Frontend (new terminal)
cd apps/frontend
npm install
npm install socket.io-client
npm run dev
```

<br/>

---

## 👥 Roles & Permissions

Slooze implements **three distinct user roles**, each with carefully scoped access:

```
┌──────────────────────────────────────────────────────────────┐
│                    PERMISSION MATRIX                          │
├─────────────────────────┬───────┬─────────┬──────────────────┤
│ Feature                 │ Admin │ Manager │ Member           │
├─────────────────────────┼───────┼─────────┼──────────────────┤
│ View Restaurants        │  ✅   │   ✅    │   ✅             │
│ View Menu Items         │  ✅   │   ✅    │   ✅             │
│ Add to Shared Cart      │  ✅   │   ✅    │   ✅             │
│ Share Cart via Link     │  ✅   │   ✅    │   ✅             │
│ View Own Orders         │  ✅   │   ✅    │   ✅             │
│ View Region Orders      │  ✅   │   ✅    │   ❌             │
│ View All Orders         │  ✅   │   ❌    │   ❌             │
│ Checkout Orders         │  ✅   │   ✅    │   ❌             │
│ Cancel Orders           │  ✅   │   ✅    │   ❌             │
│ Update Payment Method   │  ✅   │   ❌    │   ❌             │
│ Global Region Access    │  ✅   │   ❌    │   ❌             │
└─────────────────────────┴───────┴─────────┴──────────────────┘
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
│  │ 🏪 Spice Garden      │   │ 🍕 The Peri Peri Grill   │  │
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
4. **WebSocket rooms** — Socket.io rooms are scoped per `regionId` — cross-region broadcasts are impossible

<br/>

---

## 🛒 Shared Cart & Real-Time Collaboration

The most significant feature beyond basic CRUD. Every region shares **one unified cart** — no per-user isolation.

### How It Works

```
User adds item → POST /orders/cart
                       ↓
               DB updated (single cart per region)
                       ↓
       CartGateway.emitCartUpdate(regionId, cart)
                       ↓
       Socket.io broadcasts to region:India room
                       ↓
       ALL connected clients in India see update
       instantly — no polling, no refresh
```

### Multi-Restaurant Cart

Users can mix items from different restaurants in one cart. When a conflict is detected:

```
┌─────────────────────────────────────────┐
│  Add item from Spice Garden?            │
│                                         │
│  ✅ Continue with both                  │
│     Keep Delhi Dhaba + add Spice Garden │
│                                         │
│  🗑️  Cancel & start fresh               │
│     Clear cart, start with Spice Garden │
└─────────────────────────────────────────┘
```

- Conflict detection happens **client-side** before any API call
- The backend enforces region isolation regardless of UI choices
- Each `OrderItem` stores its own `restaurantId` — the order itself is restaurant-agnostic

### Cart Sharing via Link

```
User1 clicks "Share Cart"
       ↓
Copies: http://localhost:3000/cart/join?cartId=<uuid>
       ↓
Sends via Slack / WhatsApp / email (any channel)
       ↓
User2 clicks link → GET /orders/cart/join/:cartId
       ↓
Backend validates:
  ✅ Cart exists and is still active
  ✅ User2 is in the same region
       ↓
User2 lands on shared cart
User1 sees: "User2 joined the cart" (live notification)
```

### WebSocket Events

| Event | Direction | Payload | When |
|-------|-----------|---------|------|
| `joinRegion` | Client → Server | `regionId` | On cart page load |
| `cartUpdated` | Server → Client | Full cart object | Any item added/removed |
| `cartCleared` | Server → Client | `{ regionId }` | Cart cleared or checked out |
| `userJoined` | Server → Client | `{ userName }` | Someone joins via share link |

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
POST   /auth/register              # Create new account
POST   /auth/login                 # Get JWT access token
```

### Restaurants
```http
GET    /restaurants                # List (region-filtered)
GET    /restaurants/:id            # Get with menu items
GET    /restaurants/:id/menu       # Menu items only
```

### Orders & Cart
```http
GET    /orders/cart                # Get shared regional cart
POST   /orders/cart                # Add items to shared cart
GET    /orders/cart/join/:cartId   # Join cart via shared link
DELETE /orders/cart/clear          # Clear regional cart
DELETE /orders/cart/:cartId        # Clear cart by ID
DELETE /orders/cart/:id/item/:mid  # Remove single item

POST   /orders                     # Create order
GET    /orders                     # List (role + region filtered)
GET    /orders/:id                 # Get single order
POST   /orders/:id/checkout        # Confirm order [Admin, Manager]
POST   /orders/:id/cancel          # Cancel order  [Admin, Manager]
```

### Payments
```http
PATCH  /payments/update-method     # Update payment method [Admin only]
```

### WebSocket (Socket.io)
```
Namespace:  /cart
Events:     joinRegion | cartUpdated | cartCleared | userJoined
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
│  │  ├── React Query (server state + cache)              │   │
│  │  ├── Socket.io-client (WebSocket)                    │   │
│  │  ├── Tailwind CSS + shadcn/ui (styling)              │   │
│  │  └── Axios (HTTP client w/ JWT interceptor)          │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────┬────────────────────┬─────────────────────┘
                   │ HTTP / REST        │ WebSocket (ws://)
┌──────────────────▼────────────────────▼─────────────────────┐
│                    NestJS API (port 3001)                     │
│  ┌───────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Auth     │  │  Guards      │  │  Modules             │  │
│  │  JWT      │  │  JwtAuth     │  │  restaurants/        │  │
│  │  Passport │  │  Roles       │  │  orders/             │  │
│  │  bcrypt   │  │              │  │  payments/           │  │
│  └───────────┘  └──────────────┘  └──────────────────────┘  │
│  ┌──────────────────────┐  ┌───────────────────────────┐    │
│  │  CartGateway         │  │  Prisma ORM               │    │
│  │  Socket.io /cart     │  │                           │    │
│  │  region:* rooms      │  │                           │    │
│  └──────────────────────┘  └──────────────┬────────────┘    │
└──────────────────────────────────────────┼──────────────────┘
                                           │
┌──────────────────────────────────────────▼──────────────────┐
│              PostgreSQL 15 (port 5432)                       │
│  Regions · Users · Restaurants · MenuItems                   │
│  Orders · OrderItems (w/ restaurantId) · Payments            │
└─────────────────────────────────────────────────────────────┘
```

<br/>

---

## 🗄️ Database Schema

```
Region ──┬──< Restaurant ──< MenuItem ──< OrderItem >──┐
         │                                    │         │
         │                                    └── restaurantId (item-level)
         └──< User ──────────────────────< Order >─────┘
                                              │
                                         Payment (1:1)
```

Key design decisions:
- `regionId` on both `User` and `Restaurant` enables clean isolation queries
- `Order.restaurantId` is **nullable** — orders are restaurant-agnostic at the order level
- `OrderItem.restaurantId` stores restaurant per-item — supports multi-restaurant carts
- `OrderItem.price` is snapshotted at order time (price changes don't affect history)
- `Payment` is cascade-deleted with its `Order`
- `OrderItem` cascade-deletes with its `Order`
- WebSocket rooms are scoped to `region:<regionId>` — no cross-region event leakage

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

### Quick Demo Flow

```
1. Login as Thanos (Member, India)
   → Browse restaurants → Add Butter Chicken from Delhi Dhaba
   → Add Paneer Tikka from Spice Garden (conflict dialog appears)
   → Choose "Continue with both"
   → Go to Shared Cart → Click "Share Cart" → Copy link

2. Open new browser tab → Login as Thor (Member, India)
   → Paste the share link → Thor joins the cart instantly
   → Thanos sees "Thor joined the cart" notification

3. Login as Captain Marvel (Manager, India)
   → Go to Shared Cart → See all items from both users
   → Click "Checkout Cart" → Order confirmed
   → Both Thanos and Thor see cart clear in real-time
```

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
| **Data Fetching** | React Query (TanStack) | Server state & cache management |
| **Real-Time** | Socket.io-client | WebSocket cart sync |
| **Backend** | NestJS + TypeScript | Modular Node.js framework |
| **WebSockets** | Socket.io + NestJS Gateway | Real-time cart broadcasting |
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
// Members see only their own orders + shared cart
// Managers see all orders in their region
// Admins see everything — no filter
async findAll(user) {
  if (user.role === 'ADMIN') return prisma.order.findMany();
  if (user.role === 'MANAGER') return prisma.order.findMany({
    where: { regionId: user.regionId }
  });
  return prisma.order.findMany({
    where: {
      OR: [{ userId: user.id }, { regionId: user.regionId, status: 'CART' }]
    }
  });
}
```

### WebSocket Cart Gateway
```typescript
// Region-scoped rooms — clients only receive events for their region
@SubscribeMessage('joinRegion')
handleJoinRegion(@MessageBody() regionId: string, @ConnectedSocket() client: Socket) {
  void client.join(`region:${regionId}`);
}

// Broadcast after every cart mutation
emitCartUpdate(regionId: string, cart: unknown): void {
  this.server.to(`region:${regionId}`).emit('cartUpdated', cart);
}
```

### Multi-Restaurant Cart Conflict Resolution
```typescript
// Frontend detects conflict from cached cart state — no extra API call
const handleAdd = () => {
  if (activeCart && activeCart.restaurantId !== restaurantId) {
    setShowConflictDialog(true); // Show decision dialog
    return;
  }
  addToCart(); // No conflict — add directly
};

// Continue = add to existing cart (backend merges items)
// Cancel = DELETE /orders/cart/clear → then add new item
```

### Cart Sharing & Join Validation
```typescript
async joinCart(user: RequestUser, cartId: string) {
  const cart = await prisma.order.findUnique({ where: { id: cartId } });
  if (!cart) throw new NotFoundException('Cart not found');
  if (cart.status !== 'CART') throw new BadRequestException('Cart no longer active');
  if (user.role !== 'ADMIN' && cart.regionId !== user.regionId)
    throw new ForbiddenException('Cannot join cart outside your region');
  this.cartGateway.emitUserJoined(cart.regionId, user.name);
  return cart;
}
```

<br/>

---

<div align="center">

**Built with TypeScript, NestJS, Next.js, PostgreSQL, Prisma, Socket.io & Docker**

*A portfolio-quality demonstration of modern full-stack architecture principles  
including real-time collaboration, RBAC, and multi-tenant data isolation.*

<br/>

⭐ Star this repo if you found it useful!

</div>
