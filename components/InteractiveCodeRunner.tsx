import React, { useState, useEffect, useRef } from 'react';
import Editor from 'react-simple-code-editor';
import Button from './Button';
import Card from './Card';

// To avoid TypeScript errors since Prism and Pyodide are loaded from CDN script tags
declare const Prism: any;
declare const loadPyodide: (config: { indexURL: string, stdout: (text: string) => void, stderr: (text: string) => void }) => Promise<any>;

interface InteractiveCodeRunnerProps {
  initialCode: string;
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


const InteractiveCodeRunner: React.FC<InteractiveCodeRunnerProps> = ({ initialCode }) => {
    const [code, setCode] = useState(initialCode);
    const pyodideRef = useRef<any>(null);
    const [pyodideState, setPyodideState] = useState<'loading' | 'ready' | 'error'>('loading');
    const [isExecuting, setIsExecuting] = useState<boolean>(false);
    const [output, setOutput] = useState<string[]>([]);

    useEffect(() => {
        const initializePyodide = async () => {
            setOutput(['⚙️ Initializing Python environment...']);
            try {
                const pyodide = await loadPyodide({
                    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/',
                    stdout: (text) => setOutput(prev => [...prev, text]),
                    stderr: (text) => setOutput(prev => [...prev, text]),
                });
                pyodideRef.current = pyodide;
                
                setOutput(prev => [...prev, 'Loading scientific libraries (pandas, scikit-learn)... This may take a moment.']);
                await pyodide.loadPackage(['numpy', 'pandas', 'scikit-learn']);

                setOutput(prev => [...prev, '✅ Environment ready.']);
                
                setTimeout(() => {
                    setPyodideState('ready');
                    setOutput([]);
                }, 1500);

            } catch (e) {
                console.error(e);
                setOutput(prev => [...prev, '❌ Failed to load Python environment.']);
                setPyodideState('error');
            }
        };
        initializePyodide();
    }, []);

    const handleRun = async () => {
        const pyodide = pyodideRef.current;
        if (!pyodide || pyodideState !== 'ready') return;

        setIsExecuting(true);
        setOutput([]);

        try {
            await pyodide.runPythonAsync(code);
        } catch (e) {
            const err = e as Error;
            setOutput(prev => [...prev, err.message]);
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

    return (
        <Card className="!p-0 overflow-hidden shadow-lg relative border border-gray-200 dark:border-gray-700">
            {pyodideState === 'loading' && (
                <div className="absolute inset-0 bg-gray-800/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 p-4">
                     <svg className="animate-spin h-8 w-8 text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     <div className="text-center text-white">
                        {output.map((line, i) => <p key={i}>{line}</p>)}
                     </div>
                </div>
            )}
            {pyodideState === 'error' && (
                 <div className="absolute inset-0 bg-red-900/80 backdrop-blur-sm flex items-center justify-center z-10 p-4">
                     <p className="text-white font-semibold text-center">❌ Failed to load Python environment. Please try refreshing the page.</p>
                </div>
            )}
            {/* Toolbar */}
            <div className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 px-2 select-none">
                    Live Python Editor
                </h3>
                <div className="flex items-center space-x-2">
                    <Button variant="secondary" onClick={handleReset} disabled={pyodideState !== 'ready'} className="py-1 px-2 text-xs !font-semibold">
                        <ResetIcon />
                        <span className="ml-1.5">Reset</span>
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleRun} 
                        loading={isExecuting} 
                        disabled={pyodideState !== 'ready' || isExecuting}
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
                    disabled={pyodideState !== 'ready'}
                />
            </div>

            {/* Output Window */}
            <div className="border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-xs font-semibold uppercase p-2 bg-gray-100 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 select-none">
                    Console Output
                </h3>
                <pre className="p-4 bg-black text-white text-sm whitespace-pre-wrap break-words font-mono min-h-[50px] max-h-64 overflow-y-auto">
                    <code>
                       {output.length === 0 && pyodideState === 'ready' && (
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
