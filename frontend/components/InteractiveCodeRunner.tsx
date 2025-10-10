import React, { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import Button from './Button';
import Card from './Card';
import { useAnalytics } from '../src/hooks/useAnalytics';

// To avoid TypeScript errors since Prism is loaded from a CDN script tag
declare const Prism: any;

interface InteractiveCodeRunnerProps {
  initialCode: string;
  pyodideState: 'idle' | 'loading' | 'ready' | 'error';
  onExecute: (code: string) => Promise<string[]>;
  lessonSlug: string;
}

// Heroicon SVGs for buttons
const ResetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.664 0l3.181-3.183m-4.991-2.696v4.992" />
    </svg>
);

const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
    </svg>
);


const InteractiveCodeRunner: React.FC<InteractiveCodeRunnerProps> = ({ initialCode, pyodideState, onExecute, lessonSlug }) => {
    const [code, setCode] = useState(initialCode);
    const [isExecuting, setIsExecuting] = useState<boolean>(false);
    const [output, setOutput] = useState<string[]>([]);
    const { trackEvent } = useAnalytics();

    useEffect(() => {
        setCode(initialCode);
        setOutput([]);
    }, [initialCode]);
    
    const handleRun = async () => {
        if (pyodideState !== 'ready') return;

        trackEvent('CODE_EXECUTION', { lesson_slug: lessonSlug, character_count: code.length });
        setIsExecuting(true);
        setOutput([]);

        try {
            const result = await onExecute(code);
            setOutput(result);
        } catch (e) {
            const err = e as Error;
            setOutput([err.message]);
        } finally {
            setIsExecuting(false);
        }
    };

    const handleReset = () => {
        setCode(initialCode);
        setOutput([]);
    };

    const highlightCode = (codeToHighlight: string) => {
      try {
        if (typeof Prism !== 'undefined' && Prism.languages && Prism.languages.python) {
          return Prism.highlight(codeToHighlight, Prism.languages.python, 'python');
        }
      } catch (e) {
        console.error("Prism highlighting failed:", e);
        return codeToHighlight;
      }
      return codeToHighlight;
    }

    const isReady = pyodideState === 'ready';

    return (
        <Card className="!p-0 overflow-hidden shadow-lg relative border border-gray-200 dark:border-gray-700">
            {pyodideState === 'error' && (
                 <div className="absolute inset-0 bg-red-900/80 backdrop-blur-sm flex items-center justify-center z-10 p-4">
                     <p className="text-white font-semibold text-center">❌ Python environment failed to load.</p>
                </div>
            )}
            {/* Toolbar */}
            <div className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 px-2 select-none">
                    Live Python Editor
                </h3>
                <div className="flex items-center space-x-2">
                    <Button variant="secondary" onClick={handleReset} disabled={!isReady} className="py-1 px-2 text-xs !font-semibold">
                        <ResetIcon />
                        <span className="ml-1.5">Reset</span>
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleRun} 
                        loading={isExecuting} 
                        disabled={!isReady || isExecuting}
                        className="py-1 px-2 text-xs !font-semibold"
                    >
                        <PlayIcon />
                        <span className="ml-1.5">Run</span>
                    </Button>
                </div>
            </div>

            {/* Editor */}
            <div className="relative text-sm font-mono">
                <Editor
                    value={code}
                    onValueChange={newCode => setCode(newCode)}
                    highlight={highlightCode}
                    padding={16}
                    className="bg-[#2d2d2d] text-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-inset min-h-[150px]"
                    style={{
                        fontFamily: '"Fira code", "Fira Mono", monospace',
                        fontSize: 14,
                        outline: 0,
                    }}
                    disabled={!isReady}
                />
            </div>

            {/* Output Window */}
            <div className="border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-xs font-semibold uppercase p-2 bg-gray-100 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 select-none">
                    Console Output
                </h3>
                <pre className="p-4 bg-black text-white text-sm whitespace-pre-wrap break-words font-mono min-h-[50px] max-h-64 overflow-y-auto">
                    <code>
                       {output.length === 0 && isReady && (
                            <div className="text-gray-500 select-none">
                                &gt; Output will appear here...
                            </div>
                       )}
                       {output.map((line, index) => {
                            const isError = line.includes('Error:') || line.includes('Traceback');
                            return (
                                <div key={index} className={isError ? 'text-red-400' : 'text-gray-300'}>
                                    {line}
                                </div>
                            );
                        })}
                    </code>
                </pre>
            </div>
        </Card>
    );
};

export default InteractiveCodeRunner;