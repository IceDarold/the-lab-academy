import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getMyCourses,
  getCourseDetails,
  completeLesson,
  listPublicCourses,
  getPublicCourseDetails,
  enrollInCourse,
} from './courses.service'
import api from '../src/lib/api'

// Mock the API module
vi.mock('../src/lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

const mockApi = vi.mocked(api)

describe('Courses Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getMyCourses', () => {
    it('should successfully fetch and map user courses', async () => {
      const mockResponse = {
        data: [
          {
            course_id: 'course-1',
            slug: 'react-basics',
            title: 'React Basics',
            description: 'Learn React fundamentals',
            cover_image_url: 'https://example.com/image1.jpg',
            progress_percent: 75,
            status: 'in_progress',
          },
          {
            id: 'course-2',
            slug: 'typescript-advanced',
            title: 'Advanced TypeScript',
            description: 'Master TypeScript',
            cover_image_url: 'https://example.com/image2.jpg',
            progress_percent: 100,
            status: 'completed',
          },
        ],
      }

      mockApi.get.mockResolvedValueOnce(mockResponse)

      const result = await getMyCourses()

      expect(mockApi.get).toHaveBeenCalledWith('/v1/dashboard/my-courses')
      expect(result).toEqual([
        {
          courseId: 'course-1',
          slug: 'react-basics',
          title: 'React Basics',
          description: 'Learn React fundamentals',
          coverImageUrl: 'https://example.com/image1.jpg',
          progressPercent: 75,
          status: 'in-progress',
        },
        {
          courseId: 'course-2',
          slug: 'typescript-advanced',
          title: 'Advanced TypeScript',
          description: 'Master TypeScript',
          coverImageUrl: 'https://example.com/image2.jpg',
          progressPercent: 100,
          status: 'completed',
        },
      ])
    })

    it('should handle empty course list', async () => {
      const mockResponse = {
        data: [],
      }

      mockApi.get.mockResolvedValueOnce(mockResponse)

      const result = await getMyCourses()

      expect(result).toEqual([])
    })

    it('should handle missing optional fields', async () => {
      const mockResponse = {
        data: [
          {
            course_id: 'course-1',
            title: 'React Basics',
            // missing slug, description, cover_image_url, progress_percent, status
          },
        ],
      }

      mockApi.get.mockResolvedValueOnce(mockResponse)

      const result = await getMyCourses()

      expect(result).toEqual([
        {
          courseId: 'course-1',
          slug: '',
          title: 'React Basics',
          description: '',
          coverImageUrl: '',
          progressPercent: 0,
          status: 'not_started',
        },
      ])
    })

    it('should use id as fallback for course_id', async () => {
      const mockResponse = {
        data: [
          {
            id: 'course-1',
            // course_id is missing
            title: 'React Basics',
          },
        ],
      }

      mockApi.get.mockResolvedValueOnce(mockResponse)

      const result = await getMyCourses()

      expect(result[0].courseId).toBe('course-1')
    })

    it('should round progress percent to nearest integer', async () => {
      const mockResponse = {
        data: [
          {
            course_id: 'course-1',
            title: 'React Basics',
            progress_percent: 75.7,
          },
        ],
      }

      mockApi.get.mockResolvedValueOnce(mockResponse)

      const result = await getMyCourses()

      expect(result[0].progressPercent).toBe(76)
    })

    it('should throw error when API call fails', async () => {
      const error = new Error('Unauthorized')
      mockApi.get.mockRejectedValueOnce(error)

      await expect(getMyCourses()).rejects.toThrow('Unauthorized')
    })
  })

  describe('getCourseDetails', () => {
    it('should successfully fetch and map course details', async () => {
      const mockResponse = {
        data: {
          course_id: 'course-1',
          slug: 'react-basics',
          title: 'React Basics',
          description: 'Learn React fundamentals',
          cover_image_url: 'https://example.com/image1.jpg',
          overall_progress_percent: 75,
          modules: [
            {
              title: 'Introduction',
              order: 1,
              lessons: [
                {
                  lesson_id: 'lesson-1',
                  slug: 'what-is-react',
                  title: 'What is React?',
                  order: 1,
                  status: 'completed',
                },
                {
                  lesson_id: 'lesson-2',
                  slug: 'jsx-syntax',
                  title: 'JSX Syntax',
                  order: 2,
                  status: 'in_progress',
                },
              ],
            },
          ],
        },
      }

      mockApi.get.mockResolvedValueOnce(mockResponse)

      const result = await getCourseDetails('react-basics')

      expect(mockApi.get).toHaveBeenCalledWith('/v1/dashboard/courses/react-basics')
      expect(result).toEqual({
        courseId: 'course-1',
        slug: 'react-basics',
        title: 'React Basics',
        description: 'Learn React fundamentals',
        coverImageUrl: 'https://example.com/image1.jpg',
        overallProgressPercent: 75,
        modules: [
          {
            title: 'Introduction',
            order: 1,
            lessons: [
              {
                lessonId: 'lesson-1',
                slug: 'what-is-react',
                title: 'What is React?',
                order: 1,
                status: 'completed',
              },
              {
                lessonId: 'lesson-2',
                slug: 'jsx-syntax',
                title: 'JSX Syntax',
                order: 2,
                status: 'in-progress',
              },
            ],
          },
        ],
      })
    })

    it('should handle missing modules', async () => {
      const mockResponse = {
        data: {
          course_id: 'course-1',
          title: 'React Basics',
          // modules is missing
        },
      }

      mockApi.get.mockResolvedValueOnce(mockResponse)

      const result = await getCourseDetails('react-basics')

      expect(result.modules).toEqual([])
    })

    it('should handle missing lessons in modules', async () => {
      const mockResponse = {
        data: {
          course_id: 'course-1',
          title: 'React Basics',
          modules: [
            {
              title: 'Introduction',
              // lessons is missing
            },
          ],
        },
      }

      mockApi.get.mockResolvedValueOnce(mockResponse)

      const result = await getCourseDetails('react-basics')

      expect(result.modules[0].lessons).toEqual([])
    })

    it('should use provided slug when not in response', async () => {
      const mockResponse = {
        data: {
          course_id: 'course-1',
          title: 'React Basics',
          // slug is missing
        },
      }

      mockApi.get.mockResolvedValueOnce(mockResponse)

      const result = await getCourseDetails('react-basics')

      expect(result.slug).toBe('react-basics')
    })

    it('should round overall progress percent', async () => {
      const mockResponse = {
        data: {
          course_id: 'course-1',
          title: 'React Basics',
          overall_progress_percent: 75.7,
        },
      }

      mockApi.get.mockResolvedValueOnce(mockResponse)

      const result = await getCourseDetails('react-basics')

      expect(result.overallProgressPercent).toBe(76)
    })

    it('should throw error when API call fails', async () => {
      const error = new Error('Course not found')
      mockApi.get.mockRejectedValueOnce(error)

      await expect(getCourseDetails('nonexistent-course')).rejects.toThrow('Course not found')
    })
  })

  describe('completeLesson', () => {
    it('should successfully complete lesson and return progress', async () => {
      const mockResponse = {
        data: {
          new_course_progress_percent: 80,
        },
      }

      mockApi.post.mockResolvedValueOnce(mockResponse)

      const result = await completeLesson('lesson-123')

      expect(mockApi.post).toHaveBeenCalledWith('/v1/lessons/lesson-123/complete')
      expect(result).toBe(80)
    })

    it('should return undefined when progress is not provided', async () => {
      const mockResponse = {
        data: {
          // new_course_progress_percent is missing
        },
      }

      mockApi.post.mockResolvedValueOnce(mockResponse)

      const result = await completeLesson('lesson-123')

      expect(result).toBeUndefined()
    })

    it('should throw error when lessonId is empty', async () => {
      await expect(completeLesson('')).rejects.toThrow('Lesson identifier is required to complete a lesson.')
    })

    it('should throw error when lessonId is undefined', async () => {
      await expect(completeLesson(undefined as any)).rejects.toThrow('Lesson identifier is required to complete a lesson.')
    })

    it('should throw error when API call fails', async () => {
      const error = new Error('Lesson not found')
      mockApi.post.mockRejectedValueOnce(error)

      await expect(completeLesson('invalid-lesson')).rejects.toThrow('Lesson not found')
    })
  })

  describe('listPublicCourses', () => {
    it('should successfully fetch public courses', async () => {
      const mockResponse = {
        data: [
          {
            course_id: 'course-1',
            slug: 'react-basics',
            title: 'React Basics',
            description: 'Learn React fundamentals',
            cover_image_url: 'https://example.com/image1.jpg',
          },
        ],
      }

      mockApi.get.mockResolvedValueOnce(mockResponse)

      const result = await listPublicCourses()

      expect(mockApi.get).toHaveBeenCalledWith('/v1/courses', { params: undefined })
      expect(result).toEqual([
        {
          courseId: 'course-1',
          slug: 'react-basics',
          title: 'React Basics',
          description: 'Learn React fundamentals',
          coverImageUrl: 'https://example.com/image1.jpg',
        },
      ])
    })

    it('should pass limit and offset parameters', async () => {
      const mockResponse = {
        data: [],
      }

      mockApi.get.mockResolvedValueOnce(mockResponse)

      await listPublicCourses({ limit: 10, offset: 20 })

      expect(mockApi.get).toHaveBeenCalledWith('/v1/courses', {
        params: { limit: 10, offset: 20 },
      })
    })

    it('should handle empty course list', async () => {
      const mockResponse = {
        data: [],
      }

      mockApi.get.mockResolvedValueOnce(mockResponse)

      const result = await listPublicCourses()

      expect(result).toEqual([])
    })

    it('should use id as fallback for course_id', async () => {
      const mockResponse = {
        data: [
          {
            id: 'course-1',
            title: 'React Basics',
          },
        ],
      }

      mockApi.get.mockResolvedValueOnce(mockResponse)

      const result = await listPublicCourses()

      expect(result[0].courseId).toBe('course-1')
    })

    it('should throw error when API call fails', async () => {
      const error = new Error('Network error')
      mockApi.get.mockRejectedValueOnce(error)

      await expect(listPublicCourses()).rejects.toThrow('Network error')
    })
  })

  describe('getPublicCourseDetails', () => {
    it('should successfully fetch public course details', async () => {
      const mockResponse = {
        data: {
          course_id: 'course-1',
          slug: 'react-basics',
          title: 'React Basics',
          description: 'Learn React fundamentals',
          cover_image_url: 'https://example.com/image1.jpg',
          modules: [
            {
              title: 'Introduction',
              order: 1,
              lessons: [
                {
                  title: 'What is React?',
                  description: 'Introduction to React',
                  order: 1,
                },
              ],
            },
          ],
        },
      }

      mockApi.get.mockResolvedValueOnce(mockResponse)

      const result = await getPublicCourseDetails('react-basics')

      expect(mockApi.get).toHaveBeenCalledWith('/v1/courses/react-basics')
      expect(result).toEqual({
        courseId: 'course-1',
        slug: 'react-basics',
        title: 'React Basics',
        description: 'Learn React fundamentals',
        coverImageUrl: 'https://example.com/image1.jpg',
        modules: [
          {
            title: 'Introduction',
            order: 1,
            lessons: [
              {
                title: 'What is React?',
                description: 'Introduction to React',
                order: 1,
              },
            ],
          },
        ],
      })
    })

    it('should handle missing modules', async () => {
      const mockResponse = {
        data: {
          course_id: 'course-1',
          title: 'React Basics',
          // modules is missing
        },
      }

      mockApi.get.mockResolvedValueOnce(mockResponse)

      const result = await getPublicCourseDetails('react-basics')

      expect(result.modules).toEqual([])
    })

    it('should handle missing lessons in modules', async () => {
      const mockResponse = {
        data: {
          course_id: 'course-1',
          title: 'React Basics',
          modules: [
            {
              title: 'Introduction',
              // lessons is missing
            },
          ],
        },
      }

      mockApi.get.mockResolvedValueOnce(mockResponse)

      const result = await getPublicCourseDetails('react-basics')

      expect(result.modules[0].lessons).toEqual([])
    })

    it('should use provided slug when not in response', async () => {
      const mockResponse = {
        data: {
          course_id: 'course-1',
          title: 'React Basics',
          // slug is missing
        },
      }

      mockApi.get.mockResolvedValueOnce(mockResponse)

      const result = await getPublicCourseDetails('react-basics')

      expect(result.slug).toBe('react-basics')
    })

    it('should throw error when API call fails', async () => {
      const error = new Error('Course not found')
      mockApi.get.mockRejectedValueOnce(error)

      await expect(getPublicCourseDetails('nonexistent-course')).rejects.toThrow('Course not found')
    })
  })

  describe('enrollInCourse', () => {
    it('should successfully enroll in course', async () => {
      mockApi.post.mockResolvedValueOnce({})

      await expect(enrollInCourse('react-basics')).resolves.toBeUndefined()

      expect(mockApi.post).toHaveBeenCalledWith('/v1/courses/react-basics/enroll')
    })

    it('should throw error when slug is empty', async () => {
      await expect(enrollInCourse('')).rejects.toThrow('Course slug is required to enroll.')
    })

    it('should throw error when slug is undefined', async () => {
      await expect(enrollInCourse(undefined as any)).rejects.toThrow('Course slug is required to enroll.')
    })

    it('should throw error when API call fails', async () => {
      const error = new Error('Course not found')
      mockApi.post.mockRejectedValueOnce(error)

      await expect(enrollInCourse('nonexistent-course')).rejects.toThrow('Course not found')
    })
  })
})
