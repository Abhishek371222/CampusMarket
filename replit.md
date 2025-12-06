# Campus Marketplace - Replit Agent Guide

## Overview

Campus Marketplace is a student-focused peer-to-peer marketplace platform that enables college and university students to buy and sell textbooks, electronics, furniture, and other items within their campus community. The platform emphasizes safety, trust, and campus-specific commerce by restricting access to verified students and providing location-based filtering.

**Core Purpose**: Connect students on the same campus to facilitate safe, convenient transactions for essential college items.

**Key Features**:
- Product listings with categories (Textbooks, Electronics, Furniture, Clothing, etc.)
- Real-time messaging between buyers and sellers
- Community posts for campus news, lost & found, and general discussions
- Location-based filtering (country, state, city, institution)
- User verification and trust system
- AI-powered chatbot for student assistance
- Admin dashboard for user verification management

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool.

**Routing**: Wouter for client-side routing (lightweight alternative to React Router).

**State Management**: 
- TanStack Query (React Query) for server state management
- React Context API for authentication state
- Local component state with React hooks

**UI Framework**: 
- Shadcn/ui components (Radix UI primitives with Tailwind CSS styling)
- Tailwind CSS v4 for styling with CSS variables for theming
- Lucide React for icons
- Custom component library following the "new-york" style variant

**Form Handling**: React Hook Form with Zod for schema validation.

**Design Decisions**:
- **Component-based architecture**: All UI elements are modular, reusable components in `/client/src/components/ui/`
- **Type-safe forms**: Zod schemas ensure runtime validation matches TypeScript types
- **Optimistic updates**: TanStack Query provides automatic cache management and optimistic UI updates
- **Accessibility-first**: Radix UI primitives ensure keyboard navigation and screen reader support

### Backend Architecture

**Framework**: Express.js on Node.js with TypeScript.

**API Design**: RESTful API with conventional HTTP methods (GET, POST, PUT, DELETE).

**Authentication**:
- Replit Auth (OpenID Connect) for single sign-on
- Passport.js for authentication middleware
- Session-based authentication with express-session
- PostgreSQL session store (connect-pg-simple) for production persistence

**Real-time Communication**: 
- WebSocket server for live messaging
- Custom WebSocketHub class managing user connections and message broadcasting
- Authentication via session tokens passed through WebSocket messages

**File Uploads**: 
- Multer middleware for handling multipart form data
- Local file storage in `/uploads` directory
- Support for images (jpeg, jpg, png, gif, webp) and documents (pdf, doc, docx)
- 10MB file size limit

**Design Decisions**:
- **Session-based auth over JWT**: Simpler server-side session invalidation and better security for a campus marketplace
- **WebSocket for messaging**: Real-time updates provide better UX than polling for chat messages
- **Monolithic architecture**: Single server handles both API and static file serving, simplifying deployment on Replit

### Data Storage

**Database**: PostgreSQL with Drizzle ORM.

**Schema Design**:
- **Users**: Stores student profiles with Replit user ID, location, institution, verification status
- **Locations**: Hierarchical location data (country → state → city → pincode)
- **Institutions**: Educational institutions linked to locations
- **Products**: Marketplace listings with seller, category, condition, pricing, images
- **Chats & Messages**: One-to-one messaging system with chat participants tracking
- **Community Posts**: Campus-wide posts with comments and likes
- **Offers**: Price negotiation system for products
- **Notifications**: User activity notifications
- **Sessions**: Express session storage for authentication persistence
- **Uploads**: File metadata tracking
- **Phone Verifications**: OTP-based phone number verification
- **AI Chat Sessions**: Conversation history for AI assistant

**Data Relationships**:
- Users belong to Locations and Institutions (many-to-one)
- Products belong to Users (sellers) and Locations
- Chats have multiple ChatParticipants linking to Users
- Messages belong to Chats and Users
- Community posts have likes and comments from Users

**Design Decisions**:
- **Drizzle ORM**: Type-safe database access with minimal runtime overhead
- **UUID primary keys**: Generated via `gen_random_uuid()` for distributed scalability
- **Soft deletes avoided**: Hard deletes keep database lean for student marketplace use case
- **Denormalized location data**: Products store locationId directly for efficient filtering

### External Dependencies

**Third-Party Services**:
- **Replit Auth**: OAuth/OIDC provider for user authentication
- **OpenAI API**: Powers the AI chatbot assistant (GPT-5 model)
  - System prompt configured for student marketplace assistance
  - Conversation history stored in database
  - Rate limiting recommended for production use

**Database**:
- **PostgreSQL**: Primary data store, provisioned via `DATABASE_URL` environment variable
- **Drizzle Kit**: Database migration tool (migrations in `/migrations` directory)

**Development Tools**:
- **Replit-specific plugins**: 
  - `@replit/vite-plugin-runtime-error-modal`: Development error overlay
  - `@replit/vite-plugin-cartographer`: Code navigation assistance
  - `@replit/vite-plugin-dev-banner`: Development mode indicator
- **Custom Vite plugin**: `vite-plugin-meta-images.ts` updates OpenGraph meta tags with Replit deployment URLs

**Environment Variables Required**:
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret key for session encryption
- `ISSUER_URL`: Replit OIDC issuer URL (defaults to https://replit.com/oidc)
- `REPL_ID`: Replit application identifier
- `OPENAI_API_KEY`: Optional, for AI chatbot functionality

**Build Process**:
- Client: Vite builds React app to `/dist/public`
- Server: esbuild bundles Express server to `/dist/index.cjs`
- Production start: `node dist/index.cjs` serves both API and static files

**Design Decisions**:
- **Replit-first deployment**: Optimized for Replit's hosting environment with automatic HTTPS and domain provisioning
- **OpenAI integration**: Provides value-add AI assistance without being critical to core marketplace functionality
- **Session persistence in PostgreSQL**: Ensures users stay logged in across server restarts on Replit