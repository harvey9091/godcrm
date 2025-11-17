# GodCRM - Video Editor & Creative Agency CRM

A complete full-stack CRM application specifically designed for video editors & creative agencies.

## Features

- **Authentication**: Supabase Auth for login/signup/session management
- **Dashboard**: Animated text, KPIs, and charts for monthly statistics
- **CRM**: Client management with lead temperatures, status tracking, and social media links
- **Notes System**: Add, edit, and delete notes for each client
- **Asset Manager**: Upload and manage client assets with visual previews
- **Responsive Design**: Works on all device sizes

## Tech Stack

- **Frontend**: Next.js 14 App Router, TypeScript, TailwindCSS
- **UI Components**: ShadCN UI, MagicUI, Aceternity UI
- **Backend**: Supabase (Auth & Database)
- **Charts**: Recharts
- **Deployment**: Ready for Supabase deployment

## Prerequisites

- Node.js 18+
- pnpm
- Supabase account

## Getting Started

1. Clone the repository:
```bash
git clone git@github.com:harvey9091/godcrm.git
cd godcrm
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Database Setup

Run the SQL commands in `DATABASE.sql` to set up your Supabase database tables and RLS policies.

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable UI components
├── contexts/            # React contexts
├── lib/                 # Utility functions and services
│   └── supabase/        # Supabase client and services
└── types/               # TypeScript types
```

## Authentication

The application uses Supabase Auth for authentication:
- Sign Up: `supabase.auth.signUp({ email, password })`
- Login: `supabase.auth.signInWithPassword({ email, password })`
- Session: `supabase.auth.getSession()`

## RLS Policies

Row Level Security ensures each user sees only their own data:
- Clients
- Notes
- Assets

## Deployment

1. Deploy to Vercel or any Next.js compatible hosting platform
2. Set up your Supabase project
3. Configure environment variables on your hosting platform
4. Run the database setup SQL

## Components Used

### MagicUI Components
- Typing Animation
- Animated Shiny Text
- Animated Gradient Text
- Rainbow Button

### Aceternity Components
- Tooltip Card
- File Upload
- Floating Dock
- Cards Demo
- Sidebar

### ShadCN Components
- Login Form
- Signup Form

## License

MIT License

## Author

Harvey9091