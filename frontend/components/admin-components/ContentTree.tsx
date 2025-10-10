
import * as React from 'react';
import { Folder, FileText, Plus, Lock, Pencil, CircleDot } from 'lucide-react';
import CreateCourseDialog from './CreateCourseDialog';
import CreatePartDialog from './CreatePartDialog';
import CreateLessonDialog from './CreateLessonDialog';
import type { ContentNode } from '../types';


interface ContentTreeProps {
  data: ContentNode[];
  selectedId: string | null;
  onSelectNode: (node: ContentNode) => void;
}

// Modal state management
type ModalState = {
  type: 'part' | 'lesson' | null;
  parentNode: ContentNode | null;
  isOpen: boolean;
};

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'icon' }> = ({ children, className, variant = 'primary', ...props }) => {
    const baseClasses = "inline-flex items-center justify-center text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";
    const sizeClasses = variant === 'icon' ? "h-7 w-7" : "px-4 py-2";
    const variantClasses = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
        secondary: "bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-500",
        icon: "text-gray-400 hover:bg-gray-700 hover:text-white"
    };
    return (
        <button className={`${baseClasses} ${sizeClasses} ${variantClasses[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};


const StatusIcon: React.FC<{ status?: 'published' | 'locked' | 'draft' }> = ({ status = 'published' }) => {
    switch (status) {
        case 'locked':
            return <Lock className="h-3 w-3 text-yellow-500 shrink-0" aria-label="Locked" />;
        case 'draft':
            return <Pencil className="h-3 w-3 text-gray-500 shrink-0" aria-label="Draft" />;
        case 'published':
            return <CircleDot className="h-3 w-3 text-green-500 shrink-0" aria-label="Published" />;
        default:
            return null;
    }
};


interface TreeNodeProps {
    node: ContentNode;
    selectedId: string | null;
    onSelectNode: (node: ContentNode) => void;
    onAddPart: (course: ContentNode) => void;
    onAddLesson: (part: ContentNode) => void;
    level: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, selectedId, onSelectNode, onAddPart, onAddLesson, level }) => {
    const isFolder = node.type === 'course' || node.type === 'part';
    const Icon = isFolder ? Folder : FileText;
    const isSelected = selectedId === node.id;

    const handleSelect = () => {
        console.log(`[TreeNode] Selecting node: id=${node.id}, name="${node.name}", type="${node.type}"`);
        onSelectNode(node);
    };

    return (
        <div>
            <div className="group relative pr-2 rounded-md hover:bg-gray-700/50 text-gray-300">
                <div
                    className="flex items-center gap-2 py-2 cursor-pointer"
                    onClick={handleSelect}
                >
                    <div className="flex items-center gap-2">
                        <div style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }} className={`flex items-center gap-2 ${isSelected ? 'bg-blue-600/30 text-white' : ''}`}>
                            {node.type !== 'config' && <StatusIcon status={node.status} />}
                            <Icon className="h-4 w-4 shrink-0" />
                            <p className="text-sm truncate">{node.name}</p>
                            <div style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}></div>
                        </div>
                    </div>
                </div>

                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {node.type === 'course' && (
                        <Button variant="icon" aria-label={`Add part to ${node.name}`} onClick={(e) => { e.stopPropagation(); onAddPart(node); }}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    )}
                    {node.type === 'part' && (
                        <Button variant="icon" aria-label={`Add lesson to ${node.name}`} onClick={(e) => { e.stopPropagation(); onAddLesson(node); }}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
            {node.children && (
                <div className="space-y-0.5 mt-0.5">
                    {node.children.map(child => (
                        <TreeNode 
                            key={child.id} 
                            node={child} 
                            selectedId={selectedId} 
                            onSelectNode={onSelectNode} 
                            onAddPart={onAddPart}
                            onAddLesson={onAddLesson}
                            level={level + 1} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const ContentTree: React.FC<ContentTreeProps> = ({ data, selectedId, onSelectNode }) => {
    const [modalState, setModalState] = React.useState<ModalState>({ type: null, parentNode: null, isOpen: false });
    console.log('[ContentTree] Render. Selected ID:', selectedId, 'Modal state:', modalState.type);
    
    const handleAddPart = (course: ContentNode) => {
        console.log(`[ContentTree] Opening 'Add Part' modal for course: id=${course.id}`);
        setModalState({ type: 'part', parentNode: course, isOpen: true });
    };

    const handleAddLesson = (part: ContentNode) => {
        console.log(`[ContentTree] Opening 'Add Lesson' modal for part: id=${part.id}`);
        setModalState({ type: 'lesson', parentNode: part, isOpen: true });
    };

    const handleCloseModal = () => {
        console.log('[ContentTree] Closing modal.');
        setModalState({ type: null, parentNode: null, isOpen: false });
    };

    return (
        <div className="p-2 space-y-2">
            <div>
                <CreateCourseDialog>
                    <Button variant="secondary" className="w-full justify-start">
                        <Plus className="h-4 w-4 mr-2" />
                        New Course
                    </Button>
                </CreateCourseDialog>
            </div>
            <div className="space-y-0.5">
                {data.map(node => (
                    <TreeNode 
                        key={node.id} 
                        node={node} 
                        selectedId={selectedId} 
                        onSelectNode={onSelectNode} 
                        level={0}
                        onAddPart={handleAddPart}
                        onAddLesson={handleAddLesson}
                    />
                ))}
            </div>

            {/* Render Modals */}
            <CreatePartDialog
              course={modalState.parentNode}
              isOpen={modalState.type === 'part' && modalState.isOpen}
              onOpenChange={(isOpen) => setModalState(prev => ({ ...prev, isOpen }))}
            />
            <CreateLessonDialog
              part={modalState.parentNode}
              isOpen={modalState.type === 'lesson' && modalState.isOpen}
              onOpenChange={(isOpen) => setModalState(prev => ({ ...prev, isOpen }))}
            />
        </div>
    );
};

export default ContentTree;