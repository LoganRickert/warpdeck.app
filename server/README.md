# WarpDeck Server

A robust, scalable backend server for the WarpDeck dashboard application, built with Node.js, Express, and TypeScript. The server provides a RESTful API for managing dashboards, links, settings, and file uploads with automatic favicon downloading capabilities.

## 🚀 Features

### **Dashboard Management**
- **CRUD Operations**: Create, read, update, and delete dashboards
- **JSON Storage**: File-based storage with automatic directory management
- **Import/Export**: Backup and restore dashboard configurations
- **Data Validation**: Ensures data integrity and consistency
- **File-based Storage**: JSON-based persistent storage

### **Link Management**
- **Rich Link Data**: Store links with metadata, icons, and customization
- **Automatic Favicon Download**: Intelligent favicon fetching from websites
- **Multiple Fallback Strategies**: HTML parsing, common locations, and error handling
- **Bulk Operations**: Refresh favicons across entire dashboards

### **File Management**
- **Thumbnail Uploads**: Handle image uploads with multer
- **Favicon Storage**: Organize and serve downloaded favicons
- **Static File Serving**: Efficient delivery of uploaded content
- **Cache Control**: Optimized caching for static assets

### **Settings Management**
- **Global Configuration**: Theme, directories, and default dashboard
- **Persistent Storage**: JSON-based settings with automatic initialization
- **Environment Overrides**: Configurable via environment variables
- **Validation**: Type-safe settings with schema validation

### **API Features**
- **RESTful Design**: Clean, consistent API endpoints
- **CORS Support**: Cross-origin resource sharing enabled
- **Error Handling**: Comprehensive error responses and logging
- **Rate Limiting**: Built-in request size limits and validation

## 🛠️ Technology Stack

### **Core Technologies**
- **Node.js**: JavaScript runtime environment
- **Express.js**: Fast, unopinionated web framework
- **TypeScript**: Full type safety and better development experience

### **File System**
- **JSON Storage**: Human-readable data format
- **Automatic Backups**: Export/import functionality
- **Directory Management**: Self-organizing file structure

### **Utilities**
- **UUID Generation**: Unique identifier creation
- **File Archiving**: ZIP compression for exports
- **Favicon Downloading**: Automatic website icon fetching

## 📁 Project Structure

```
server/
├── data/                   # Persistent data storage
│   ├── dashboards/         # Dashboard JSON files
│   ├── images/             # Downloaded favicons
│   ├── uploads/            # User-uploaded thumbnails
│   └── settings.json       # Global application settings
├── src/
│   ├── api/                # API route handlers
│   │   ├── dashboards.ts   # Dashboard CRUD operations
│   │   ├── settings.ts     # Settings management
│   │   ├── upload.ts       # File upload handling
│   │   └── utils.ts        # Utility endpoints
│   ├── lib/                # Core library functions
│   │   ├── favicon.ts      # Favicon download logic
│   │   ├── fsStore.ts      # File system operations
│   │   └── schema.ts       # TypeScript type definitions
│   └── index.ts            # Server entry point
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+
- pnpm (recommended) or npm
- Access to external websites (for favicon downloading)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd warpdeck/server
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Create .env file
   cp .env.example .env
   
   # Edit .env with your configuration
   PORT=8089
   DATA_DIR=./data
   NODE_ENV=development
   ```

4. **Start development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. **Verify server is running**
   - Server starts on port 8089 (default)
   - API available at `http://localhost:8089/api`
   - Check console for initialization messages

### **Production Build**

```bash
# Build the application
pnpm build

# Start production server
pnpm start

# Clean build artifacts
pnpm clean
```

## 🔧 Configuration

