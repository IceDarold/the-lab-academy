#!/usr/bin/env python3
"""
E2E Test Database Seeding Script
Seeds the test database with predictable test data for E2E tests.
"""
import asyncio
import os
import sys
from pathlib import Path
from datetime import datetime

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.core.config import settings
from src.core.security import get_password_hash
from src.db.session import get_db, get_supabase_client
from src.models.user import User
from src.models.profile import Profile
from src.models.enrollment import Enrollment
from src.models.user_lesson_progress import UserLessonProgress
from src.models.user_activity_log import UserActivityLog
from src.models.user_session import UserSession
import uuid

# Test user data - predictable credentials for E2E tests
TEST_USERS = [
    {
        "email": os.getenv("E2E_ADMIN_EMAIL", "testadmin@example.com"),
        "password": os.getenv("E2E_ADMIN_PASSWORD", "adminpass123"),
        "full_name": "Test Admin",
        "role": "ADMIN"
    },
    {
        "email": os.getenv("E2E_STUDENT_EMAIL", "teststudent@example.com"),
        "password": os.getenv("E2E_STUDENT_PASSWORD", "studentpass123"),
        "full_name": "Test Student",
        "role": "STUDENT"
    },
    {
        "email": os.getenv("E2E_STUDENT2_EMAIL", "teststudent2@example.com"),
        "password": os.getenv("E2E_STUDENT2_PASSWORD", "studentpass456"),
        "full_name": "Test Student Two",
        "role": "STUDENT"
    },
    {
        "email": os.getenv("E2E_INACTIVE_EMAIL", "testinactive@example.com"),
        "password": os.getenv("E2E_INACTIVE_PASSWORD", "inactivepass123"),
        "full_name": "Inactive Test User",
        "role": "STUDENT"
    }
]


# Test course data - deterministic for E2E tests
TEST_COURSES = [
    {
        "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, "ml-foundations")),
        "slug": "ml-foundations",
        "title": "Machine Learning Foundations",
        "description": "Learn the basics of machine learning including supervised and unsupervised learning.",
        "summary": "Introduction to ML concepts",
        "cover_image_url": None,
    },
    {
        "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, "ml-fundamentals")),
        "slug": "ml-fundamentals",
        "title": "Machine Learning Fundamentals",
        "description": "Deep dive into machine learning algorithms and techniques.",
        "summary": "Advanced ML topics",
        "cover_image_url": None,
    },
    {
        "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, "python-basics")),
        "slug": "python-basics",
        "title": "Python Basics",
        "description": "Learn the fundamentals of Python programming.",
        "summary": "Programming fundamentals",
        "cover_image_url": None,
    },
]


# Test lesson data
TEST_LESSONS = [
    {
        "slug": "supervised-vs-unsupervised",
        "course_slug": "ml-foundations",
        "title": "Supervised vs Unsupervised Learning",
        "content": """---
title: Supervised vs Unsupervised Learning
slug: supervised-vs-unsupervised
course_slug: ml-foundations
lesson_id: "0d30a5c9-ea8e-4f0a-8b9d-1a1927a046a1"
reading_time: 15m
objectives:
  - Understand the difference between supervised and unsupervised learning
  - Learn to choose the appropriate algorithm type
---
type: markdown
order: 1
---
# Supervised Learning

*Supervised learning* uses labeled data. The model learns to map features to a target variable.

Examples:
- Email classification (spam / not spam)
- House price prediction

---
type: markdown
order: 2
---
# Unsupervised Learning

*Unsupervised learning* works with unlabeled data and finds hidden structures.

Examples:
- Customer clustering
- Dimensionality reduction

---
type: code
language: python
order: 3
---
from sklearn.cluster import KMeans
from sklearn.datasets import load_iris

iris = load_iris()
model = KMeans(n_clusters=3, random_state=42)
model.fit(iris.data)
print(model.labels_[:10])

---
type: quiz
question_id: "q-supervised"
correct_answer_id: "a-supervised"
---
What type of learning is suitable for predicting house prices?

- id: a-unsupervised
  text: Unsupervised learning
- id: a-reinforcement
  text: Reinforcement learning
- id: a-supervised
  text: Supervised learning
"""
    },
    {
        "slug": "getting-started-with-python",
        "course_slug": "python-basics",
        "title": "Getting Started with Python",
        "content": """---
title: Getting Started with Python
slug: getting-started-with-python
course_slug: python-basics
lesson_id: "1e40b6d0-fb9f-5g1b-9c0e-2b2938b057b2"
reading_time: 10m
objectives:
  - Install Python
  - Write your first Python program
---
type: markdown
order: 1
---
# Installing Python

Download Python from python.org and install it.

---
type: code
language: python
order: 2
---
print("Hello, World!")

---
type: quiz
question_id: "q-hello"
correct_answer_id: "a-hello"
---
What does print("Hello, World!") do?

- id: a-error
  text: Causes an error
- id: a-hello
  text: Prints Hello, World! to the console
"""
    },
]


# Test enrollment data
TEST_ENROLLMENTS = [
    {"user_email": "teststudent@example.com", "course_slug": "ml-foundations"},
    {"user_email": "teststudent@example.com", "course_slug": "python-basics"},
    {"user_email": "teststudent2@example.com", "course_slug": "ml-fundamentals"},
]


# Test progress data
TEST_PROGRESS = [
    {"user_email": "teststudent@example.com", "course_slug": "ml-foundations", "lesson_slug": "supervised-vs-unsupervised"},
]


