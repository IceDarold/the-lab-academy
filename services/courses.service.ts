import { Course } from '../types/courses';

const MOCK_COURSES: Course[] = [
  { 
    id: '1', 
    slug: 'classic-ml-algorithms', 
    title: 'Classic ML Algorithms', 
    description: 'This course provides a comprehensive introduction to the fundamental concepts and algorithms of classical machine learning.', 
    coverImageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=870&auto=format&fit=crop', 
    progress: 55, 
    status: 'in-progress',
    tags: ['Beginner', 'Python'],
    stats: { partsCompleted: 2, partsTotal: 4, lessonsCompleted: 5, lessonsTotal: 12 },
    syllabus: [
        { title: "Section 1: Intro to ML", status: 'Completed', progress: 100, lessons: [{ id: 1, slug: 'welcome', title: "Welcome", status: 'completed', duration: '5 min' }, { id: 2, slug: 'core-concepts', title: "Core Concepts", status: 'completed', duration: '15 min' }] },
        { title: "Section 2: Regression", status: 'In Progress', progress: 50, lessons: [{ id: 3, slug: 'linear-regression', title: "Linear Regression", status: 'completed', duration: '25 min' }, { id: 4, slug: 'evaluating-models', title: "Evaluating Models", status: 'in-progress', duration: '20 min' }, { id: 5, slug: 'hands-on-project-regression', title: "Hands-On Project", status: 'not-started', duration: '45 min' }] },
        { title: "Section 3: Classification", status: 'Not Started', progress: 0, lessons: [{ id: 6, slug: 'logistic-regression', title: "Logistic Regression", status: 'not-started', duration: '30 min' }, { id: 7, slug: 'decision-trees', title: "Decision Trees", status: 'not-started', duration: '30 min' }] },
        { title: "Section 4: Unsupervised Learning", status: 'Not Started', progress: 0, lessons: [{ id: 8, slug: 'k-means-clustering', title: "K-Means Clustering", status: 'not-started', duration: '35 min' }] }
    ]
  },
  { 
    id: '2', 
    slug: 'data-wrangling-with-pandas', 
    title: 'Data Wrangling with Pandas', 
    description: 'Learn the art of cleaning, transforming, and analyzing data with the powerful Pandas library.', 
    coverImageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=870&auto=format&fit=crop', 
    progress: 10, 
    status: 'in-progress',
    tags: ['Beginner', 'Data Science'],
    stats: { partsCompleted: 0, partsTotal: 3, lessonsCompleted: 1, lessonsTotal: 9 },
    syllabus: [
        { title: "Section 1: Pandas Basics", status: 'In Progress', progress: 33, lessons: [{ id: 1, slug: 'intro-to-dataframes', title: "Intro to DataFrames", status: 'in-progress', duration: '20 min' }, { id: 2, slug: 'data-selection', title: "Data Selection", status: 'not-started', duration: '25 min' }] },
        { title: "Section 2: Data Cleaning", status: 'Not Started', progress: 0, lessons: [{ id: 3, slug: 'handling-missing-data', title: "Handling Missing Data", status: 'not-started', duration: '30 min' }] },
        { title: "Section 3: Advanced Operations", status: 'Not Started', progress: 0, lessons: [{ id: 4, slug: 'grouping-and-aggregating', title: "Grouping and Aggregating", status: 'not-started', duration: '40 min' }] }
    ]
  },
  { 
    id: '3', 
    slug: 'deep-dive-into-neural-networks', 
    title: 'Deep Dive into Neural Networks', 
    description: 'Build and train your first neural networks for image classification and natural language processing.', 
    coverImageUrl: 'https://images.unsplash.com/photo-1555431182-0c3e4383a1ec?q=80&w=870&auto=format&fit=crop', 
    progress: 90, 
    status: 'in-progress',
    tags: ['Intermediate', 'PyTorch'],
    stats: { partsCompleted: 3, partsTotal: 4, lessonsCompleted: 8, lessonsTotal: 10 },
    syllabus: [
        { title: "Section 1: Foundations", status: 'Completed', progress: 100, lessons: [{ id: 1, slug: 'what-is-a-nn', title: "What is a Neural Network?", status: 'completed', duration: '15 min' }] },
        { title: "Section 2: Building with PyTorch", status: 'Completed', progress: 100, lessons: [{ id: 2, slug: 'tensors-and-gradients', title: "Tensors and Gradients", status: 'completed', duration: '30 min' }] },
        { title: "Section 3: CNNs", status: 'In Progress', progress: 80, lessons: [{ id: 3, slug: 'convolutional-layers', title: "Convolutional Layers", status: 'in-progress', duration: '40 min' }] },
        { title: "Section 4: RNNs", status: 'Not Started', progress: 0, lessons: [{ id: 4, slug: 'handling-sequences', title: "Handling Sequences", status: 'not-started', duration: '45 min' }] }
    ]
  },
  { 
    id: '4', 
    slug: 'advanced-computer-vision', 
    title: 'Advanced Computer Vision', 
    description: 'Explore object detection, semantic segmentation, and other advanced computer vision techniques.', 
    coverImageUrl: 'https://images.unsplash.com/photo-1612012179831-2384a8397c44?q=80&w=870&auto=format&fit=crop', 
    progress: 0, 
    status: 'not_started',
    tags: ['Advanced', 'TensorFlow'],
    stats: { partsCompleted: 0, partsTotal: 5, lessonsCompleted: 0, lessonsTotal: 15 },
    syllabus: [
        { title: "Section 1: Object Detection", status: 'Not Started', progress: 0, lessons: [{ id: 1, slug: 'intro-to-r-cnn', title: "Intro to R-CNN", status: 'not-started', duration: '45 min' }] },
        { title: "Section 2: Segmentation", status: 'Not Started', progress: 0, lessons: [{ id: 2, slug: 'u-net-architecture', title: "U-Net Architecture", status: 'not-started', duration: '50 min' }] }
    ]
  },
  { 
    id: '5', 
    slug: 'natural-language-processing-basics', 
    title: 'Natural Language Processing Basics', 
    description: 'Understand how machines process human language, from tokenization to sentiment analysis.', 
    coverImageUrl: 'https://images.unsplash.com/photo-1555949963-ff98c872d2e8?q=80&w=870&auto=format&fit=crop', 
    progress: 100, 
    status: 'completed',
    tags: ['Intermediate', 'NLP'],
    stats: { partsCompleted: 4, partsTotal: 4, lessonsCompleted: 12, lessonsTotal: 12 },
    syllabus: [
        { title: "Section 1: Text Preprocessing", status: 'Completed', progress: 100, lessons: [{ id: 1, slug: 'tokenization', title: "Tokenization", status: 'completed', duration: '20 min' }] },
        { title: "Section 2: Word Embeddings", status: 'Completed', progress: 100, lessons: [{ id: 2, slug: 'word2vec', title: "Word2Vec", status: 'completed', duration: '35 min' }] }
    ]
  }
];

