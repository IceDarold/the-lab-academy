// ContentManagementPage.tsx
import * as React from 'react';
import ContentTree from '../ContentTree';
import EditorPanel from '../EditorPanel';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable';
import { getContentTree } from '../../../services/admin.service';
import { mockContentTree } from './mock-data';
import type { ContentNode } from '../../types';

type Selection = {
  type: 'lesson' | 'config';
  path: string;
} | null;

const allNodesMap = new Map<string, ContentNode>();
function buildNodeMap(nodes: ContentNode[]) {
    for (const node of nodes) {
        allNodesMap.set(node.id, node);
        if (node.configPath) {
            allNodesMap.set(node.configPath, node);
        }
        if (node.children) {
            buildNodeMap(node.children);
        }
    }
}

const getInitialSelection = (contentTree: ContentNode[]): Selection => {
    if (contentTree.length > 0 && contentTree[0].type === 'course' && contentTree[0].configPath) {
        return { type: 'config', path: contentTree[0].configPath };
    }
    return null;
};


const ContentManagementPage: React.FC = () => {
    const [contentTree, setContentTree] = React.useState<ContentNode[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [selection, setSelection] = React.useState<Selection>(null);

    React.useEffect(() => {
        const fetchContentTree = async () => {
            try {
                const data = await getContentTree();
                setContentTree(data);
                setError(null);
                setSelection(getInitialSelection(data));
            } catch (err) {
                console.error('Failed to fetch content tree:', err);
                setError('Failed to load content tree');
                setContentTree(mockContentTree); // Fallback
                setSelection(getInitialSelection(mockContentTree));
            } finally {
                setIsLoading(false);
            }
        };

        fetchContentTree();
    }, []);

    const selectedNode = React.useMemo(() => {
        if (!selection || contentTree.length === 0) return null;
        // Rebuild map when contentTree changes
        allNodesMap.clear();
        buildNodeMap(contentTree);
        return allNodesMap.get(selection.path) || null;
    }, [selection, contentTree]);

    const handleSelectNode = (node: ContentNode) => {
        if (node.type === 'course' || node.type === 'part') {
            if (node.configPath) {
                setSelection({ type: 'config', path: node.configPath });
            }
        } else if (node.type === 'lesson') {
            setSelection({ type: 'lesson', path: node.id });
        }
    };

    const selectedId = selectedNode ? selectedNode.id : null;
    console.log('[ContentManagementPage] Render cycle:', { selection, selectedId });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-gray-400">Loading content tree...</div>
            </div>
        );
    }

    return (
        <ResizablePanelGroup
            direction="horizontal"
            className="h-full w-full"
            autoSaveId="content-management-layout"
        >
            <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                <div className="h-full overflow-y-auto">
                    {error && (
                        <div className="p-2 bg-red-900/50 border border-red-700 text-red-400 text-sm">
                            {error}
                        </div>
                    )}
                    <ContentTree
                        data={contentTree}
                        selectedId={selectedId}
                        onSelectNode={handleSelectNode}
                    />
                </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={75}>
                <div className="h-full overflow-y-auto">
                    <EditorPanel selectedNode={selectedNode} />
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
};

export default ContentManagementPage;