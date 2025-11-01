import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Clock, Bookmark, Share2, Copy, Mail, Linkedin, Twitter, MessageCircle } from 'lucide-react';
import { useSavedJobsContext } from '../contexts/SavedJobsContext';
import { jobsAPI } from '../services/api';

interface Job {
  _id: string;
  title: string;
  description?: string;
  company?: { name: string } | null;
  companyName?: string;
  location: string;
  jobType: string;
  skills?: string[];
  salary: {
    min?: number;
    max?: number;
    currency?: string;
  };
  isRemote?: boolean;
  applicationDeadline?: string;
  createdAt: string;
  jobImage?: string | { filename: string };
}

interface SavedJobsProps {
  darkMode: boolean;
}

const SavedJobsReal: React.FC<SavedJobsProps> = ({ darkMode }) => {
  const navigate = useNavigate();
  const { savedJobs, toggleBookmark, isJobSaved } = useSavedJobsContext();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openShareMenu, setOpenShareMenu] = useState<string | null>(null);

  console.log('SavedJobsReal rendering - savedJobs:', savedJobs);

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
      
      const jobPromises = savedJobs.map(async (jobId) => {
        try {
          console.log(`Fetching job ${jobId}...`);
          const job = await jobsAPI.getJob(jobId);
          console.log(`Successfully fetched job ${jobId}:`, job);
          return job;
        } catch (err) {
          console.error(`Failed to fetch job ${jobId}:`, err);
          return null;
        }
      });
      
      const jobResults = await Promise.all(jobPromises);
      const validJobs = jobResults.filter((job: any) => job !== null) as Job[];
      
      console.log('Setting jobs:', validJobs);
      setJobs(validJobs);
    } catch (err) {
      console.error('Error in fetchSavedJobs:', err);
      setError('Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  };

  // Share menu functions
  const toggleShareMenu = (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenShareMenu(openShareMenu === jobId ? null : jobId);
  };

  const closeShareMenu = () => {
    setOpenShareMenu(null);
  };

  const copyJobLink = (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const jobUrl = `${window.location.origin}/job/${jobId}`;
    navigator.clipboard.writeText(jobUrl);
    closeShareMenu();
  };

  const shareViaEmail = (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();
    const jobUrl = `${window.location.origin}/job/${job._id}`;
    const subject = `Job Opportunity: ${job.title}`;
    const body = `Check out this job opportunity:\n\nJob: ${job.title}\nCompany: ${job.company?.name || job.companyName}\nLocation: ${job.location}\n\nView details: ${jobUrl}`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
    closeShareMenu();
  };

  const shareOnLinkedIn = (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();
    const jobUrl = `${window.location.origin}/job/${job._id}`;
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`;
    window.open(linkedinUrl, '_blank');
    closeShareMenu();
  };

  const shareOnTwitter = (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();
    const jobUrl = `${window.location.origin}/job/${job._id}`;
    const text = `🔍 Job Alert: ${job.title} at ${job.company?.name || job.companyName} in ${job.location}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(jobUrl)}`;
    window.open(twitterUrl, '_blank');
    closeShareMenu();
  };

  const shareOnWhatsApp = (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();
    const jobUrl = `${window.location.origin}/job/${job._id}`;
    const text = `Check out this job: ${job.title} at ${job.company?.name || job.companyName}\n${jobUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
    closeShareMenu();
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  const getDeadlineInfo = (deadlineString?: string) => {
    if (!deadlineString) return null;
    
    const deadline = new Date(deadlineString);
    const now = new Date();
    const diffInMs = deadline.getTime() - now.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMs < 0) {
      return { text: 'Expired', isExpired: true, isUrgent: false };
    } else if (diffInDays === 0) {
      return { text: 'Today', isExpired: false, isUrgent: true };
    } else if (diffInDays === 1) {
      return { text: '1 day left', isExpired: false, isUrgent: true };
    } else if (diffInDays <= 3) {
      return { text: `${diffInDays} days left`, isExpired: false, isUrgent: true };
    } else if (diffInDays <= 7) {
      return { text: `${diffInDays} days left`, isExpired: false, isUrgent: false };
    } else if (diffInDays <= 30) {
      return { text: `${diffInDays} days left`, isExpired: false, isUrgent: false };
    } else {
      const formattedDate = deadline.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: deadline.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
      return { text: `Until ${formattedDate}`, isExpired: false, isUrgent: false };
    }
  };

  const formatSalary = (salary: Job['salary']) => {
    // Check if salary values are 0 or empty/null - return null to hide
    if ((!salary.min || salary.min <= 0) && (!salary.max || salary.max <= 0)) return null;
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: salary.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    if (salary.min && salary.min > 0 && salary.max && salary.max > 0) {
      return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`;
    } else if (salary.min && salary.min > 0) {
      return `From ${formatter.format(salary.min)}`;
    } else if (salary.max && salary.max > 0) {
      return `Up to ${formatter.format(salary.max)}`;
    }
    
    return null; // Return null instead of "Competitive salary" to hide
  };

  const hasSalaryInfo = (salary: Job['salary']) => {
    if (!salary) return false;
    // Only show salary if min or max is a positive number
    return (salary.min && salary.min > 0) || (salary.max && salary.max > 0);
  };

  const handleBookmarkClick = (jobId: string) => {
    toggleBookmark(jobId);
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
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {jobs.map((job) => (
              <div
                key={job._id}
                className={`group relative rounded-lg md:rounded-xl shadow-md md:shadow-lg transition-all duration-300 hover:shadow-lg md:hover:shadow-2xl hover:-translate-y-1 md:hover:-translate-y-2 min-h-[280px] md:min-h-[400px] ${
                  darkMode 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-white border border-gray-100'
                }`}
              >
                {/* Job Card Content */}
                <div className="p-2 md:p-4 flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-1 md:mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold text-xs md:text-lg line-clamp-2 ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {job.title}
                      </h3>
                      <p className={`text-xs md:text-sm truncate ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {job.company?.name || job.companyName || 'Company'}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleBookmarkClick(job._id)}
                      className={`p-1 md:p-2 rounded-md md:rounded-lg transition-colors ml-1 ${
                        isJobSaved(job._id)
                          ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
                          : darkMode
                          ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-700'
                          : 'text-gray-400 hover:text-blue-600 hover:bg-gray-100'
                      }`}
                    >
                      <Bookmark className={`w-3 h-3 md:w-5 md:h-5 ${isJobSaved(job._id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Job Image - Compact for mobile - Fixed Height */}
                  <div className="mb-1 md:mb-3 min-h-[64px] md:min-h-[128px]">
                    {job.jobImage ? (
                      <img
                        src={
                          typeof job.jobImage === 'string' 
                            ? `http://localhost:5000${job.jobImage}` 
                            : `http://localhost:5000/api/uploads/jobs/${job.jobImage.filename}`
                        }
                        alt="Job post"
                        className="w-full h-16 md:h-32 object-cover rounded-md md:rounded-lg"
                        onLoad={() => {
                          console.log('✅ Job image loaded successfully');
                        }}
                        onError={(e) => {
                          const imageUrl = typeof job.jobImage === 'string' 
                            ? `http://localhost:5000${job.jobImage}` 
                            : `http://localhost:5000/api/uploads/jobs/${job.jobImage?.filename}`;
                          console.error('❌ Image failed to load:', imageUrl);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className={`w-full h-16 md:h-32 rounded-md md:rounded-lg flex items-center justify-center ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          No Image
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Job Details - Ultra compact for mobile - Fixed Height */}
                  <div className="space-y-1 md:space-y-2 mb-2 md:mb-3 min-h-[40px] md:min-h-[60px]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 flex-1 min-w-0">
                        <MapPin className={`w-3 h-3 md:w-4 md:h-4 ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        <span className={`text-xs md:text-sm truncate ${
                          darkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {job.location}
                        </span>
                        {job.isRemote && (
                          <span className="px-1 py-0.5 bg-green-100 text-green-800 text-xs rounded dark:bg-green-900/20 dark:text-green-400 hidden sm:inline">
                            Remote
                          </span>
                        )}
                      </div>
                      <span className="px-1 py-0.5 md:px-2 md:py-1 bg-blue-100 text-blue-800 text-xs rounded dark:bg-blue-900/20 dark:text-blue-400">
                        {job.jobType}
                      </span>
                    </div>

                    {/* Salary and Time - Compact - Fixed Height */}
                    <div className="flex items-center justify-between text-xs min-h-[16px] md:min-h-[20px]">
                      <div className="flex items-center space-x-1 min-w-0 flex-1 mr-2">
                        {hasSalaryInfo(job.salary) && formatSalary(job.salary) ? (
                          <span className={`font-medium text-xs md:text-sm leading-tight ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {formatSalary(job.salary)}
                          </span>
                        ) : (
                          <span className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                            Salary not specified
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <Clock className={`w-3 h-3 ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        <span className={`text-xs ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {getTimeAgo(job.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Application Deadline - Fixed Height */}
                    <div className="flex items-center justify-center mt-1 min-h-[20px] md:min-h-[24px]">
                      {job.applicationDeadline && getDeadlineInfo(job.applicationDeadline) ? (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          getDeadlineInfo(job.applicationDeadline)?.isExpired
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            : getDeadlineInfo(job.applicationDeadline)?.isUrgent
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        }`}>
                          📅 {getDeadlineInfo(job.applicationDeadline)?.text}
                        </span>
                      ) : (
                        <div className="h-5"></div>
                      )}
                    </div>
                  </div>

                  {/* Description - Hidden on mobile for ultra compact view - Fixed Height */}
                  <div className="mb-2 md:mb-3 min-h-[0px] md:min-h-[48px]">
                    <p className={`text-xs md:text-sm line-clamp-1 md:line-clamp-2 hidden sm:block ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {job.description || 'No description available.'}
                    </p>
                  </div>

                  {/* Skills - Very compact on mobile - Fixed Height */}
                  <div className="mb-2 md:mb-4 min-h-[20px] md:min-h-[32px] flex-1">
                    {job.skills && job.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {job.skills.slice(0, 2).map((skill) => (
                          <span
                            key={skill}
                            className={`px-1 py-0.5 md:px-2 md:py-1 text-xs rounded ${
                              darkMode 
                                ? 'bg-gray-700 text-gray-300' 
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 2 && (
                          <span className={`px-1 py-0.5 text-xs ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            +{job.skills.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="h-4 md:h-6"></div>
                    )}
                  </div>

                  {/* Action Buttons - Always at bottom of card */}
                  <div className="flex space-x-1 md:space-x-3 mt-auto pt-1 md:pt-2">
                    <button 
                      onClick={() => navigate(`/job/${job._id}`)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 text-white px-2 py-1 md:px-4 md:py-2 rounded-md md:rounded-lg text-xs md:text-sm font-medium hover:from-blue-700 hover:to-teal-700 transition-all duration-300"
                    >
                      Apply
                    </button>
                    
                    {/* Enhanced Share Menu */}
                    <div className="relative share-menu-container">
                      <button 
                        onClick={(e) => toggleShareMenu(job._id, e)}
                        className={`px-2 py-1 md:px-4 md:py-2 rounded-md md:rounded-lg border transition-all duration-300 ${
                          openShareMenu === job._id
                            ? darkMode
                              ? 'border-blue-500 bg-blue-600 text-white'
                              : 'border-blue-500 bg-blue-100 text-blue-600'
                            : darkMode 
                              ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700' 
                              : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        <Share2 className="w-3 h-3 md:w-4 md:h-4" />
                      </button>

                      {/* Share Dropdown Menu */}
                      {openShareMenu === job._id && (
                        <div className={`absolute right-0 bottom-full mb-2 z-[60] w-48 rounded-lg shadow-lg border ${
                          darkMode
                            ? 'bg-gray-800 border-gray-700'
                            : 'bg-white border-gray-200'
                        }`}>
                          <div className="p-2 space-y-1">
                            {/* Copy Link */}
                            <button
                              onClick={(e) => copyJobLink(job._id, e)}
                              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                                darkMode
                                  ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
                                  : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                              }`}
                            >
                              <Copy className="w-4 h-4 mr-3" />
                              Copy Link
                            </button>

                            {/* Email */}
                            <button
                              onClick={(e) => shareViaEmail(job, e)}
                              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                                darkMode
                                  ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
                                  : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                              }`}
                            >
                              <Mail className="w-4 h-4 mr-3" />
                              Share via Email
                            </button>

                            {/* LinkedIn */}
                            <button
                              onClick={(e) => shareOnLinkedIn(job, e)}
                              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                                darkMode
                                  ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
                                  : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                              }`}
                            >
                              <Linkedin className="w-4 h-4 mr-3 text-blue-600" />
                              Share on LinkedIn
                            </button>

                            {/* Twitter */}
                            <button
                              onClick={(e) => shareOnTwitter(job, e)}
                              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                                darkMode
                                  ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
                                  : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                              }`}
                            >
                              <Twitter className="w-4 h-4 mr-3 text-sky-500" />
                              Share on Twitter
                            </button>

                            {/* WhatsApp */}
                            <button
                              onClick={(e) => shareOnWhatsApp(job, e)}
                              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                                darkMode
                                  ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
                                  : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                              }`}
                            >
                              <MessageCircle className="w-4 h-4 mr-3 text-green-500" />
                              Share on WhatsApp
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobsReal;