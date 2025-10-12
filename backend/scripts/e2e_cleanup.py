#!/usr/bin/env python3
"""
E2E Test Database Cleanup Script
Removes all test data created by seeding scripts.

This script safely removes test users, courses, enrollments, and progress
created during E2E testing, supporting both local SQLite and cloud databases.
"""
import asyncio
import os
import sys
from pathlib import Path
from typing import List

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
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

# Test user emails to clean up
TEST_USER_EMAILS = [
    "testadmin@example.com",
    "teststudent@example.com",
    "teststudent2@example.com",
    "testinactive@example.com",
    "testuser1@example.com",
    "testuser2@example.com"
]

# Test course slugs to clean up
TEST_COURSE_SLUGS = [
    "ml-foundations",
    "ml-fundamentals",
    "python-basics"
]


async def cleanup_test_users(db: AsyncSession) -> None:
    """Remove test users from local database."""
    print("Cleaning up test users from local database...")

    for email in TEST_USER_EMAILS:
        try:
            # Get user ID
            user_result = await db.execute(
                select(User.id).where(User.email == email)
            )
            user_id = user_result.scalar()

            if not user_id:
                print(f"User {email} not found in local DB, skipping")
                continue

            # Delete related records first (due to foreign keys)
            await db.execute(
                delete(UserSession).where(UserSession.user_id == user_id)
            )
            await db.execute(
                delete(UserActivityLog).where(UserActivityLog.user_id == user_id)
            )
            await db.execute(
                delete(UserLessonProgress).where(UserLessonProgress.user_id == user_id)
            )
            await db.execute(
                delete(Enrollment).where(Enrollment.user_id == user_id)
            )

            # Delete user and profile
            await db.execute(delete(Profile).where(Profile.id == user_id))
            await db.execute(delete(User).where(User.id == user_id))

            print(f"Removed test user: {email}")

        except Exception as e:
            # Handle case where tables don't exist (e.g., no migrations run yet)
            if "no such table" in str(e).lower():
                print(f"Database tables not found, skipping user cleanup for {email}")
                continue
            print(f"Error removing user {email}: {e}")
            continue

    try:
        await db.commit()
        print("Test users cleaned up from local database")
    except Exception as e:
        if "no such table" in str(e).lower():
            print("Database tables not found, skipping user cleanup commit")
        else:
            print(f"Error committing user cleanup: {e}")
            raise


async def cleanup_test_courses(db: AsyncSession) -> None:
    """Remove test courses from Supabase."""
    print("Cleaning up test courses from Supabase...")

    # Use test Supabase URL if available
    supabase_url = os.getenv("TEST_SUPABASE_URL") or settings.SUPABASE_URL
    supabase_key = os.getenv("TEST_SUPABASE_SERVICE_ROLE_KEY") or settings.SUPABASE_SERVICE_ROLE_KEY

    if not supabase_url or not supabase_key:
        print("Supabase credentials not available, skipping course cleanup")
        return

    from supabase import create_client
    supabase = create_client(supabase_url, supabase_key)

    for slug in TEST_COURSE_SLUGS:
        try:
            # Delete course
            result = await supabase.table("courses").delete().eq("slug", slug).execute()
            if result.data:
                print(f"Removed test course: {slug}")
            else:
                print(f"Course {slug} not found in Supabase, skipping")

        except Exception as e:
            print(f"Error removing course {slug}: {e}")
            continue

    print("Test courses cleaned up from Supabase")


async def cleanup_supabase_users() -> None:
    """Remove test users from Supabase Auth and profiles."""
    print("Cleaning up test users from Supabase...")

    # Use test Supabase URL if available
    supabase_url = os.getenv("TEST_SUPABASE_URL") or settings.SUPABASE_URL
    supabase_key = os.getenv("TEST_SUPABASE_SERVICE_ROLE_KEY") or settings.SUPABASE_SERVICE_ROLE_KEY

    if not supabase_url or not supabase_key:
        print("Supabase credentials not available, skipping user cleanup")
        return

    from supabase import create_client
    supabase = create_client(supabase_url, supabase_key)

    for email in TEST_USER_EMAILS:
        try:
            # Get user from profiles
            profile_response = await supabase.table("profiles").select("id").eq("email", email).execute()
            profiles = getattr(profile_response, "data", [])

            if not profiles:
                print(f"User {email} not found in Supabase profiles, skipping")
                continue

            user_id = profiles[0]["id"]

            # Delete from auth using admin method
            try:
                await supabase.auth.admin.delete_user(user_id)
                print(f"Removed user from Supabase Auth: {email}")
            except Exception as e:
                print(f"Warning: Failed to delete user from Supabase Auth {email}: {e}")

            # Delete profile
            await supabase.table("profiles").delete().eq("id", user_id).execute()
            print(f"Removed user profile: {email}")

        except Exception as e:
            print(f"Error removing Supabase user {email}: {e}")
            continue

    print("Test users cleaned up from Supabase")


