# Job Application Tracking System

A full-stack MERN application for candidates to submit job applications and administrators to manage recruitment progress.

## Features

- Candidate application form with name, email, phone, job role and skills
- MongoDB persistence using Mongoose
- Duplicate prevention for the same email + job role
- Admin login with bcrypt password hashing and JWT authentication
- Protected admin APIs
- Dashboard with application table and status statistics
- Search by candidate name or email
- Filter by job role and status
- Update status: Applied, Shortlisted, Interview, Rejected
- Confirm-before-delete workflow
- Server-side pagination (10 records per page)
- Backend validation, Helmet security headers, API rate limiting
- Environment-based secrets and configuration

## Requirements

- Node.js 18+
- MongoDB local installation or MongoDB Atlas database
- npm

## 1. Backend setup

Open a terminal:

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and update the values:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/job_application_tracker
JWT_SECRET=use_a_long_random_secret_here
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
ADMIN_NAME=System Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!
```

For MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string. Do not commit `.env` to Git.

Create the first admin account:

```bash
npm run create-admin
```

Start the backend:

```bash
npm run dev
```

Backend: http://localhost:5000

## 2. Frontend setup

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

Optional: create `frontend/.env` to change the API URL:

```env
VITE_API_URL=http://localhost:5000/api
```

## 3. Use the application

1. Open `http://localhost:5173` and submit a candidate application.
2. Open `/admin/login`.
3. Sign in using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from backend `.env`.
4. Use the dashboard to search, filter, update statuses and delete records.

## API endpoints

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/applications` | Public | Submit candidate application |
| POST | `/auth/login` | Public | Admin login; returns JWT |
| GET | `/applications` | Admin | List/search/filter/paginate applications |
| GET | `/applications/statistics` | Admin | Status-wise counts |
| PATCH | `/applications/:id/status` | Admin | Update application status |
| DELETE | `/applications/:id` | Admin | Delete application |

For protected endpoints send:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Example candidate application request

```json
{
  "name": "Dinesh Kumar",
  "email": "dinesh@example.com",
  "phone": "+91 9876543210",
  "jobRole": "MERN Stack Developer",
  "skills": ["React", "Node.js", "Express", "MongoDB"]
}
```

### List endpoint query parameters

- `search`: candidate name or email
- `jobRole`: exact job role
- `status`: Applied, Shortlisted, Interview or Rejected
- `page`: page number (starts at 1)
- `limit`: records per page (default 10, maximum 50)

## Project structure

```text
job-application-tracker/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   └── server.js
└── frontend/
    └── src/
        ├── components/
        ├── pages/
        ├── services/
        ├── App.jsx
        └── styles.css
```

## Important notes

- The first admin must be created using `npm run create-admin`.
- Keep `.env` private and use a strong `JWT_SECRET` and admin password.
- Duplicate prevention uses a MongoDB unique compound index on `email` and `jobRole`. If an old database already contains duplicates, remove those duplicates before the index is created.
- This project stores the JWT in localStorage for a straightforward assessment demo. For production, consider secure, HttpOnly cookies, CSRF protection, stronger validation, audit logs and role-based permissions.
- No candidate account or candidate login is required by the task; candidates submit the public application form.
