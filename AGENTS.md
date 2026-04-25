# LearnFlow AI Agent Guidelines

## Development Commands
- `npm install` - Install dependencies
- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Create production build
- `npm run start` - Run production build
- `npm run lint` - Run ESLint

## UI/UX Implementation Notes (Critical for Agent)
- **Priority**: Super trendy UI with Gen Z naming/words - this is the #1 focus
- **Design System**: Custom Material 3 inspired with these exact implementations:
  - Glassmorphism: `backdrop-filter: blur(14px)` on cards, `blur(10px)` on surfaces
  - Tonal surfaces: `background: rgba(16, 20, 43, 0.75)` for `.surface`, `linear-gradient(120deg, rgba(146, 122, 255, 0.36), rgba(58, 182, 255, 0.24))` for `.material-card`
  - Rounded cards: `border-radius: 28px` (material-card), `24px` (surface), `16px` (KPI/dashboard), `14px` (quiz-item), `12px` (inputs)
  - Pill CTAs: `border-radius: 999px` on `.pill-btn` and `.pill-btn-alt`
  - Gradient animations: Animated gradient backgrounds in body using CSS variables
- **Styling**: Tailwind CSS v4 with custom color palette - use these exact values:
  - Eyebrow text: `#d5c8ff` (light purple)
  - Primary button (`pill-btn`): Background `#d6bcff`, text `#27174b` (dark purple)
  - Secondary button (`pill-btn-alt`): Border `rgba(255, 255, 255, 0.26)`, background `rgba(255, 255, 255, 0.1)`, text `#fff`
  - Progress bar gradient: `from-fuchsia-400 via-violet-400 to-cyan-300`
  - Chip styling: Border `rgba(188, 181, 255, 0.45)`, background `rgba(188, 181, 255, 0.18)`
  - Status dots: Done `rgba(29, 201, 152, 0.25)`, Pending `rgba(142, 166, 255, 0.25)`
  - KPI cards: Background `rgba(255, 255, 255, 0.04)`, border `rgba(255, 255, 255, 0.14)`
  - Dashboard cards: Background `rgba(255, 255, 255, 0.05)`, border `rgba(255, 255, 255, 0.16)`
  - Body background: Dual radial gradients `#4b2f97` (10% 0%) and `#0074a7` (90% 20%) over `--background`
- **Key Components** (use exact class names):
  - `pill-btn` - Primary CTA button style (Gen Z action words)
  - `pill-btn-alt` - Secondary button variant (outline style)
  - `surface` - Card container with glassmorphism effect (use for all cards)
  - `chip` - Tag-like UI elements (for feature tags like "Roadmap", "Micro Lessons")
  - `dashboard-card` - Metric display cards (for completion, pulse state, etc.)
  - `roadmap-row` - Progress tracking rows (with `.status-done`/`.status-pending`)
  - `material-card` - Main header container with strongest glassmorphism
  - `kpi` - Key metric display boxes (confusion, confidence, mastery, streak)
  - `quiz-item` - Individual quiz question containers
  - `field` - Form label/input pairs
  - `eyebrow` - Small uppercase text above main title
- **Typography**: Uses Geist font family from next/font/google - specifically:
  - `variable: "--font-geist-sans"` for sans-serif
  - `variable: "--font-geist-mono"` for mono (used in layout)