export const getMyCourses = async (): Promise<Course[]> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  const enrolledCourses = MOCK_COURSES.filter(course => course.status === 'in-progress' || course.status === 'completed');
  return enrolledCourses;
};

export const getCourseDetails = async (slug: string): Promise<Course | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const course = MOCK_COURSES.find(c => c.slug === slug);
    return course;
};

export const getLessonNavigation = async (lessonSlug: string): Promise<{ previousLessonSlug: string | null; nextLessonSlug: string | null }> => {
    await new Promise(resolve => setTimeout(resolve, 50)); // Fast lookup

    let allLessonsInCourse: { slug: string }[] = [];

    for (const course of MOCK_COURSES) {
        const lessons = course.syllabus.flatMap(s => s.lessons);
        if (lessons.some(l => l.slug === lessonSlug)) {
            allLessonsInCourse = lessons;
            break;
        }
    }

    if (allLessonsInCourse.length === 0) {
        return { previousLessonSlug: null, nextLessonSlug: null };
    }
    
    const currentLessonIndex = allLessonsInCourse.findIndex(l => l.slug === lessonSlug);

    if (currentLessonIndex === -1) {
        return { previousLessonSlug: null, nextLessonSlug: null };
    }
    
    const previousLessonSlug = currentLessonIndex > 0 ? allLessonsInCourse[currentLessonIndex - 1].slug : null;
    const nextLessonSlug = currentLessonIndex < allLessonsInCourse.length - 1 ? allLessonsInCourse[currentLessonIndex + 1].slug : null;
    
    return { previousLessonSlug, nextLessonSlug };
};

export const completeLesson = async (lessonSlug: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let courseOfLesson: Course | null = null;
  let lessonIndex = -1;
  let sectionIndex = -1;
  
  for (const course of MOCK_COURSES) {
    for (let sIdx = 0; sIdx < course.syllabus.length; sIdx++) {
      const section = course.syllabus[sIdx];
      const lIdx = section.lessons.findIndex(l => l.slug === lessonSlug);
      if (lIdx !== -1) {
        courseOfLesson = course;
        sectionIndex = sIdx;
        lessonIndex = lIdx;
        break;
      }
    }
    if (courseOfLesson) break;
  }
  
  if (!courseOfLesson) {
    throw new Error(`Lesson with slug "${lessonSlug}" not found in any course.`);
  }
  
  // Do not perform updates if already completed
  if (courseOfLesson.syllabus[sectionIndex].lessons[lessonIndex].status === 'completed') {
    return;
  }
  
  courseOfLesson.syllabus[sectionIndex].lessons[lessonIndex].status = 'completed';

  // Recalculate progress
  const currentSection = courseOfLesson.syllabus[sectionIndex];
  const completedInSection = currentSection.lessons.filter(l => l.status === 'completed').length;
  currentSection.progress = Math.round((completedInSection / currentSection.lessons.length) * 100);
  currentSection.status = currentSection.progress === 100 ? 'Completed' : 'In Progress';

  const allLessons = courseOfLesson.syllabus.flatMap(s => s.lessons);
  const totalCompleted = allLessons.filter(l => l.status === 'completed').length;
  courseOfLesson.progress = Math.round((totalCompleted / allLessons.length) * 100);
  courseOfLesson.stats.lessonsCompleted = totalCompleted;
  
  const completedSections = courseOfLesson.syllabus.filter(s => s.status === 'Completed').length;
  courseOfLesson.stats.partsCompleted = completedSections;

  if (courseOfLesson.progress === 100) {
      courseOfLesson.status = 'completed';
  }
};