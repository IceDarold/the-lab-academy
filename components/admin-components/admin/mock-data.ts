import type { ContentNode } from '../../types';

export const mockContentTree: ContentNode[] = [
  {
    id: 'course-1',
    name: 'Introduction to Machine Learning',
    type: 'course',
    configPath: 'course-1/config',
    children: [
      {
        id: 'part-1',
        name: 'Supervised Learning',
        type: 'part',
        status: 'published',
        configPath: 'course-1/part-1/config',
        children: [
          { id: 'lesson-1-1', name: '01-introduction-to-sl.lesson', type: 'lesson', status: 'published' },
          { id: 'lesson-1-2', name: '02-linear-regression.lesson', type: 'lesson', status: 'published' },
        ],
      },
      {
        id: 'part-2',
        name: 'Unsupervised Learning',
        type: 'part',
        status: 'locked',
        configPath: 'course-1/part-2/config',
        children: [
          { id: 'lesson-2-1', name: '01-clustering.lesson', type: 'lesson', status: 'locked' },
        ],
      },
    ],
  },
  {
    id: 'course-2',
    name: 'Advanced Deep Learning',
    type: 'course',
    configPath: 'course-2/config',
    children: [
      {
        id: 'part-3',
        name: 'Convolutional Neural Networks',
        type: 'part',
        status: 'published',
        configPath: 'course-2/part-3/config',
        children: [
          { id: 'lesson-3-1', name: '01-intro-to-cnns.lesson', type: 'lesson', status: 'published' },
          { id: 'lesson-3-2', name: '02-advanced-cnns.lesson', type: 'lesson', status: 'draft' },
        ],
      },
    ],
  },
];