- **Mobile-first**: All layouts use `sm:` prefixes for mobile breakpoints, test at 320px width
- **Gen Z Naming Conventions** (use EXACTLY these phrases):
  - Eyebrow text: "AI Learning OS" (not "AI Learning System" or similar)
  - Main brand: "LearnFlow AI" (not "LearnFlow" or "LearnFlowAI")
  - Feature names: 
    - "Smart Topic Input" (for topic/time/goal/style inputs)
    - "AI Learning Pulse" (for confusion/confidence/mastery tracking)
    - "Quiz + Revision Engine" (for quiz generation and weak area detection)
    - "Dashboard: Learning Pulse Board" (for metrics overview)
  - Button text (Gen Z action verbs):
    - "Detect Confusion" (not "Check Understanding" or "Assess")
    - "Generate AI Quiz" (not "Create Quiz" or "Start Quiz")
    - "M3 Premium Mode" (not "Premium Features" or "Upgrade")
  - Achievement names:
    - "Consistency Hero" (streak >= 5 days)
    - "On Fire" (streak < 5 days)
  - UI labels (casual, engaging language):
    - KPIs: "Confusion", "Confidence", "Mastery", "Streak"
    - Dashboard: "Topic Completion", "Pulse State", "Weak Area", "Achievement"
    - Pulse modes: "Simple Explanation", "Analogy Explanation", "Visual Explanation", "Revision Explanation", "Challenge Explanation", "Mentor Explanation"
    - Feature chips: "Roadmap", "Micro Lessons", "Mentor", "Quiz Mode"
    - Form labels: "Topic", "Daily time", "Goal", "Style"
    - Status indicators: "Done", "Next"
    - Estimated time: "Estimated completion: 6 weeks with {dailyTime}/day"
  - Encouraging phrases used throughout:
    - "Duolingo + ChatGPT + personal mentor, powered by real-time adaptive learning pulse."
    - "Live adaptation detects confusion, confidence, retention and switches teaching mode instantly."
    - "Quick recall loop"
    - "Weak area detected: [topic]. Smart revision added."
    - "You are close. Focus on control scope:"

## Architecture & Code Structure
- **Entry Point**: `src/app/page.tsx` (single-screen demo flow - ALL UI changes here)
- **Layout**: `src/app/layout.tsx` (metadata, fonts, base shell - rarely modified)
- **Styling**: `src/app/globals.css` (Material 3 tokens, surface/button/card primitives - MODIFY FOR UI CHANGES)
- **State Management**: React hooks (useState, useMemo) in page component only
- **No external state library**: Demo uses local component state only - avoid introducing Redux/Zustand/etc.

## Adaptive Learning System
- **AI Learning Pulse™**: Tracks confusion (0-100), confidence (0-100), mastery (0-100), streak (days)
- **Pulse Modes**: Simple → Analogy → Visual → Revision → Challenge → Mentor (in this order)
- **Mode Switching Logic**: 
  - If confusion > 70% → Simple mode
  - Else if confidence < 55% → Analogy mode  
  - Else → Challenge mode
  - (Visual/Revision/Mentor modes are simulated but not auto-activated in current demo)
- **Quiz System**: Simulated scoring = round((confidence + (100-confusion))/2)
- **Progress Tracking**: Completion = round((mastery + confidence)/2) (capped at 100)
- **State Update Logic**:
  - On "Detect Confusion": confusion -= 18 (min 30), confidence += 14 (max 95)
  - On "Generate AI Quiz": mastery += 16 (max 100), streak += 1, quizScore = calculated score

## Important Files to Modify (ORDER MATTERS)
1. `src/app/globals.css` - For ALL UI/UX changes (colors, gradients, shadows, radii, fonts)
2. `src/app/page.tsx` - For feature logic, text content, Gen Z naming, state changes
3. `src/app/layout.tsx` - Only for metadata/font changes (rarely needed)

## Verification Steps (DO THESE IN ORDER)
1. Run `npm run dev` to start development server
2. Verify UI renders with Material 3 inspired surfaces (check glassmorphism, gradients)
3. Test responsive layout: mobile (320px), tablet (768px), desktop (1024px+)
4. Test pulse mode switching via "Detect Confusion" button (watch mode change + text update)
5. Check quiz generation via "Generate AI Quiz" button (score appears, weak area message)
6. Confirm Gen Z naming is used EXACTLY as specified above (no substitutions)
7. Verify achievement text updates correctly at streak=5 threshold
8. Check progress bar width matches completion percentage
9. Validate all hover/active states on buttons and chips
10. Run `npm run lint` to ensure no ESLint errors

## Dependency Notes (Versions Matter)
- Uses `@mui/material` v9 and `@mui/icons-material` v9 for icons (though minimally used)
- `framer-motion` v12 for animations (imported in page.tsx but verify usage)
- `recharts` v3.8.1 for potential chart implementations (imported but not currently used)
- `@emotion/react/styled` for CSS-in-JS capabilities (available if needed)
- Tailwind CSS v4 (uses `@tailwindcss/postcss` "^4" in devDependencies)
- Next.js 16.2.4 (App Router - note: `use client` directive required in page.tsx)
- React 19.2.4, TypeScript 5