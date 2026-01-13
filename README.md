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
