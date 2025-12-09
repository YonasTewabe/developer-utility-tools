# Encryption Application

A full-stack application with Node.js backend and React frontend.

## Project Structure

```
encryption/
├── server/          # Node.js/Express backend
├── client/          # React frontend
├── package.json     # Root package.json with scripts
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Install all dependencies (root, server, and client):
```bash
npm run install-all
```

Or install them separately:
```bash
npm install
cd server && npm install
cd ../client && npm install
```

### Running the Application

#### Development Mode (runs both server and client)

From the root directory:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- React frontend on `http://localhost:3000`

#### Run Server and Client Separately

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

### Environment Variables

Copy the example environment file in the server directory:
```bash
cp server/.env.example server/.env
```

Then edit `server/.env` with your configuration.

## Available Scripts

- `npm run dev` - Run both server and client in development mode
- `npm run server` - Run only the backend server
- `npm run client` - Run only the React frontend
- `npm run build` - Build the React app for production
- `npm run install-all` - Install dependencies for root, server, and client

## Technologies

- **Backend**: Node.js, Express
- **Frontend**: React
- **Development**: Concurrently (for running both servers)

