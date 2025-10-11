import React, { useState, useEffect, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import Editor from 'react-simple-code-editor';
import Button from '../components/Button';
import { getLessonBySlug, getRawLessonBySlug, updateRawLessonBySlug } from '../services/lessons.service';
import { completeLesson, getCourseDetails } from '../services/courses.service';
import { Lesson, TextCell } from '../types/lessons';
import LessonPageSkeleton from '../components/LessonPageSkeleton';
import Card from '../components/Card';
import CellRenderer from '../components/CellRenderer';
import { useAuth } from '@/src/contexts/AuthContext';
import { useAnalytics } from '@/src/hooks/useAnalytics';

// To avoid TypeScript errors since Pyodide is loaded from CDN script tags
// FIX: Updated the type declaration for `loadPyodide` to accept an optional configuration object, which is required for specifying the `indexURL`. This resolves the error on line 36.
declare const loadPyodide: (config?: { indexURL: string }) => Promise<any>;
declare const Prism: any;


const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
);

const LessonPage = () => {
  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoadingLesson, setIsLoadingLesson] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [navigation, setNavigation] = useState<{ previous: string | null; next: string | null }>({ previous: null, next: null });

  // --- Edit Mode State ---
  const [isEditMode, setIsEditMode] = useState(false);
  const [lessonText, setLessonText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isStartingEdit, setIsStartingEdit] = useState(false);

  // --- Pyodide State Management ---
  const pyodideRef = useRef<any>(null);
  const [pyodideState, setPyodideState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  const resolveCourseSlug = (lessonData: Lesson): string | null => {
    if (lessonData.courseSlug) {
      return lessonData.courseSlug;
    }

    const breadcrumbWithSlug = lessonData.breadcrumbs.find((crumb) => crumb.href.includes('slug='));
    if (!breadcrumbWithSlug) {
      return null;
    }

    const queryStart = breadcrumbWithSlug.href.indexOf('?');
    if (queryStart === -1) {
      return null;
    }

    const params = new URLSearchParams(breadcrumbWithSlug.href.substring(queryStart));
    return params.get('slug');
  };

  const buildNavigation = async (lessonData: Lesson) => {
    const courseSlug = resolveCourseSlug(lessonData);
    if (!courseSlug) {
      setNavigation({ previous: null, next: null });
      return;
    }

    try {
      const courseDetails = await getCourseDetails(courseSlug);
      const orderedLessons = [...courseDetails.modules]
        .sort((a, b) => a.order - b.order)
        .flatMap((module) =>
          [...module.lessons].sort((a, b) => {
            const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
            const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
            if (orderA !== orderB) {
              return orderA - orderB;
            }
            const titleA = a.title ?? '';
            const titleB = b.title ?? '';
            return titleA.localeCompare(titleB);
          })
        );

      const currentIndex = orderedLessons.findIndex((item) => item.slug === lessonData.slug);
      setNavigation({
        previous: currentIndex > 0 ? orderedLessons[currentIndex - 1].slug : null,
        next:
          currentIndex !== -1 && currentIndex < orderedLessons.length - 1
            ? orderedLessons[currentIndex + 1].slug
            : null,
      });
    } catch (navError) {
      console.error('Failed to derive lesson navigation', navError);
      setNavigation({ previous: null, next: null });
    }
  };

  // Effect to initialize Pyodide once per lesson page load
  useEffect(() => {
    const initializePyodide = async () => {
        setPyodideState('loading');
        try {
            const pyodide = await loadPyodide({
                indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/',
            });
            await pyodide.loadPackage(['numpy', 'pandas', 'scikit-learn']);
            pyodideRef.current = pyodide;
            setPyodideState('ready');
        } catch (e) {
            console.error("Pyodide initialization failed:", e);
            setPyodideState('error');
        }
    };
    initializePyodide();
  }, []);

  const executePythonCode = async (code: string): Promise<string[]> => {
    const pyodide = pyodideRef.current;
    if (!pyodide || pyodideState !== 'ready') {
      return ['Error: Python environment is not ready.'];
    }

    const output: string[] = [];
    pyodide.setStdout({ batched: (msg: string) => output.push(msg) });
    pyodide.setStderr({ batched: (msg: string) => output.push(msg) });

    try {
      await pyodide.runPythonAsync(code);
    } catch (e) {
      const err = e as Error;
      output.push(err.message);
    } finally {
      // Reset stdout/stderr to default (console log)
      pyodide.setStdout({});
      pyodide.setStderr({});
    }
    
    return output;
  };

  const fetchLesson = async () => {
    try {
      const hash = window.location.hash;
      const slug = new URLSearchParams(hash.substring(hash.indexOf('?'))).get('slug') || 'decision-trees';

      if (!slug) {
        throw new Error("Lesson slug not found in URL.");
      }
      
      setIsLoadingLesson(true);
      setError(null);
      setNavigation({ previous: null, next: null });

      const lessonData = await getLessonBySlug(slug);

      setLesson(lessonData);

      if (lessonData.cells.length > 0) {
        setActiveSection(lessonData.cells[0].id);
      }

      await buildNavigation(lessonData);
    } catch (err) {
      setError((err as Error).message);
      console.error(err);
    } finally {
      setIsLoadingLesson(false);
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      window.scrollTo(0, 0);
      setIsEditMode(false); // Exit edit mode on navigation
      fetchLesson();
    };

    fetchLesson();
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const tableOfContents = useMemo(() => {
    if (!lesson) return [];
    return lesson.cells
      .filter((cell): cell is TextCell => cell.type === 'text' && !!cell.title)
      .map(cell => ({ id: cell.id, title: cell.title! }));
  }, [lesson]);

  useEffect(() => {
    if (!lesson || isEditMode) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const offset = 150;

      const currentSection = tableOfContents
        .map(section => {
          const el = document.getElementById(section.id);
          return { id: section.id, top: el ? el.offsetTop : 0 };
        })
        .filter(section => section.top <= scrollPosition + offset)
        .pop();

      if (currentSection) {
        setActiveSection(currentSection.id);
      } else if (tableOfContents.length > 0) {
        setActiveSection(tableOfContents[0].id);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [tableOfContents, lesson, isEditMode]);

  const handleTocClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    document.getElementById(sectionId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
    history.pushState(null, '', `#${sectionId}`);
    setActiveSection(sectionId);
  };

  const handleCompleteLesson = async () => {
    if (!lesson) return;

    setIsCompleting(true);
    try {
      const lessonIdentifier = lesson.lessonId ?? lesson.id;
      if (!lessonIdentifier) {
        throw new Error('Cannot determine lesson identifier for completion.');
      }

      const updatedProgress = await completeLesson(lessonIdentifier);

      const courseSlug = resolveCourseSlug(lesson);
      if (!courseSlug) {
        throw new Error('Course context not found.');
      }

      trackEvent('LESSON_COMPLETED', { lesson_slug: lesson.slug, course_slug: courseSlug });

      if (typeof updatedProgress === 'number') {
        toast.success(`Course progress: ${Math.round(updatedProgress)}%`);
      } else {
        toast.success('Lesson marked as complete.');
      }

      if (navigation.next) {
        window.location.hash = `#/lesson?slug=${navigation.next}`;
      } else {
        window.location.hash = `#/dashboard/course?slug=${courseSlug}&completed=true`;
      }
    } catch (err) {
      console.error('Failed to complete lesson:', err);
      toast.error('Could not complete lesson. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleEdit = async () => {
    if (!lesson) return;
    setIsStartingEdit(true);
    try {
        const rawText = await getRawLessonBySlug(lesson.slug);
        setLessonText(rawText);
        setIsEditMode(true);
    } catch (error) {
        toast.error('Failed to load lesson content for editing.');
        console.error(error);
    } finally {
        setIsStartingEdit(false);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setLessonText('');
  };

  const handleSave = async () => {
    if (!lesson) return;
    setIsSaving(true);
    try {
        await updateRawLessonBySlug(lesson.slug, lessonText);
        toast.success('Lesson saved successfully!');
        setIsEditMode(false);
        await fetchLesson(); // Reload the lesson to see changes
    } catch (error) {
        toast.error('Syntax error in file. Check the format.');
        console.error(error);
    } finally {
        setIsSaving(false);
    }
  };


  const pageIsLoading = isLoadingLesson || pyodideState === 'loading' || pyodideState === 'idle';

  if (pageIsLoading) {
    return <LessonPageSkeleton />;
  }

  if (error || pyodideState === 'error') {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <Card>
                <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">An Error Occurred</h1>
                <p className="mt-4 text-gray-600 dark:text-gray-400">{error || "Failed to load the Python environment. Please try refreshing the page."}</p>
                <Button variant="primary" className="mt-6" onClick={fetchLesson}>
                    Try Again
                </Button>
            </Card>
        </div>
    );
  }

  if (!lesson) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="lg:grid lg:grid-cols-12 lg:gap-12">
        
        <aside className="hidden lg:block lg:col-span-3">
          <div className="lg:sticky lg:top-24">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Lesson Content</h3>
            <nav className="mt-4">
              <ul className="space-y-1">
                {tableOfContents.map(section => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      onClick={(e) => handleTocClick(e, section.id)}
                      className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 relative ${
                        activeSection === section.id
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-gray-800 dark:text-indigo-400'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-white'
                      }`}
                    >
                       <span
                        className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-lg ${
                            activeSection === section.id ? 'bg-indigo-500' : 'bg-transparent'
                        }`}
                      ></span>
                      <span className="ml-2">{section.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        <main className="lg:col-span-9">
          <div className="flex justify-between items-start">
            <div>
                <nav className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex-wrap">
                {lesson.breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.href}>
                        <a href={crumb.href} onClick={(e) => { e.preventDefault(); window.location.hash = crumb.href; }} className="hover:text-gray-700 dark:hover:text-gray-200">{crumb.title}</a>
                        <ChevronRightIcon />
                    </React.Fragment>
                ))}
                <span className="text-gray-700 dark:text-gray-200">{lesson.title}</span>
                </nav>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                {lesson.title}
                </h1>
            </div>
            {user?.role === 'admin' && !isEditMode && (
                <Button variant="secondary" onClick={handleEdit} loading={isStartingEdit} className="flex-shrink-0 ml-4 mt-1">
                    Edit Lesson
                </Button>
            )}
          </div>
          
          {isEditMode ? (
            <div className="mt-8">
                <div className="relative text-sm font-mono border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-lg">
                    <Editor
                        value={lessonText}
                        onValueChange={text => setLessonText(text)}
                        highlight={code => Prism.highlight(code, Prism.languages.yaml, 'yaml')}
                        padding={16}
                        className="bg-[#2d2d2d] text-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-inset min-h-[70vh]"
                        style={{
                            fontFamily: '"Fira code", "Fira Mono", monospace',
                            fontSize: 14,
                            outline: 0,
                        }}
                    />
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <Button variant="secondary" onClick={handleCancel} disabled={isSaving}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave} loading={isSaving}>Save Changes</Button>
                </div>
            </div>
          ) : (
            <>
                <article className="mt-8 prose prose-lg dark:prose-invert max-w-none prose-h2:font-bold prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-10 prose-p:leading-relaxed prose-li:my-2 prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:font-semibold hover:prose-a:text-indigo-500 prose-code:bg-gray-100 prose-code:dark:bg-gray-800 prose-code:p-1 prose-code:rounded prose-code:font-mono prose-code:text-sm">
                {lesson.cells.map(cell => (
                    <CellRenderer 
                    cell={cell} 
                    key={cell.id} 
                    pyodideState={pyodideState} 
                    onExecute={executePythonCode} 
                    />
                ))}
                </article>
                
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <Button 
                    variant="secondary"
                    onClick={() => { if(navigation.previous) window.location.hash = `#/lesson?slug=${navigation.previous}` }}
                    disabled={!navigation.previous}
                >
                    <span aria-hidden="true" className="mr-2">←</span> Previous Lesson
                </Button>
                <Button 
                    variant="primary" 
                    onClick={handleCompleteLesson} 
                    loading={isCompleting}
                >
                    {navigation.next ? 'Finish and Continue' : 'Finish Course'}
                    <span aria-hidden="true" className="ml-2">→</span>
                </Button>
                </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

// FIX: Removed duplicate 'export' keyword to fix syntax error.
export default LessonPage;
