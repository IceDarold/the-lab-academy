#!/usr/bin/env python3
"""
Integration Test Data Seeding Script
Seeds test users directly in Supabase for integration testing.

This script creates predictable test accounts with known credentials
that can be used by integration tests. It bypasses email confirmation
and creates users directly in Supabase Auth and the profiles table.
"""
import asyncio
import os
import sys
from pathlib import Path
from typing import Dict, List, Any
from uuid import uuid4
import requests

# Load environment variables
from dotenv import load_dotenv
# Load from project root
load_dotenv(dotenv_path=Path(__file__).parent.parent.parent / ".env")

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from supabase import Client, create_client
from src.core.logging import get_logger
from src.core.config import settings

logger = get_logger(__name__)

# Test user data - predictable credentials for integration tests
TEST_USERS = [
    {
        "email": "testuser1@example.com",
        "password": "testpass123",
        "full_name": "Test User One",
        "role": "student"
    },
    {
        "email": "testuser2@example.com",
        "password": "testpass123",
        "full_name": "Test User Two",
        "role": "student"
    },
    {
        "email": "testadmin@example.com",
        "password": "adminpass123",
        "full_name": "Test Admin",
        "role": "admin"
    },
    {
        "email": "teststudent@example.com",
        "password": "studentpass123",
        "full_name": "Regular Test Student",
        "role": "student"
    },
    {
        "email": "testinactive@example.com",
        "password": "inactivepass123",
        "full_name": "Inactive Test User",
        "role": "student"
    }
]


class IntegrationSeeder:
    """Handles seeding of test data for integration tests."""

    def __init__(self):
        self.supabase_url = settings.effective_supabase_url
        self.supabase_service_key = settings.effective_supabase_service_role_key
        self.testing = settings.TESTING

        if not self.supabase_url or not self.supabase_service_key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required")

        # Create admin client for seeding
        self.supabase: Client = create_client(self.supabase_url, self.supabase_service_key)

    async def _create_user_in_auth(self, user_data: Dict[str, str]) -> str:
        """Create user in Supabase Auth using admin client for auto-confirmation."""
        try:
            # Use admin client method for creating confirmed users (required for testing)
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.supabase.auth.admin.create_user({
                    "email": user_data["email"],
                    "password": user_data["password"],
                    "email_confirm": True,  # Skip email confirmation for tests
                    "user_metadata": {
                        "full_name": user_data["full_name"],
                        "role": user_data["role"]
                    }
                })
            )

            if not response.user:
                raise ValueError(f"Failed to create user {user_data['email']}: no user in response")

            user_id = response.user.id
            logger.info(f"Created auth user: {user_data['email']} (ID: {user_id})")
            return user_id

        except Exception as e:
            logger.error(f"Failed to create auth user {user_data['email']}: {str(e)}")
            raise

    async def _create_user_profile(self, user_id: str, user_data: Dict[str, str]) -> None:
        """Create user profile in the profiles table."""
        try:
            profile_data = {
                "id": user_id,
                "email": user_data["email"],
                "full_name": user_data["full_name"],
                "role": user_data["role"]
            }

            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.supabase.table("profiles").insert(profile_data).execute()
            )

            if not getattr(response, "data", None):
                raise ValueError(f"Failed to create profile for user {user_data['email']}")

            logger.info(f"Created profile for user: {user_data['email']}")

        except Exception as e:
            logger.error(f"Failed to create profile for user {user_data['email']}: {str(e)}")
            raise

    async def _user_exists(self, email: str) -> bool:
        """Check if user already exists in profiles."""
        try:
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.supabase.table("profiles").select("id").eq("email", email).execute()
            )
            return bool(getattr(response, "data", []))
        except Exception as e:
            logger.warning(f"Error checking if user exists {email}: {str(e)}")
            return False

    async def seed_test_users(self) -> List[Dict[str, Any]]:
        """Seed all test users."""
        created_users = []

        for user_data in TEST_USERS:
            try:
                # Check if user already exists
                if await self._user_exists(user_data["email"]):
                    logger.info(f"User {user_data['email']} already exists, skipping")
                    continue

                # Create user in auth
                user_id = await self._create_user_in_auth(user_data)

                # Create profile
                await self._create_user_profile(user_id, user_data)

                created_users.append({
                    "id": user_id,
                    "email": user_data["email"],
                    "full_name": user_data["full_name"],
                    "role": user_data["role"]
                })

            except Exception as e:
                logger.error(f"Failed to create user {user_data['email']}: {str(e)}")
                # Continue with other users
                continue

        return created_users

    async def cleanup_test_users(self) -> int:
        """Remove all test users (for cleanup between test runs)."""
        deleted_count = 0

        for user_data in TEST_USERS:
            try:
                # Get user from profiles
                profile_response = await asyncio.get_event_loop().run_in_executor(
                    None,
                    lambda: self.supabase.table("profiles").select("id").eq("email", user_data["email"]).execute()
                )

                profiles = getattr(profile_response, "data", [])
                if not profiles:
                    continue

                user_id = profiles[0]["id"]

                # Try to delete from auth using admin method
                try:
                    await asyncio.get_event_loop().run_in_executor(
                        None,
                        lambda: self.supabase.auth.admin.delete_user(user_id)
                    )
                except Exception as e:
                    logger.warning(f"Failed to delete user from auth {user_data['email']}: {str(e)}")

                # Also try to delete profile explicitly
                await asyncio.get_event_loop().run_in_executor(
                    None,
                    lambda: self.supabase.table("profiles").delete().eq("id", user_id).execute()
                )

                deleted_count += 1
                logger.info(f"Deleted test user: {user_data['email']}")

            except Exception as e:
                logger.warning(f"Failed to delete user {user_data['email']}: {str(e)}")
                continue

        return deleted_count


async def main():
    """Main seeding function."""
    print("🌱 Starting integration test data seeding...")

    # Environment checks
    testing = settings.TESTING
    environment = os.getenv("ENVIRONMENT", "development").lower()

    if environment == "production":
        print("❌ Seeding is not allowed in production environment")
        sys.exit(1)

    if not testing:
        print("⚠️  WARNING: TESTING environment variable is not set to 'true'")
        print("   This script should only be run in test environments")
        response = input("Continue anyway? (y/N): ").lower().strip()
        if response not in ['y', 'yes']:
            print("Seeding cancelled")
            return

    try:
        seeder = IntegrationSeeder()

        # Seed test users
        created_users = await seeder.seed_test_users()

        print("\n🎉 Integration test data seeding completed successfully!")
        print(f"   👥 Created {len(created_users)} test users")

        if created_users:
            print("\n🔑 Test accounts created:")
            for user in created_users:
                password = next(u["password"] for u in TEST_USERS if u["email"] == user["email"])
                print(f"   {user['email']} / {password} ({user['role']})")

        print("\n📋 Test data summary:")
        print("   - Users are created in Supabase Auth with email confirmation bypassed")
        print("   - Profiles are inserted into the 'profiles' table")
        print("   - All users have predictable credentials for testing")
        print("   - Users can be cleaned up by running with --cleanup flag")

    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        logger.exception("Seeding failed")
        sys.exit(1)


async def cleanup_main():
    """Main cleanup function."""
    print("🧹 Starting cleanup of integration test data...")

    try:
        seeder = IntegrationSeeder()
        deleted_count = await seeder.cleanup_test_users()

        print(f"\n✅ Cleanup completed! Removed {deleted_count} test users")

    except Exception as e:
        print(f"❌ Error during cleanup: {e}")
        logger.exception("Cleanup failed")
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--cleanup":
        asyncio.run(cleanup_main())
    else:
        asyncio.run(main())