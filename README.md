# Bright Automations Sales Platform

Internal sales operations platform for Bright Automations.

## Features

### Sales Rep Portal
- **Dashboard**: Daily stats, callbacks due, recent activity, earnings summary
- **Dialer**: Single-lead focus view with keyboard shortcuts for fast calling
- **My Leads**: Filterable list of assigned leads
- **Callbacks**: Overdue and scheduled callback management
- **Earnings**: Stats, commissions, and leaderboard

### Admin Portal
- **Dashboard**: Company-wide KPIs, rep performance cards, live activity feed
- **Lead Management**: CSV import with column mapping, bulk actions, lead assignment
- **Rep Management**: Add/manage reps, view stats, suspend/reactivate
- **Commissions**: Approve/reject/pay commissions, export reports
- **Reports**: Pipeline funnel, leaderboard, lead source ROI, time-of-day analysis
- **Settings**: Company config, daily targets, commission rules, notifications

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Supabase)

### Installation

1. Clone and install dependencies:
```bash
cd Bright-Automations-Work-UI
npm install
```

2. Copy environment file and configure:
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your credentials:
```
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

4. Generate Prisma client and push schema:
```bash
npm run db:generate
npm run db:push
```

5. Seed the database with sample data:
```bash
npm run db:seed
```

6. Start the development server:
```bash
npm run dev
```

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (frontend), Railway/Supabase (database)

## Demo Access

The app includes demo mode with placeholder credentials:
- **Admin Portal**: Use any email containing "admin", "andrew", or "jared"
- **Rep Portal**: Use any other email

## Keyboard Shortcuts (Dialer)

| Key | Action |
|-----|--------|
| `1` | Connected |
| `2` | No Answer |
| `3` | Voicemail Left |
| `4` | Wrong Number |
| `N` | Focus notes field |
| `←` `→` | Navigate leads |

## Project Structure

```
src/
├── app/
│   ├── (auth)/         # Login pages
│   ├── (rep)/          # Sales rep portal
│   │   ├── dashboard/
│   │   ├── dialer/
│   │   ├── leads/
│   │   ├── callbacks/
│   │   └── earnings/
│   └── (admin)/        # Admin portal
│       ├── dashboard/
│       ├── leads/
│       ├── reps/
│       ├── commissions/
│       ├── reports/
│       └── settings/
├── components/
│   └── ui/             # shadcn/ui components
├── lib/                # Utilities and database client
├── hooks/              # React hooks
└── types/              # TypeScript types
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side) |
| `SLACK_WEBHOOK_URL` | Optional: Slack notifications |

---

Built for Bright Automations
