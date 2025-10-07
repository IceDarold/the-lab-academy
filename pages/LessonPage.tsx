import React, { useState, useEffect, useMemo } from 'react';
import Button from '../components/Button';
import { getLessonBySlug } from '../services/lessons.service';
import { completeLesson, getLessonNavigation } from '../services/courses.service';
import { Lesson, TextCell } from '../types/lessons';
import LessonPageSkeleton from '../components/LessonPageSkeleton';
import Card from '../components/Card';
import CellRenderer from '../components/CellRenderer';

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
);

const LessonPage = () => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [navigation, setNavigation] = useState<{ previous: string | null; next: string | null }>({ previous: null, next: null });

  const fetchLesson = async () => {
    try {
      const hash = window.location.hash;
      const slug = new URLSearchParams(hash.substring(hash.indexOf('?'))).get('slug') || 'decision-trees';

      if (!slug) {
        throw new Error("Lesson slug not found in URL.");
      }
      
      setIsLoading(true);
      setError(null);
      setNavigation({ previous: null, next: null });

      const [lessonData, navData] = await Promise.all([
        getLessonBySlug(slug),
        getLessonNavigation(slug)
      ]);
      
      setLesson(lessonData);
      setNavigation({ previous: navData.previousLessonSlug, next: navData.nextLessonSlug });

      if (lessonData.cells.length > 0) {
        setActiveSection(lessonData.cells[0].id);
      }
    } catch (err) {
      setError((err as Error).message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      window.scrollTo(0, 0);
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
    if (!lesson) return;

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
  }, [tableOfContents, lesson]);

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
        const courseBreadcrumb = lesson.breadcrumbs[0];
        if (!courseBreadcrumb) throw new Error("Course context not found");
        
        const courseSlug = new URLSearchParams(courseBreadcrumb.href.substring(courseBreadcrumb.href.indexOf('?'))).get('slug');
        if (!courseSlug) throw new Error("Could not parse course slug.");

        await completeLesson(lesson.slug);
        
        if (navigation.next) {
            window.location.hash = `#/lesson?slug=${navigation.next}`;
        } else {
            window.location.hash = `#/dashboard/course?slug=${courseSlug}&completed=true`;
        }
    } catch (err) {
        console.error("Failed to complete lesson:", err);
        // In a real app, show a toast notification to the user
    } finally {
        setIsCompleting(false);
    }
  };


  if (isLoading) {
    return <LessonPageSkeleton />;
  }

  if (error) {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <Card>
                <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">An Error Occurred</h1>
                <p className="mt-4 text-gray-600 dark:text-gray-400">{error}</p>
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
          
          <article className="mt-8 prose prose-lg dark:prose-invert max-w-none prose-h2:font-bold prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-10 prose-p:leading-relaxed prose-li:my-2 prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:font-semibold hover:prose-a:text-indigo-500 prose-code:bg-gray-100 prose-code:dark:bg-gray-800 prose-code:p-1 prose-code:rounded prose-code:font-mono prose-code:text-sm">
             {lesson.cells.map(cell => (
                <CellRenderer cell={cell} key={cell.id} />
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
        </main>
      </div>
    </div>
  );
};

export default LessonPage;