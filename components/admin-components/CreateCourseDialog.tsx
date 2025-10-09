
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';

// --- Zod Schema for Form Validation ---
const courseFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug must be URL-friendly (e.g., 'my-new-course').",
  }),
});

type CourseFormData = z.infer<typeof courseFormSchema>;

// --- Helper Function ---
const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
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
const CreateCourseDialog: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { register, handleSubmit, formState: { errors, dirtyFields, isSubmitting }, watch, setValue, reset } = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: { title: "", slug: "" },
  });

  const titleValue = watch('title');

  React.useEffect(() => {
    if (!dirtyFields.slug && titleValue) {
      const newSlug = slugify(titleValue);
      // console.log(`[CreateCourseDialog] Auto-generating slug: "${newSlug}"`);
      setValue('slug', newSlug, { shouldValidate: true });
    }
  }, [titleValue, dirtyFields.slug, setValue]);

  const handleOpenChange = (open: boolean) => {
    console.log(`[CreateCourseDialog] Setting isOpen to: ${open}`);
    if (!open) {
      console.log('[CreateCourseDialog] Resetting form.');
      reset(); // Reset form when dialog is closed
    }
    setIsOpen(open);
  };

  const onSubmit = (data: CourseFormData) => {
    console.log('[CreateCourseDialog] Form submitted. Simulating request...');
    return new Promise(resolve => {
        setTimeout(() => {
            console.log("[CreateCourseDialog] SUCCESS: New Course Data:", data);
            handleOpenChange(false);
            resolve(true);
        }, 1000); // Simulate network request
    });
  };

  return (
    <>
      <div onClick={() => handleOpenChange(true)}>{children}</div>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/60" onClick={() => handleOpenChange(false)}></div>
          
          {/* Dialog Content */}
          <div className="relative z-10 w-full max-w-lg p-6 mx-4 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl">
            <form role="form" onSubmit={handleSubmit(onSubmit)}>
              {/* Header */}
              <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-6">
                <h2 className="text-lg font-semibold leading-none tracking-tight text-white">Create New Course</h2>
                <p className="text-sm text-gray-400">Enter the details for your new course. A unique slug will be generated automatically.</p>
              </div>

              {/* Form Fields */}
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">Title</Label>
                  <div className="col-span-3">
                    <Input type="text" id="title" placeholder="e.g., Advanced Python Programming" {...register('title')} />
                    {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="slug" className="text-right">Slug</Label>
                  <div className="col-span-3">
                    <Input type="text" id="slug" placeholder="e.g., advanced-python-programming" {...register('slug')} />
                    {errors.slug && <p className="text-red-400 text-sm mt-1">{errors.slug.message}</p>}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="secondary" onClick={() => handleOpenChange(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Course'}
                </Button>
              </div>

              {/* Close Button */}
              <button type="button" onClick={() => handleOpenChange(false)} className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateCourseDialog;