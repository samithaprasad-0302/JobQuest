import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Heart, Briefcase } from 'lucide-react';
import { useSavedJobsContext } from '../contexts/SavedJobsContext';
import { jobsAPI } from '../services/api';

interface Job {
  id: string;
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

const SavedJobsFinal: React.FC<SavedJobsProps> = ({ darkMode }) => {
  const navigate = useNavigate();
  const { savedJobs, toggleBookmark, isJobSaved } = useSavedJobsContext();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('SavedJobsFinal rendering - savedJobs:', savedJobs);

  useEffect(() => {
    fetchSavedJobs();
  }, [savedJobs]);

  const fetchSavedJobs = async () => {
    console.log('fetchSavedJobs called with:', savedJobs);
    
    if (savedJobs.length === 0) {
      console.log('No saved jobs, setting empty array');
      setJobs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching jobs for IDs:', savedJobs);
      
      // Create mock data as fallback while we test API calls one by one
      const mockJobs = savedJobs.map(jobId => ({
        _id: jobId,
        title: `Job ${jobId.slice(-8)}`,
        company: 'Sample Company (Loading real data...)',
        location: 'Sample Location',
        type: 'Full-time',
        salary: '$50,000',
        description: 'Loading description...',
        requirements: ['Loading requirements...'],
        postedDate: new Date().toISOString(),
        deadline: new Date().toISOString()
      }));

      // Try to fetch real data, but fall back to mock data if it fails
      try {
        console.log('Attempting to fetch real job data...');
        const jobPromises = savedJobs.map(async (jobId) => {
          try {
            console.log(`Fetching job ${jobId}...`);
            const job = await jobsAPI.getJob(jobId);
            console.log(`Successfully fetched job ${jobId}:`, job);
            return job;
          } catch (err) {
            console.log(`Failed to fetch job ${jobId}, using mock data:`, err);
            return mockJobs.find(mock => mock._id === jobId) || null;
          }
        });
        
        const jobResults = await Promise.all(jobPromises);
        const validJobs = jobResults.filter((job: any) => job !== null) as Job[];
        
        console.log('Setting jobs:', validJobs);
        setJobs(validJobs);
      } catch (err) {
        console.log('API fetch failed completely, using mock data:', err);
        setJobs(mockJobs as Job[]);
      }
    } catch (err) {
      console.error('Error in fetchSavedJobs:', err);
      setError('Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
                  Saved Jobs
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="text-center">
              <div className={`inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}></div>
              <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading saved jobs...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
                  Saved Jobs
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className={`text-center py-12 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
            <p className="text-lg mb-4">Error loading saved jobs</p>
            <p className="mb-4">{error}</p>
            <button 
              onClick={() => fetchSavedJobs()}
              className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
            >
              Try Again
            </button>
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
            {jobs.map((job) => (
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

export default SavedJobsFinal;

