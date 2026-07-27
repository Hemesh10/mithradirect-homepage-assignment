# Mithra Direct Homepage

A responsive, API-integrated homepage created as a frontend developer assignment for Mithra Direct.

The assignment was shared by the co-founder of Mithra Direct as part of the hiring process for a frontend developer role. The goal was to design and build a clean, modern homepage that communicates the company’s neighbourhood-commerce vision while integrating live API data into the customer experience.

> This repository is an assignment project and should not be treated as Mithra Direct’s official production website.

## Overview

Mithra Direct helps customers discover and order from nearby businesses. This implementation combines a marketing landing page with an interactive neighbourhood discovery experience, allowing the interface to respond to a user’s selected delivery area.

The homepage is designed around three priorities:

- Present the brand and its value proposition through a warm, trustworthy UI
- Make nearby vendors, products, and offers easy to explore
- Handle live data, location changes, and request states gracefully

## Features

- Responsive landing page for desktop, tablet, and mobile
- Location-aware vendor and product discovery
- Delivery-area search powered by Google Maps Places
- Current-location support with reverse geocoding
- API-backed featured vendors, local products, offers, and result counts
- Vendor and product preview drawer with keyboard and focus management
- Loading skeletons, empty states, image fallbacks, and retryable error states
- Interactive subscription and waitlist UI
- Mobile navigation and scroll-reveal transitions
- Reduced-motion support and accessible controls
- Unit and interaction tests for the API, adapters, hooks, and discovery interface

## Tech Stack

- React 19
- TypeScript
- Vite
- CSS
- Vitest
- React Testing Library
- Google Maps JavaScript and Geocoding APIs
- Phosphor Icons and Lucide React

## Getting Started

### Prerequisites

- Node.js 20.19 or newer
- npm

### Installation

```bash
git clone <repository-url>
cd mithradirect-assignment
npm install
```

Create a `.env.local` file in the project root:

```env
VITE_HOME_API_BASE_URL=/api/home
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

Production builds always use the same-origin `/api/home` proxy. Vite proxies
that path during local development and preview, while Vercel serves
`api/home.ts` as a serverless function in deployments. This avoids depending on
browser CORS access to the employer-owned API. A Google Maps API key is required
for place search and current-location reverse geocoding. The key should have the
required Maps and Geocoding APIs enabled and should be restricted to the
appropriate browser origins.

Start the development server:

```bash
npm run dev
```

Open the local URL printed by Vite in your browser.

## Available Scripts

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm test
```

Runs the Vitest test suite once in a jsdom environment.

```bash
npm run typecheck
```

Checks the TypeScript source without generating output.

```bash
npm run build
```

Runs the type check and creates an optimized production build in `dist/`.

```bash
npm run preview
```

Serves the production build locally for final verification.

## Project Structure

```text
api/
└── home.ts       # Same-origin Vercel proxy for the assignment API
src/
├── api/          # API requests, response normalization, and location services
├── assets/       # Optimized landing-page images
├── components/   # Interactive homepage sections
├── hooks/        # Reusable request and search state
├── test/         # Shared test setup and fixtures
├── App.tsx       # Homepage composition
├── data.ts       # Static marketing content
├── styles.css    # Core visual system and landing-page styles
└── discovery.css # Discovery experience styles
```

## API Integration

The discovery request sends the selected service area and coordinates to the home endpoint:

```text
GET /api/v1/home?service_area=<pincode>&latitude=<latitude>&longitude=<longitude>
```

Raw backend fields are normalized in `src/api/homeAdapter.ts` before reaching the UI. This keeps API-specific naming and defensive data handling out of the React components.

The request layer also:

- Cancels stale requests when the selected location changes
- Preserves existing results during a manual refresh
- Converts network, response, and malformed-data failures into user-friendly states
- Associates products and offers with their corresponding vendors
- Falls back safely when remote media is missing or cannot be loaded

## Testing

The test suite covers:

- API query construction and failure handling
- Backend response normalization
- Loading, refresh, empty, and error states
- Stale-request cancellation
- Debounced place search and reverse geocoding
- Keyboard navigation for location suggestions
- Vendor and product preview behavior
- Dialog focus management and Escape-key handling
- Remote image fallbacks and offer associations

Run the full verification workflow with:

```bash
npm test
npm run build
```

## Assignment Focus

This project demonstrates:

- Translating a business brief into a cohesive visual direction
- Building reusable, accessible React components
- Integrating and normalizing real API data
- Designing resilient UI states around asynchronous requests
- Creating a responsive customer-facing commerce experience
- Testing behavior at the API, hook, and component levels
