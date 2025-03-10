# Interview Prep Tool

An AI-powered interview preparation web application that helps users practice for job interviews by generating relevant questions based on their CV and job specifications, recording their responses, and providing AI-powered feedback.

## Features

### User Input
- CV and job specification upload/input functionality
- Support for file uploads (PDF, DOC, DOCX, TXT) and direct text input
- Option to specify industry and role type for more targeted questions

### Interview Simulation
- AI-generated questions based on user's CV and job specification
- Text-to-speech functionality to ask questions aloud
- Speech recognition to capture user's verbal responses
- Timer for responses to simulate real interview conditions
- Audio recording and playback of responses

### Feedback System
- AI analysis of user responses
- Detailed feedback on answer quality, delivery, confidence, and language usage
- Identification of strengths and areas for improvement
- Suggestions for better responses
- Option to retry questions

### User Dashboard
- Progress tracking and performance analytics
- History of practice sessions
- Document management
- Quick access to start new sessions

## Tech Stack

### Frontend
- **Framework**: React.js with TypeScript
- **UI Library**: Material-UI for responsive design
- **State Management**: Redux Toolkit
- **Form Handling**: Formik with Yup validation
- **API Client**: Axios
- **Speech Services**: Web Speech API for speech recognition and synthesis

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Validation**: Express Validator

### AI Integration
- **OpenAI API**: For question generation, response analysis, and feedback
- **Speech Recognition**: For transcribing verbal responses
- **Text-to-Speech**: For delivering questions verbally

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- MongoDB (local or Atlas)
- OpenAI API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/interview-prep-tool.git
cd interview-prep-tool
```

2. Run the setup script to install all dependencies and create environment files
```bash
npm run setup
```

3. Configure environment variables
   - Update `.env` files in both frontend and backend directories with your specific configuration
   - Most importantly, add your OpenAI API key to the backend `.env` file

4. Start the development servers
```bash
npm run dev
```

This will start both the frontend and backend servers concurrently. The frontend will be available at http://localhost:3000 and the backend at http://localhost:5000.

### Alternative Setup

If you prefer to set up each part separately:

```bash
# Install all dependencies
npm run install:all

# Start backend server only
npm run start:backend

# Start frontend server only (in a separate terminal)
npm run start:frontend
```

## Project Structure

```
interview-prep-tool/
├── frontend/                 # React frontend application
│   ├── public/               # Static files
│   ├── src/                  # Source code
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── store/            # Redux store and slices
│   │   ├── services/         # API services
│   │   └── App.tsx           # Main application component
│   ├── package.json          # Frontend dependencies
│   └── tsconfig.json         # TypeScript configuration
│
├── backend/                  # Node.js Express backend
│   ├── src/                  # Source code
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Express middleware
│   │   ├── models/           # MongoDB models
│   │   ├── routes/           # API routes
│   │   └── server.ts         # Entry point
│   ├── uploads/              # Uploaded files directory
│   ├── package.json          # Backend dependencies
│   └── tsconfig.json         # TypeScript configuration
│
├── package.json              # Root package.json for monorepo setup
└── README.md                 # Project documentation
```

## Available Scripts

In the project root directory, you can run:

- `npm run dev` - Start both frontend and backend in development mode
- `npm run start:frontend` - Start only the frontend
- `npm run start:backend` - Start only the backend
- `npm run build` - Build both frontend and backend for production
- `npm run test` - Run tests for both frontend and backend
- `npm run lint` - Run linting for both frontend and backend
- `npm run setup` - Install all dependencies and create environment files
- `npm run clean` - Remove all node_modules and build directories

## Deployment

The application is prepared for deployment to various platforms:

### Frontend
- Can be deployed to Vercel, Netlify, or any static hosting service
- Build with `cd frontend && npm run build`

### Backend
- Can be deployed to Heroku, AWS, or any Node.js hosting service
- Build with `cd backend && npm run build`
- Start with `cd backend && npm start`

### Full Stack
- For Heroku deployment, the root package.json includes a `heroku-postbuild` script

## Data Privacy

- User data is securely stored and encrypted
- OpenAI API interactions follow data privacy best practices
- Users can delete their data at any time
- No data is shared with third parties without explicit consent

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Acknowledgments

- OpenAI for providing the AI capabilities
- Web Speech API for speech recognition and synthesis
- Material-UI team for the excellent component library
