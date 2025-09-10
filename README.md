# Learnest.AI Landing Page

A production-ready landing page for Learnest.AI built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- 🚀 Next.js 14 with App Router
- 📱 Fully responsive design (mobile-first)
- ♿ Accessible with semantic HTML and ARIA attributes
- 🎨 Clean, minimal, professional design
- ⚡ Optimized performance with Next/Image and next/font
- 🔧 TypeScript for type safety
- 🎯 Content-driven from JSON configuration

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Fonts**: Inter (via next/font/google)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with Inter font
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles
│   └── api/health/        # Health check API
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── sections/         # Page sections
├── config/               # Configuration files
├── content/              # Content data
├── lib/                  # Utilities and types
└── public/               # Static assets
```

## Content Management

All textual content is managed through `content/site-content.json`. This allows for easy content updates without code changes.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Deployment

The app is ready for deployment on Vercel, Netlify, or any other platform that supports Next.js.

## License

© 2025 Learnest.AI. All rights reserved.