async def seed_test_courses(db: AsyncSession) -> None:
    """Seed test courses into the database."""
    print("Seeding test courses...")

    supabase = get_supabase_client()

    for course_data in TEST_COURSES:
        # Check if course already exists
        try:
            existing = await supabase.table("courses").select("id").eq("slug", course_data["slug"]).single()
            if existing.data:
                print(f"Course {course_data['slug']} already exists, skipping")
                continue
        except:
            pass  # If not found, proceed to create

        # Create course
        await supabase.table("courses").insert(course_data)
        print(f"Created course: {course_data['slug']}")

    print("Test courses seeded successfully")


async def seed_test_lessons(db: AsyncSession) -> None:
    """Seed test lessons by creating content files."""
    print("Seeding test lessons...")

    for lesson_data in TEST_LESSONS:
        course_dir = Path(__file__).parent.parent / "content" / "courses" / lesson_data["course_slug"]
        lesson_file = course_dir / f"{lesson_data['slug']}.lesson"

        if lesson_file.exists():
            print(f"Lesson {lesson_data['slug']} already exists, skipping")
            continue

        # Create directory if needed
        course_dir.mkdir(parents=True, exist_ok=True)

        # Write lesson content
        with open(lesson_file, 'w', encoding='utf-8') as f:
            f.write(lesson_data["content"])

        print(f"Created lesson: {lesson_data['slug']}")

    print("Test lessons seeded successfully")


async def seed_test_enrollments(db: AsyncSession) -> None:
    """Seed test enrollments into the database."""
    print("Seeding test enrollments...")

    for enrollment_data in TEST_ENROLLMENTS:
        # Get user ID by email
        user_result = await db.execute(
            select(User.id).where(User.email == enrollment_data["user_email"])
        )
        user_id = user_result.scalar()
        if not user_id:
            print(f"User {enrollment_data['user_email']} not found, skipping enrollment")
            continue

        # Check if enrollment already exists
        existing = await db.execute(
            select(Enrollment.id).where(
                Enrollment.user_id == user_id,
                Enrollment.course_slug == enrollment_data["course_slug"]
            )
        )
        if existing.scalar():
            print(f"Enrollment for {enrollment_data['user_email']} in {enrollment_data['course_slug']} already exists, skipping")
            continue

        # Create enrollment
        enrollment = Enrollment(
            user_id=user_id,
            course_slug=enrollment_data["course_slug"]
        )
        db.add(enrollment)
        print(f"Created enrollment: {enrollment_data['user_email']} -> {enrollment_data['course_slug']}")

    await db.commit()
    print("Test enrollments seeded successfully")


async def seed_test_progress(db: AsyncSession) -> None:
    """Seed test progress records into the database."""
    print("Seeding test progress...")

    for progress_data in TEST_PROGRESS:
        # Get user ID by email
        user_result = await db.execute(
            select(User.id).where(User.email == progress_data["user_email"])
        )
        user_id = user_result.scalar()
        if not user_id:
            print(f"User {progress_data['user_email']} not found, skipping progress")
            continue

        # Check if progress already exists
        existing = await db.execute(
            select(UserLessonProgress.id).where(
                UserLessonProgress.user_id == user_id,
                UserLessonProgress.course_slug == progress_data["course_slug"],
                UserLessonProgress.lesson_slug == progress_data["lesson_slug"]
            )
        )
        if existing.scalar():
            print(f"Progress for {progress_data['user_email']} on {progress_data['lesson_slug']} already exists, skipping")
            continue

        # Create progress
        from datetime import datetime
        progress = UserLessonProgress(
            user_id=user_id,
            course_slug=progress_data["course_slug"],
            lesson_slug=progress_data["lesson_slug"],
            completion_date=datetime.utcnow()
        )
        db.add(progress)
        print(f"Created progress: {progress_data['user_email']} completed {progress_data['lesson_slug']}")

    await db.commit()
    print("Test progress seeded successfully")


async def seed_test_users(db: AsyncSession) -> None:
    """Seed test users into the database."""
    print("Seeding test users...")

    for user_data in TEST_USERS:
        # Check if user already exists
        existing_user = await db.execute(
            select(User.id).where(User.email == user_data["email"])
        )
        if existing_user.scalar():
            print(f"User {user_data['email']} already exists, skipping")
            continue

        # Create user
        user_id = uuid.uuid4()
        hashed_password = get_password_hash(user_data["password"])

        user = User(
            id=user_id,
            email=user_data["email"],
            hashed_password=hashed_password,
            full_name=user_data["full_name"],
            role=user_data["role"],
            status="ACTIVE" if user_data["email"] != "testinactive@example.com" else "BLOCKED"
        )

        db.add(user)

        # Create profile
        profile = Profile(
            id=user_id,
            email=user_data["email"],
            full_name=user_data["full_name"],
            role=user_data["role"].lower()
        )

        db.add(profile)
        print(f"Created user: {user_data['email']}")

    await db.commit()
    print("Test users seeded successfully")


async def main():
    """Main seeding function."""
    print("🌱 Starting E2E test database seeding...")

    # Ensure we're in testing mode
    # if not settings.TESTING:
    #     print("❌ This script should only be run in testing mode")
    #     sys.exit(1)

    try:
        async for db in get_db():
            await seed_test_users(db)
            await seed_test_courses(db)
            await seed_test_lessons(db)
            await seed_test_enrollments(db)
            await seed_test_progress(db)
            break  # Only need one session

        print("\n🎉 E2E test database seeding completed successfully!")
        print("\n🔑 Test accounts created:")
        for user in TEST_USERS:
            print(f"   {user['email']} / {user['password']} ({user['role']})")

        print("\n📋 Test data summary:")
        print("   - Users are created in both User and Profile tables")
        print("   - Passwords are hashed using the same method as production")
        print("   - All users have predictable credentials for testing")
        print("   - One user is set to BLOCKED status for testing access control")

    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())