import React from 'react';
import { Zap, CheckCircle, FileText } from 'lucide-react';

/**
 * Reusable component for a single feature card in this section.
 * It handles the distinct coloring of the icon background for each card.
 *
 * @param {object} props - Component props
 * @param {React.Component} props.icon - Lucide icon component.
 * @param {string} props.iconBg - Tailwind CSS class for the background color (e.g., 'bg-blue-100').
 * @param {string} props.iconText - Tailwind CSS class for the icon color (e.g., 'text-blue-600').
 * @param {string} props.title - The main feature title (e.g., 'Instant Analysis').
 * @param {string} props.description - The supporting text.
 */
const FeatureCard = ({ icon: Icon, iconBg, iconText, title, description }) => {
  return (
    <div className="
      p-8
      border border-gray-200
      rounded-2xl
      bg-white
      shadow-md
      text-center
      flex flex-col items-center
      transition duration-300 ease-in-out
      hover:shadow-lg
        hover:border-teal-600
              hover:border-2
        cursor-pointer
    ">
      {/* Icon Area */}
      <div className={`
        w-16 h-16 p-3 mb-6
        ${iconBg}
        ${iconText}
        rounded-full
        flex items-center justify-center
      `}>
        <Icon className="w-8 h-8" />
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
        {description}
      </p>
    </div>
  );
};

/**
 * Main component to render the 3-card feature section.
 */
const Cards = () => {
  // Define the data for the three cards, including custom colors for each icon
  const features = [
    {
      id: 1,
      icon: Zap,
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-500',
      title: 'Instant Analysis',
      description: 'Get results in seconds with our advanced AI technology.',
    },
    {
      id: 2,
      icon: CheckCircle,
      iconBg: 'bg-green-100',
      iconText: 'text-green-500',
      title: 'High Accuracy',
      description: '95%+ accuracy in detecting common data insights.',
    },
    {
      id: 3,
      icon: FileText,
      iconBg: 'bg-purple-100',
      iconText: 'text-purple-500',
      title: 'Detailed Reports',
      description: 'Detailed recommendations for process improvement and recovery.',
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="
          grid grid-cols-1
          gap-8
          md:grid-cols-3
        ">
          {features.map((feature) => (
            <FeatureCard
              key={feature.id}
              icon={feature.icon}
              iconBg={feature.iconBg}
              iconText={feature.iconText}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Cards;