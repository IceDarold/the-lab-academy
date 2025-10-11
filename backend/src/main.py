from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi.middleware import SlowAPIMiddleware
from slowapi.errors import RateLimitExceeded

from src.core.config import settings
from src.core.logging import app_logger, RequestIDMiddleware
from src.core.rate_limiting import limiter
from src.core.errors import (
    ContentFileNotFoundError,
    SecurityError,
    ParsingError,
    AuthenticationError,
    AuthorizationError,
    ValidationError,
    DatabaseError,
    ExternalServiceError,
)
from src.routers.health_router import router as health_router
from src.api.v1.auth import router as auth_router
from src.api.v1.admin import router as admin_router
from src.api.v1.courses import router as courses_router
from src.api.v1.dashboard import router as dashboard_router
from src.api.v1.lessons import router as lessons_router
from src.api.v1.quizzes import router as quizzes_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Validate critical environment variables on startup.
    This ensures the app fails fast if required configuration is missing.
    """
    try:
        if not settings.SECRET_KEY:
            raise ValueError("SECRET_KEY environment variable is required")
        if not settings.TESTING and not settings.DATABASE_URL:
            raise ValueError("DATABASE_URL environment variable is required")

        app_logger.info("Environment validation successful")
        if settings.DATABASE_URL:
            app_logger.info(f"Database URL configured: {settings.DATABASE_URL[:20]}...")
        app_logger.info("Application startup complete")
        yield
    except Exception as exc:
        app_logger.error(f"Startup validation failed: {exc}")
        raise

app = FastAPI(
    title="The Lab Academy API",
    description="Backend API for The Lab Academy learning platform",
    version="1.0.0",
    lifespan=lifespan,
)

# Add middleware
app.add_middleware(RequestIDMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://the-lab-academy.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SlowAPIMiddleware)
app.state.limiter = limiter

# Exception handlers
@app.exception_handler(ContentFileNotFoundError)
async def handle_content_file_not_found(request, exc):
    return JSONResponse(status_code=404, content={"detail": "Content file not found"})

@app.exception_handler(SecurityError)
async def handle_security_error(request, exc):
    return JSONResponse(status_code=403, content={"detail": "Security violation"})

@app.exception_handler(ParsingError)
async def handle_parsing_error(request, exc):
    return JSONResponse(status_code=400, content={"detail": "Parsing failed"})

@app.exception_handler(AuthenticationError)
async def handle_authentication_error(request, exc):
    return JSONResponse(status_code=401, content={"detail": "Authentication failed"})

@app.exception_handler(AuthorizationError)
async def handle_authorization_error(request, exc):
    return JSONResponse(status_code=403, content={"detail": "Authorization failed"})

@app.exception_handler(ValidationError)
async def handle_validation_error(request, exc):
    return JSONResponse(status_code=422, content={"detail": "Validation failed"})

@app.exception_handler(DatabaseError)
async def handle_database_error(request, exc):
    return JSONResponse(status_code=500, content={"detail": "Database error"})

@app.exception_handler(ExternalServiceError)
async def handle_external_service_error(request, exc):
    return JSONResponse(status_code=502, content={"detail": "External service error"})

@app.exception_handler(RateLimitExceeded)
async def handle_rate_limit_exceeded(request, exc):
    return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"})

# Root endpoint
@app.get("/")
async def root():
    return {"status": "ok"}

# Include routers
app.include_router(health_router)
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(admin_router, prefix="/api/admin", tags=["admin"])
app.include_router(courses_router, prefix="/api/v1/courses", tags=["courses"])
app.include_router(dashboard_router, prefix="/api/v1/dashboard", tags=["dashboard"])
app.include_router(lessons_router, prefix="/api/v1/lessons", tags=["lessons"])
app.include_router(quizzes_router, prefix="/api/v1/quizzes", tags=["quizzes"])