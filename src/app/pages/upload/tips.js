import React from 'react';
import { Lightbulb, Check } from 'lucide-react';

/**
 * Component for displaying tips and best practices in a structured card format.
 * Customized for meeting productivity and using the teal-700 color scheme.
 */

// Data for the tips, categorized into sections relevant to a meeting productivity app
const meetingTips = [
  {
    category: 'Audio Quality',
    points: [
      'Use a quality microphone for clear input.',
      'Minimize background noise during the recording.',
      'Speak clearly and at a moderate pace.',
    ],
  },
  {
    category: 'Best Practices',
    points: [
      'Keep meetings focused with a prepared agenda.',
      'Encourage active participation from everyone.',
      'Summarize key decisions and action items before ending.',
    ],
  },
  {
    category: 'Privacy & Data',
    points: [
      'Inform participants that the meeting is being recorded.',
      'Review and adjust transcription accuracy post-meeting.',
      'Securely delete recordings after the retention period.',
    ],
  },
];

const TipsCard = () => {
  return (
    <div className="pt-4 flex justify-center">
      <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8">
        <div className="
          p-6 md:p-8 lg:p-10
          border-2 border-teal-200
          bg-teal-50
          rounded-2xl
         
        ">
          
          {/* Header */}
          <div className="flex items-center mb-8 pb-4 border-b border-teal-100">
            <div className="
              w-8 h-8 p-1.5 mr-3
              bg-teal-700
              text-white
              rounded-full
              flex items-center justify-center
            ">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              Tips for Better Results
            </h2>
          </div>

          {/* Tips Grid */}
          <div className="
            grid grid-cols-1 gap-x-12 gap-y-8
            sm:grid-cols-2
            lg:grid-cols-3
          ">
            {meetingTips.map((section) => (
              <div key={section.category} className="flex flex-col">
                <h3 className="text-lg font-semibold text-teal-700 mb-4 border-b border-teal-50/50 pb-2">
                  {section.category}
                </h3>
                <ul className="space-y-3">
                  {section.points.map((point, index) => (
                    <li key={index} className="flex items-start text-gray-700">
                      <Check className="
                        w-5 h-5 mr-3 mt-1
                        text-teal-700
                        flex-shrink-0
                      " />
                      <span className="text-base leading-relaxed">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default TipsCard;