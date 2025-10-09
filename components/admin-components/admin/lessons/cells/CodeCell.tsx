import * as React from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import Editor from 'react-simple-code-editor';
import Button from '../../../ui/button';
import { Play } from 'lucide-react';
import type { CodeCell } from '../../../../types';

const CodeCell: React.FC<{ cell: CodeCell }> = ({ cell }) => {
  const [code, setCode] = React.useState(cell.initialCode || '');
  const [output, setOutput] = React.useState<string | null>(null);

  const handleRun = () => {
    setOutput(`Simulating execution...\nCode for language "${cell.language}" ran successfully.`);
  };

  const language = cell.language === 'python' ? Prism.languages.python : Prism.languages.javascript;

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <Editor
          value={code}
          onValueChange={setCode}
          highlight={(code) => Prism.highlight(code, language, cell.language || 'javascript')}
          padding={10}
          className="font-mono text-sm bg-gray-900 rounded-md"
          style={{
            fontFamily: '"Fira Code", "Fira Mono", monospace',
            fontSize: 14,
          }}
        />
      </div>
      <div className="p-4 flex flex-col gap-4">
        <Button onClick={handleRun} size="sm" className="self-start">
          <Play className="h-4 w-4 mr-2" />
          Run Code
        </Button>
        {output && (
          <pre className="text-sm text-gray-300 bg-gray-900 p-4 rounded-md w-full whitespace-pre-wrap">
            <code>{output}</code>
          </pre>
        )}
      </div>
    </div>
  );
};

export default CodeCell;
