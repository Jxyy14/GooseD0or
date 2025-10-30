# 🪿 GooseDoor

**Anonymous internship salary database for university students worldwide.**

Born at the University of Waterloo, now serving students from 350+ universities across the globe. Share internship offers, salaries, tech stacks, and experiences with verified students.

---

## 🌟 Features

### For Students
- **📊 Browse Offers**: Explore thousands of real internship offers with verified salary data
- **💰 Salary Transparency**: See hourly rates in CAD and USD with company breakdowns
- **🛠️ Tech Stack Insights**: Filter by 300+ technologies to find relevant opportunities
- **⭐ Experience Ratings**: Read authentic reviews from fellow students
- **🏫 University Verification**: Auto-detected university badges for trusted submissions
- **📈 Analytics Dashboard**: Interactive charts showing top-paying companies and trending tech

### For the Community
- **🔒 Verified Access**: Only .edu, .edu.au, .ca, and .ac.uk emails allowed
- **✏️ Edit & Delete**: Manage your own submissions anytime
- **🌍 Global Reach**: Supporting students from US, Canada, UK, and Australia
- **🪿 UWaterloo Pride**: Special badges for submissions from the founding university

---

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **UI**: Tailwind CSS, shadcn/ui
- **Charts**: Recharts
- **Routing**: React Router
- **Email**: SendGrid (Custom SMTP)
- **Deployment**: Vercel

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- SendGrid account (for email verification)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/goosedoor.git
cd goosedoor
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create `.env.local` in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Run database migrations**

In your Supabase SQL Editor, run the migrations in order from `supabase/migrations/`:
- `20251029145000_auth_only_simple.sql` - Authentication setup
- `20251029150000_add_university_field.sql` - University tracking
- `20251029151000_add_uwaterloo_verification.sql` - UWaterloo badges
- `20251029152000_add_currency_field.sql` - Currency support
- `20251030000000_add_sample_offers.sql` - Sample data (optional)
- `20251030001000_add_international_email_domains.sql` - International email support

5. **Start the development server**
```bash
npm run dev
```

Visit `http://localhost:5173` 🎉

---

## 📧 Email Configuration

GooseDoor uses SendGrid for email verification to prevent spam and bounces.

### Setup SendGrid SMTP

1. Create a SendGrid account and verify your domain
2. Generate an API key with mail send permissions
3. In Supabase Dashboard → Project Settings → Auth → SMTP Settings:
   - **Host**: `smtp.sendgrid.net`
   - **Port**: `587`
   - **Username**: `apikey`
   - **Password**: Your SendGrid API key
   - **Sender email**: `noreply@yourdomain.com`
   - **Sender name**: `GooseDoor`

---

## 🎓 Supported Universities

GooseDoor accepts emails from **350+ universities** across 4 countries:

- 🇺🇸 **United States**: `.edu` domains
- 🇨🇦 **Canada**: `.ca` domains (including UWaterloo, UofT, UBC, McGill, etc.)
- 🇦🇺 **Australia**: `.edu.au` domains (including UNSW, UTS, Sydney, Melbourne, etc.)
- 🇬🇧 **United Kingdom**: `.ac.uk` domains (including Oxford, Cambridge, Imperial, etc.)

**Auto-detection**: Your university is automatically detected from your email domain and locked to prevent misrepresentation.

---

## 🗄️ Database Schema

### `offers` table
- Company name, role title, location
- Hourly salary (CAD/USD)
- Tech stack (array of technologies)
- Experience rating (1-5, optional)
- Review text, program, year of study
- Term, job type, level, work type
- University, UWaterloo verification badge
- User ID and email for ownership

### Row Level Security (RLS)
- Anyone can read offers
- Only authenticated users with verified emails can submit
- Users can only edit/delete their own submissions

---

## 🔒 Security & Anti-Spam

GooseDoor implements multiple layers of protection:

1. **Email Verification**: Only university emails (.edu, .edu.au, .ca, .ac.uk)
2. **Domain Validation**: Database-level email domain constraints
3. **Rate Limiting**: Client-side submission throttling
4. **Honeypot Fields**: Bot detection (hidden form fields)
5. **Submission Time Tracking**: Flags suspiciously fast submissions
6. **RLS Policies**: Database-level access control

---

## 📦 Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory, ready for deployment to Vercel, Netlify, or any static hosting service.

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy! Vercel will auto-deploy on every push to main.

---

## 🤝 Contributing

GooseDoor is built by students, for students. Contributions are welcome!

### Ideas for Contributions
- Add more universities to the dropdown
- Improve analytics visualizations
- Add export/CSV download features
- Mobile app (React Native)
- Browser extension for quick lookups

---

## 📄 License

MIT License - feel free to use this for your own university!

---

## 💬 Contact

- **Website**: [goosedoor.com](https://goosedoor.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/goosedoor/issues)

---

<div align="center">
  <p><strong>Made with 🪿 at University of Waterloo • Serving 350+ universities worldwide</strong></p>
  <p><em>Honk if you love salary transparency!</em></p>
</div>
