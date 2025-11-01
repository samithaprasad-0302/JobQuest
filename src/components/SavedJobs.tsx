import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Bookmark, Share2, ArrowLeft, Heart, Briefcase } from 'lucide-react';
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

const SavedJobs: React.FC<SavedJobsProps> = ({ darkMode }) => {
  const navigate = useNavigate();
  const { savedJobs, toggleBookmark, isJobSaved } = useSavedJobsContext();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedJobs();
  }, [savedJobs]);

  const fetchSavedJobs = async () => {
    if (savedJobs.length === 0) {
      setJobs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch all saved jobs
      const jobPromises = savedJobs.map(jobId => 
        jobsAPI.getJob(jobId).catch(() => null)
      );
      
      const jobResults = await Promise.all(jobPromises);
      const validJobs = jobResults.filter((job: any) => job !== null) as Job[];
      
      setJobs(validJobs);
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
      setError('Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleViewJob = (jobId: string) => {
    navigate(`/job/${jobId}`);
  };

  const handleShareJob = (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/job/${jobId}`;
    navigator.clipboard.writeText(url);
    // You could add a toast notification here
    console.log('Job URL copied to clipboard');
  };

  const formatSalary = (salary?: string) => {
    if (!salary) return 'Salary not specified';
    return salary;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
                  onClick={() => navigate('/')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    darkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <div className="flex items-center space-x-2">
                  <Heart className={`w-6 h-6 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />
                  <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Saved Jobs
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className={`inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}></div>
              <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading saved jobs...</p>
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
                onClick={() => navigate('/')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <div className="flex items-center space-x-2">
                <Heart className={`w-6 h-6 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />
                <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Saved Jobs ({savedJobs.length})
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="text-center py-12">
            <div className={`text-red-500 mb-4`}>
              <Briefcase className="w-12 h-12 mx-auto mb-2" />
              <p className="text-lg font-medium">Error loading saved jobs</p>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={fetchSavedJobs}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <Heart className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <h2 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              No saved jobs yet
            </h2>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
              Start browsing jobs and save the ones you're interested in.
            </p>
            <button
              onClick={() => navigate('/search')}
              className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105"
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className={`${
                    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  } border rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 cursor-pointer`}
                  onClick={() => handleViewJob(job._id)}
                >
                  {/* Company Logo and Title */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {job.title}
                      </h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                        {typeof job.company === 'string' ? job.company : job.company?.name}
                      </p>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {job.location}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {job.type}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                        {formatSalary(job.salary)}
                      </span>
                    </div>
                  </div>

                  {/* Job Description Preview */}
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4 line-clamp-2`}>
                    {job.description}
                  </p>

                  {/* Footer with Bookmark, Apply and Share Buttons */}
                  <div className="flex items-center justify-between mt-auto">
                    <button
                      className={`p-2 rounded-lg transition-colors ${
                        isJobSaved(job._id)
                          ? darkMode
                            ? 'text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20'
                            : 'text-yellow-600 bg-yellow-100 hover:bg-yellow-200'
                          : darkMode
                            ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(job._id);
                      }}
                      title={isJobSaved(job._id) ? 'Remove from saved jobs' : 'Save job'}
                    >
                      <Bookmark 
                        className={`w-4 h-4 ${
                          isJobSaved(job._id) ? 'fill-current' : ''
                        }`} 
                      />
                    </button>
                    
                    <button
                      className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewJob(job._id);
                      }}
                    >
                      Apply Now
                    </button>
                    
                    <button
                      className={`p-2 rounded-lg transition-colors ${
                        darkMode
                          ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                      }`}
                      onClick={(e) => handleShareJob(job._id, e)}
                      title="Share Job"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Date Info */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Posted: {formatDate(job.postedDate)}</span>
                      <span>Deadline: {formatDate(job.deadline)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;