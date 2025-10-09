import * as React from 'react';
import type { TextCell } from '../../../../types';

interface MarkdownCellProps {
  cell: TextCell;
}

const MarkdownCell: React.FC<MarkdownCellProps> = ({ cell }) => {
  // In a real app, you would use a library like 'react-markdown' here.
  // For this project, we'll render the content directly in a formatted way.
  return (
    <div className="prose prose-invert prose-lg max-w-none p-4 bg-gray-800/50 rounded-lg border border-gray-700">
      {/* This is a simple pseudo-markdown renderer */}
      {cell.content.split('\n').map((line, index) => {
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-bold mt-4 mb-2">{line.substring(3)}</h2>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-3xl font-bold mt-6 mb-3">{line.substring(2)}</h1>;
        }
        if (line.trim() === '') {
            return <br key={index} />;
        }
        return <p key={index} className="text-gray-300 leading-relaxed">{line}</p>;
      })}
    </div>
  );
};

export default MarkdownCell;
