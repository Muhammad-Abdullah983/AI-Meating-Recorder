import React from 'react';
// Assuming these Lucide icons are available in your Next.js environment
import { UploadCloud, Code, Zap, CheckCircle, Users, Lock } from 'lucide-react';

/**
 * Reusable component for a single feature card.
 * It implements the styling from the image: rounded corners, light border,
 * and a prominent icon area.
 */
const FeatureBox = ({ icon: Icon, title, description }) => {
    return (
        <div className="
      p-6 md:p-8
      border border-gray-200
      rounded-xl
      bg-white
      shadow-sm
      hover:shadow-lg
      transform transition duration-300 ease-in-out
      flex flex-col
    ">
            {/* Icon Area */}
            <div className="mb-4">
                {/* The icon container is a light blue square with a subtle rounded shape */}
                <div className="
          w-12 h-12 p-3
          bg-indigo-50
          text-indigo-600
          rounded-xl
          flex items-center justify-center
        ">
                    {/* The Icon component is passed via props */}
                    <Icon className="w-6 h-6" />
                </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {title}
            </h3>

            {/* Description */}
            <p className="text-base text-gray-500 leading-relaxed">
                {description}
            </p>
        </div>
    );
};


const CallToAction = () => {
    return (
        <div className="
      mt-20 py-12 md:py-25 bg-teal-500  text-center ">
            <div className="max-w-4xl mx-auto px-4">
                {/* Headline */}
                <h2 className="
          text-3xl sm:text-4xl md:text-5xl
          font-extrabold text-white
          mb-4
        ">
                    Ready to Transform Your Meetings?
                </h2>

                {/* Subtext */}
                <p className="
          text-lg md:text-xl
          text-teal-200
          mb-10
        ">
                    Join thousands of teams already using MeetingAI to make their meetings more productive.
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">

                    {/* Primary Button */}
                    <a
                        href="#" // Replace with actual trial link
                        className="
              px-8 py-4
              text-lg font-semibold
              text-teal-600 bg-white
              rounded-lg
              shadow-lg
              hover:bg-gray-100
              transition duration-300 ease-in-out
              transform hover:scale-[1.02]
              w-full sm:w-auto
            "
                    >
                        Start Free Trial
                    </a>

                    {/* Secondary Button (Placeholder for 'Contact Sales' or similar) */}
                    <a
                        href="#" // Replace with actual contact link
                        className="
              px-8 py-4
              text-lg font-semibold
              text-white bg-teal-700
              border-2 border-white
              rounded-lg
              shadow-lg
              hover:bg-teal-700
              transition duration-300 ease-in-out
              transform hover:scale-[1.02]
              w-full sm:w-auto
            "
                    >
                        Contact Sales
                    </a>
                </div>
            </div>
        </div>
    );
};


const Aboutmeetings = () => {
  
    const features = [
        {
            id: 1,
            icon: UploadCloud, // Corresponds to the icon in the image
            title: 'Easy Upload',
            description: 'Drag and drop your meeting recordings. Supports audio and video formats.',
        },
        {
            id: 2,
            icon: Code, // A suitable icon for transcription/AI
            title: 'AI Transcription',
            description: 'Automatic transcription with speaker identification and timestamps.',
        },
        {
            id: 3,
            icon: Zap, // A suitable icon for smart insights
            title: 'Smart Insights',
            description: 'Get summaries, action items, and key decisions automatically extracted.',
        },
        {
            id: 4,
            icon: CheckCircle, // New feature: Action item tracking
            title: 'Action Item Tracking',
            description: 'Automatically identify, assign, and track tasks and deadlines within your notes.',
        },
        {
            id: 5,
            icon: Users, // New feature: Collaboration
            title: 'Collaborative Editing',
            description: 'Share, comment, and edit transcripts and summaries with your entire team in real-time.',
        },
        {
            id: 6,
            icon: Lock, // New feature: Security
            title: 'Security & Compliance',
            description: 'Enterprise-grade security and robust compliance features ensure your data is always protected.',
        },
    ];

    return (
        <section className="">
            <div className=" mx-auto px-4 sm:px-6 pt-25 lg:px-8">

                {/* Header Section */}
                <div className="text-center mb-12 md:mb-16 ">
                    <h2 className="text-3xl sm:text-4xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                        Everything You Need to Master Your Meetings
                    </h2>
                    <p className="mt-4 text-lg md:text-lg text-gray-600 max-w-3xl mx-auto">
                        Powerful AI features that transform how you capture, understand, and act on meeting insights.
                    </p>
                </div>

                {/* Features Grid - Responsive Layout */}
                <div className="
          grid grid-cols-1
          gap-8
          md:grid-cols-2
          lg:grid-cols-3
        ">
                    {features.map((feature) => (
                        <FeatureBox
                            key={feature.id}
                            icon={feature.icon}
                            title={feature.title}
                            description={feature.description}
                        />
                    ))}
                </div>
            </div>
            <CallToAction />
        </section>
    );
};

export default Aboutmeetings;