# Dating App Technical Product Specification

## 1. Web App Overview
- **App Name**: Conect
- **Target Audience**: Young adults (18-35) seeking meaningful connections or casual dating.
- **Unique Value Proposition**: Seamless, fast, and safe discovery with rich profile expression.
- **Supported Platforms**: Desktop (Chrome/Safari/Edge), Tablet, Mobile Web (Responsive).
- **Tech Stack**:
    - **Frontend**: React, TailwindCSS, Framer Motion (for animations).
    - **Backend**: Python FastAPI.
    - **Database**: SQLAlchemy (SQLite for MVP, PostgreSQL for Production).
    - **Runtime**: Single Web Service (Python serving React assets).

## 2. Authentication & User System
- **Sign Up**: Email + Password (Bcrypt hashing).
- **Session**: JWT (JSON Web Tokens) stored in LocalStorage.
- **Flow**:
    1. Sign Up -> API returns Token -> Onboarding.
    2. Login -> API returns Token -> Discovery.

## 3. User Profile System
### Fields
- **Basic**: Name, Age (derived/manual), Bio.
- **Identity**: Gender, Sexual Orientation.
- **Professional**: Job Title, Company, Education.
- **Lifestyle**: Interests (Tags), Lifestyle Badges (Smoking, Pets, etc.), Relationship Goals.
- **Location**: Latitude/Longitude (Optional for MVP).

### Media
- Up to 9 Images (URL storage).
- Upload functionality via `/api/upload`.

### Settings
- Edit Profile.
- Account Deletion.

## 4. Matching & Discovery System
### Mechanics
- **Swipe Right**: Like.
- **Swipe Left**: Pass.
- **Match**: Mutual Like creates a `Match` record.

### Filters
- Gender Preference (Backend filtering).
- Age Range (Backend filtering).
- Exclude Blocked/Reported users.

### Logic
- `get_discovery_profiles`: Returns users not yet swiped by current user.

## 5. Messaging System
- **Real-time**: Polling (MVP) / WebSockets (Roadmap).
- **Features**: Text messages, basic emojis.
- **Unmatch**: Deletes match association.

## 6. Safety & Moderation System
- **Report**: Users can report others for specific reasons.
- **Block**: Users can block others to prevent seeing them again.
- **Verification**: `is_verified` badge in DB.

## 7. Technical Architecture
### Database Schema (SQLAlchemy)
- **User**: `id`, `email`, `password_hash`, `is_active`, `is_verified`, `is_admin`.
- **Profile**: `user_id`, `name`, `age`, `bio`, `gender`, `orientation`, `job`, `company`, `images` (JSON), `interests` (JSON).
- **Swipe**: `user_id`, `target_id`, `is_like`, `timestamp`.
- **Match**: `user1_id`, `user2_id`, `timestamp`.
- **Message**: `match_id`, `sender_id`, `text`, `timestamp`.
- **Report**: `reporter_id`, `reported_id`, `reason`.
- **Block**: `blocker_id`, `blocked_id`.

### Deployment
- **Platform**: Render.
- **Type**: Single Web Service (Python + Node Build).
- **Config**: `render.yaml`.

## 8. UI/UX Guidelines
- **Style**: Modern Dark Mode (Black/Zinc/Orange).
- **Interactions**: Swipe gestures, Smooth transitions (Framer Motion).
- **Responsive**: Mobile-first grid layouts.

## 9. Admin Panel (MVP)
- Database flag `is_admin`.
- Future: Dedicated /admin route to view reports.
