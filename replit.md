# SmritiSaar - Legal Case Retrieval and Summarization System

## Overview

SmritiSaar is an ML-driven legal case law retrieval and summarization platform that helps legal professionals find relevant case precedents and generate AI-powered summaries. The system features bilingual support (English and Tamil), advanced search capabilities, and intelligent document processing. Built as a full-stack web application, it combines modern React frontend with Express.js backend, integrated with Google's Gemini AI for case analysis and summarization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design system
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds
- **Theme System**: Custom theme provider supporting light/dark modes with legal-themed color palette (primary red, accent gold)

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for full-stack type safety
- **Database ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **File Processing**: Multer for file uploads with support for Excel, CSV, and ZIP formats
- **API Design**: RESTful APIs with structured request/response schemas using Zod validation

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon Database as the serverless provider
- **Schema Design**: Two main tables - `legal_cases` for case data and `search_history` for analytics
- **Data Types**: JSONB fields for flexible metadata storage (tags, filters)
- **Indexing Strategy**: Optimized for text search across English and Tamil content

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store using connect-pg-simple
- **Security**: No complex authentication system implemented - focusing on core legal research functionality
- **Data Access**: Direct database queries through ORM with proper input validation

### AI Integration and ML Pipeline
- **AI Provider**: Google Gemini API for case analysis and summarization
- **Processing Steps**: Multi-stage pipeline including query processing, dataset search, AI analysis, relevance scoring, and summarization
- **Analysis Types**: Support for precedent analysis, comprehensive case review, and summarization
- **Bilingual Processing**: Handles both English and Tamil legal documents

### File Processing System
- **Supported Formats**: Excel (.xlsx, .xls), CSV, and ZIP files for bulk case imports
- **Processing Pipeline**: Automated extraction, validation, and database insertion
- **Data Transformation**: Converts various file formats into standardized case records
- **Batch Processing**: Handles large datasets with progress tracking

### Search and Filtering System
- **Advanced Search**: Multi-field search across case content, titles, and metadata
- **Filter Options**: Court type, jurisdiction, case type, date ranges, and judge filtering
- **Relevance Scoring**: AI-powered relevance scoring for search result ranking
- **Search History**: Tracks user queries for analytics and improved recommendations

### Development and Deployment
- **Development Stack**: Hot module replacement with Vite, TypeScript checking, and development middleware
- **Build Process**: Separate client and server builds with optimized static asset serving
- **Environment Configuration**: Environment variable management for API keys and database connections
- **Monitoring**: Request logging and error handling middleware

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **@google/genai**: Google Gemini AI integration for case analysis
- **drizzle-orm**: Type-safe database operations and migrations
- **@tanstack/react-query**: Server state management and data fetching

### UI and Styling
- **@radix-ui/react-***: Comprehensive set of headless UI components
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library for consistent iconography

### File Processing
- **multer**: File upload middleware
- **adm-zip**: ZIP file extraction and processing
- **xlsx**: Excel file reading and processing capabilities

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Type system and compiler
- **@replit/vite-plugin-***: Replit-specific development plugins
- **wouter**: Lightweight routing library

### Form and Validation
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Form validation resolvers
- **zod**: Schema validation and type inference

### Session and Security
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store
- **cors**: Cross-origin resource sharing configuration