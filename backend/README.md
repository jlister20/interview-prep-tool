# Interview Prep Tool - Backend

This is the backend server for the Interview Prep Tool, an AI-powered interview preparation web application. It provides APIs for user authentication, document management, interview simulation, and feedback generation.

## Features

- User authentication and profile management
- Document upload and management (CV and job specifications)
- AI-powered interview question generation
- Interview session management
- Response recording and analysis
- Detailed feedback generation

## Tech Stack

- Node.js with Express
- TypeScript for type safety
- MongoDB for data storage
- JWT for authentication
- OpenAI API for AI capabilities
- Multer for file uploads

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- OpenAI API key

### Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```
5. Update the `.env` file with your configuration values

### Development

Start the development server:

```
npm run dev
```

The server will run on http://localhost:5000 by default.

### Build for Production

Build the TypeScript code:

```
npm run build
```

Start the production server:

```
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/me` - Get current user profile

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `DELETE /api/users/:id` - Delete user (admin only)

### Document Management
- `POST /api/documents/upload` - Upload a document (CV or job specification)
- `GET /api/documents` - Get all documents for current user
- `GET /api/documents/:id` - Get document by ID
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document
- `POST /api/documents/:id/process` - Process document with AI

### Interview Management
- `POST /api/interviews/sessions` - Create a new interview session
- `POST /api/interviews/questions/generate` - Generate questions based on user documents
- `GET /api/interviews/sessions` - Get all interview sessions for current user
- `GET /api/interviews/sessions/:id` - Get interview session by ID
- `POST /api/interviews/sessions/:sessionId/responses` - Save response to a question
- `PUT /api/interviews/sessions/:id/end` - End interview session

### Feedback Management
- `POST /api/feedback/generate/:interviewId` - Generate feedback for an interview session
- `GET /api/feedback/interview/:interviewId` - Get feedback by interview ID
- `GET /api/feedback/:id` - Get feedback by feedback ID
- `GET /api/feedback` - Get all feedback for current user

## Project Structure

```
src/
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── models/          # MongoDB models
├── routes/          # API routes
├── server.ts        # Entry point
uploads/             # Uploaded files
```

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT token generation
- `OPENAI_API_KEY` - OpenAI API key
- `CORS_ORIGIN` - Allowed CORS origin
