import * as React from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markdown';
import { FileText, Code, Eye, Settings, Edit, X, Check, BookOpen, Lock, Pencil, CircleDot, Folder } from 'lucide-react';

import type { ContentNode, ParsedLesson } from '../../types/admin';
import { parseLesson } from '../../src/lib/admin-utils/lessonParser';
import { getConfigFile, updateConfigFile } from '../../services/admin.service';
import { mockLessonRawContent } from './admin/mock-lesson-raw';
import CellRenderer from './admin/lessons/CellRenderer';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './ui/resizable';
import Button from './ui/button';
import Badge from './ui/badge';
import LessonSettingsDialog from './admin/lessons/LessonSettingsDialog';

interface EditorPanelProps {
  selectedNode: ContentNode | null;
}

const yamlPlaceholder = `
# Configuration for: 
title: A great title
description: A comprehensive overview of fundamental concepts.
author: AI Academy
version: 1.0.0
`;

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`bg-gray-800 border border-gray-700 rounded-lg shadow-md ${className}`}>
        {children}
    </div>
);

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`p-4 border-b border-gray-700 ${className}`}>
        {children}
    </div>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`p-4 ${className}`}>
        {children}
    </div>
);

const EditorPanel: React.FC<EditorPanelProps> = ({ selectedNode }) => {
    const [mode, setMode] = React.useState<'read' | 'edit'>('read');
    const [rawContent, setRawContent] = React.useState('');
    const [parsedLesson, setParsedLesson] = React.useState<ParsedLesson | null>(null);
    const [isSaving, setIsSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
    
    const [yamlCode, setYamlCode] = React.useState(yamlPlaceholder);

    React.useEffect(() => {
        if (selectedNode?.type === 'lesson') {
            console.log(`[EditorPanel] Loading lesson: ${selectedNode.id}`);
            setMode('read');
            const content = mockLessonRawContent; // Simulate API fetch
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
        } else if (selectedNode?.type === 'course' || selectedNode?.type === 'part') {
             const placeholder = `# Configuration for: ${selectedNode.name}\n${yamlPlaceholder.split('\n').slice(2).join('\n')}`;
            setYamlCode(placeholder); // Simulate fetch
        }
    }, [selectedNode]);

    React.useEffect(() => {
        if (selectedNode?.type === 'lesson' && mode === 'edit') {
            try {
                const parsed = parseLesson(rawContent);
                setParsedLesson(parsed);
                setError(null);
            } catch (e) {
                setError("Error parsing lesson content. Check syntax.");
            }
        }
    }, [rawContent, mode, selectedNode]);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setMode('read');
            const parsed = parseLesson(rawContent);
            setParsedLesson(parsed);
        }, 1500);
    };
    
    const handleCancel = () => {
        const originalContent = mockLessonRawContent;
        setRawContent(originalContent);
        setParsedLesson(parseLesson(originalContent));
        setMode('read');
    };

    if (!selectedNode) {
        return (
            <div className="flex flex-col h-full items-center justify-center p-6 text-center">
                <FileText className="h-12 w-12 mx-auto text-gray-600" />
                <h2 className="mt-4 text-xl font-bold">Select a file</h2>
                <p className="mt-1 text-sm text-gray-400">
                    Choose a file from the left panel to view or edit its content.
                </p>
            </div>
        );
    }

    if (selectedNode.type === 'lesson') {
        const lessonName = parsedLesson?.metadata?.title || selectedNode.name;
        const status = selectedNode.status || 'published';

        const statusMap: { [key in typeof status]: { variant: 'success' | 'primary' | 'secondary', text: string, icon: React.ElementType } } = {
            published: { variant: 'success', text: 'Published', icon: CircleDot },
            locked: { variant: 'primary', text: 'Locked', icon: Lock },
            draft: { variant: 'secondary', text: 'Draft', icon: Pencil },
        };

        const currentStatus = statusMap[status];

        return (
            <div className="p-6 h-full">
                <Card className="h-full flex flex-col">
                    <CardHeader className="flex justify-between items-center">
                        <div className="flex items-center gap-3 min-w-0">
                            <BookOpen className="h-5 w-5 text-blue-400 shrink-0" />
                            <h2 className="text-lg font-semibold truncate" title={lessonName}>{lessonName}</h2>
                            {currentStatus && (
                                <Badge variant={currentStatus.variant} className="shrink-0">
                                    <currentStatus.icon className="h-3 w-3 mr-1.5" />
                                    {currentStatus.text}
                                </Badge>
                            )}
                        </div>
                        {mode === 'read' ? (
                            <div className="flex items-center gap-2">
                                <Button variant="secondary" size="sm"><Eye className="h-4 w-4 mr-2" />Preview</Button>
                                <Button variant="secondary" size="sm" onClick={() => setIsSettingsOpen(true)}><Settings className="h-4 w-4 mr-2" />Settings</Button>
                                <Button size="sm" onClick={() => setMode('edit')}><Edit className="h-4 w-4 mr-2" />Edit</Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button variant="secondary" size="sm" onClick={handleCancel} disabled={isSaving}><X className="h-4 w-4 mr-2" />Cancel</Button>
                                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? 'Saving...' : <><Check className="h-4 w-4 mr-2" />Save</>}
                                </Button>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="flex-1 p-0 overflow-hidden">
                        {mode === 'read' ? (
                            <div className="h-full overflow-y-auto p-6 space-y-6">
                                {parsedLesson ? parsedLesson.cells.map((cell, index) => <CellRenderer key={index} cell={cell} />) : <div className="text-red-400">{error || 'Loading lesson...'}</div>}
                            </div>
                        ) : (
                            <ResizablePanelGroup direction="horizontal" className="h-full">
                                <ResizablePanel defaultSize={50} minSize={30}>
                                    <div className="h-full overflow-auto bg-gray-900 editor-container">
                                        <Editor
                                            value={rawContent}
                                            onValueChange={setRawContent}
                                            highlight={(code) => Prism.highlight(code, Prism.languages.markdown, 'markdown')}
                                            padding={16}
                                            className="font-mono text-sm leading-relaxed"
                                            style={{ fontFamily: '"Fira Code", "Fira Mono", monospace', fontSize: 14, outline: 'none', border: 'none', backgroundColor: 'transparent', caretColor: 'white' }}
                                        />
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle withHandle />
                                <ResizablePanel defaultSize={50} minSize={30}>
                                    <div className="h-full overflow-y-auto p-6 bg-gray-800/20">
                                        <div className="space-y-6">
                                            {error ? <div className="text-red-400 p-4 bg-red-900/50 border border-red-700 rounded-md">{error}</div> : parsedLesson ? parsedLesson.cells.map((cell, index) => <CellRenderer key={index} cell={cell} />) : <div className="text-gray-400">Waiting for content...</div>}
                                        </div>
                                    </div>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        )}
                    </CardContent>
                </Card>
                <LessonSettingsDialog
                    lesson={selectedNode}
                    isOpen={isSettingsOpen}
                    onOpenChange={setIsSettingsOpen}
                />
            </div>
        );
    }
    
    if (selectedNode.type === 'course' || selectedNode.type === 'part') {
         return (
            <div className="p-6 h-full">
                <Card className="h-full flex flex-col">
                    <CardHeader className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                             <Folder className="h-5 w-5 text-green-400" />
                             <h2 className="text-lg font-semibold">{selectedNode.name} Configuration</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="secondary" size="sm">Cancel</Button>
                            <Button size="sm">Save Changes</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto bg-gray-900/50 rounded-b-lg p-0 editor-container">
                        <Editor
                            value={yamlCode}
                            onValueChange={code => setYamlCode(code)}
                            highlight={code => Prism.highlight(code, Prism.languages.yaml, 'yaml')}
                            padding={16}
                            className="font-mono text-sm leading-relaxed"
                            style={{ fontFamily: '"Fira Code", "Fira Mono", monospace', fontSize: 14, outline: 'none', border: 'none', backgroundColor: 'transparent', caretColor: 'white' }}
                        />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full items-center justify-center p-6 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-600" />
            <h2 className="mt-4 text-xl font-bold">Unsupported Item</h2>
            <p className="mt-1 text-sm text-gray-400">This item type cannot be edited at this time.</p>
        </div>
    );
};

export default EditorPanel;