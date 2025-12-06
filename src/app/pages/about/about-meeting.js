import React from 'react';
import { BrainCircuit, Sparkles } from 'lucide-react';

/**
 * About section for the AI Meeting Recorder platform.
 * Converted from PlantCare AI → Meeting Intelligence AI (your project).
 * The theme now uses teal colors.
 */
const AboutBanner = () => {
  return (
    <div className="py-16 md:py-24 bg-teal-100 flex justify-center">
      <div className="md:max-w-4xl  mx-auto px-6 sm:px-6 lg:px-8 text-center">
        
        {/* Large Central Icon */}
        <div
          className="
            w-20 h-20 p-4 mx-auto mb-6
            bg-teal-600
            text-white
            rounded-full
            shadow-lg
            flex items-center justify-center
          "
        >
          <BrainCircuit className="w-10 h-10" />
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          About MeetingAI
        </h1>

        {/* Description Text */}
        <p className="text-lg md:text-xl text-teal-800 max-w-2xl mx-auto leading-relaxed">
          MeetingAI helps teams capture, summarize, and understand their
          meetings using the power of AI. Upload recordings, generate
          smart insights, and ask questions — all in one intelligent workspace.
        </p>

        {/* Footer / Tagline */}
        <div className="mt-8 text-base font-semibold text-teal-700 flex items-center justify-center">
          <Sparkles className="w-5 h-5 mr-2 text-teal-600" />
          Built to make every meeting smarter, faster, and more productive.
        </div>
      </div>
    </div>
  );
};

export default AboutBanner;
