# Utility Tools Application

A frontend-only React application providing a collection of useful developer and utility tools, including encryption, formatting, conversion, and more.

## Project Structure

```
encryption/
├── public/              # Public assets
│   └── index.html
├── src/
│   ├── components/     # React components
│   ├── services/       # Service modules
│   ├── App.js          # Main application component
│   ├── App.css         # Application styles
│   └── index.js        # Entry point
├── .env                # Environment variables
├── .env.example        # Environment variables template
├── package.json        # Dependencies and scripts
└── README.md
```

## Features

### 🔒 Encryption/Decryption
- Encrypt and decrypt text and JSON objects
- Uses AES-256-GCM encryption
- Client-side encryption using Web Crypto API
- Configurable encryption keys via environment variables
- Supports both object and text encryption

### 📝 JSON Formatter
- Format and beautify unformatted JSON
- Syntax validation
- Easy copy-to-clipboard functionality

### 🔄 File Format Converter
- Convert between multiple data formats:
  - JSON
  - YAML
  - XML
  - FormData
  - .env files
- Bidirectional conversion between all supported formats

### 🔍 Diff Checker
- Compare two text inputs side-by-side
- Highlight differences line by line
- Show only lines with differences
- Visual highlighting for easy identification

### 🔗 URL Shortener
- Shorten long URLs using is.gd API
- Automatic protocol detection
- URL validation
- Clickable shortened URLs
- Copy-to-clipboard functionality

### 🌓 Dark Mode
- Toggle between light and dark themes
- iOS-style sliding toggle switch
- Preferences saved in browser localStorage
- Persistent across page reloads

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository or navigate to the project directory

2. Install dependencies:
```bash
npm install
```

### Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` with your encryption configuration:
```env
REACT_APP_ENCRYPTION_ALGORITHM=aes-256-gcm
REACT_APP_ENCRYPTION_KEY=your-encryption-key-change-this-in-production
REACT_APP_ENCRYPTION_IV=0123456789abcdef01234567
REACT_APP_ENCRYPTION_SALT=default-salt
```

**Note:** In React, environment variables must be prefixed with `REACT_APP_` to be accessible in the browser. These values will be exposed in the client bundle, so use appropriate keys for your use case.

### Running the Application

#### Development Mode

From the root directory:
```bash
npm start
```

This will start the React development server on `http://localhost:3000`

#### Production Build

To create a production build:
```bash
npm run build
```

The build folder will contain the optimized production files.

## Available Scripts

- `npm start` - Start the development server
- `npm run build` - Build the app for production
- `npm test` - Run tests (if configured)
- `npm run eject` - Eject from Create React App (irreversible)

## Technologies

- **Frontend**: React 18.2.0
- **Styling**: CSS3 with custom components
- **Encryption**: Web Crypto API (AES-256-GCM)
- **Notifications**: react-toastify
- **Data Parsing**: js-yaml
- **Build Tool**: react-scripts (Create React App)

## Features Details

### Encryption Service
- Uses Web Crypto API for browser-native encryption
- PBKDF2 key derivation (1000 iterations, SHA-256)
- Compatible with server-side encryption format
- Environment variable configuration
- Automatic key initialization

### UI/UX
- Responsive sidebar navigation
- Full-width layouts for all tools
- Dark mode support
- Toast notifications for user feedback
- Copy-to-clipboard functionality throughout
- Clear All button to reset all components

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Security Notes

- Encryption keys are stored in environment variables
- All encryption/decryption happens client-side
- Environment variables are bundled into the client (consider this for production)
- For production use, consider implementing a secure key management solution

## Contributing

This is a utility application. Feel free to fork and modify for your needs.

## License

ISC
