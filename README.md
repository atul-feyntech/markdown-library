# Markdown Library 📚

A beautiful, Apple Music-inspired markdown reader and library manager with AI-powered features.

![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)

## Features

- 🎵 **Apple Music-style UI** - Sleek sidebar navigation with list/grid views
- 📖 **WYSIWYG Markdown Editor** - Edit with live preview using `@uiw/react-md-editor`
- 🤖 **AI Assistant** - Powered by OpenRouter (free models available)
  - Document summarization
  - Auto-classification and tagging
  - Chat about your documents
- 📊 **Reading Analytics** - Track time spent, sessions, and reading history
- 🔍 **Folder Browser** - Navigate and explore your markdown files
- 🌓 **Dark/Light Theme** - Beautiful themes for comfortable reading
- ⚡ **Fast C++ Backend** - Uses Crow framework for high performance

## Screenshots

Coming soon...

## Prerequisites

### Ubuntu/Debian
```bash
# Install build essentials and dependencies
sudo apt update
sudo apt install -y build-essential cmake git curl

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### macOS
```bash
# Install Xcode command line tools
xcode-select --install

# Install Node.js via Homebrew
brew install node
```

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/atul-feyntech/markdown-library.git
cd markdown-library
```

### 2. Build the C++ Backend
```bash
cd backend

# Initialize and fetch submodules (Crow, nlohmann/json, Asio)
git submodule update --init --recursive

# Build
make

# The binary will be created as ./markdown-server
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

## Running the Application

### Start the Backend
```bash
cd backend
./markdown-server
# Server runs on http://localhost:8080
```

### Start the Frontend (Development)
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

### Production Build
```bash
cd frontend
npm run build
npm start
```

## Configuration

### Watch Folders
By default, the app scans:
- `~/Documents/`
- `~/Downloads/`
- Your home directory (configurable)

You can add/remove folders in the **Settings** panel (gear icon in sidebar).

### AI Features (Optional)
To enable AI features:
1. Get a free API key from [OpenRouter](https://openrouter.ai/keys)
2. Click **AI Assistant** in the sidebar
3. Enter your API key in Settings

Free models available:
- Google Gemini 2.0 Flash
- Meta Llama 3.3 70B
- Mistral 7B
- Google Gemma 2 9B

## Project Structure

```
markdown-library/
├── backend/                 # C++ backend server
│   ├── main.cpp            # API endpoints
│   ├── FileSystem.cpp      # File operations
│   ├── Makefile            # Build configuration
│   └── lib/                # Dependencies (Crow, json, Asio)
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # Pages
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities
│   └── package.json
└── README.md
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/files` | GET | List markdown files (supports `?folders=` param) |
| `/api/file` | GET | Get file content (`?path=`) |
| `/api/file` | POST | Save file (JSON: `{path, content}`) |
| `/health` | GET | Health check |

## Tech Stack

**Backend:**
- C++17
- [Crow](https://github.com/CrowCpp/Crow) - Web framework
- [nlohmann/json](https://github.com/nlohmann/json) - JSON library
- [Asio](https://github.com/chriskohlhoff/asio) - Networking

**Frontend:**
- [Next.js 16](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [@uiw/react-md-editor](https://github.com/uiwjs/react-md-editor) - Markdown editor
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [Lucide Icons](https://lucide.dev/)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by Apple Music's beautiful UI
- Thanks to the open-source community for the amazing libraries
