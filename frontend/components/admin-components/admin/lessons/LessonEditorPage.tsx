import * as React from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-yaml';

import LessonEditorHeader from './LessonEditorHeader';
import CellRenderer from './CellRenderer';
import { mockLessonRawContent } from '../mock-lesson-raw';
import { parseLesson } from '../../../../src/lib/admin-utils/lessonParser';
import type { ParsedLesson } from '../../../../types/admin';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../../ui/resizable';
import Button from '../../ui/button';
import { ArrowLeft } from 'lucide-react';

interface LessonEditorPageProps {
  lesson: { id: string; name: string };
  onExit: () => void;
}

const LessonEditorPage: React.FC<LessonEditorPageProps> = ({ lesson, onExit }) => {
  const [mode, setMode] = React.useState<'read' | 'edit'>('read');
  const [rawContent, setRawContent] = React.useState('');
  const [parsedLesson, setParsedLesson] = React.useState<ParsedLesson | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Initial load effect
  React.useEffect(() => {
    console.log(`[LessonEditorPage] Loading lesson: ${lesson.id}`);
    // Simulate API fetch
    const content = mockLessonRawContent;
    setRawContent(content);
    try {
      const parsed = parseLesson(content);
      setParsedLesson(parsed);
      setError(null);
    } catch (e) {
      console.error("Failed to parse lesson content:", e);
      setError("Failed to parse lesson content.");
      setParsedLesson(null);
    }
  }, [lesson.id]);
  
  // Live preview effect
  React.useEffect(() => {
    if (mode === 'edit') {
      try {
        const parsed = parseLesson(rawContent);
        setParsedLesson(parsed);
        setError(null);
      } catch (e) {
        setError("Error parsing lesson content. Check syntax.");
      }
    }
  }, [rawContent, mode]);

  const handleSave = () => {
    console.log("[LessonEditorPage] Saving content...");
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      console.log("[LessonEditorPage] Save successful.");
      setIsSaving(false);
      setMode('read');
      // In a real app, you might refetch or just trust the current state
      const parsed = parseLesson(rawContent);
      setParsedLesson(parsed);
    }, 1500);
  };
  
  const handleCancel = () => {
      // refetch original content and switch to read mode
      const originalContent = mockLessonRawContent;
      setRawContent(originalContent);
      setParsedLesson(parseLesson(originalContent));
      setMode('read');
  }

  const lessonName = parsedLesson?.metadata?.title || lesson.name;

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 md:p-8 border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={onExit} className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <LessonEditorHeader
              lessonName={lessonName}
              mode={mode}
              onModeChange={setMode}
              onSave={handleSave}
              onCancel={handleCancel}
              isSaving={isSaving}
            />
        </div>
      </div>
      
      {mode === 'read' && (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {parsedLesson ? (
            parsedLesson.cells.map((cell, index) => (
              <CellRenderer key={index} cell={cell} />
            ))
          ) : (
            <div className="text-red-400">{error || 'Loading lesson...'}</div>
          )}
        </div>
      )}
      
      {mode === 'edit' && (
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full overflow-auto bg-gray-900 editor-container">
              <Editor
                value={rawContent}
                onValueChange={setRawContent}
                highlight={(code) => Prism.highlight(code, Prism.languages.markdown, 'markdown')}
                padding={16}
                className="font-mono text-sm leading-relaxed"
                style={{
                  fontFamily: '"Fira Code", "Fira Mono", monospace',
                  fontSize: 14,
                  outline: 'none',
                  border: 'none',
                  backgroundColor: 'transparent',
                  caretColor: 'white',
                }}
              />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full overflow-y-auto p-6 bg-gray-800/20">
              <div className="space-y-6">
                  {error ? (
                     <div className="text-red-400 p-4 bg-red-900/50 border border-red-700 rounded-md">{error}</div>
                  ) : parsedLesson ? (
                    parsedLesson.cells.map((cell, index) => (
                      <CellRenderer key={index} cell={cell} />
                    ))
                  ) : (
                    <div className="text-gray-400">Waiting for content...</div>
                  )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </div>
  );
};

export default LessonEditorPage;
