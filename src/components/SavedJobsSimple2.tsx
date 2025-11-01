import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useSavedJobsContext } from '../contexts/SavedJobsContext';

interface SavedJobsProps {
  darkMode: boolean;
}

const SavedJobsSimple2: React.FC<SavedJobsProps> = ({ darkMode }) => {
  const navigate = useNavigate();
  
  // Test if context is working
  try {
    const { savedJobs } = useSavedJobsContext();
    
    return (
      <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        {/* Header */}
        <div className={`sticky top-0 z-10 ${darkMode ? 'bg-gray-800/95' : 'bg-white/95'} backdrop-blur-sm border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(-1)}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode 
                      ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Saved Jobs ({savedJobs.length})
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {savedJobs.length === 0 ? (
            <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p className="text-lg mb-4">No saved jobs yet</p>
              <p>Save jobs while searching to see them here!</p>
            </div>
          ) : (
            <div>
              <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Context is working! You have {savedJobs.length} saved jobs with IDs: {savedJobs.join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} p-8`}>
        <div className={`${darkMode ? 'text-red-400' : 'text-red-600'}`}>
          <h1>Error with SavedJobsContext</h1>
          <p>Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }
};

export default SavedJobsSimple2;