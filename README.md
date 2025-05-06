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

## Setup

1. **Clone the repository**

```
git clone <repository-url>
cd kolayers
```

2. **Install dependencies**

```
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/kolayers"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Set up the database**

Make sure PostgreSQL is running, then:

```
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
```

5. **Start the development server**

```
npm run dev
```

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