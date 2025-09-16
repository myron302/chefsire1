# Chefsire 👨‍🍳

A mobile-first, API-driven culinary platform for sharing recipes and food stories, designed for seamless expansion to React Native.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+

### Installation & Development

```bash
# Install dependencies for all workspaces
npm install

# Start development servers (web + API)
npm run dev

# Or start individually:
npm run dev --workspace=web    # React web app (http://localhost:3000)
npm run dev --workspace=server # Express API (http://localhost:3001)
```

### Build & Production

```bash
# Build all packages
npm run build

# Start production server
npm start --workspace=server
```

## 📁 Project Structure

```
chefsire/
├── shared/           # Shared types, schemas, and utilities
│   ├── src/
│   │   ├── schema.ts    # User, Recipe, Story type definitions
│   │   ├── utils.ts     # Common utility functions
│   │   └── index.ts     # Exports
│   └── package.json
├── web/              # React web application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   │   ├── NavBar.tsx
│   │   │   └── RecipeCard.tsx
│   │   ├── pages/       # Route components
│   │   │   ├── Home.tsx
│   │   │   ├── Recipes.tsx
│   │   │   ├── RecipeDetail.tsx
│   │   │   └── Profile.tsx
│   │   ├── styles/      # CSS and styling
│   │   └── App.tsx
│   └── package.json
├── server/           # Express API backend
│   ├── src/
│   │   ├── index.ts     # API routes and server setup
│   │   └── storage.ts   # Data layer (in-memory, replace with DB)
│   └── package.json
├── mobile/           # React Native placeholder
│   ├── README.md        # Expansion plan and guidelines
│   └── package.json
└── package.json      # Root workspace configuration
```

## 🌟 Features

### Current (Web App)
- **Recipe Browsing**: Discover and search recipes with filtering
- **Recipe Details**: Full recipe view with ingredients and step-by-step instructions
- **User Profiles**: View user information and their contributed content
- **Responsive Design**: Mobile-first design that works on all devices
- **Modern UI**: Clean, culinary-themed interface with smooth interactions

### API Endpoints
- `GET /api/recipes` - List all recipes
- `GET /api/recipes/:id` - Get specific recipe
- `POST /api/recipes` - Create new recipe
- `GET /api/stories` - List all stories
- `GET /api/stories/:id` - Get specific story
- `GET /api/users/:id` - Get user profile
- `GET /health` - Health check

### Planned (Mobile Expansion)
- **Native Mobile App**: React Native implementation
- **Camera Integration**: Photo capture for recipes
- **Offline Support**: Local data caching
- **Push Notifications**: Recipe updates and social features
- **Voice Commands**: Hands-free cooking mode

## 🛠️ Technology Stack

### Web Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **Vite** for fast development and building
- **CSS Custom Properties** for theming
- **Mobile-first responsive design**

### Backend API
- **Express.js** with TypeScript
- **CORS, Helmet, Morgan** for security and logging
- **In-memory storage** (easily replaceable with database)

### Shared
- **TypeScript** for type safety
- **Common schemas** and utilities
- **Workspace architecture** for code reuse

### Development
- **npm Workspaces** for monorepo management
- **TypeScript** across all packages
- **Hot reload** for rapid development

## 🎨 Design System

### Color Palette
- **Primary**: `#2d5a27` (Forest Green)
- **Primary Light**: `#4a7c59`
- **Secondary**: `#f4a261` (Warm Orange)
- **Accent**: `#e76f51` (Coral)
- **Text**: `#2a3132` (Dark Gray)
- **Surface**: `#f8f9fa` (Light Gray)

### Typography
- **Font Stack**: System fonts (San Francisco, Segoe UI, Roboto)
- **Responsive scales**: From mobile to desktop
- **Readable line heights** for recipe content

### Components
- **Cards**: Recipe and story presentation
- **Navigation**: Fixed bottom navigation (mobile) / top bar (desktop)
- **Buttons**: Primary, secondary, and outline variants
- **Form Elements**: Consistent styling across all inputs

## 🏗️ Architecture

### Mobile-First Approach
- CSS designed for mobile screens first
- Progressive enhancement for larger screens
- Touch-friendly interface elements
- Optimized loading and performance

### API-Driven Design
- Clean separation between frontend and backend
- RESTful API design
- Consistent response formats
- Easy to extend for mobile app

### Workspace Structure
- **Shared package**: Common code for web and future mobile
- **Independent packages**: Each can be developed and deployed separately
- **Type safety**: Shared TypeScript definitions prevent inconsistencies

## 🚦 Development Workflow

1. **Start Development**: `npm run dev`
2. **Make Changes**: Edit files in respective workspace
3. **Hot Reload**: Changes reflect immediately
4. **Test API**: Use browser or API client to test endpoints
5. **Build**: `npm run build` for production builds

## 📱 Mobile Expansion

The project is structured for easy React Native expansion:

1. **Shared Types**: All data models in `shared/` package
2. **API Compatibility**: Same endpoints work for web and mobile
3. **Design System**: Colors and spacing ready for mobile
4. **Component Architecture**: Reusable patterns established

See `mobile/README.md` for detailed expansion plan.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes in the appropriate workspace
4. Test your changes locally
5. Submit a pull request

## 📝 License

MIT License - feel free to use this project as a starting point for your own culinary platform!

---

**Ready to cook up something amazing? Start developing with `npm run dev`!** 👨‍🍳✨