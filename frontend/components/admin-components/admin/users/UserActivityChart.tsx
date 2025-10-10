import * as React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
  AreaChart,
  Area,
} from 'recharts';
import type { ComparisonActivityData } from './mock-chart-data';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale/ru';
import { Check } from 'lucide-react';

type Metric = {
  key: keyof Omit<ComparisonActivityData, 'date' | 'shortDate'>;
  label: string;
  color: string;
};

interface UserActivityChartProps {
  data: ComparisonActivityData[];
  availableMetrics: Metric[];
}

const CustomTooltip: React.FC<any> = ({ active, payload, availableMetrics }) => {
  if (active && payload && payload.length) {
    const dateStr = payload[0].payload.date;
    const fullDate = new Date(dateStr + 'T00:00:00'); 
    const formattedDate = format(fullDate, 'EEEE, d MMMM yyyy', { locale: ru });
    const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    
    const getLabel = (dataKey: string) => availableMetrics.find((m: Metric) => m.key === dataKey)?.label || dataKey;

    return (
      <div className="p-3 bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg text-sm">
        <p className="font-bold text-gray-100">{capitalizedDate}</p>
        <div className="mt-2 space-y-1">
          {payload.map((entry: any) => (
            <div key={entry.dataKey} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: entry.stroke }}
              />
              <span className="text-gray-300">{getLabel(entry.dataKey)}:</span>
              <span className="font-medium text-white">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const FilterButton: React.FC<{ metric: Metric; isActive: boolean; onToggle: (key: string) => void }> = ({ metric, isActive, onToggle }) => {
  const activeClasses = 'bg-opacity-20 text-white';
  const inactiveClasses = 'bg-opacity-0 text-gray-300 hover:bg-opacity-10';

  return (
    <button
      onClick={() => onToggle(metric.key)}
      className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActive ? activeClasses : inactiveClasses}`}
      style={{
        backgroundColor: isActive ? metric.color + '33' : 'transparent', // 20% opacity
        '--metric-color': metric.color,
      } as React.CSSProperties}
    >
      <div 
        className="flex items-center justify-center w-4 h-4 rounded-sm mr-2 border-2 transition-all duration-200"
        style={{ 
          borderColor: metric.color,
          backgroundColor: isActive ? metric.color : 'transparent',
        }}
      >
        {isActive && <Check className="w-3 h-3 text-white" />}
      </div>
      {metric.label}
    </button>
  );
};


const UserActivityChart: React.FC<UserActivityChartProps> = ({ data, availableMetrics }) => {
  const [visibleMetrics, setVisibleMetrics] = React.useState<string[]>(['lessonCompletions', 'quizAttempts']);
  const [dateRange, setDateRange] = React.useState({ start: '', end: '' });

  React.useEffect(() => {
    if (data && data.length > 0) {
      setDateRange({
        start: data[0].shortDate,
        end: data[data.length - 1].shortDate,
      });
    }
  }, [data]);
  
  const handleMetricToggle = (metricKey: string) => {
    setVisibleMetrics(prev => 
        prev.includes(metricKey) 
            ? prev.filter(key => key !== metricKey) 
            : [...prev, metricKey]
    );
  };

  const handleBrushChange = (range: any) => {
    if (data && typeof range.startIndex === 'number' && typeof range.endIndex === 'number' && data[range.startIndex] && data[range.endIndex]) {
        setDateRange({
            start: data[range.startIndex].shortDate,
            end: data[range.endIndex].shortDate
        });
    }
  };
  
  const firstVisibleMetric = availableMetrics.find(m => m.key === visibleMetrics[0]);

  return (
    <div className="w-full bg-gray-800 p-6 rounded-lg border border-gray-700">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">ДЕТАЛИЗИРОВАННАЯ АКТИВНОСТЬ</h3>
          <p className="text-xl font-bold text-white">{`${dateRange.start} - ${dateRange.end}`}</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" vertical={false} />
          <XAxis
            dataKey="shortDate"
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip availableMetrics={availableMetrics} />} cursor={{ stroke: '#6b7280', strokeWidth: 1, strokeDasharray: '3 3' }} />

          {availableMetrics.map((metric) => 
            visibleMetrics.includes(metric.key) && (
                <Line
                    key={metric.key}
                    type="monotone"
                    dataKey={metric.key}
                    stroke={metric.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 2, fill: metric.color }}
                />
            )
          )}
          
           <Brush 
            dataKey="shortDate" 
            height={40} 
            stroke={firstVisibleMetric?.color || '#3b82f6'}
            y={260}
            onChange={handleBrushChange}
            tickFormatter={() => ''}
            travellerWidth={10}
          >
             <AreaChart data={data}>
                {firstVisibleMetric && (
                    <defs>
                      <linearGradient id="brushGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={firstVisibleMetric.color} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={firstVisibleMetric.color} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                )}
                {firstVisibleMetric && (
                    <Area dataKey={firstVisibleMetric.key} type="monotone" stroke={firstVisibleMetric.color} fill="url(#brushGradient)" />
                )}
             </AreaChart>
          </Brush>

        </LineChart>
      </ResponsiveContainer>
       <div className="flex flex-wrap items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-700/50">
          {availableMetrics.map(metric => (
              <FilterButton 
                  key={metric.key}
                  metric={metric}
                  isActive={visibleMetrics.includes(metric.key)}
                  onToggle={handleMetricToggle}
              />
          ))}
      </div>
    </div>
  );
};

export default UserActivityChart;