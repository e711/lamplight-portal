# Overview

This is a full-stack web application built as a holding company portfolio site for "Lamplight Technology." The application showcases multiple SaaS platforms with administrative capabilities to manage company information and platform listings. It uses a modern React frontend with a Node.js/Express backend, Drizzle ORM for database operations, and shadcn/ui components for the interface.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Technology Stack**: React with TypeScript, Vite as the build tool, and TanStack Query for server state management.

**UI Component System**: The application uses shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling. This provides a comprehensive set of accessible, customizable components following the "New York" style variant.

**Routing**: Client-side routing is handled by Wouter, a minimal routing library. The application currently has two routes: home page and a 404 not-found page.

**State Management**: Server state is managed through TanStack Query with custom query functions defined in `lib/queryClient.ts`. The query client is configured with infinite stale time and disabled refetching to optimize performance.

**Styling Approach**: The application uses Tailwind CSS with a custom configuration that includes CSS variables for theming. Custom color schemes are defined for both light and dark modes, with specific "Lamplight" branded colors for primary UI elements.

## Backend Architecture

**Framework**: Express.js server with TypeScript, using ES modules throughout the application.

**Development vs Production**: The application uses Vite's middleware mode in development for hot module replacement and serves static files in production. This is configured in `server/vite.ts`.

**API Structure**: RESTful API endpoints are registered in `server/routes.ts` with the following patterns:
- `/api/company` - GET and PUT operations for company data
- `/api/platforms` - CRUD operations for platform management
- Input validation using Zod schemas from the shared schema definitions

**Request Logging**: Custom middleware logs API requests with method, path, status code, duration, and truncated response data (max 80 characters).

**Error Handling**: Centralized error handling middleware catches errors and returns appropriate status codes and messages.

## Data Storage Solutions

**ORM**: Drizzle ORM is used for type-safe database operations with PostgreSQL dialect configuration.

**Database Provider**: Neon serverless PostgreSQL (indicated by `@neondatabase/serverless` dependency).

**Schema Design**: Three main tables defined in `shared/schema.ts`:
- `companies` - Stores company information including logo (URL or base64), hero content, about sections, contact details, and maintenance mode flag
- `platforms` - Manages SaaS platform listings with name, description, category, link, logo, active status, and sort order
- `users` - Basic user authentication with username and password fields

**Storage Implementation**: The application uses a storage interface (`IStorage`) with a PostgreSQL-backed implementation (`DbStorage`). All data is persisted to the database and survives server restarts.

**Data Seeding**: On first run, the database is automatically seeded with default company information and 6 sample platform entries.

**Data Validation**: Drizzle-Zod generates Zod schemas from the database schema for runtime validation of insert operations.

## Authentication and Authorization

**Auth0 Integration**: The application uses Auth0 for authentication with the following configuration:
- Backend: `express-openid-connect` middleware handles OpenID Connect authentication
- Frontend: `@auth0/auth0-react` SDK provides React hooks and components
- Session Management: Auth0 manages sessions with automatic token refresh
- Protected Routes: Admin endpoints require authentication via custom `requiresAuth()` middleware

**Authentication Flow**:
1. User clicks "Login" button in navigation
2. Redirected to Auth0 login page (supports Google, GitHub, email/password, etc.)
3. After successful login, redirected back to application via `/callback`
4. Auth0 session persisted in browser localStorage with refresh tokens
5. Authenticated users see Admin and Logout buttons instead of Login
6. Admin panel and modification endpoints only accessible when authenticated

**Protected Endpoints**:
- `PUT /api/company/:id` - Update company information
- `POST /api/platforms` - Create new platform
- `PUT /api/platforms/:id` - Update platform
- `DELETE /api/platforms/:id` - Delete platform
- `POST /api/platforms/extract-from-url` - Extract platform data from URL

**Public Endpoints**:
- `GET /api/company` - View company information
- `GET /api/platforms` - View active platforms

## External Dependencies

**UI Components**: 
- @radix-ui/* - Comprehensive suite of unstyled, accessible UI primitives
- shadcn/ui - Pre-built component library built on Radix UI
- class-variance-authority - Component variant styling
- tailwindcss - Utility-first CSS framework

**Data Fetching & State**:
- @tanstack/react-query - Server state management
- wouter - Lightweight routing

**Database & ORM**:
- drizzle-orm - Type-safe SQL ORM
- drizzle-kit - Database migrations and schema management
- @neondatabase/serverless - Neon PostgreSQL client

**Forms & Validation**:
- react-hook-form - Form state management
- @hookform/resolvers - Form validation resolvers
- zod - Schema validation
- drizzle-zod - Zod schema generation from Drizzle schemas

**Backend Framework**:
- express - Web server framework
- vite - Build tool and dev server

**Utilities**:
- cheerio - HTML parsing for web scraping and URL import feature
- date-fns - Date manipulation
- nanoid - Unique ID generation
- clsx & tailwind-merge - Conditional CSS class handling

**Development Tools**:
- TypeScript - Type safety
- @replit/vite-plugin-runtime-error-modal - Development error overlay
- @replit/vite-plugin-cartographer - Replit development integration (conditional)

## Key Features

### AI-Powered URL Import
- Endpoint: POST `/api/platforms/extract-from-url`
- Uses OpenAI GPT-4o-mini to extract business information from websites
- Automated SSRF protections: DNS resolution checking, private IP blocking, redirect prevention, 10s timeout
- Extracts: business name, description, category
- Image handling priority:
  1. Uses Open Graph image from the website if available
  2. Generates professional hero image via OpenAI image generation based on category
- Integrated into admin panel with "Import from URL" dialog

### Logo Generation
- Endpoint: POST `/api/platforms/generate-logo`
- Generates professional logos/hero images for platforms
- Uses OpenAI image generation to create relevant, professional imagery based on platform category
- Integrated into admin panel with sparkle button (✨) next to Logo URL field
- Available in both "Add Platform" and "Edit Platform" dialogs
- Requires category to be filled before generation

### Company Logo Management
- Logo field supports both external URLs and base64-encoded images
- Admin panel provides two upload methods:
  1. URL input - paste any image URL
  2. File upload - select and upload image files (converted to base64)
- File upload features:
  - 5MB size limit
  - Image format validation
  - Live preview with error handling
  - Base64 encoding for storage
- Logo display:
  - Navigation bar shows logo when available
  - Falls back to company name text if no logo
  - Supports both URL and data URL formats