import React from 'react';

const TechnologyBox = ({ title, description, points }) => {
  return (
    <div
      className="
        p-6 md:p-8
        bg-teal-50
        rounded-xl
        shadow-lg
        flex flex-col
      "
    >
      <h3 className="text-xl font-bold text-gray-900 mb-3 border-b border-teal-200 pb-2">
        {title}
      </h3>

      <p className="text-base text-gray-700 leading-relaxed mb-4 flex-grow">
        {description}
      </p>

      <ul className="list-disc pl-5 space-y-2 text-sm text-teal-700 font-medium">
        {points.map((point, index) => (
          <li key={index} className="text-teal-600">
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
};

const TechnologySection = () => {
  const technologyData = [
    {
      title: 'AI Transcription',
      description:
        'Advanced AI models process audio/video recordings and generate highly accurate transcripts.',
      points: [
        'Speaker Identification',
        'Timestamping',
        'Noise Reduction & Audio Cleaning',
      ],
    },
    {
      title: 'Insight Generation',
      description:
        'Automatically extract meeting summaries, action items, key decisions, and insights.',
      points: [
        'Summarization Engine',
        'Action Item Detection',
        'Decision Tracking',
      ],
    },
    {
      title: 'Contextual Q&A',
      description:
        'Answer any question about your meetings by analyzing transcripts intelligently.',
      points: [
        'Transcript-based Responses',
        'Topic Filtering',
        'Follow-up Suggestions',
      ],
    },
  ];

  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl w-[95%] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-3">
            Our Technology
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Built on the latest advances in AI, NLP, and meeting intelligence
          </p>
        </div>

        {/* Grid: 1 column mobile, 2 columns tablet, 3 columns desktop */}
        <div className="
          grid grid-cols-1
          gap-8
          sm:grid-cols-2
          md:grid-cols-3
        ">
          {technologyData.map((tech, index) => (
            <TechnologyBox
              key={index}
              title={tech.title}
              description={tech.description}
              points={tech.points}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default TechnologySection;