### **Environment Variables**

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8089` | Server port number |
| `DATA_DIR` | `./data` | Base directory for data storage |
| `NODE_ENV` | `development` | Environment mode |
| `CORS_ORIGIN` | `*` | CORS origin configuration |

### **Data Directory Structure**

The server automatically creates the following directory structure:

```
data/
├── dashboards/          # Individual dashboard JSON files
├── images/              # Downloaded favicons and icons
├── uploads/             # User-uploaded thumbnails
└── settings.json        # Global application settings
```

### **File Permissions**

Ensure the server has read/write access to the data directory:

```bash
# Set proper permissions
chmod 755 data/
chmod 644 data/*.json
```

## 🔌 API Endpoints

### **Settings API** (`/api/settings`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Retrieve global settings |
| `PUT` | `/` | Update global settings |
| `GET` | `/export` | Export settings and dashboards |
| `POST` | `/import` | Import settings and dashboards |

### **Dashboards API** (`/api/dashboards`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List all dashboards |
| `POST` | `/` | Create new dashboard |
| `POST` | `/import` | Import complete dashboard |
| `POST` | `/reorder` | Reorder dashboard list |
| `POST` | `/repair` | Repair invalid dashboard references |
| `GET` | `/:slug` | Get dashboard by slug |
| `PUT` | `/:slug` | Update dashboard |
| `DELETE` | `/:slug` | Delete dashboard |

### **Links API** (`/api/dashboards/:slug/links`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/` | Add new link to dashboard |
| `PUT` | `/:linkId` | Update existing link |
| `DELETE` | `/:linkId` | Delete link from dashboard |

### **Upload API** (`/api/upload`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/thumbnail` | Upload thumbnail image |

### **Utility API** (`/api`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/favicon` | Download favicon for URL |

## 🎯 Key Features Implementation

### **Favicon Download System**

The server implements a sophisticated favicon downloading system:

1. **HTML Parsing**: Extracts favicon links from website HTML
2. **Common Locations**: Falls back to standard favicon paths
3. **Multiple Formats**: Supports ICO, PNG, and other image formats
4. **Error Handling**: Graceful fallbacks when downloads fail
5. **Caching**: Efficient storage and serving of downloaded icons

```typescript
// Example favicon download
const faviconPath = await downloadFavicon('https://example.com');
// Returns: 'images/uuid.png' or null
```

### **File Storage System**

- **Organized Storage**: Separate directories for different file types
- **UUID Naming**: Unique filenames prevent conflicts
- **Automatic Cleanup**: Removes orphaned files when links are deleted
- **Cache Headers**: Optimized delivery with proper cache control

### **Data Persistence**

- **JSON Storage**: Human-readable data format
- **Automatic Backups**: Export functionality for data safety
- **Schema Validation**: TypeScript ensures data integrity
- **Atomic Operations**: Safe file writing and updates

## 🧪 Development

### **Code Style**
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Functional Approach**: Pure functions where possible
- **Error Handling**: Comprehensive error management

### **State Management**
- **File System**: Persistent storage with JSON files
- **In-Memory Caching**: Optimized for frequently accessed data
- **Atomic Updates**: Safe concurrent access patterns

### **Performance Considerations**
- **Async Operations**: Non-blocking I/O operations
- **Stream Processing**: Efficient file handling
- **Memory Management**: Proper cleanup of temporary resources
- **Connection Pooling**: Optimized database-like operations

## 🚀 Deployment

### **Production Considerations**

1. **Environment Variables**
   ```bash
   NODE_ENV=production
   PORT=8089
   DATA_DIR=/var/warpdeck/data
   ```

2. **Process Management**
   ```bash
   # Using PM2
   pm2 start dist/index.js --name warpdeck-server
   
   # Using systemd
   sudo systemctl enable warpdeck-server
   sudo systemctl start warpdeck-server
   ```

3. **Reverse Proxy**
   ```nginx
   # Nginx configuration
   location /api/ {
       proxy_pass http://localhost:8089;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
   }
   ```

### **Docker Deployment**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 8089
CMD ["node", "dist/index.js"]
```

### **Monitoring and Logging**

- **Console Logging**: Structured logging for development
- **Error Tracking**: Comprehensive error reporting
- **Performance Metrics**: Request timing and resource usage
- **Health Checks**: Endpoint for monitoring system health

## 🔒 Security Considerations

### **Input Validation**
- **URL Validation**: Ensures valid URLs for favicon downloads
- **File Type Checking**: Validates uploaded file types
- **Size Limits**: Prevents oversized file uploads
- **Path Traversal**: Protects against directory traversal attacks

### **CORS Configuration**
- **Configurable Origins**: Environment-based CORS settings
- **Method Restrictions**: Limits allowed HTTP methods
- **Header Validation**: Controls exposed headers

### **File Upload Security**
- **Type Validation**: Checks file MIME types
- **Size Limits**: Prevents abuse through large uploads
- **Path Sanitization**: Safe file path handling
- **Quarantine**: Isolates uploaded files

## 🐛 Troubleshooting

### **Common Issues**

#### **Favicon Download Failures**
```bash
# Check network connectivity
curl -I https://example.com/favicon.ico

# Verify server internet access
ping google.com

# Check firewall settings
sudo ufw status
```

#### **File Permission Errors**
```bash
# Fix data directory permissions
sudo chown -R $USER:$USER data/
chmod 755 data/
chmod 644 data/*.json
```

#### **Port Already in Use**
```bash
# Find process using port 8089
lsof -i :8089

# Kill the process
kill -9 <PID>

# Or use different port
PORT=8090 pnpm dev
```

#### **Memory Issues**
```bash
# Check Node.js memory usage
node --max-old-space-size=2048 dist/index.js

# Monitor system resources
htop
free -h
```

### **Debug Mode**

Enable detailed logging for troubleshooting:

```bash
# Set debug environment variable
DEBUG=warpdeck:* pnpm dev

# Or enable verbose logging
NODE_ENV=development LOG_LEVEL=debug pnpm dev
```

## 📊 Performance Monitoring

### **Key Metrics**
- **Response Times**: API endpoint performance
- **Memory Usage**: Node.js heap and system memory
- **File Operations**: I/O performance and bottlenecks
- **Network Requests**: Favicon download success rates

### **Optimization Strategies**
- **File Caching**: Efficient static file serving
- **Stream Processing**: Memory-efficient file handling
- **Connection Pooling**: Optimized resource management
- **Background Processing**: Non-blocking favicon downloads

## 🤝 Contributing

### **Development Workflow**
1. **Fork** the repository
2. **Create** a feature branch
3. **Implement** your changes
4. **Test** thoroughly with various scenarios
5. **Submit** a pull request

### **Code Standards**
- Follow TypeScript best practices
- Implement proper error handling
- Add comprehensive logging
- Include performance considerations
- Write clear documentation

### **Testing Guidelines**
- Test with various file types and sizes
- Verify error handling scenarios
- Test concurrent operations
- Validate data integrity
- Performance testing for large datasets

## 📚 Additional Resources

- **Express.js Documentation**: https://expressjs.com/
- **Node.js Documentation**: https://nodejs.org/docs/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Multer Documentation**: https://github.com/expressjs/multer

## 📄 License

This project is part of the WarpDeck application. See the main repository for license information.

---

**WarpDeck Server** - A robust, scalable backend for modern dashboard applications.
