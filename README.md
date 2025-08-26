# Kolayers Learning Platform

A Next.js app for task-based learning with modules, badges, and progress tracking.

## Features

- User authentication (signup, login, logout)
- Learning modules with various task types:
  - Videos
  - Articles
  - Quizzes
  - Action items
  - Referrals
- Progress tracking
- Badge system for achievements

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with HTTP-only cookies

## Transitioning from Mock Data to Real Database

Follow these steps to transition from mock data to using a real PostgreSQL database:

## Prerequisites

- PostgreSQL database (can be hosted on services like [Supabase](https://supabase.com/), [Railway](https://railway.app/), [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres), or your own server)
- Node.js 16.x or later
- Vercel account for deployment

## Setup Instructions

### 1. Set up the database

1. Create a PostgreSQL database instance
2. Add your database connection string to `.env` and Vercel environment variables:

```
DATABASE_URL="postgresql://username:password@hostname:port/database?schema=public"
```

### 2. Set up the project

1. Clone the repository:
```
git clone https://github.com/ahmetozzturkk/kolayers.git
cd kolayers
```

2. Install dependencies:
```
npm install
```

3. Generate Prisma client:
```
npm run prisma:generate
```

4. Apply the database migrations:
```
npm run prisma:migrate
```

5. Seed the database with initial data:
```
npm run db:seed
```

### 3. Configure authentication

1. Create a JWT secret and add it to your environment variables:
```
JWT_SECRET="your-secret-key-here"
```

2. Update the authentication settings in your environment:
```
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://your-deployment-url.com"
```

3. Configure YourGPT widget for user authentication:
```
YOURGPT_SECRET_KEY="your-yourgpt-secret-key-from-dashboard"
```

**To get your YourGPT Secret Key:**
- Go to your YourGPT Dashboard
- Select your chatbot
- Navigate to Widget → Settings
- Copy the Secret Key

### 4. Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Configure the environment variables in Vercel
3. Deploy your application

## API Routes

The application provides the following API endpoints:

- **GET /api/badges** - Get all badges
- **POST /api/badges** - Create a badge
- **GET /api/modules** - Get all modules
- **GET /api/tasks** - Get all tasks
- **POST /api/user/progress** - Update user progress

## Data Migration

When migrating real users' data, ensure you:

1. Export your existing mock data using `localStorage`
2. Transform the data to match the Prisma schema
3. Import the data using a custom script or the Prisma seed script

## Development Workflow

1. Use Prisma Studio to view and edit data during development:
```
npm run prisma:studio
```

2. Run the development server:
```
npm run dev
```

3. Making schema changes:
```
npx prisma migrate dev --name <migration-name>
```

## User Authentication Flow

1. Users sign up via the `/login` page
2. JWT tokens are used for authentication
3. Protected routes check the user's session

## API Endpoints

### Authentication
- POST `/api/auth/signup` - Create a new user
- POST `/api/auth/login` - Log in a user
- GET `/api/auth/user` - Get current user info
- POST `/api/auth/logout` - Log out a user

### Modules
- GET `/api/modules` - Get all modules with tasks

### Tasks
- POST `/api/tasks/progress` - Update task progress

### Badges
- GET `/api/badges` - Get all badges with progress

### Referrals
- GET `/api/referrals` - Get user's referrals
- POST `/api/referrals` - Create a new referral

## Database Schema

The database includes the following models:
- User
- Module
- Task
- Badge
- UserProgress
- Referral

## Next Steps

1. Deploy application to a hosting service
2. Add email verification for signups
3. Implement social authentication
4. Add more task types
5. Create admin panel for content management 