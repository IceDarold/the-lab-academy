import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import type { ContentNode } from '../../../types';
import Button from '../../ui/button';
import Input from '../../ui/input';
import Label from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

// --- Zod Schema ---
const settingsFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  slug: z.string().regex(/^[a-z0-9\d{2}\-]+(?:\.lesson)?$/, { message: "Invalid filename format." }),
  status: z.enum(['published', 'locked', 'draft']),
});

type SettingsFormData = z.infer<typeof settingsFormSchema>;

// --- Main Dialog Component ---
interface LessonSettingsDialogProps {
  lesson: ContentNode;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const LessonSettingsDialog: React.FC<LessonSettingsDialogProps> = ({ lesson, isOpen, onOpenChange }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, control, reset } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsFormSchema),
  });
  
  // Reset form with lesson data when it opens or changes
  React.useEffect(() => {
    if (lesson && isOpen) {
      reset({
        title: lesson.name.replace(/^\d{2}-/, '').replace(/\.lesson$/, ''),
        slug: lesson.name,
        status: lesson.status || 'published',
      });
    }
  }, [lesson, isOpen, reset]);

  const onSubmit = (data: SettingsFormData) => {
    console.log('[LessonSettingsDialog] Form submitted. Simulating request...');
    return new Promise(resolve => {
        setTimeout(() => {
            console.log("[LessonSettingsDialog] SUCCESS: Updated Lesson Data:", { ...data, id: lesson.id });
            onOpenChange(false);
            resolve(true);
        }, 1000);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60" onClick={() => onOpenChange(false)}></div>
      <div className="relative z-10 w-full max-w-lg p-6 mx-4 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-6">
            <h2 className="text-lg font-semibold leading-none tracking-tight text-white">Lesson Settings</h2>
            <p className="text-sm text-gray-400">Edit metadata for '{lesson.name}'.</p>
          </div>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <div className="col-span-3">
                <Input id="title" {...register('title')} />
                {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="slug" className="text-right">Filename/Slug</Label>
              <div className="col-span-3">
                <Input id="slug" {...register('slug')} />
                {errors.slug && <p className="text-red-400 text-sm mt-1">{errors.slug.message}</p>}
              </div>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <div className="col-span-3">
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="published">Published (Visible to all)</SelectItem>
                            <SelectItem value="locked">Locked (Announced, not accessible)</SelectItem>
                            <SelectItem value="draft">Draft (Hidden from students)</SelectItem>
                        </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && <p className="text-red-400 text-sm mt-1">{errors.status.message}</p>}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          <button type="button" onClick={() => onOpenChange(false)} className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default LessonSettingsDialog;