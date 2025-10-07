import React, { useState } from 'react';
import CourseCard from '../components/CourseCard';
import Modal from '../components/Modal';
import CourseDetailView from '../components/CourseDetailView';

const coursesData = [
  {
    courseName: "Classic ML Algorithms",
    tags: ['Beginner', 'Python'],
    description: "Master the fundamentals of machine learning, from linear regression to support vector machines.",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=870&auto=format&fit=crop"
  },
  {
    courseName: "Deep Dive into Neural Networks",
    tags: ['Intermediate', 'PyTorch'],
    description: "Build and train your first neural networks for image classification and natural language processing.",
    imageUrl: "https://images.unsplash.com/photo-1555431182-0c3e4383a1ec?q=80&w=870&auto=format&fit=crop"
  },
  {
    courseName: "Data Wrangling with Pandas",
    tags: ['Beginner', 'Data Science'],
    description: "Learn the art of cleaning, transforming, and analyzing data with the powerful Pandas library.",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=870&auto=format&fit=crop"
  },
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
    courseName: "Unsupervised Learning Techniques",
    tags: ['Intermediate', 'Statistics'],
    description: "Dive into clustering, dimensionality reduction, and anomaly detection with Scikit-learn.",
    imageUrl: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=870&auto=format&fit=crop"
  },
   {
    courseName: "Reinforcement Learning",
    tags: ['Advanced', 'AI'],
    description: "Learn the principles of reinforcement learning by building agents that learn in complex environments.",
    imageUrl: "https://images.unsplash.com/photo-1593349480503-64d481089938?q=80&w=870&auto=format&fit=crop"
  },
  {
    courseName: "Introduction to Big Data",
    tags: ['Beginner', 'Big Data'],
    description: "Get started with big data technologies like Hadoop and Spark to process massive datasets.",
    imageUrl: "https://images.unsplash.com/photo-1521464302861-ce944953d553?q=80&w=870&auto=format&fit=crop"
  }
];

const CoursesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coursesData.map((course) => (
              <div key={course.courseName} className="h-full">
                  <CourseCard
                  status="public"
                  courseName={course.courseName}
                  tags={course.tags}
                  description={course.description}
                  imageUrl={course.imageUrl}
                  onCourseClick={() => setIsModalOpen(true)}
                  />
              </div>
            ))}
          </div>
        </section>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CourseDetailView />
      </Modal>
    </>
  );
};

export default CoursesPage;