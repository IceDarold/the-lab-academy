from typing import List
import logging

from fastapi import APIRouter, Depends, HTTPException, status

from src.core.security import get_current_user
from src.db.session import get_supabase_client
from src.schemas.course import CourseDetailsWithProgress, CourseWithProgress
from src.schemas.user import User

logger = logging.getLogger(__name__)

router = APIRouter()


async def _finalize(result):
    execute = getattr(result, "execute", None)
    if callable(execute):
        result = execute()
    if hasattr(result, "__await__"):
        result = await result
    return result


@router.get("/my-courses", response_model=List[CourseWithProgress])
async def get_my_courses(current_user: User = Depends(get_current_user)) -> List[CourseWithProgress]:
    supabase = get_supabase_client()
    try:
        # For now, return empty list since courses table doesn't exist yet
        # TODO: Implement proper courses functionality when database schema is ready
        logger.info(f"User {current_user.user_id} requested courses - returning empty list (courses table not yet implemented)")
        return []
    except Exception as exc:
        logger.error(f"Dashboard courses request failed: {str(exc)}")
        logger.error(f"Exception type: {type(exc)}")
        raise


@router.get("/courses/{slug}", response_model=CourseDetailsWithProgress)
async def get_course_details(slug: str, current_user: User = Depends(get_current_user)) -> CourseDetailsWithProgress:
    supabase = get_supabase_client()
    response = await _finalize(
        supabase.rpc(
            "get_course_details_for_user",
            {"user_id": str(current_user.user_id), "course_slug": slug},
        )
    )

    data = getattr(response, "data", response)
    if not data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    return data
