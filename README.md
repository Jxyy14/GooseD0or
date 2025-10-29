# 🦆 GooseDoor

**GlassDoor, but for UWaterloo...**

A platform for University of Waterloo students to anonymously share and browse co-op job offers, salaries, and reviews. Make informed career decisions backed by real student data.

🌐 **Live Site:** [goosedoor.com](https://goosedoor.com)

---

## ✨ Features

### 📊 Browse Offers
- View real co-op offers from fellow Waterloo students
- Filter by company, role, salary, job type, and more
- See verified student reviews with ✅ badges
- Real-time updates when new offers are submitted

### 📝 Submit Anonymously
- Share your co-op experience completely anonymously
- Optional UWaterloo email verification for verified badge
- Include salary, tech stack, ratings, and detailed reviews
- Help the community make better co-op decisions

### 📈 Analytics Dashboard
- Interactive charts showing salary trends
- Popular tech stacks visualization
- Company ratings comparison
- Average salary by role and location

### 🚨 Hall of Shame
- Community-reported companies with toxic work environments
- Submit reports about unprofessional practices
- Help students avoid bad co-op experiences
- All reports are community-verified

### 🤖 AI-Powered Insights
- Sentiment analysis on reviews using OpenAI
- Automatic company summaries
- Smart categorization of experiences

### 🔒 Privacy First
- Completely anonymous submissions
- No personal data stored
- Email addresses never saved (only verification tokens)
- Open-source and transparent

---

## 🛠️ Tech Stack

- **Frontend:** React + TypeScript + Vite
- **UI:** shadcn/ui + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **Email:** Resend API
- **AI:** OpenAI API (GPT-4o-mini for sentiment analysis)
- **Hosting:** Vercel
- **Domain:** goosedoor.com

---

## 📦 Project Structure

```
GooseDoor/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/             # Main application pages
│   │   ├── Index.tsx      # Home page
│   │   ├── Browse.tsx     # Browse offers
│   │   ├── Submit.tsx     # Submit new offer
│   │   ├── Analytics.tsx  # Charts and statistics
│   │   ├── HallOfShame.tsx # Reported companies
│   │   └── Verify.tsx     # Email verification
│   ├── integrations/      # Supabase client & types
│   └── lib/               # Utility functions
├── supabase/
│   ├── functions/         # Edge Functions (AI, emails)
│   └── migrations/        # Database schema
└── public/                # Static assets
```

---

## 🌟 Key Features Explained

### Email Verification
Students can verify their submissions using their `@uwaterloo.ca` email to get a verified badge (✅). Email addresses are never stored - only verification tokens.

### Sentiment Analysis
Reviews are automatically analyzed using OpenAI's GPT-4o-mini to determine sentiment (positive, neutral, negative) and provide better insights.

### Real-time Updates
The Browse page uses Supabase realtime subscriptions to automatically show new offers as they're submitted.

### Currency Support
Students can submit salaries in CAD or USD, helping international students and those with US-based internships.

---

## 📊 Sample Data

The repository includes sample data:
- 4 sample co-op offers (Google, Amazon, Microsoft, Meta)
- 11 blacklisted companies with detailed reports
- All data is community-submitted and anonymized

---

## 🤝 Contributing

This is a student-run community project! Contributions are welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🔒 Privacy & Security

- **No personal data stored** - All submissions are anonymous
- **Email verification** - Uses one-time tokens, emails never saved
- **Row Level Security** - Supabase RLS policies protect data
- **Open source** - Full transparency, audit the code yourself

---

## 📄 License

MIT License - Feel free to use this for your own school or community!

---

## 👤 Author

**Jaffer Wehliye**

- 🔗 LinkedIn: [Jaffer Wehliye](https://www.linkedin.com/in/jaffer-wehliye)
- 🐦 Twitter/X: [@wehliyejaffer](https://twitter.com/wehliyejaffer)
- 📸 Instagram: [@jw14_](https://instagram.com/jw14_)

---

## 🙏 Acknowledgments

- Built for the UWaterloo co-op community
- Inspired by Glassdoor and Levels.fyi
- Thanks to all students who contribute their data

---

## 🐛 Found a Bug?

Open an issue on GitHub or reach out on social media!

---

**Made with ❤️ for Waterloo students**

*Help your fellow students make informed co-op decisions. Share your experience today!*
