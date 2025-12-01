import React from 'react';
import { Search, Upload } from 'lucide-react';
import Link from 'next/link';

const SearchAndUploadBar = () => {
  return (
    <div className="
      max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
      py-8
      bg-gray-50
    ">
      <div className="flex flex-col sm:flex-row gap-4">

        {/* Search Input Bar (Takes up the majority of the space) */}
        <div className="
          flex items-center
          flex-grow
          bg-white
          border border-gray-300
          rounded-xl
          shadow-md
          overflow-hidden
          h-14
          transition duration-200 ease-in-out
          focus-within:border-teal-600
          focus-within:ring-2 focus-within:ring-teal-700/50
        ">
          <Search className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search meetings by title, tags, or participants..."
            className="
              flex-grow
              p-4
              text-base text-gray-700
              placeholder-gray-400
              bg-transparent
              focus:outline-none
              disabled:opacity-50
            "
            aria-label="Search recordings"
          />
        </div>

        {/* Upload Recording Button (Primary Action) */}
        <Link href="/upload">
          <button
            className="
              flex items-center justify-center
              gap-2
              px-6 py-3
              bg-teal-700
              text-white
              font-semibold
              rounded-xl
              shadow-md
              hover:bg-teal-600
              transition duration-200 ease-in-out
              transform hover:scale-[1.02]
              focus:outline-none focus:ring-4 focus:ring-teal-500/50
              h-14
              w-full sm:w-auto
              whitespace-nowrap
            "
          >
            <Upload className="w-5 h-5" />
            Upload Recording
          </button>
        </Link>
      </div>
    </div>
  );
};

export default SearchAndUploadBar;