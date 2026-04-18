<p align="center">
	<img src="../uniride/assets/images/icon.png" alt="UniRide Logo" width="120" height="120" />
</p>

<h1 align="center">UniRide Web Dashboard</h1>

<p align="center">
	Operational frontend for UniRide admins and support teams, built with Next.js App Router.
</p>

## Overview

UniRide Web is the control center for platform operations.
It provides role-based dashboards for administrators to manage drivers, rides, bookings,
notifications, support, account deletion requests, map behavior, and platform-wide settings.

The dashboard works with:

- UniRide backend API in `../UniRide-Backend`
- UniRide mobile app in `../uniride`

## Core Features

- Secure admin authentication and guarded dashboard routes.
- Driver application review and approval workflows.
- User, driver, booking, ride, review, and support management screens.
- Broadcast messaging and notification operations.
- Device/session management and account security tooling.
- Platform settings management, including mobile map provider and 3D controls.
- Data tables and operational analytics-oriented dashboard widgets.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand stores for domain state
- Socket.IO client for realtime updates
- Component primitives and UI composition with utility-first architecture

## Application Areas

### Public and Entry Routes

- `app/page.tsx`: landing or entry experience.
- `app/auth`: login and account access pages.
- `app/driver-apply`: public driver application flow.
- `app/api-subscription`, `app/reviews`, `app/support`, `app/terms`.

### Admin Dashboard Modules

- `app/dashboard/users`
- `app/dashboard/drivers`
- `app/dashboard/driver-applications`
- `app/dashboard/rides`
- `app/dashboard/bookings`
- `app/dashboard/locations`
- `app/dashboard/reviews`
- `app/dashboard/support`
- `app/dashboard/notifications`
- `app/dashboard/broadcast`
- `app/dashboard/fare-policy`
- `app/dashboard/settings`
- `app/dashboard/account-deletion-requests`
- `app/dashboard/admins`

### Shared Layers

- `components/`: layout, navigation, table, modal, chart, form, and module-specific UI.
- `store/`: state domains for auth, dashboard, notifications, support, drivers, etc.
- `lib/`: utility functions, guards, device detection, SEO helpers.

## Project Structure

```text
UniRide-Web/
	app/
		auth/
		dashboard/
		driver-apply/
		support/
		reviews/
	components/
		ui/
		dashboard/
		support/
		tables/
		settings/
	store/
	lib/
	public/
```

## Prerequisites

- Node.js 18+
- npm 9+
- Access to a running UniRide backend API

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Create `.env.local` and add required environment variables

3. Run development server

```bash
npm run dev
```

4. Open `http://localhost:3000`

## Environment Variables

| Variable                               | Required                     | Purpose                          |
| -------------------------------------- | ---------------------------- | -------------------------------- |
| `NEXT_PUBLIC_API_URL`                  | Yes                          | Base URL for UniRide backend API |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`    | If media uploads are enabled | Cloudinary cloud name            |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | If media uploads are enabled | Cloudinary upload preset         |

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
```

## Scripts

| Command         | Description                       |
| --------------- | --------------------------------- |
| `npm run dev`   | Start Next.js dev server          |
| `npm run build` | Build optimized production bundle |
| `npm run start` | Run production server             |
| `npm run lint`  | Run ESLint checks                 |

## Authentication and Session Model

- Auth state is persisted in client-side stores.
- Protected dashboard sections rely on route guards and token checks.
- Device/session actions integrate with backend device management endpoints.

## Platform Settings Integration

The settings dashboard includes controls for mobile app behavior, including:

- `mobile_map_enabled`
- `mobile_map_provider`
- `mobile_map_3d_enabled`

Changes are sent to backend APIs and broadcast in realtime to connected mobile clients.

## Build and Deployment

Production build:

```bash
npm run build
npm run start
```

Deployment options:

- Vercel
- Render
- Railway
- Any Node-compatible hosting platform

Deploy with environment variables configured for the target backend and media services.

## QA Checklist

Before release, verify:

- Auth login/logout and protected route redirects.
- Dashboard navigation for all major modules.
- CRUD flows for users, drivers, rides, and support tickets.
- Broadcast and notification management actions.
- Settings updates reflected in backend and mobile behavior.
- Responsive rendering across desktop and tablet layouts.

## Troubleshooting

- If API calls fail, confirm `NEXT_PUBLIC_API_URL` and backend CORS/access.
- If uploads fail, validate Cloudinary cloud name and preset values.
- If stale data appears, verify store hydration and refresh actions.
- If live updates are missing, check Socket.IO connectivity and backend health.

## Related Services

- Mobile app: `../uniride`
- Backend API: `../UniRide-Backend`
