import * as React from 'react';
import { Eye, Settings, Edit, X, Check } from 'lucide-react';
import Button from '../../ui/button';

interface LessonEditorHeaderProps {
  lessonName: string;
  mode: 'read' | 'edit';
  onModeChange: (mode: 'read' | 'edit') => void;
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
}

const LessonEditorHeader: React.FC<LessonEditorHeaderProps> = ({
  lessonName,
  mode,
  onModeChange,
  onCancel,
  onSave,
  isSaving,
}) => {
  if (mode === 'edit') {
    return (
      <div className="flex justify-between items-center w-full">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Editing: <span className="text-blue-400">{lessonName}</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={isSaving}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? (
              'Saving...'
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center w-full">
      <div>
        <p className="text-sm text-gray-400">
          <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-gray-100">Content</a>
          <span className="mx-2">/</span>
          <span className="text-gray-100 font-medium">{lessonName}</span>
        </p>
        <h1 className="text-3xl font-bold tracking-tight">{lessonName}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary">
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
        <Button variant="secondary">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
        <Button onClick={() => onModeChange('edit')}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>
    </div>
  );
};

export default LessonEditorHeader;
