import { format, subDays } from 'date-fns';
import { ru } from 'date-fns/locale/ru';

export interface ComparisonActivityData {
  date: string; // "YYYY-MM-DD"
  shortDate: string; // "d MMM"
  lessonCompletions: number;
  quizAttempts: number;
  codeExecutions: number;
  logins: number;
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const generateRandomComparisonData = (days = 365): ComparisonActivityData[] => {
  const data: ComparisonActivityData[] = [];
  const today = new Date('2025-10-08'); 
  for (let i = 0; i < days; i++) {
    const date = subDays(today, i);
    
    // Simulate some weekly variance
    const dayOfWeek = date.getDay(); // Sunday = 0, Saturday = 6
    const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 1.2;

    const formatted = format(date, 'd MMM', { locale: ru });
    const parts = formatted.split(' ');
    // Handle cases like "мая" -> "Май"
    const month = parts[1].replace('.', '');
    const shortDate = `${parts[0]} ${capitalize(month)}`;


    data.push({
      date: format(date, 'yyyy-MM-dd'),
      shortDate: shortDate,
      lessonCompletions: Math.floor((Math.random() * 15 + (Math.sin(i/30) * 5 + 5)) * weekendMultiplier),
      quizAttempts: Math.floor((Math.random() * 8 + (Math.cos(i/20) * 3 + 3)) * weekendMultiplier),
      codeExecutions: Math.floor((Math.random() * 40 + 10) * weekendMultiplier * 1.5),
      logins: Math.random() > 0.3 ? Math.floor(Math.random() * 3) + 1 : 0, // More sparse
    });
  }
  return data.reverse();
};

export const mockComparisonData = generateRandomComparisonData();
