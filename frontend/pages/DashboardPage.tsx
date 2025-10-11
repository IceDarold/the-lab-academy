import React, { useState, useEffect } from 'react';
// FIX: Import Variants type from framer-motion to correctly type animation variants.
import { motion, Variants } from 'framer-motion';
import Card from '../components/Card';
import Button from '../components/Button';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../src/contexts/AuthContext';
import Modal from '../components/Modal';
import CourseDetailView from '../components/CourseDetailView';
import { getMyCourses } from '../services/courses.service';
import { CourseSummary } from '../types/courses';
import CourseCardSkeleton from '../components/CourseCardSkeleton';

// Animation variants for card containers and individual items
// FIX: Explicitly type animation variants with the Variants type to prevent TypeScript from widening string literals (e.g., 'easeInOut') to the general 'string' type, which would cause a type error.
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// FIX: Explicitly type animation variants with the Variants type to prevent TypeScript from widening string literals (e.g., 'easeInOut') to the general 'string' type, which would cause a type error.
const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
};

// Static data for "Recommended Courses"
const recommendedCoursesData = [
    {
        courseName: "Advanced Computer Vision",
        tags: ['Advanced', 'TensorFlow'],
        description: "Explore object detection, semantic segmentation, and other advanced computer vision techniques.",
        imageUrl: "https://images.unsplash.com/photo-1612012179831-2384a8397c44?q=80&w=870&auto=format&fit=crop"
    },
    {
        courseName: "Natural Language Processing Basics",
        tags: ['Intermediate', 'NLP'],
        description: "Understand how machines process human language, from tokenization to sentiment analysis.",
        imageUrl: "https://images.unsplash.com/photo-1555949963-ff98c872d2e8?q=80&w=870&auto=format&fit=crop"
    },
    {
        courseName: "Reinforcement Learning",
        tags: ['Advanced', 'AI'],
        description: "Learn the principles of reinforcement learning by building agents that learn in complex environments.",
        imageUrl: "https://images.unsplash.com/photo-1593349480503-64d481089938?q=80&w=870&auto=format&fit=crop"
    }
];

const DashboardPage = () => {
  const { user } = useAuth();
  const username = user?.fullName?.split(' ')[0] || "User";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [myCourses, setMyCourses] = useState<CourseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const courses = await getMyCourses();
        setMyCourses(courses);
      } catch (err) {
        setError("Failed to load your courses. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);


  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-16">
          
          {/* Welcome Block */}
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              Glad to see you again, {username}!
            </h1>
          </div>

          {/* Continue Learning */}
          <section>
              <Card className="bg-indigo-600 dark:bg-indigo-700/80 text-white p-8 shadow-2xl">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                      <div>
                          <h2 className="text-xl font-semibold text-indigo-100">Pick up where you left off</h2>
                          <p className="mt-2 text-3xl font-bold">
                              Lesson 6: Decision Trees
                          </p>
                          <p className="text-indigo-200">
                              in "Classic ML Algorithms"
                          </p>
                      </div>
                      <Button 
                          variant="secondary" 
                          className="text-lg py-3 px-8 bg-white text-indigo-600 hover:bg-gray-100 dark:bg-gray-100 dark:text-indigo-700 dark:hover:bg-gray-200 flex-shrink-0"
                          onClick={() => window.location.hash = '#/lesson'}
                      >
                          <span aria-hidden="true" className="mr-2">▶</span> Return to lesson
                      </Button>
                  </div>
              </Card>
          </section>

          {/* My Courses */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
              Your current courses
            </h2>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => <CourseCardSkeleton key={index} />)
              ) : error ? (
                <div className="md:col-span-2 lg:col-span-3">
                    <Card className="text-center py-12">
                        <p className="text-red-500 font-semibold">{error}</p>
                    </Card>
                </div>
              ) : (
                myCourses.map((course) => (
                  <motion.a 
                    href={`#/dashboard/course?slug=${course.slug}`} 
                    key={course.courseId} 
                    onClick={(e) => { e.preventDefault(); window.location.hash = `#/dashboard/course?slug=${course.slug}`; }} 
                    className="block h-full"
                    variants={itemVariants}
                  >
                    <CourseCard
                      status={course.status}
                      courseName={course.title}
                      progress={course.progressPercent}
                      imageUrl={course.coverImageUrl}
                    />
                  </motion.a>
                ))
              )}
            </motion.div>
          </section>

          {/* Recommended Courses */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
              Start a New Journey
            </h2>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {recommendedCoursesData.map((course) => (
                <motion.div key={course.courseName} className="h-full" variants={itemVariants}>
                  <CourseCard
                    status="public"
                    courseName={course.courseName}
                    tags={course.tags}
                    description={course.description}
                    imageUrl={course.imageUrl}
                    onCourseClick={() => setIsModalOpen(true)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </section>

        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CourseDetailView />
      </Modal>
    </>
  );
};

export default DashboardPage;
