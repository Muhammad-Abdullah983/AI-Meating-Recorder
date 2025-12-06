import React from 'react';

const metrics = [
  { value: '20K+', label: 'Meetings Transcribed', color: 'text-teal-500' },
  { value: '95%', label: 'Summary Accuracy', color: 'text-teal-500' },
  { value: '10M+', label: 'Minutes Processed', color: 'text-teal-500' },
  { value: '50K+', label: 'Active Users', color: 'text-teal-500' },
];

const MissionMetrics = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl w-[95%] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header: Mission */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Mission
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Helping teams capture smarter insights, reduce meeting fatigue, 
            and boost productivity through AI-powered meeting intelligence.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

          {/* Left Column: Mission Description */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Transforming Every Meeting Into Actionable Knowledge
            </h2>

            <p className="text-base text-gray-700 mb-4 leading-relaxed">
              Meetings often contain important decisions, action items, and 
              discussions — but most of this information gets lost or forgotten. 
              Teams spend hours taking notes, summarizing calls, and digging 
              through long recordings to find what matters.
            </p>

            <p className="text-base text-gray-700 leading-relaxed">
              MeetingAI automates the entire process by converting your recordings 
              into clean transcripts, summaries, insights, and action points using 
              advanced AI models. Whether you're running a startup sprint 
              planning, a teacher-parent session, or a corporate strategy call, 
              MeetingAI ensures nothing important is ever missed again.
            </p>
          </div>

          {/* Right Column: Metrics */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 items-center justify-center pt-8">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center">
                <p className={`text-4xl  font-bold ${metric.color} mb-1`}>
                  {metric.value}
                </p>
                <p className="text-base font-semibold text-gray-700">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default MissionMetrics;
