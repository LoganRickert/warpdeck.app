# WarpDeck

A single-page dashboard portal for quick link access, built with React, TypeScript, and Express.js.

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## 🌟 Features

- **Customizable Dashboards**: Create multiple dashboards with custom layouts
- **Smart Link Management**: Organize links with descriptions, icons, and thumbnails
- **Drag & Drop Interface**: Intuitive drag-and-drop reordering of dashboards and links
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Theme Support**: Light and dark theme options
- **Data Persistence**: Local file-based storage with export/import capabilities
- **Favicon Integration**: Automatic favicon fetching for links
- **Grid Layout Control**: Customize card sizes and grid columns per link

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Build the Docker image
docker build -t warpdeck:latest .

# Run the container
docker run -p 8089:8089 -v $(pwd)/server/data:/app/server/data warpdeck:latest
```

The application will be available at `http://localhost:8089`

### Manual Installation

#### Prerequisites
- Node.js 20+
- pnpm

#### Setup
```bash
# Install dependencies
pnpm install

# Install client dependencies
cd client && pnpm install

# Install server dependencies
cd server && pnpm install

# Build the application
pnpm run build

# Start the server
pnpm start
```

## 🏗️ Project Structure

```
warpdeck/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── api/           # API client functions
│   │   └── types.ts       # TypeScript type definitions
│   └── package.json
├── server/                 # Express.js backend
│   ├── src/
│   │   ├── api/           # API route handlers
│   │   ├── lib/           # Utility libraries
│   │   └── index.ts       # Server entry point
│   └── package.json
├── Dockerfile              # Multi-stage Docker build
├── .dockerignore           # Docker build exclusions
└── package.json            # Root package configuration
```

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm run dev:server         # Start server in development mode
pnpm run dev:client         # Start client in development mode

# Building
pnpm run build              # Build both client and server
pnpm run docker:build       # Build Docker image
pnpm run docker:run         # Run Docker container

# Server management
pnpm run start              # Start production server
```

### Development Workflow

1. **Start the development server**:
   ```bash
   pnpm run dev:server
   ```

2. **Start the development client**:
   ```bash
   pnpm run dev:client
   ```

3. **Make changes** to the code - both client and server support hot reloading

4. **Build for production**:
   ```bash
   pnpm run build
   ```

## 🔧 Configuration

### Environment Variables

- `PORT`: Server port (default: 8089)
- `DATA_DIR`: Data storage directory (default: `/app/server/data`)
- `NODE_ENV`: Environment mode (default: `production`)

### Data Storage

The application stores data in the `server/data/` directory:
- `settings.json`: Global application settings
- `dashboards/`: Individual dashboard files
- `images/`: Uploaded thumbnails and images

## 📱 Usage

### Creating Dashboards

1. Navigate to Settings → Dashboards
2. Click "Add Dashboard"
3. Enter a title and slug
4. Customize the layout (columns, card size, gutter)

### Managing Links

1. Select a dashboard to edit
2. Click "Add Link" or edit existing links
3. Configure link properties:
   - Label and URL
   - Description and icon
   - Thumbnail image
   - Color customization
   - Grid column span
   - Open in new tab option

### Customization Options

- **Color Bar**: Left border color for each link card
- **Background Color**: Custom background for link cards
- **Text Color**: Custom text color for link cards
- **Grid Columns**: Control how many columns a link spans
- **Card Size**: Small, medium, or large card sizes

## 🐳 Docker

### Building the Image

```bash
docker build -t warpdeck:latest .
```

### Running the Container

```bash
# Basic run
docker run -p 8089:8089 warpdeck:latest

# With data persistence
docker run -p 8089:8089 -v $(pwd)/server/data:/app/server/data warpdeck:latest

# With custom port
docker run -p 3000:8089 warpdeck:latest
```

### Docker Compose

```yaml
version: '3.8'
services:
  warpdeck:
    build: .
    ports:
      - "8089:8089"
    volumes:
      - ./server/data:/app/server/data
    environment:
      - NODE_ENV=production
```

## 🧪 Testing

```bash
# Run client tests
cd client && pnpm test

# Run server tests
cd server && pnpm test
```

## 📦 Deployment

### Production Build

```bash
# Build the application
pnpm run build

# Start production server
pnpm start
```

### Docker Deployment

```bash
# Build production image
docker build -t warpdeck:latest .

# Deploy to your preferred container platform
docker push your-registry/warpdeck:latest
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE.md) file for details.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/)
- UI components from [Material-UI](https://mui.com/)
- Drag and drop functionality from [@dnd-kit](https://dndkit.com/)
- Backend powered by [Express.js](https://expressjs.com/)

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/LoganRickert/warpdeck.app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/LoganRickert/warpdeck.app/discussions)
- **Wiki**: [GitHub Wiki](https://github.com/LoganRickert/warpdeck.app/wiki)

---

**WarpDeck** - Your personal dashboard portal for quick link access.