async def cleanup_test_enrollments(db: AsyncSession) -> None:
    """Remove test enrollments from local database."""
    print("Cleaning up test enrollments...")

    try:
        # Get all test user IDs
        test_user_ids = []
        for email in TEST_USER_EMAILS:
            user_result = await db.execute(
                select(User.id).where(User.email == email)
            )
            user_id = user_result.scalar()
            if user_id:
                test_user_ids.append(user_id)

        if not test_user_ids:
            print("No test users found, skipping enrollment cleanup")
            return

        # Delete enrollments for test users in test courses
        for user_id in test_user_ids:
            for course_slug in TEST_COURSE_SLUGS:
                try:
                    result = await db.execute(
                        delete(Enrollment).where(
                            Enrollment.user_id == user_id,
                            Enrollment.course_slug == course_slug
                        )
                    )
                    if result.rowcount > 0:
                        print(f"Removed enrollment: user {user_id} from {course_slug}")
                except Exception as e:
                    if "no such table" in str(e).lower():
                        print(f"Enrollment table not found, skipping cleanup for user {user_id} in {course_slug}")
                        continue
                    print(f"Error removing enrollment for user {user_id} in {course_slug}: {e}")
                    continue

        await db.commit()
        print("Test enrollments cleaned up")
    except Exception as e:
        if "no such table" in str(e).lower():
            print("Database tables not found, skipping enrollment cleanup")
        else:
            print(f"Error during enrollment cleanup: {e}")
            raise


async def cleanup_test_progress(db: AsyncSession) -> None:
    """Remove test progress records from local database."""
    print("Cleaning up test progress...")

    try:
        # Get all test user IDs
        test_user_ids = []
        for email in TEST_USER_EMAILS:
            user_result = await db.execute(
                select(User.id).where(User.email == email)
            )
            user_id = user_result.scalar()
            if user_id:
                test_user_ids.append(user_id)

        if not test_user_ids:
            print("No test users found, skipping progress cleanup")
            return

        # Delete progress for test users in test courses
        for user_id in test_user_ids:
            for course_slug in TEST_COURSE_SLUGS:
                try:
                    result = await db.execute(
                        delete(UserLessonProgress).where(
                            UserLessonProgress.user_id == user_id,
                            UserLessonProgress.course_slug == course_slug
                        )
                    )
                    if result.rowcount > 0:
                        print(f"Removed progress records for user {user_id} in {course_slug}")
                except Exception as e:
                    if "no such table" in str(e).lower():
                        print(f"Progress table not found, skipping cleanup for user {user_id} in {course_slug}")
                        continue
                    print(f"Error removing progress for user {user_id} in {course_slug}: {e}")
                    continue

        await db.commit()
        print("Test progress cleaned up")
    except Exception as e:
        if "no such table" in str(e).lower():
            print("Database tables not found, skipping progress cleanup")
        else:
            print(f"Error during progress cleanup: {e}")
            raise


async def main():
    """Main cleanup function."""
    print("🧹 Starting E2E test database cleanup...")

    # Safety check: only run in testing mode
    if not settings.TESTING:
        print("❌ This script should only be run in testing mode (TESTING=true)")
        sys.exit(1)

    # Additional safety: check environment
    environment = os.getenv("ENVIRONMENT", "development").lower()
    if environment == "production":
        print("❌ Cleanup is not allowed in production environment")
        sys.exit(1)

    try:
        # Clean up Supabase data first (courses and users)
        await cleanup_test_courses(None)  # No DB session needed for Supabase
        await cleanup_supabase_users()

        # Clean up local database data
        async for db in get_db():
            await cleanup_test_users(db)
            await cleanup_test_enrollments(db)
            await cleanup_test_progress(db)
            break  # Only need one session

        print("\n✅ E2E test database cleanup completed successfully!")
        print("\n📋 Cleanup summary:")
        print("   - Removed test users from local User and Profile tables")
        print("   - Removed test courses from Supabase")
        print("   - Removed test users from Supabase Auth and profiles")
        print("   - Removed test enrollments and progress records")
        print("   - Only test data with specific identifiers was removed")

    except Exception as e:
        print(f"❌ Error during cleanup: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())