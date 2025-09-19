# CodeTEI Demo Application

A web application demonstrating the CodeTEI specification for annotating and managing source code works.

## Features

- **Code Work Registration**: Register source code as CodeTEI XML with automatic hash generation
- **Real-time XML Generation**: Preview CodeTEI XML as you type
- **File Upload**: Import existing CodeTEI XML files
- **Code Browsing**: View and browse registered code works
- **AI Explanations**: Generate explanations for entire works or specific lines (using ChatGPT)
- **User Feedback**: Rate understanding of AI explanations (1-3 scale)
- **Execution Records**: Log container and blockchain execution records
- **XML Download**: Export CodeTEI XML files

## Technology Stack

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Vercel Postgres + Prisma ORM
- **AI**: OpenAI GPT (with fallback to mock explanations)
- **Deployment**: Vercel

## Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- Vercel account (for database)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

3. Configure your `.env.local`:
```env
# Vercel Postgres (auto-populated when deployed to Vercel)
POSTGRES_URL="your-postgres-url"
POSTGRES_PRISMA_URL="your-postgres-prisma-url"
POSTGRES_URL_NON_POOLING="your-postgres-non-pooling-url"

# OpenAI API (optional - will use mock explanations if not set)
OPENAI_API_KEY="sk-your-openai-api-key"
```

### Database Setup

1. Generate Prisma client:
```bash
npx prisma generate
```

2. Push database schema:
```bash
npx prisma db push
```

### Development

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set up Vercel Postgres:
   - Go to your project dashboard on Vercel
   - Navigate to the Storage tab
   - Create a new Postgres database
   - Environment variables will be auto-populated

4. Run database migration:
```bash
vercel env pull .env.local
npx prisma generate
npx prisma db push
```

## Usage

### Registering Code Works

1. Go to "Register Code Work"
2. Enter title, author, and source code
3. Select programming language
4. Watch CodeTEI XML generate in real-time
5. Submit to save to database

### Viewing and Annotating

1. Go to "View Code Works" to browse registered works
2. Click "View & Annotate" on any work
3. Click lines to select them
4. Generate AI explanations for works or specific lines
5. Rate your understanding of explanations
6. Add execution records (container or blockchain)

### CodeTEI XML Features

- Automatic SHA3-256 hash generation
- Stable URI scheme: `codetei://sha3-256-<hash>`
- TEI P5 compliant XML structure
- Line-by-line code markup
- Metadata preservation

## API Endpoints

- `GET /api/code-works` - List all code works
- `POST /api/code-works` - Create new code work
- `GET /api/code-works/[id]` - Get specific code work with annotations
- `POST /api/explanations` - Create new explanation
- `PUT /api/explanations` - Update explanation feedback
- `POST /api/executions` - Create execution record
- `POST /api/ai/explain` - Generate AI explanation

## Database Schema

- **CodeWork**: Stores code works with metadata and XML
- **Explanation**: AI/human explanations linked to works or lines
- **Execution**: Container and blockchain execution records

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `POSTGRES_URL` | PostgreSQL connection string | Yes |
| `POSTGRES_PRISMA_URL` | Prisma-specific connection string | Yes |
| `POSTGRES_URL_NON_POOLING` | Non-pooling connection string | Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI explanations | No* |

\* If not provided, mock explanations will be used instead.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is part of the CodeTEI specification development.