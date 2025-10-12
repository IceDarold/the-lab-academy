import React, { useEffect, useMemo, useState } from 'react';
import CourseCard from '../components/CourseCard';
import Modal from '../components/Modal';
import CourseDetailView from '../components/CourseDetailView';
import Card from '../components/Card';
import Button from '../components/Button';
import { listPublicCourses, getPublicCourseDetails, enrollInCourse } from '../services/courses.service';
import { PublicCourse, PublicCourseDetails } from '../types/courses';
import toast from 'react-hot-toast';

const CoursesPage = () => {
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCourseSlug, setSelectedCourseSlug] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<PublicCourseDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  useEffect(() => {
    const loadCourses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await listPublicCourses({ limit: 100, offset: 0 });
        setCourses(data);
      } catch (err) {
        console.error('Failed to load courses', err);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourseSlug) {
      setSelectedCourse(null);
      return;
    }

    const loadCourseDetails = async () => {
      setIsFetchingDetails(true);
      try {
        const details = await getPublicCourseDetails(selectedCourseSlug);
        setSelectedCourse(details);
      } catch (err) {
        console.error('Failed to load course details', err);
        toast.error('Could not load course details.');
        setSelectedCourse(null);
      } finally {
        setIsFetchingDetails(false);
      }
    };

    loadCourseDetails();
  }, [selectedCourseSlug]);

  const handleSelectCourse = (slug: string) => {
    setSelectedCourseSlug(slug);
    setIsModalOpen(true);
  };

  const handleEnroll = async (slug: string) => {
    try {
      await enrollInCourse(slug);
      toast.success('Enrollment successful!');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Enrollment failed', err);
      toast.error('Enrollment failed. Please try again.');
    }
  };

  const renderedCourses = useMemo(() => {
    if (isLoading) {
      return Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="p-6 animate-pulse">
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-md" />
          <div className="mt-6 space-y-3">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <Button className="mt-6 w-full" disabled>
            Loading…
          </Button>
        </Card>
      ));
    }

    if (error) {
      return (
        <div className="md:col-span-2 lg:col-span-3">
          <Card className="text-center py-16">
            <p className="text-lg text-red-600 dark:text-red-400">{error}</p>
          </Card>
        </div>
      );
    }

    if (courses.length === 0) {
      return (
        <div className="md:col-span-2 lg:col-span-3">
          <Card className="text-center py-16">
            <p className="text-lg text-gray-600 dark:text-gray-400">No courses available right now. Please check back later.</p>
          </Card>
        </div>
      );
    }

    return courses.map((course) => (
      <div key={course.slug} className="h-full">
        <CourseCard
          status="public"
          courseName={course.title}
          description={course.description}
          imageUrl={course.coverImageUrl}
          onCourseClick={() => handleSelectCourse(course.slug)}
        />
      </div>
    ));
  }, [courses, error, isLoading]);

  return (
    <>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="py-16 lg:py-24">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              All courses to explore
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
              Find the perfect course to start your journey in Machine Learning, from beginner basics to advanced topics.
            </p>
          </div>
          <div data-testid="courses-list" className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {renderedCourses}
          </div>
        </section>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCourseSlug(null);
          setSelectedCourse(null);
        }}
      >
        <CourseDetailView
          course={isFetchingDetails ? null : selectedCourse}
          onEnroll={handleEnroll}
        />
      </Modal>
    </>
  );
};

export default CoursesPage;
