import * as React from 'react';
// FIX: The member `subYears` was not found in the module 'date-fns'. Replaced with `addYears` as it provides equivalent functionality when used with a negative value.
import { format, addYears, addDays, getDay, getISOWeek, differenceInDays } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../ui/tooltip';

export type Contribution = {
  date: string; // YYYY-MM-DD
  count: number;
};

interface ContributionGraphProps {
  data: Contribution[];
}

const WEEKS_IN_YEAR = 53;
const DAYS_IN_WEEK = 7;
const MONTH_LABELS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

const getColor = (count: number) => {
  if (count === 0) return 'bg-gray-800';
  if (count <= 2) return 'bg-indigo-900';
  if (count <= 5) return 'bg-indigo-700';
  return 'bg-indigo-500';
};

const ContributionGraph: React.FC<ContributionGraphProps> = ({ data }) => {
  const today = new Date();
  const yearAgo = addYears(today, -1);
  const days: Date[] = [];
  
  // Create an array of all days in the last year
  let currentDate = yearAgo;
  while(currentDate <= today) {
    days.push(currentDate);
    currentDate = addDays(currentDate, 1);
  }

  const contributionData = React.useMemo(() => {
    return new Map(data.map(item => [item.date, item.count]));
  }, [data]);
  
  const firstDay = days[0];
  const dayOfWeekOffset = getDay(firstDay) === 0 ? 6 : getDay(firstDay) - 1; // Monday is 0

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-flow-col grid-rows-8 gap-1 self-start">
        {/* Day labels */}
        <div className="text-xs text-gray-400" style={{ gridRow: '2' }}>Пн</div>
        <div className="text-xs text-gray-400" style={{ gridRow: '4' }}>Ср</div>
        <div className="text-xs text-gray-400" style={{ gridRow: '6' }}>Пт</div>

        {/* Month labels */}
        {MONTH_LABELS.map((month, index) => {
           const firstDayOfMonth = new Date(today.getFullYear(), index, 1);
           if (firstDayOfMonth < yearAgo && today.getMonth() < index) return null; // Only show relevant months

           const weekIndex = Math.floor(differenceInDays(firstDayOfMonth, firstDay) / 7) + 1;
           return (
             <div key={month} className="text-xs text-gray-400 -mt-5" style={{ gridColumn: weekIndex + 1 }}>
               {month}
             </div>
           )
        })}

        {/* Placeholder cells for alignment */}
        {Array.from({ length: dayOfWeekOffset }).map((_, index) => (
          <div key={`empty-${index}`} className="w-4 h-4" style={{ gridRow: index + 2, gridColumn: 1 }} />
        ))}

        {/* Contribution cells */}
        {days.map(date => {
          const dateString = format(date, 'yyyy-MM-dd');
          const count = contributionData.get(dateString) || 0;
          const dayOfWeek = getDay(date) === 0 ? 7 : getDay(date);
          const weekIndex = Math.floor(differenceInDays(date, firstDay) / 7) + 1;
          
          const tooltipText = count > 0 
            ? `${count} ${count === 1 ? 'активность' : count < 5 ? 'активности' : 'активностей'} - ${format(date, 'd MMMM yyyy')}`
            : `Нет активностей - ${format(date, 'd MMMM yyyy')}`;

          return (
            <Tooltip key={dateString}>
              <TooltipTrigger>
                <div
                  className={`w-4 h-4 rounded-sm ${getColor(count)}`}
                  style={{ gridRow: dayOfWeek + 1, gridColumn: weekIndex + 1 }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltipText}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-gray-400 self-end">
        <span>Меньше</span>
        <div className="w-3 h-3 rounded-sm bg-gray-800" />
        <div className="w-3 h-3 rounded-sm bg-indigo-900" />
        <div className="w-3 h-3 rounded-sm bg-indigo-700" />
        <div className="w-3 h-3 rounded-sm bg-indigo-500" />
        <span>Больше</span>
      </div>
    </div>
  );
};

export default ContributionGraph;