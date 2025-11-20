import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Heart, Briefcase } from 'lucide-react';
import { useSavedJobsContext } from '../contexts/SavedJobsContext';

interface SavedJobsProps {
  darkMode: boolean;
}

const SavedJobsWorking: React.FC<SavedJobsProps> = ({ darkMode }) => {
  const navigate = useNavigate();
  const { savedJobs, toggleBookmark, isJobSaved } = useSavedJobsContext();

  console.log('SavedJobsWorking rendering - savedJobs:', savedJobs);

  // Instead of fetching jobs, let's just display the IDs for now
  const mockJobs = savedJobs.map(jobId => ({
    id: jobId,
    title: `Job Title (ID: ...${jobId.slice(-8)})`,
    company: 'Loading company...',
    location: 'Loading location...',
    type: 'Loading...',
    salary: 'Loading salary...'
  }));

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
            <Heart className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-4">No saved jobs yet</p>
            <p>Save jobs while searching to see them here!</p>
            <button 
              onClick={() => navigate('/search')}
              className={`mt-4 px-6 py-2 rounded-lg transition-colors ${
                darkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`mb-4 p-4 rounded-lg ${darkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
              <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                📝 Note: This is a simplified version showing your saved job IDs. Full job details will be loaded once API issues are resolved.
              </p>
            </div>
            
            {mockJobs.map((job) => (
              <div
                key={job.id}
                className={`p-6 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                    : 'bg-white border-gray-200 hover:shadow-lg'
                }`}
                onClick={() => navigate(`/job/${job.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {job.title}
                    </h3>
                    <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {job.company}
                    </p>
                    <div className={`flex items-center space-x-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {job.location}
                      </span>
                      <span className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-1" />
                        {job.type}
                      </span>
                      <span>{job.salary}</span>
                    </div>
                    <div className={`mt-2 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Job ID: {job.id}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(job.id);
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      isJobSaved(job.id)
                        ? `${darkMode ? 'bg-red-900 text-red-400 hover:bg-red-800' : 'bg-red-100 text-red-600 hover:bg-red-200'}`
                        : `${darkMode ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isJobSaved(job.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobsWorking;
