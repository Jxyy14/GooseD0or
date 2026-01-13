# GooseDoor

An anonymous internship salary sharing platform built for students. Founded at the University of Waterloo, now serving students from universities worldwide.

## Overview

GooseDoor allows students to anonymously share and browse internship compensation data. The platform provides transparency into tech internship salaries, helping students make informed decisions during their job search and salary negotiations.

## Features

### Core Features

- **Browse Offers** - Search and filter through hundreds of anonymously submitted internship offers
- **Submit Offers** - Share your internship compensation anonymously to help other students
- **Analytics Dashboard** - View aggregated insights including top universities, offers by term, and salary statistics
- **My Submissions** - Manage and edit your previously submitted offers

### New Features

- **Cost of Living Adjustor** - Compare salaries across 30+ cities worldwide with purchasing power calculations
- **Bookmark/Save Offers** - Save interesting offers for later reference (stored locally)
- **Dark/Light Mode** - Toggle between dark and light themes with persistent preference
- **University Verification** - Verified badges for users with .uwaterloo.ca email addresses

### Additional Pages

- **Hall of Shame** - Community-reported companies with poor internship experiences
- **Saved Offers** - View all your bookmarked offers in one place

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Authentication, Edge Functions)
- **Charts**: Recharts
- **Deployment**: Vercel/Netlify compatible

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   └── Navigation.tsx   # Main navigation component
├── hooks/
│   ├── useBookmarks.ts  # Bookmark/save functionality
│   └── useTheme.ts      # Dark/light mode toggle
├── integrations/
│   └── supabase/        # Supabase client and types
├── lib/
│   ├── technologies.ts  # Tech stack options
│   └── universities.ts  # University list with email detection
├── pages/
│   ├── Index.tsx        # Homepage
│   ├── Browse.tsx       # Browse offers
│   ├── Submit.tsx       # Submit new offer
│   ├── Analytics.tsx    # Analytics dashboard
│   ├── CostOfLiving.tsx # COL adjustor tool
│   ├── Saved.tsx        # Saved/bookmarked offers
│   ├── MySubmissions.tsx # User's submissions
│   ├── HallOfShame.tsx  # Reported companies
│   ├── Login.tsx        # User login
│   ├── Signup.tsx       # User registration
│   └── Edit.tsx         # Edit submission
└── index.css            # Global styles and design tokens
```

## Database Schema

### offers
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| company_name | text | Company name |
| role_title | text | Job title |
| location | text | Office location |
| salary_hourly | numeric | Hourly compensation |
| currency | text | USD or CAD |
| tech_stack | text[] | Technologies used |
| experience_rating | integer | 1-5 rating |
| term | text | Internship term (e.g., "Summer 2025") |
| university | text | Submitter's university |
| verified_uwaterloo | boolean | UWaterloo email verified |
| user_id | uuid | Foreign key to auth.users |
| created_at | timestamp | Submission date |

## API Routes

The application uses Supabase for all backend operations:

- Authentication via Supabase Auth
- Database queries via Supabase client
- Row Level Security (RLS) for data protection
- Edge Functions for email verification and AI features

## Security

- All sensitive credentials are stored in environment variables
- `.env` files are excluded from version control via `.gitignore`
- Supabase Row Level Security (RLS) protects user data
- Service role keys are only used in server-side edge functions

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Built at the University of Waterloo
- Inspired by levels.fyi and Blind
- UI components from shadcn/ui
- Icons from Lucide React

## Contact

For questions or feedback, reach out via:
- Twitter: [@wehliyejaffer](https://twitter.com/wehliyejaffer)
- LinkedIn: [jafferwehliye](https://linkedin.com/in/jafferwehliye)
