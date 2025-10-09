import * as React from 'react';
import type { UnknownCell } from '../../../../types';
import { AlertTriangle } from 'lucide-react';

const UnknownCell: React.FC<{ cell: UnknownCell }> = ({ cell }) => {
  return (
    <div className="p-4 bg-yellow-900/50 border border-yellow-700 rounded-lg">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-400" />
        <h3 className="font-semibold text-yellow-300">Unknown Cell Type</h3>
      </div>
      <p className="text-sm text-yellow-400 mt-2">
        The cell type "{cell.data.type || 'undefined'}" is not recognized. Displaying raw content.
      </p>
      <pre className="mt-4 p-3 bg-gray-900 rounded-md text-xs text-gray-300 whitespace-pre-wrap">
        <code>{cell.rawContent}</code>
      </pre>
    </div>
  );
};

export default UnknownCell;
