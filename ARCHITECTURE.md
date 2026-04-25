# LearnFlow AI - Architecture

## Current Hackathon Architecture

```text
UI Layer (Next.js + Tailwind + M3-inspired components)
        |
Adaptive State Engine (client-side pulse logic)
        |
Learning Experience Modules
  - Topic intake
  - Roadmap rendering
  - Explanation mode switching
  - Quiz scoring
  - Dashboard updates
```

## Module Breakdown

### 1) Experience Shell
- **File**: `src/app/page.tsx`
- Handles the full demo narrative with responsive card-based UI.

### 2) Adaptive Pulse Engine
- Inputs:
  - confusion score
  - confidence score
  - interaction events
- Outputs:
  - explanation mode switch
  - mastery updates
  - streak updates

### 3) Learning Modules
- **Roadmap module**: renders beginner-to-advanced milestones
- **Tutor module**: displays mode-specific explanations
- **Quiz module**: computes score from learner state
- **Dashboard module**: visualizes progress and achievement state

### 4) Design System
- **File**: `src/app/globals.css`
- Material 3 inspired primitives:
  - tonal surfaces
  - rounded geometry
  - chips and pill actions
  - glass-like card layering

## Planned Production Expansion

### Backend (Supabase)
- Auth + profile
- Learning session persistence
- Mastery logs and revision history
- Streak and achievement history

### AI Services (Gemini/OpenAI)
- Dynamic roadmap generation
- Personalized explanation generation
- Question generation and grading
- Spaced revision planning

### Data/Signal Loop
1. Capture learner interaction events
2. Estimate confusion/confidence/retention
3. Select best teaching mode
4. Generate adaptation response
5. Measure subsequent learning outcome
