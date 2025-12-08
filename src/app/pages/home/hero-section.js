
import React from 'react';


const HeroSection = () => {


    return (
        <section className="flex items-center justify-center pt-18 md:py-20 px-4 sm:px-6 lg:px-8 bg-gray-100">
            <div className="max-w-3xl w-full text-center">

                {/* AI-Powered Tag */}
                <div className="inline-block mb-8 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-100/70 rounded-full border border-blue-200/90 shadow-sm">
                    ⚡ AI-Powered Meeting Recorder
                </div>

                {/* Main Heading */}
                <h1 className="text-6xl sm:text-6xl font-extrabold leading-tight tracking-tight mb-6 text-gray-900">
                    Turn Meetings Into
                    <span className="text-teal-600"> Actionable</span>
                    <span className="text-amber-700/90"> Insights</span>
                </h1>

                {/* Description Text */}
                <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
                    Upload your meeting recordings and get AI-generated summaries, action items, and insights. Ask questions about any meeting and get instant answers.
                </p>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4">

                    {/* Primary Button */}
                    <a href="/dashboard">


                        <button className="flex items-center justify-center px-4 py-4 md:px-8 md:py-4 text-sm md:text-base font-semibold text-white bg-teal-600 rounded-lg shadow-md hover:bg-teal-700 transition duration-150 ease-in-out"
                        >
                            View Dashboard →
                        </button>
                    </a>

                    {/* Secondary Button */}
                    <a
                        href="/upload"
                        className="flex items-center cursor-pointer justify-center px-4 py-4 md:px-8 md:py-4 text-sm md:text-base font-semibold text-gray-700 bg-white rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 transition duration-150 ease-in-out"
                    >
                      Upload Recording
                    </a>
                </div>
                <div className=" flex justify-between gap-4 p-6 pt-14 sm:mt-16">

                    {/* Card 1 */}
                    <div className="flex-1 ">
                        <h2 className="text-3xl text-teal-600 font-semibold">10K+</h2>
                        <p className="text-gray-600 mt-1"> Processed</p>
                    </div>

                    {/* Card 2 */}
                    <div className="flex-1">
                        <h2 className="text-3xl text-teal-600 font-semibold">95%</h2>
                        <p className="text-gray-600 mt-1">Accuracy Rate</p>
                    </div>

                    {/* Card 3 */}
                    <div className="flex-1">
                        <h2 className="text-3xl text-teal-600 font-semibold">50hrs</h2>
                        <p className="text-gray-600 mt-1">Time Saved</p>
                    </div>

                </div>

            </div>
        </section >
    );
};

export default HeroSection;