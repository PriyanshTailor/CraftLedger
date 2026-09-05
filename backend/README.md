# CraftLedger Backend

The intelligent accounting, inventory, and financial decision-support platform built for urban furniture businesses.

## Technologies
- Node.js
- Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT)
- Zod for Validation

## Getting Started

1. Copy `.env.example` to `.env` and configure variables.
2. Ensure MongoDB is running.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

## Folder Structure
- `/src/config`: Environment and database configuration
- `/src/controllers`: Request handlers
- `/src/models`: Mongoose database schemas
- `/src/routes`: API route definitions
- `/src/services`: Business logic
- `/src/middleware`: Custom middleware (auth, error handling)
- `/src/validators`: Zod validation schemas
- `/src/utils`: Helper functions (response formatting)
