
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import type { ContentNode } from '../types';

// --- Zod Schema ---
const partFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug must be URL-friendly (e.g., 'my-new-part').",
  }),
});

type PartFormData = z.infer<typeof partFormSchema>;

// --- Helper Function ---
const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// --- Mock Shadcn/ui Components ---
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }> = ({ children, className, variant = 'primary', ...props }) => {
    const baseClasses = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";
    const variantClasses = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
        secondary: "bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-500",
        ghost: "hover:bg-gray-700 hover:text-gray-100",
    };
    return <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>{children}</button>;
};

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => {
    return <input className={`flex h-10 w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 ${className}`} ref={ref} {...props} />;
});

const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ children, className, ...props }) => {
    return <label className={`text-sm font-medium leading-none text-gray-200 ${className}`} {...props}>{children}</label>;
};

// --- Main Dialog Component ---
interface CreatePartDialogProps {
  course: ContentNode;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const CreatePartDialog: React.FC<CreatePartDialogProps> = ({ course, isOpen, onOpenChange }) => {
  const { register, handleSubmit, formState: { errors, dirtyFields, isSubmitting }, watch, setValue, reset } = useForm<PartFormData>({
    resolver: zodResolver(partFormSchema),
    defaultValues: { title: "", slug: "" },
  });

  const titleValue = watch('title');

  React.useEffect(() => {
    if (isOpen) {
      console.log(`[CreatePartDialog] Opened for course "${course.name}". Resetting form.`);
      reset({ title: "", slug: "" });
    }
  }, [isOpen, reset, course.name]);

  React.useEffect(() => {
    if (!dirtyFields.slug && titleValue) {
      setValue('slug', slugify(titleValue), { shouldValidate: true });
    }
  }, [titleValue, dirtyFields.slug, setValue]);

  const onSubmit = (data: PartFormData) => {
    console.log('[CreatePartDialog] Form submitted. Simulating request...');
    return new Promise(resolve => {
        setTimeout(() => {
            const submissionData = { ...data, courseId: course.id };
            console.log("[CreatePartDialog] SUCCESS: New Part Data:", submissionData);
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
            <h2 className="text-lg font-semibold leading-none tracking-tight text-white">Create New Part in '{course.name}'</h2>
            <p className="text-sm text-gray-400">Enter a title for the new part (e.g., a module or section).</p>
          </div>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <div className="col-span-3">
                <Input id="title" placeholder="e.g., Supervised Learning Basics" {...register('title')} />
                {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="slug" className="text-right">Slug</Label>
              <div className="col-span-3">
                <Input id="slug" placeholder="e.g., supervised-learning-basics" {...register('slug')} />
                {errors.slug && <p className="text-red-400 text-sm mt-1">{errors.slug.message}</p>}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Part'}
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

export default CreatePartDialog;