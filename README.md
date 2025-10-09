# The Lab Academy

An interactive online learning platform designed for programming and technology education. Built with modern web technologies to provide an engaging learning experience with hands-on coding exercises, quizzes, and comprehensive course management.

## 🚀 Features

### For Students
- **Interactive Learning**: Browse and enroll in programming courses with structured modules and lessons
- **Hands-on Coding**: Built-in code editors with syntax highlighting and execution capabilities
- **Progress Tracking**: Monitor your learning progress across courses and lessons
- **Quizzes and Assessments**: Test your knowledge with interactive quizzes
- **Personal Dashboard**: Track enrolled courses, completed lessons, and overall progress
- **User Authentication**: Secure login/registration with password reset functionality

### For Administrators
- **Content Management**: Create and manage courses, modules, and lessons through an intuitive admin interface
- **Lesson Editor**: Rich text editing with support for markdown, code blocks, and embedded quizzes
- **User Analytics**: Monitor user activity, course completion rates, and engagement metrics
- **Content Organization**: Hierarchical content structure with courses, modules, and lessons

### Platform Features
- **Responsive Design**: Optimized for desktop and mobile devices
- **Real-time Analytics**: Track user interactions and learning patterns
- **Modern UI/UX**: Clean, intuitive interface built with Tailwind CSS
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript for better development experience
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing for single-page application
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Framer Motion** - Animation library for smooth transitions
- **React Hook Form** - Performant forms with easy validation
- **Zod** - TypeScript-first schema validation
- **Axios** - HTTP client for API requests
- **React Hot Toast** - Toast notifications
- **Prism.js** - Syntax highlighting for code blocks
- **React Markdown** - Render markdown content
- **Recharts** - Data visualization components

### Development Tools
- **Vitest** - Fast unit testing framework
- **Testing Library** - Testing utilities for React components
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

### Backend Integration
- **Supabase** - Backend-as-a-Service for database and authentication
- **Custom API** - RESTful API for course content and user management

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (>= 20.0.0) - JavaScript runtime
- **npm** or **yarn** - Package manager
- **Git** - Version control system

## 🚀 Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd the-lab-academy
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root directory and configure the following variables:

   ```env
   # API Configuration
   VITE_API_URL=http://localhost:8000/api

   # Optional: Override default API settings
   VITE_API_TIMEOUT=15000
   VITE_API_MAX_RETRIES=3
   VITE_API_RETRY_BASE_DELAY=300
   VITE_API_RETRY_MAX_DELAY=5000

   # Development mode (set to 'DEBUG' to bypass authentication)
   VITE_MODE=development
   ```

## 🏃 Running the Application

### Development Mode

Start the development server with hot reload:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (default Vite port).

### Production Build

Build the application for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

The preview will be available at `http://localhost:3000`.

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests once (CI mode)
npm run test:run

# Run tests with coverage
npm run test:coverage
```

## 🔧 API Configuration

The application communicates with a backend API for data management. The API endpoints are documented in [`docs/api_endpoints.md`](docs/api_endpoints.md).

### Backend Requirements

The application expects a REST API with the following base URL structure:
- **Base URL**: `/api/v1`
- **Authentication**: JWT Bearer tokens
- **Content-Type**: `application/json`

### Key API Endpoints

- **Authentication**: `/api/v1/auth/*` - User registration, login, password reset
- **Courses**: `/api/v1/courses/*` - Course catalog and enrollment
- **Dashboard**: `/api/v1/dashboard/*` - User progress and enrolled courses
- **Lessons**: `/api/v1/lessons/*` - Lesson content and completion
- **Admin**: `/api/admin/*` - Content management (admin only)

### Development Setup

For local development, you'll need:

1. **Backend API Server** running on `http://localhost:8000`
2. **Database** (typically PostgreSQL with Supabase)
3. **Environment Variables** configured as shown above

## 🚢 Deployment

### Production Deployment

The application is configured for deployment on platforms like Vercel, Netlify, or any static hosting service.

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting provider.

### Environment Configuration

For production, set the following environment variables:

```env
VITE_API_URL=https://your-api-domain.com/api
VITE_MODE=production
```

### Reverse Proxy Setup

If deploying behind a reverse proxy (nginx, Apache), configure it to route `/api/*` requests to your backend server:

**nginx example:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/built/app;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://your-backend-server:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/your-feature-name`
3. **Make your changes** and ensure tests pass
4. **Run linting:** `npm run lint`
5. **Commit your changes:** `git commit -m 'Add some feature'`
6. **Push to the branch:** `git push origin feature/your-feature-name`
7. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and TypeScript conventions
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PRs

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

If you have any questions or need help:

- Check the [API Documentation](docs/api_endpoints.md)
- Open an issue on GitHub
- Contact the development team

---

**Happy Learning! 🎓**