# ✂️ Premium Salon SaaS Platform (Booking & Management System)

A full-stack, production-ready SaaS platform built for modern hair salons and barbershops. This application serves as an automated digital receptionist, handling appointment bookings, staff schedules, role-based access control, and financial overviews.

> This project demonstrates advanced full-stack development skills, specifically focusing on modern Next.js 15 architecture, secure data mutation with Server Actions, complex database relationships, and strict Role-Based Access Control (RBAC).

---

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router, Server Components)
- **Language**: TypeScript (Strict mode)
- **Database**: PostgreSQL (hosted on [Supabase](https://supabase.com/))
- **ORM**: Prisma (with native PostgreSQL driver adapters)
- **Authentication**: [Clerk](https://clerk.com/) (Email/Google) + Custom Database RBAC mapping
- **UI/Styling**: Tailwind CSS v4, [shadcn/ui](https://ui.shadcn.com/), Framer Motion
- **Validation**: Zod (for forms and strict Server Action payload validation)

---

## 🧠 Core Architecture & Backend Highlights (For Recruiters)

### 1. Robust Booking Engine (Overlap Prevention)
The core of the system relies on a secure booking algorithm that prevents double-booking. When a client books an appointment, the server queries the database to ensure the requested time slot is completely free for the selected staff member, accounting for both existing appointments and staff time-offs.

### 2. Custom Role-Based Access Control (RBAC) & Whitelisting
While Clerk handles identity verification, **authorization is strictly managed within the local Supabase database**. 
- **Roles**: `ADMIN`, `STAFF`, `VIEWER`.
- **Whitelisting System**: Public sign-ups are disabled for the dashboard. A user must be manually added to the database by an Admin (via their email). 
- **Email Auto-Sync**: When a staff member logs in via Clerk for the first time, a custom middleware/service links their Clerk ID to the pre-existing database record based on email, seamlessly authorizing them without manual ID copy-pasting.

### 3. Next.js Server Actions & Data Mutation
All database mutations (creating appointments, updating services, managing roles, changing status) are handled via **Server Actions**.
- **Zod Validation**: Every Server Action validates incoming payloads using Zod schemas before touching the database.
- **Server-Side Security**: Actions verify the authenticated user's Clerk session and their local database Role (`getAuthenticatedUser("ADMIN")`) before executing privileged operations.

### 4. Database Schema (Prisma)
The database structure is highly relational and optimized for cascading operations:
- `User`: Manages staff/admins, linked to Clerk.
- `Service`: Available treatments with prices and durations.
- `Appointment`: Link between explicit clients, staff (`User`), and `Service`. Tracks status (`PENDING`, `APPROVED`, etc.).
- `TimeOff`: Staff leaves/breaks.
- `SalonSettings` & `WorkSchedule`: Dynamic salon opening hours, managed by the Admin.

---

## 🎯 Key Features

### For Clients (Public Facing):
- **Glassmorphism UI**: High-end, premium aesthetic designed to elevate the brand.
- **Frictionless Booking**: Dynamic calendar selection, service selection with real-time price/duration calculation.
- **Status Portal**: Clients can track or cancel their appointments via a status page using their email and Appointment ID.
- **18-Hour Cancellation Rule**: Clients are prevented from directly cancelling appointments less than 18 hours prior to the start time (requires staff approval).

### For Admins & Staff (Dashboard):
- **Admin Dashboard**: Real-time revenue statistics (daily/monthly), aggregated appointment views, staff management (promote/demote roles).
- **Staff Dashboard**: Isolated view where staff members (`STAFF` role) can only see and manage their own upcoming appointments and log their own time-off.
- **Service Management**: Full CRUD capabilities for salon services, updating prices and durations instantly.

---

## ⚙️ Running Locally

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Set up Environment Variables**: Create a `.env` file with your Clerk and Supabase (Prisma) keys:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
   CLERK_SECRET_KEY=...
   DATABASE_URL="postgresql://[user]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
   DIRECT_URL="..."
   ```
4. **Push Prisma Schema**: `npx prisma db push`
5. **Run Development Server**: `npm run dev`

---
*Built with ❤️ and a focus on solving real-world business problems through automation and code.*
