# The Lab Academy

A full-stack interactive online learning platform designed for programming and technology education. Built with modern web technologies to provide an engaging learning experience with hands-on coding exercises, quizzes, and comprehensive course management.

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

### Backend
- **FastAPI (Python)** - High-performance asynchronous web framework
- **Pydantic** - Data validation and serialization
- **SQLAlchemy** - ORM for database interactions
- **Alembic** - Database migration tool
- **Supabase** - Backend-as-a-Service for database and authentication
- **Poetry** - Python dependency management

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (>= 20.0.0) - JavaScript runtime
- **npm** or **yarn** - Package manager
- **Python** (>= 3.12) - Python runtime
- **Poetry** - Python dependency management
- **Git** - Version control system

## 🚀 Installation

1. **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd the-lab-academy
    ```

2. **Install frontend dependencies:**
    ```bash
    npm run frontend:install
    ```

3. **Install backend dependencies:**
    ```bash
    npm run backend:install
    ```

4. **Set up environment variables:**

    Copy `.env.example` to `.env` and configure the variables:

    ```bash
    cp .env.example .env
    ```

    Edit `.env` with your configuration values.

## 🏃 Running the Application

### Development Mode

1. **Run database migrations (first time only):**
    ```bash
    npm run backend:migrate
    ```

2. **Start the backend server:**
    ```bash
    npm run backend:run
    ```
    The API will be available at `http://localhost:8000`.

3. **Start the frontend development server (in a new terminal):**
    ```bash
    npm run frontend:dev
    ```
    The application will be available at `http://localhost:5173` (default Vite port).

### Production Build

Build the frontend for production:

```bash
npm run frontend:build
```

Preview the production build locally:

```bash
npm run frontend:preview
```

The preview will be available at `http://localhost:3000`.

## 🧪 Testing

### Frontend Tests
Run the frontend test suite:

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

### Backend Tests
Run the backend test suite:

```bash
npm run backend:test
```

## 🔧 API Configuration

The application includes both frontend and backend components. The backend API is built with FastAPI and provides REST endpoints for data management. The API endpoints are documented in [`docs/api_endpoints.md`](docs/api_endpoints.md) and [`backend/docs/api_endpoints.md`](backend/docs/api_endpoints.md).

### Backend API

The backend provides a REST API with the following base URL structure:
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

For local development, the backend runs on `http://localhost:8000` and uses Supabase for database and authentication. Ensure environment variables are configured as shown in `.env.example`.

## 🚢 Deployment

### Frontend Deployment

The frontend is configured for deployment on static hosting platforms like Vercel, Netlify, or any static hosting service.

1. **Build the frontend:**
    ```bash
    npm run frontend:build
    ```

2. **Deploy the `frontend/dist` folder** to your hosting provider.

### Backend Deployment

The backend can be deployed on platforms that support Python applications, such as:
- **Vercel** (serverless functions)
- **Render**
- **Fly.io**
- **Railway**

For Vercel serverless deployment, the backend includes a `vercel.json` configuration file.

### Environment Configuration

For production, set the following environment variables:

```env
# Frontend
VITE_API_URL=https://your-api-domain.com/api
VITE_MODE=production

# Backend
APP_NAME=the-lab-education-backend
DEBUG=false
SECRET_KEY=your-production-secret-key
DATABASE_URL=your-production-database-url
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Monorepo Deployment

For platforms that support monorepos, you can deploy both frontend and backend from this single repository. Configure your deployment platform to:
- Build the frontend from the root directory
- Deploy the backend from the `backend/` directory

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