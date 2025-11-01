import React, { useState } from 'react';
import { Search, MapPin, Filter, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchBarProps {
  darkMode: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ darkMode }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [experience, setExperience] = useState('');
  const [showSearchError, setShowSearchError] = useState(false);
  const navigate = useNavigate();

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    
    if (keyword.trim()) searchParams.set('keyword', keyword.trim());
    if (location.trim()) searchParams.set('location', location.trim());
    if (jobType) searchParams.set('jobType', jobType);
    if (experience) searchParams.set('experience', experience);
    
    // Only navigate if at least one search parameter is provided
    if (searchParams.toString()) {
      setShowSearchError(false); // Clear any previous error
      navigate(`/search?${searchParams.toString()}`);
    } else {
      // Show error message for a few seconds
      setShowSearchError(true);
      setTimeout(() => setShowSearchError(false), 4000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section id="find-jobs" className={`py-12 px-4 ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    } shadow-lg -mt-16 relative z-10`}>
      <div className="max-w-6xl mx-auto">
        {/* Main Search Bar */}
        <div className={`rounded-2xl shadow-xl p-6 ${
          darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Keyword Search */}
            <div className="md:col-span-5">
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Job Title or Keywords
              </label>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  darkMode ? 'text-gray-400' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g. Software Engineer, Marketing Manager"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                    darkMode 
                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:border-blue-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-200 focus:outline-none`}
                />
              </div>
            </div>

            {/* Location Search */}
            <div className="md:col-span-4">
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Location
              </label>
              <div className="relative">
                <MapPin className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  darkMode ? 'text-gray-400' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="City, State or Remote"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                    darkMode 
                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:border-blue-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-200 focus:outline-none`}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-3 flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all ${
                  showFilters
                    ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    : darkMode
                    ? 'border-gray-500 text-gray-300 hover:border-gray-400'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </button>
              
              <button
                onClick={handleSearch}
                className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Search Jobs
              </button>
            </div>
          </div>

          {/* Search Error Message */}
          {showSearchError && (
            <div className={`mt-4 p-4 rounded-lg border-l-4 ${
              darkMode 
                ? 'bg-red-900/20 border-red-500 text-red-300' 
                : 'bg-red-50 border-red-400 text-red-700'
            }`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <X className="w-5 h-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">
                    Please enter search criteria
                  </p>
                  <p className="text-sm mt-1 opacity-90">
                    Enter at least one search criteria (keyword, location, job type, or experience level) to find jobs.
                  </p>
                </div>
                <button
                  onClick={() => setShowSearchError(false)}
                  className={`ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 ${
                    darkMode 
                      ? 'text-red-300 hover:bg-red-800/20' 
                      : 'text-red-400 hover:bg-red-100'
                  } transition-colors`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Advanced Filters */}
          {showFilters && (
            <div className={`mt-6 pt-6 border-t ${
              darkMode ? 'border-gray-600' : 'border-gray-200'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Job Type
                  </label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                      darkMode 
                        ? 'bg-gray-600 border-gray-500 text-white focus:border-blue-400' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    } focus:ring-2 focus:ring-blue-200 focus:outline-none`}
                  >
                    <option value="">Any Type</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="freelance">Freelance</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Experience Level
                  </label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                      darkMode 
                        ? 'bg-gray-600 border-gray-500 text-white focus:border-blue-400' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    } focus:ring-2 focus:ring-blue-200 focus:outline-none`}
                  >
                    <option value="">Any Level</option>
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setKeyword('');
                      setLocation('');
                      setJobType('');
                      setExperience('');
                    }}
                    className={`w-full flex items-center justify-center px-4 py-3 rounded-lg transition-colors ${
                      darkMode 
                        ? 'text-gray-300 border border-gray-600 hover:bg-gray-600' 
                        : 'text-gray-600 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Search Suggestions */}
        <div className="mt-6">
          <p className={`text-sm mb-3 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Popular Searches:
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              'Remote Jobs', 'Software Engineer', 'Data Scientist', 
              'Product Manager', 'UX Designer', 'Marketing Manager'
            ].map((term) => (
              <button
                key={term}
                onClick={() => setKeyword(term)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchBar;