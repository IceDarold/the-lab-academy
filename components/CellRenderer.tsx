import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Cell } from '../types/lessons';
import InteractiveCodeRunner from './InteractiveCodeRunner';
import QuizComponent from './QuizComponent';
import Card from './Card';

const LightBulbIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-1.125a6.01 6.01 0 0 0 2.25-3.375m-5.25 4.5 1.5-1.125a6.01 6.01 0 0 1 2.25-3.375m-5.25 4.5V18m0-5.25h5.25M6 18h12a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15A2.25 2.25 0 0 0 2.25 6.75v9A2.25 2.25 0 0 0 4.5 18Z" />
    </svg>
);


const CellRenderer: React.FC<{ cell: Cell }> = ({ cell }) => {
  switch (cell.type) {
    case 'text':
      return (
        <section id={cell.id} className="mb-8">
            {cell.title && (
                 <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 pb-3 mb-6 border-b border-gray-200 dark:border-gray-700 not-prose">
                    {cell.title}
                </h2>
            )}
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
            >
                {cell.content}
            </ReactMarkdown>
        </section>
      );

    case 'code':
      return (
        <div id={cell.id} className="not-prose my-12">
            <InteractiveCodeRunner initialCode={cell.initialCode} />
        </div>
      );
      
    case 'quiz':
      return (
        <div id={cell.id} className="not-prose my-12">
            <QuizComponent
                question={cell.question}
                answers={cell.answers}
                explanation={cell.explanation}
            />
        </div>
      );

    case 'challenge':
      return (
         <div id={cell.id} className="not-prose my-12">
            <Card className="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700/50 shadow-lg">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 text-indigo-500 dark:text-indigo-400 mt-1">
                        <LightBulbIcon />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{cell.title || 'Challenge'}</h3>
                        <p className="mb-4 text-gray-700 dark:text-gray-300">{cell.instructions}</p>
                        <InteractiveCodeRunner initialCode={cell.initialCode} />
                    </div>
                </div>
            </Card>
         </div>
      );

    default:
      return (
        <div className="p-4 bg-red-100 border border-red-400 rounded-md text-red-700">
            Unsupported cell type.
        </div>
      );
  }
};

export default CellRenderer;