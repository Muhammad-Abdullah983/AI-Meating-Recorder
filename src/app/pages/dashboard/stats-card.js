import React from 'react';
// Import the icons used in the dashboard cards
import { FileText, Calendar, TrendingUp, Clock } from 'lucide-react';


const MetricCard = ({ icon: Icon, title, value, change }) => {
  // Determine if the change is positive (green) or negative (red)
  const isPositive = change >= 0;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-500';

  return (
    <div className="
      p-6
      border border-gray-200
      rounded-xl
      bg-white
      shadow-sm
      flex flex-col
      transition duration-200 ease-in-out
      hover:shadow-md
    ">
      <div className="flex justify-between items-start mb-4">
        {/* Title and Value Group */}
        <div className="flex flex-col">
          {/* Title */}
          <p className="text-sm font-medium text-gray-500 mb-1">
            {title}
          </p>

          {/* Value (e.g., 48, 8, 127, 54m) */}
          <p className="text-3xl font-bold text-gray-800">
            {value}
          </p>
        </div>

        {/* Icon Badge */}
        <div className="
          w-10 h-10 p-2
          bg-indigo-50
          text-indigo-600
          rounded-lg
          flex items-center justify-center
        ">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {/* Change Percentage */}
      <p className={`text-sm font-semibold ${changeColor}`}>
        {/* Format the change with a '+' sign if positive */}
        {isPositive ? `+${change}%` : `${change}%`}
      </p>
    </div>
  );
};

// --- Container Component ---
const DashboardMetrics = () => {
  // Data for the 4 dashboard metrics
  const metrics = [
    {
      id: 1,
      icon: FileText,
      title: 'Total Meetings',
      value: '48',
      change: 12, // +12%
    },
    {
      id: 2,
      icon: Calendar,
      title: 'This Week',
      value: '8',
      change: -25, // -25%
    },
    {
      id: 3,
      icon: TrendingUp,
      title: 'Action Items',
      value: '127',
      change: -8, // -8%
    },
    {
      id: 4,
      icon: Clock,
      title: 'Avg Duration',
      value: '54m',
      change: -5, // -5%
    },
  ];

  return (
    <div className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Dashboard Overview
        </h1>
        <div className="
          grid grid-cols-2
          gap-4
          md:grid-cols-4
          md:gap-6
          lg:gap-8
        ">
          {metrics.map((metric) => (
            <MetricCard
              key={metric.id}
              icon={metric.icon}
              title={metric.title}
              value={metric.value}
              change={metric.change}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardMetrics;