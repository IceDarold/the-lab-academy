import * as React from 'react';
import type { LessonCell } from '../../../types';
import MarkdownCell from './cells/MarkdownCell';
import CodeCell from './cells/CodeCell';
import QuizCell from './cells/QuizCell';
import UnknownCell from './cells/UnknownCell';

interface CellRendererProps {
  cell: LessonCell;
}

const CellRenderer: React.FC<CellRendererProps> = ({ cell }) => {
  switch (cell.type) {
    case 'text':
      return <MarkdownCell cell={cell} />;
    case 'code':
      return <CodeCell cell={cell} />;
    case 'quiz':
      return <QuizCell cell={cell} />;
    default:
      return <UnknownCell cell={cell as any} />;
  }
};

export default CellRenderer;
