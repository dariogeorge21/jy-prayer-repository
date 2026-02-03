# Vitanova Prayer Repository

A modern, real-time prayer tracking application built with Next.js 16 and Supabase. Designed for communities to collectively track and aggregate prayers with full admin management capabilities.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ecf8e)

## ✨ Features

- **🙏 Real-time Prayer Tracking** - Live counters update across all connected devices
- **📊 Admin Dashboard** - Comprehensive statistics and management interface
- **🔒 Anonymous Submissions** - User privacy maintained with secure identifiers
- **⏱️ Rate Limiting** - Configurable cooldown to prevent spam
- **📱 Mobile Responsive** - Beautiful experience on all devices
- **🎨 Dark Theme** - Elegant, modern dark UI design

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- Supabase account

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd prayer-repository

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
prayer-repository/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Public prayer page
│   ├── admin/             # Admin panel pages
│   │   ├── dashboard/     # Statistics overview
│   │   ├── prayers/       # Prayer type management
│   │   ├── actions/       # Activity logs
│   │   ├── settings/      # Configuration
│   │   └── login/         # Admin authentication
│   └── api/               # API routes
├── components/
│   ├── admin/             # Admin UI components
│   └── public/            # Public-facing components
├── lib/
│   ├── hooks/             # React hooks
│   ├── supabase/          # Supabase client config
│   ├── types/             # TypeScript definitions
│   └── utils/             # Utility functions
├── supabase/
│   └── migrations/        # Database schema files
└── docs/                  # Documentation
```

## 🗄️ Database Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Run migrations in the SQL Editor (in order):
   - `001_initial_schema.sql`
   - `002_rls_policies.sql`
   - `003_functions.sql`
   - `004_admin_setup.sql`

3. Enable Realtime for the `prayer_counters` table

## ⚙️ Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional
NEXT_PUBLIC_RATE_LIMIT_SECONDS=30
```

## 📖 Documentation

For detailed usage instructions, see the [User Guide](docs/USER_GUIDE.md).

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **State Management**: [TanStack Query](https://tanstack.com/query)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## 🔐 Security

- Anonymous user tracking (no personal data collected)
- Row Level Security (RLS) policies on all tables
- Admin authentication via Supabase Auth
- Comprehensive audit logging
- Rate limiting on submissions

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ for the Vitanova community
