# LearnFlow AI - Intelligent Learning Assistant

LearnFlow AI is a mobile-first **AI Learning OS** that adapts in real-time to learner confusion, confidence, and mastery level.

This demo is designed for hackathon judging with a polished startup-feel UI inspired by Material 3 surfaces, glassmorphism, and adaptive teaching flow.

## Problem We Solve

Most learning platforms are generic and linear.

Learners drop off when:
- explanations are too complex
- weak areas are not detected early
- confidence falls with no intervention
- there is no personalized revision loop

## Solution

LearnFlow AI provides:
- personalized topic roadmap generation
- real-time adaptive explanation engine
- AI quiz and revision loop
- learning pulse dashboard with progress + streak mechanics

Core differentiator: **AI Learning Pulse(TM)**.

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Custom Material 3 inspired design system (tonal surfaces, rounded cards, chips, pill CTAs)

## Features Implemented

1. **Smart Topic Input**
   - User enters learning goal (`I want to learn Kubernetes`)
   - Learner context captured (daily time, goal, preferred style)
   - Dynamic roadmap shown with progression states

2. **AI Learning Pulse(TM)**
   - Tracks confusion, confidence, mastery, and streak
   - Automatically switches explanation mode:
     - Simple
     - Analogy
     - Visual
     - Revision
     - Challenge
     - Mentor

3. **Adaptive Explanation Engine**
   - Learning response updates based on pulse state
   - Demonstrates real-time pedagogical adaptation

4. **AI Quiz Generator (Simulated Logic)**
   - Instant quiz trigger
   - Score updates from confidence/confusion model
   - Weak area recommendation + revision signal

5. **Learning Pulse Dashboard**
   - Completion, pulse state, weak area insights, and achievement snapshot
   - Progress bar and streak unlock behavior

## Architecture

### Frontend Layer
- `src/app/page.tsx`
  - Single-screen hackathon demo flow optimized for mobile-first UX
  - Stateful simulation engine for pulse and quiz updates
- `src/app/globals.css`
  - Material 3 inspired UI tokens and reusable surface/button/card primitives
- `src/app/layout.tsx`
  - Metadata and base shell

### Adaptive Engine Layer (Current Demo)
- State-based pulse controller:
  - Input signals: confusion + confidence
  - Output action: explanation mode switch

### Persistence/API Layer (Planned Next)
- Supabase Auth + Profiles
- Session history
- Mastery analytics per concept

## Quick Start

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Demo Script (For Judges)

1. Enter: `I want to learn Kubernetes`
2. Show generated roadmap with milestones
3. Start explanation (Pod vs Deployment)
4. Click **Detect Confusion**
5. Show AI Learning Pulse switching explanation mode
6. Click **Generate AI Quiz**
7. Highlight score + weak concept insight
8. Show dashboard metrics update (mastery, completion, streak)
9. Call out achievement unlock state and adaptive mentor behavior

## Pitch Talking Points

- **Category**: AI Learning OS (not chatbot)
- **User segments**: students, exam prep, universities, enterprise upskilling
- **Value proposition**: higher completion rates via real-time adaptive teaching
- **Business model**:
  - B2C subscription (premium mentor/voice mode)
  - B2B team learning analytics
  - White-label API for edtech platforms

## Roadmap

- Supabase authentication and profile memory
- Gemini/OpenAI integration for true generative roadmap + quiz APIs
- Voice tutor mode
- Micro-session planner + spaced repetition scheduler
- PWA install, offline revision packs

## Deployment

Recommended: Vercel.

```bash
npm run build
npm run start
```
