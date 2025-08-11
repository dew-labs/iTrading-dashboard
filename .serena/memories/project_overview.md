# iTrading Dashboard - Project Overview

## Purpose

A React-based admin dashboard for iTrading platform with comprehensive content management capabilities including users, posts, products, brokers, and banners management.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Tailwind CSS 4.x with atomic design patterns
- **State Management**: Zustand + TanStack React Query
- **Routing**: React Router 7.x
- **Rich Text**: TinyMCE
- **UI Components**: Custom atomic design library
- **Internationalization**: react-i18next (EN/PT)

## Architecture

- **Atomic Design**: Components organized as atoms → molecules → organisms → templates
- **Feature-Based**: Business logic grouped by domain (users, posts, brokers, etc.)
- **Type-Safe Database**: Generated Supabase types with strict TypeScript

## Key Features

- Role-based access control (user, moderator, admin)
- Multi-language content management
- Real-time notifications
- Dark/light theme support
- Mobile-responsive design
- Image management with blurhash placeholders
- Rich text editing capabilities

## Brand Colors

- Primary: Teal/Cyan gradient (`from-teal-500 to-cyan-500`)
- Supporting palette includes status colors (green, yellow, red, blue)
- Feature-specific colors (users: blue, products: purple, posts: green, banners: orange)
