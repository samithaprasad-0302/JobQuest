import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Heart, Briefcase } from 'lucide-react';
import { useSavedJobsContext } from '../contexts/SavedJobsContext';
import { jobsAPI } from '../services/api';

interface Job {
  _id: string;
  title: string;
  company?: {
    name: string;
    logo?: string;
  } | string;
  location: string;
  salary?: string;
  type: string;
  description: string;
  requirements: string[];
  postedDate: string;
  deadline: string;
}

interface SavedJobsProps {
  darkMode: boolean;
}

const SavedJobsDebug: React.FC<SavedJobsProps> = ({ darkMode }) => {
  const navigate = useNavigate();
  const { savedJobs, toggleBookmark, isJobSaved } = useSavedJobsContext();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (info: string) => {
    console.log('DEBUG:', info);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  useEffect(() => {
    addDebugInfo(`Component mounted. Saved jobs: ${JSON.stringify(savedJobs)}`);
    fetchSavedJobs();
  }, [savedJobs]);

  const fetchSavedJobs = async () => {
    addDebugInfo('fetchSavedJobs called');
    
    if (savedJobs.length === 0) {
      addDebugInfo('No saved jobs, setting empty array');
      setJobs([]);
      setLoading(false);
      return;
    }

    addDebugInfo(`Fetching ${savedJobs.length} jobs: ${savedJobs.join(', ')}`);
    setLoading(true);
    setError(null);

    try {
      addDebugInfo('Starting API calls...');
      
      // Fetch all saved jobs
      const jobPromises = savedJobs.map(jobId => {
        addDebugInfo(`Creating promise for job ID: ${jobId}`);
        return jobsAPI.getJob(jobId).catch((err) => {
          addDebugInfo(`Error fetching job ${jobId}: ${err.message}`);
          return null;
        });
      });
      
      addDebugInfo('Waiting for all promises to resolve...');
      const jobResults = await Promise.all(jobPromises);
      
      addDebugInfo(`Got ${jobResults.length} results: ${jobResults.map(r => r ? 'success' : 'failed').join(', ')}`);
      
      const validJobs = jobResults.filter((job: any) => job !== null) as Job[];
      
      addDebugInfo(`Setting ${validJobs.length} valid jobs`);
      setJobs(validJobs);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      addDebugInfo(`Catch block: ${errorMsg}`);
      console.error('Error fetching saved jobs:', err);
      setError('Failed to load saved jobs');
    } finally {
      addDebugInfo('Setting loading to false');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        <div className="p-8">
          <h1 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Loading Saved Jobs...
          </h1>
          <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <h3 className="font-semibold mb-2">Debug Info:</h3>
            <div className="space-y-1 text-sm font-mono">
              {debugInfo.map((info, index) => (
                <div key={index}>{info}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        <div className="p-8">
          <h1 className={`text-xl font-bold mb-4 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
            Error Loading Saved Jobs
          </h1>
          <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{error}</p>
          <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <h3 className="font-semibold mb-2">Debug Info:</h3>
            <div className="space-y-1 text-sm font-mono">
              {debugInfo.map((info, index) => (
                <div key={index}>{info}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                Saved Jobs ({jobs.length})
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {jobs.length === 0 ? (
          <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <Heart className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-4">No saved jobs yet</p>
            <p>Save jobs while searching to see them here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job._id}
                className={`p-6 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                    : 'bg-white border-gray-200 hover:shadow-lg'
                }`}
                onClick={() => navigate(`/job/${job._id}`)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {job.title}
                    </h3>
                    <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {typeof job.company === 'string' ? job.company : job.company?.name}
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
                      {job.salary && (
                        <span>{job.salary}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(job._id);
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      isJobSaved(job._id)
                        ? `${darkMode ? 'bg-red-900 text-red-400 hover:bg-red-800' : 'bg-red-100 text-red-600 hover:bg-red-200'}`
                        : `${darkMode ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isJobSaved(job._id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Debug Info */}
        <div className={`mt-8 p-4 rounded-lg ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <div className="space-y-1 text-xs font-mono max-h-48 overflow-y-auto">
            {debugInfo.map((info, index) => (
              <div key={index}>{info}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedJobsDebug;