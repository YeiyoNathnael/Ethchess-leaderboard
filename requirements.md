# EthChess League - Automatic Leaderboard System Requirements Specification

## 1. System Overview

The **EthChess League Automatic Leaderboard Builder** is a dedicated web platform designed for managing, calculating, and presenting competition standings for the EthChess League chess club.

The system ingests Chess.com tournament URLs, fetches tournament results directly from the **Chess.com Public API**, validates player eligibility against official registration data (Google Form responses), applies the custom **EthChess League Scoring Rules**, and presents beautiful, responsive leaderboards adhering to the official **EthChess Brand Guidelines**.

---

## 2. Competition & Business Rules

### 2.1 Player Eligibility & Verification
* **Rule 1: Registered Players Only**: Leaderboard points and rankings are strictly reserved for players registered via the official Google Form.
* **Unregistered Player Handling**: Non-registered players participating in Chess.com tournaments are ignored during points allocation, ensuring registered players receive their earned ranks and points cleanly.
* **Ban / Disqualification Policy (Rule 8)**: Players flagged for suspicious accounts, sandbagging, or cheating face lifetime bans and immediate removal from all current and historical leaderboards.

### 2.2 Event Categories & Structure (Rule 2)
* **EthChess Tuesday**: 9-round Swiss tournament held weekly on Tuesdays.
* **Freestyle Friday**: 9-round Swiss tournament held weekly on Fridays.
* **Season Duration (Rule 6)**: Each season spans **2 to 3 months** comprising multiple Tuesday and Friday tournaments.

### 2.3 Scoring System

Points are awarded per tournament based on a combination of **F1-Style Rank Points** and **Participation Bonus Points**.

#### A. F1-Style Rank Points (Rule 3)
| Placement | Points Awarded |
| :--- | :--- |
| **1st Place** | 25 pts |
| **2nd Place** | 20 pts |
| **3rd Place** | 16 pts |
| **4th Place** | 13 pts |
| **5th - 8th Place** | 10 pts each |
| **9th Place & Below** | 0 pts |

#### B. Participation Bonus Points (Rules 4 & 5)
| Condition | Bonus Points |
| :--- | :--- |
| **Finished event with 6+ rounds played** | +5 pts |
| **Played 5 rounds or fewer** | +2 pts |

#### C. Total Event Score Calculation
$$\text{Total Event Points} = \text{Rank Points} + \text{Participation Bonus Points}$$

*Example*: A player finishing 3rd who completed 7 rounds earns $16 + 5 = 21 \text{ points}$. A player finishing 6th who completed 4 rounds earns $10 + 2 = 12 \text{ points}$.

---

## 3. Functional Requirements

### 3.1 Tournament URL Ingestion & Chess.com API Integration
* **Tournament Link Parser**: Admins can submit any standard Chess.com tournament URL (e.g., `https://www.chess.com/tournament/ethchess-tuesday-round-1`).
* **API Fetching**: System extracts the tournament ID/slug and queries Chess.com's public endpoints:
  * `GET https://api.chess.com/pub/tournament/{url_id}` (Overview & Standings)
  * `GET https://api.chess.com/pub/tournament/{url_id}/{round}` (Round data for verifying played rounds count)
* **Header Compliance**: Includes proper custom `User-Agent` headers as required by Chess.com API guidelines.
* **Sync & Re-sync**: Ability to sync ongoing tournaments or refresh finished tournament results.

### 3.2 Registered Roster & Player Initialization
* **Excel / CSV Initialization**: Admins initialize and seed the player roster by uploading an Excel (`.xlsx`/`.xls`) or CSV file exported from the Google Form responses.
* **Username & Data Mapping**: System parses uploaded spreadsheet rows (Full Name, Email, Chess.com Handle, registration date) to build the authoritative player list.
* **Alias & Status Flags**: Supports updating handles, mapping aliases, and toggling player statuses (Active, Unverified, or Banned per Rule 8).

### 3.3 Leaderboards & Aggregation
* **Three Leaderboard Views**:
  1. **EthChess Tuesday Leaderboard**: Cumulative standings for Tuesday events in the active season.
  2. **Freestyle Friday Leaderboard**: Cumulative standings for Friday events in the active season.
  3. **Overall Season Leaderboard**: Combined cumulative standings across both Tuesday and Friday events.
* **Leaderboard Metrics**:
  * Rank & Movement (up/down indicators)
  * Player Name & Chess.com Handle
  * Total Season Points
  * Events Played Count
  * Podium Finishes (1st, 2nd, 3rd counts)
  * Best Rank & Average Points
* **Tie-Breaker Hierarchy**:
  1. Total Season Points
  2. Total 1st Place Finishes (then 2nd, 3rd)
  3. Total Events Played
  4. Average Swiss Points

### 3.4 "How Scoring Works" & League Rules Section
* **Visually Engaging Rules Component**: Interactive modal or dedicated page section explaining the scoring mechanism in a clean, editorial layout.
* **Content Structure**:
  * **F1 Rank Points Breakdown**: Visual badges for 1st (25pts), 2nd (20pts), 3rd (16pts), 4th (13pts), 5th–8th (10pts).
  * **Participation Bonus Calculator / Guide**: Explaining +5 pts for 6+ rounds and +2 pts for 1–5 rounds.
  * **Eligibility & Fair Play Notice**: Explaining Google Form registration requirement (Rule 1) and Anti-Cheating zero-tolerance policy (Rule 8).
  * **Brand Motto & Tagline**: Displaying the official tagline *"PLAY. ENJOY. REPEAT."* with `#00A86B` Jade Green typography.

### 3.5 Admin Dashboard
* CSV / Excel player roster upload and parser engine.
* Tournament URL input & bulk sync trigger.
* Roster editor (Add / Remove / Ban player).
* Manual point adjustments / override options with audit logs.
* Season management (Create Season, Set Active Season, Archive Season).

---

## 4. Design & Aesthetic Requirements (Adhering strictly to `design-rules.md`)

### 4.1 Visual Style & Theme
* **Minimalist Editorial**: Clean layout grids, strong visual hierarchy, bold typography, warm neutral backdrop with vibrant green accents.
* **Youthful Expression**: Crisp status badges, dynamic micro-interactions, sleek rank change indicators.

### 4.2 Brand Color Palette
* **Primary Brand Color (Hero Green)**: `#00A86B` (Jade / Vibrant Emerald)
  * *Usage*: Primary buttons, active tabs, headlines, podium highlights, pillar accents.
* **Accent Color (Terracotta)**: `#E2725B`
  * *Usage*: Alert badges, ban indicators, secondary highlights.
* **Background Color (Warm Cream)**: `#FFFCF1`
  * *Usage*: Main application background, container cards backdrop.
* **Neutral Dark / Text**: `#1A1A1A` / `#2D3748`
  * *Usage*: High-contrast text, dark mode cards.

### 4.3 Typography Rules
* **Primary Title Font**: `Space Grotesk`
  * *Usage*: Headlines, titles, section headers, navigation menus.
  * *Style*: Bold or Semi-Bold.
  * *Case*: **ALWAYS UPPERCASE** for headlines and navigation.
* **Secondary Body Font**: `Satoshi`
  * *Usage*: Body text, paragraphs, table rows, metadata, descriptions.
  * *Style*: Regular or Medium.
  * *Case*: Sentence case, left-aligned for readability.
* *Constraint*: Maximum 2 font families across the entire design system.

### 4.4 Logo & Branding Guidelines
* Display official EthChess Knight logo with green crown.
* Preserve clear spacing around logo; no stretching, warping, recoloring, or drop shadows.
* Primary logo placement on warm cream (`#FFFCF1`) or clean dark surfaces.

---

## 5. Technical Implementation & Hosting Architecture

### 5.1 Infrastructure & Services
* **Deployment Platform**: **Vercel (Free Tier)**
  * Serverless hosting for web application frontend and API routes.
  * Automated deployments and global CDN edge network.
* **Database & Persistence**: **Turso Database (Free Tier)**
  * SQLite-compatible LibSQL edge database optimized for serverless deployments.
  * Persistent tables for:
    * `players` (Roster imported from CSV/Excel, Chess.com handles, ban status)
    * `seasons` (Season metadata, date ranges, status)
    * `tournaments` (Chess.com URL, tournament ID, event type: Tuesday/Friday, round count, sync status)
    * `tournament_standings` (Calculated event rank, rank points, participation points, total score per player)
    * `season_leaderboard` (Aggregated season standings and historical stats)
* **Application Framework & Language**: Framework of choice (e.g. Next.js / Vite + React / TypeScript) optimized for Vercel + Turso edge execution.

### 5.2 Roster Import Engine
* Client/Server Excel (`.xlsx`/`.xls`) & CSV parser (e.g., `xlsx`/`papaparse`).
* Preview & column-mapping wizard for admin upload.
* Deduplication and upsert handling by Chess.com handle or member ID.

---

## 6. Non-Functional & Technical Requirements

* **Performance**: Fast initial load (< 1.5s), responsive table renders, cached Chess.com API calls to prevent rate limiting.
* **Responsive Layout**: Seamless presentation on desktop, tablet, and mobile browsers.
* **SEO & Accessibility**: Semantic HTML5 elements (`<header>`, `<main>`, `<table>`, `<footer>`), high contrast ratio compliance, descriptive meta tags, unique interactive element IDs.

---

## 7. Project Deliverables

1. `requirements.md` (This document)
2. Interactive Web Application (Leaderboard Frontend & Admin Tournament Sync Engine)
3. Design System & CSS Token Configuration (`Space Grotesk` & `Satoshi` fonts, `#00A86B` green theme)
4. Data Persistence (Turso DB schema & LibSQL client integration) & Chess.com API Connector Module
5. Vercel deployment configuration

