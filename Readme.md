# BloodBank (Full Stack)

Blood bank management system with role-based access for donors/users, organisations, hospitals, and admins. Includes inventory tracking, request processing, transactions, and real-time inventory updates over Socket.IO.

## Features
- User registration and login with JWT auth
- Role-based access: `admin`, `organisation`, `hospital`, `user`
- Blood inventory per organisation or global inventory
- Donate/receive requests with approval workflow
- Transaction history per user or organisation
- Real-time inventory updates via Socket.IO

## Tech Stack
- Frontend: React (Vite), React Router, Tailwind CSS, Socket.IO client
- Backend: Node.js, Express, MongoDB (Mongoose), Socket.IO

## Project Structure
```
.
├── backend
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── seed
│   │   ├── utils
│   │   ├── server.js
│   │   └── socket.js
│   └── package.json
└── bloodbank-frontend
    ├── src
    ├── public
    └── package.json
```

## Prerequisites
- Node.js (LTS recommended)
- MongoDB connection string

## Setup
1. Install backend dependencies:
```
cd backend
npm install
```

2. Create `backend/.env`:
```
PORT=5000
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
BCRYPT_ROUNDS=10



3. Install frontend dependencies:
```
cd ..\bloodbank-frontend
npm install
```

4. Create `bloodbank-frontend/.env`:
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_FRONTEND_URL=http://localhost:5173
```

## Running the App (Development)
Start backend:
```
cd backend
npm run dev
```

Start frontend:
```
cd ..\bloodbank-frontend
npm run dev
```

Frontend runs at `http://localhost:5173` and backend at `http://localhost:5000`.

## Seeding Users (Optional)
Seed an admin user:
```
cd backend
node src/seed/adminSeed.js
```

Seed default organisation and hospital users:
```
cd backend
node src/seed/orgHospitalSeed.js
```

## API Overview
Base URL: `http://localhost:5000/api`

Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` (requires `Authorization: Bearer <token>`)
- `PUT /auth/update` (requires auth)

Requests
- `POST /requests`
- `GET /requests/my`
- `GET /requests` (admin/organisation/hospital)
- `PATCH /requests/:id/process` (admin/organisation/hospital)

Inventory
- `GET /inventory` (optionally `?orgId=...`)
- `PATCH /inventory/update` (admin/organisation/hospital)

Transactions
- `GET /transactions/user/:userId`

Admin (admin only)
- `GET /admin/requests`
- `GET /admin/transactions`
- `GET /admin/inventory`
- `PATCH /admin/make-organisation/:id`
- `POST /admin/register-facility` (role: `organisation` or `hospital`)

Organisation (org/hospital/admin)
- `POST /organisation/register`
- `POST /organisation/login`
- `PATCH /organisation/profile`
- `GET /organisation/inventory` (admins can pass `orgId`)
- `PATCH /organisation/inventory` (admins can pass `orgId`)
- `GET /organisation/requests` (admins can pass `orgId`)
- `PATCH /organisation/requests/:id/process`
- `GET /organisation/transactions` (admins can pass `orgId`)

## Socket.IO Events
Connect to `VITE_SOCKET_URL`.
- Emit `subscribeInventory` with optional `{ orgId }` to join an inventory room
- Listen for `inventory:update` to receive inventory changes

## Security Notes
- Use strong `JWT_SECRET` and keep `.env` files out of version control.
- Update default seed passwords before production use.

## Scripts
Backend (`backend/package.json`)
- `npm run dev` starts the API with nodemon
- `npm run seed:admin` is defined but points to a missing file; use `node src/seed/adminSeed.js` instead

Frontend (`bloodbank-frontend/package.json`)
- `npm run dev` starts Vite dev server
- `npm run build` creates production build
- `npm run preview` serves the build locally
