# Environment Configuration Guide

This document explains how to work with the different environments (development, test, and production) in the InterviewPrep application.

## Available Environments

The application supports three environments:

1. **Development** - For local development work
2. **Test** - For running tests and QA
3. **Production** - For the live application

## Environment Files

### Backend Environment Files

- `.env.development` - Development environment configuration
- `.env.test` - Test environment configuration
- `.env.production` - Production environment configuration

### Frontend Environment Files

- `.env.development` - Development environment configuration
- `.env.test` - Test environment configuration
- `.env.production` - Production environment configuration

## Running in Different Environments

### Backend

To run the backend in a specific environment:

```bash
# Development environment (default)
NODE_ENV=development npm run start

# Test environment
NODE_ENV=test npm run start

# Production environment
NODE_ENV=production npm run start
```

### Frontend

To run the frontend in a specific environment:

```bash
# Development environment (default)
npm run start

# Test environment
npm run start:test

# Production environment
npm run build
```

## Environment-Specific Features

### Database Configuration

- **Development**: Uses a local MongoDB database named `interview-prep-dev`
- **Test**: Uses a local MongoDB database named `interview-prep-test`
- **Production**: Uses a production MongoDB database

### Elasticsearch Configuration

- **Development**: Not configured by default
- **Test**: Not configured by default
- **Production**: Uses elastic.co hosting with a production index

## Adding Environment-Specific Scripts

You may want to add these scripts to your `package.json` files:

### Backend package.json

```json
"scripts": {
  "start": "ts-node src/server.ts",
  "start:dev": "NODE_ENV=development ts-node src/server.ts",
  "start:test": "NODE_ENV=test ts-node src/server.ts",
  "start:prod": "NODE_ENV=production ts-node src/server.ts"
}
```

### Frontend package.json

```json
"scripts": {
  "start": "react-scripts start",
  "start:test": "env-cmd -f .env.test react-scripts start",
  "start:prod": "env-cmd -f .env.production react-scripts start",
  "build": "react-scripts build",
  "build:test": "env-cmd -f .env.test react-scripts build",
  "build:prod": "env-cmd -f .env.production react-scripts build"
}
```

## Environment Variables

### Key Backend Variables

| Variable | Description |
|----------|-------------|
| PORT | Server port |
| NODE_ENV | Environment name (development, test, production) |
| MONGODB_URI | MongoDB connection string |
| JWT_SECRET | Secret key for JWT tokens |
| ELASTICSEARCH_URL | URL for Elasticsearch (production only) |
| ELASTICSEARCH_INDEX | Elasticsearch index name |

### Key Frontend Variables

| Variable | Description |
|----------|-------------|
| REACT_APP_API_URL | Backend API URL |
| REACT_APP_ENV | Environment name |

## Best Practices

1. Never hardcode environment-specific values in your code
2. Always use environment variables for configuration
3. Keep sensitive information (API keys, secrets) out of version control
4. Use separate databases for each environment
5. Test changes in development and test environments before deploying to production
