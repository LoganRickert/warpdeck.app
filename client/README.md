# WarpDeck Client

A modern, responsive React-based dashboard application for organizing and managing web links with a beautiful, customizable interface.

## 🚀 Features

### **Dashboard Management**
- **Multiple Dashboards**: Create and manage multiple dashboard collections
- **Custom Layouts**: Configure grid columns, card sizes, and spacing
- **Drag & Drop**: Reorder dashboards and links with intuitive drag-and-drop
- **Import/Export**: Backup and restore dashboard configurations

### **Link Management**
- **Rich Link Cards**: Beautiful cards with customizable appearance
- **Automatic Favicons**: Automatically downloads website icons
- **Custom Thumbnails**: Upload custom images or use URL-based thumbnails
- **FontAwesome Icons**: Optional FontAwesome icon support
- **Smart Fallbacks**: Graceful handling when icons/favicons are unavailable

### **Visual Customization**
- **Color Themes**: Light and dark theme support
- **Custom Colors**: Individual link color customization
  - Left border color
  - Background color
  - Text color
- **Grid Layout**: Configurable grid spanning (1-4 columns)
- **Card Sizing**: Small, medium, and large card options

### **User Experience**
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Loading States**: Smooth loading indicators for favicon downloads
- **Real-time Updates**: Instant feedback for all operations
- **Keyboard Navigation**: Full keyboard accessibility support

## 🛠️ Technology Stack

### **Core Technologies**
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Full type safety and better development experience
- **Vite**: Lightning-fast build tool and development server

### **UI Framework**
- **Material-UI (MUI)**: Professional, accessible component library
- **Emotion**: CSS-in-JS styling solution
- **FontAwesome**: Icon library integration

### **State Management**
- **React Hooks**: useState, useEffect for local state
- **Context API**: Global settings and theme management

### **Drag & Drop**
- **@dnd-kit**: Modern, accessible drag-and-drop library
- **Sortable**: Reorderable lists and grids

### **Routing**
- **React Router**: Client-side routing with nested routes

## 📁 Project Structure

```
client/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── settings/       # Settings-specific components
│   │   ├── Header.tsx      # Application header with navigation
│   │   ├── LinkCard.tsx    # Individual link display component
│   │   └── DashboardGrid.tsx # Dashboard grid layout
│   ├── pages/              # Page components
│   │   ├── DashboardPage.tsx # Main dashboard view
│   │   └── SettingsPage.tsx # Settings and management
│   ├── api.ts              # API client functions
│   ├── types.ts            # TypeScript type definitions
│   ├── router.tsx          # Application routing
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Application entry point
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
└── tsconfig.json           # TypeScript configuration
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- pnpm (recommended) or npm
- WarpDeck server running on port 8089

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd warpdeck/client
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Start development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:3548`
   - The app will automatically proxy API calls to the server

### **Build for Production**

```bash
# Build the application
pnpm build

# Preview the production build
pnpm preview

# Clean build artifacts
pnpm clean
```

## 🔧 Configuration

### **Development Server**
The development server runs on port 3548 and automatically proxies API calls to the backend server at `http://localhost:8089`.

### **Environment Variables**
Create a `.env` file in the client directory for environment-specific configuration:

```env
VITE_API_BASE_URL=http://localhost:8089
VITE_APP_TITLE=WarpDeck
```

## 🎨 Component Architecture

### **Core Components**

#### **LinkCard**
- Displays individual links with customizable appearance
- Handles icon/favicon/thumbnail display with fallbacks
- Supports different sizes (sm, md, lg)
- Responsive design with hover effects

#### **DashboardGrid**
- Manages the grid layout for dashboard links
- Responsive grid system with auto-fit columns
- Supports custom grid spanning for individual links

#### **Header**
- Navigation between dashboards
- Theme switching (light/dark)
- Dashboard selector dropdown
- Settings access

### **Settings Components**

#### **LinkEditor**
- Comprehensive link editing interface
- Color customization tools
- Thumbnail upload and management
- Grid layout configuration

#### **DashboardManagement**
- Dashboard CRUD operations
- Import/export functionality
- Drag-and-drop reordering
- Mobile-responsive design

#### **GlobalSettings**
- Theme configuration
- Default dashboard selection
- Directory configuration

## 🔌 API Integration

The client communicates with the backend through a RESTful API:

- **Settings API**: Global configuration management
- **Dashboards API**: Dashboard CRUD operations
- **Links API**: Link management within dashboards
- **Upload API**: File upload for thumbnails

All API calls are centralized in `src/api.ts` with proper error handling and TypeScript types.

## 🎯 Key Features Implementation

### **Favicon Download**
- Automatic favicon fetching when creating/editing links
- Multiple fallback strategies (HTML parsing, common locations)
- Loading states during download process
- Graceful error handling

### **Drag & Drop**
- Dashboard reordering with @dnd-kit
- Link reordering within dashboards
- Visual feedback during drag operations
- Keyboard accessibility support

### **Theme System**
- Light/dark theme switching
- Persistent theme preferences
- Material-UI theme integration
- Custom color support for individual links

### **Mobile Responsiveness**
- Responsive grid layouts
- Touch-friendly drag and drop
- Mobile-optimized settings interface
- Adaptive button layouts

## 🧪 Development

### **Code Style**
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Functional Components**: Modern React patterns

### **State Management**
- **Local State**: useState for component-specific state
- **Context**: Global settings and theme
- **Props**: Component communication
- **Effects**: Side effects and API calls

### **Performance**
- **React.memo**: Component memoization where beneficial
- **useCallback**: Stable function references
- **Lazy Loading**: Route-based code splitting
- **Optimized Renders**: Minimal re-renders

## 🚀 Deployment

### **Build Process**
1. **TypeScript Compilation**: Ensures type safety
2. **Vite Build**: Optimized production bundle
3. **Asset Optimization**: Minified CSS/JS with source maps
4. **Output**: Static files in `dist/` directory

### **Static Hosting**
The built application can be deployed to any static hosting service:
- **Netlify**: Drag and drop deployment
- **Vercel**: Git-based deployment
- **GitHub Pages**: Repository-based hosting
- **AWS S3**: Cloud storage hosting

### **Environment Configuration**
Update the API base URL in production builds:
```bash
# Set production API URL
VITE_API_BASE_URL=https://your-api-domain.com
pnpm build
```

## 🤝 Contributing

### **Development Workflow**
1. **Fork** the repository
2. **Create** a feature branch
3. **Implement** your changes
4. **Test** thoroughly
5. **Submit** a pull request

### **Code Standards**
- Follow TypeScript best practices
- Use functional components and hooks
- Maintain component reusability
- Add proper error handling
- Ensure mobile responsiveness

## 📄 License

This project is part of the WarpDeck application. See the main repository for license information.

---

**WarpDeck Client** - A modern, beautiful dashboard for organizing your digital life.
