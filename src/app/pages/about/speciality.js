import React from 'react';
import { Mic, FileText, Brain, MessageSquare } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description }) => {
    return (
        <div
            className="
        p-4 md:p-8
        border border-teal-300
        rounded-2xl
        bg-white
        shadow-md
        h-50
        flex flex-col
        transition duration-300 ease-in-out
        hover:shadow-lg hover:border-teal-300
        w-full
      "
        >
            <div
                className="
          w-12 h-12 p-2 mb-4
          bg-teal-200
          text-teal-800
          rounded-xl
          flex items-center justify-center
        "
            >
                <Icon className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>

            <p className="text-base text-gray-600 leading-relaxed">{description}</p>
        </div>
    );
};

const MeetingFeatures = () => {
    const features = [
        {
            id: 1,
            icon: Mic,
            title: 'Smart Transcription',
            description:
                'Convert meeting recordings into clean, structured transcripts using AI.',
        },
        {
            id: 2,
            icon: FileText,
            title: 'AI Summaries & Insights',
            description:
                'Generate summaries, action items, decisions, and key insights instantly.',
        },
        {
            id: 3,
            icon: Brain,
            title: 'Contextual Q&A',
            description:
                'Ask any meeting-related question and get accurate answers from your transcript.',
        },
        {
            id: 4,
            icon: MessageSquare,
            title: 'Conversation Intelligence',
            description:
                'Extract topics, sentiment, and deep insights from discussions.',
        },
    ];

    return (
        <section className="py-8 md:py-16  bg-white">
            <div className="max-w-7xl w-[95%] mx-auto px-4 sm:px-6 lg:px-8">

                {/* ----------- SECTION TITLE ----------- */}
                <div className="text-center mb-14">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                        What Makes Us Different
                    </h2>
                    <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
                        Cutting-edge AI technology combined with deep meeting intelligence expertise
                    </p>
                </div>

                {/* ----------- FEATURES GRID (2 PER ROW) ----------- */}
                <div className="grid grid-cols-1 md:grid-cols-2  gap-8">
                    {features.map((feature) => (
                        <FeatureCard
                            key={feature.id}
                            icon={feature.icon}
                            title={feature.title}
                            description={feature.description}
                        />
                    ))}
                </div>

            </div>
        </section>
    );
};

export default MeetingFeatures;
