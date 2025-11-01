import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Clock, Bookmark, Share2, SortAsc, SortDesc, ArrowLeft, AlertCircle, X, Mail, Linkedin, Twitter, MessageCircle, Copy } from 'lucide-react';
import { jobsAPI } from '../services/api';
import { useSavedJobsContext } from '../contexts/SavedJobsContext';
import { useAuth } from '../hooks/useAuth';

interface Job {
  _id: string;
  title: string;
  company?: {
    _id: string;
    name: string;
    logo: string;
  };
  companyName?: string;
  location: string;
  isRemote: boolean;
  jobType: string;
  salary: {
    min: number;
    max: number;
    currency: string;
    period: string;
  };
  createdAt: string;
  applicationDeadline?: string;
  link?: string;
  description: string;
  skills: string[];
  jobImage?: string | {
    filename: string;
    originalName: string;
  };
}

interface SearchResultsProps {
  darkMode: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({ darkMode }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Use the saved jobs context
  const { isJobSaved, toggleBookmark } = useSavedJobsContext();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookmarkError, setShowBookmarkError] = useState(false);
  const [totalJobs, setTotalJobs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [openShareMenu, setOpenShareMenu] = useState<string | null>(null);

  // Get search parameters
  const keyword = searchParams.get('keyword') || '';
  const location = searchParams.get('location') || '';
  const category = searchParams.get('category') || '';
  const jobType = searchParams.get('jobType') || '';
  const experience = searchParams.get('experience') || '';

  // Handle bookmark click for guest users
  const handleBookmarkClick = (jobId: string) => {
    if (!user) {
      // Show error message for guest users
      setShowBookmarkError(true);
      setTimeout(() => setShowBookmarkError(false), 5000); // Hide after 5 seconds
      return;
    }
    // If user is authenticated, proceed with bookmark toggle
    toggleBookmark(jobId);
  };

  const fetchJobs = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        search: keyword,
        location: location,
        category: category,
        jobType: jobType,
        experienceLevel: experience,
        sortBy,
        sortOrder,
      };

      console.log('🔍 SearchResults - Fetching jobs with params:', params);
      console.log('📂 Category from URL:', category);

      const response = await jobsAPI.getJobs(params);
      console.log('📊 SearchResults - API response:', response);
      console.log('📊 Total jobs found:', response.total || 0);
      console.log('📊 Jobs array length:', response.jobs?.length || 0);
      
      setJobs(response.jobs || []);
      setTotalJobs(response.total || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(1);
  }, [keyword, location, category, jobType, experience, sortBy, sortOrder]);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openShareMenu && !(event.target as Element)?.closest('.share-menu-container')) {
        setOpenShareMenu(null);
      }
    };

    if (openShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openShareMenu]);

  const formatSalary = (salary: Job['salary']) => {
    if (!salary) return null;
    const { min, max, currency } = salary;
    const formatAmount = (amount: number) => {
      return new Intl.NumberFormat('en-US').format(amount);
    };

    if (min && max) {
      return `${currency} ${formatAmount(min)} - ${formatAmount(max)}`;
    } else if (min) {
      return `${currency} ${formatAmount(min)}+`;
    } else if (max) {
      return `Up to ${currency} ${formatAmount(max)}`;
    }
    return null;
  };

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return 'Recently posted';
    
    try {
      const jobDate = new Date(dateString);
      const now = new Date();
      
      // Check if date is valid
      if (isNaN(jobDate.getTime())) {
        return 'Recently posted';
      }
      
      // Calculate the difference in milliseconds
      const diffTime = now.getTime() - jobDate.getTime();
      
      // Convert to different time units
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffMinutes < 60) {
        if (diffMinutes <= 1) return 'Just now';
        return `${diffMinutes} minutes ago`;
      } else if (diffHours < 24) {
        if (diffHours === 1) return '1 hour ago';
        return `${diffHours} hours ago`;
      } else if (diffDays === 1) {
        return '1 day ago';
      } else if (diffDays < 30) {
        return `${diffDays} days ago`;
      } else {
        const diffMonths = Math.floor(diffDays / 30);
        if (diffMonths === 1) return '1 month ago';
        return `${diffMonths} months ago`;
      }
    } catch (error) {
      return 'Recently posted';
    }
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

  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const handleViewJob = (jobId: string) => {
    navigate(`/job/${jobId}`);
  };

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
    // You could add a toast notification here
  };

  const shareViaEmail = (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();
    const jobUrl = `${window.location.origin}/job/${job._id}`;
    const subject = `Check out this job: ${job.title}`;
    const body = `I found this job opportunity that might interest you:\n\n${job.title} at ${job.company?.name || job.companyName}\nLocation: ${job.location}\n\n${jobUrl}`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
    closeShareMenu();
  };

  const shareOnLinkedIn = (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();
    const jobUrl = `${window.location.origin}/job/${job._id}`;
    const text = `Check out this job opportunity: ${job.title} at ${job.company?.name || job.companyName}`;
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}&title=${encodeURIComponent(text)}`;
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

  const handlePageChange = (page: number) => {
    fetchJobs(page);
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-48 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Bookmark Error Message */}
      {showBookmarkError && (
        <div className="fixed top-4 right-4 z-[9999] max-w-sm animate-in slide-in-from-right-full">
          <div className="bg-red-500 text-white px-4 py-4 rounded-lg shadow-lg flex items-start">
            <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium mb-1">Sign in required</p>
              <p className="text-sm opacity-90 leading-relaxed">Please sign in to save jobs. Create a free account to bookmark and manage your favorite job listings!</p>
            </div>
            <button
              onClick={() => setShowBookmarkError(false)}
              className="ml-3 text-white/70 hover:text-white transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <div className={`sticky top-0 z-50 ${darkMode ? 'bg-gray-900' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
          <div className="flex-1">
            <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Job Search Results
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Summary */}
        <div className="mb-6">
          <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {category ? `${category} Jobs` : 'Search Results'}
          </h1>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Found {totalJobs} jobs
            {category && ` in ${category}`}
            {keyword && ` for "${keyword}"`}
            {location && ` in ${location}`}
          </p>
          
          {/* Active Filters */}
          {(category || keyword || location || jobType || experience) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Active filters:
              </span>
              
              {category && (
                <button
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('category');
                    navigate(`/search?${newParams.toString()}`);
                  }}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    darkMode 
                      ? 'bg-blue-900/20 border-blue-500/30 text-blue-400 hover:bg-blue-900/30' 
                      : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  {category}
                  <X className="w-3 h-3 ml-1" />
                </button>
              )}
              
              {keyword && (
                <button
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('keyword');
                    navigate(`/search?${newParams.toString()}`);
                  }}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  "{keyword}"
                  <X className="w-3 h-3 ml-1" />
                </button>
              )}
              
              {location && (
                <button
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('location');
                    navigate(`/search?${newParams.toString()}`);
                  }}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📍 {location}
                  <X className="w-3 h-3 ml-1" />
                </button>
              )}
              
              <button
                onClick={() => navigate('/search')}
                className={`text-xs font-medium transition-colors ${
                  darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'
                }`}
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Sort and Filter Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSortChange('createdAt')}
              className={`flex items-center px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                sortBy === 'createdAt'
                  ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : darkMode
                  ? 'border-gray-600 text-gray-300 hover:border-gray-500'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              Date Posted
              {sortBy === 'createdAt' && (
                sortOrder === 'desc' ? <SortDesc className="w-4 h-4 ml-1" /> : <SortAsc className="w-4 h-4 ml-1" />
              )}
            </button>

            <button
              onClick={() => handleSortChange('title')}
              className={`flex items-center px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                sortBy === 'title'
                  ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : darkMode
                  ? 'border-gray-600 text-gray-300 hover:border-gray-500'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              Job Title
              {sortBy === 'title' && (
                sortOrder === 'desc' ? <SortDesc className="w-4 h-4 ml-1" /> : <SortAsc className="w-4 h-4 ml-1" />
              )}
            </button>
          </div>
        </div>

        {/* Job Results - Matching AllJobs layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
          {jobs.length === 0 ? (
            <div className={`col-span-full text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p className="text-lg">No jobs found matching your criteria.</p>
              <p className="mt-2">Try adjusting your search terms or filters.</p>
            </div>
          ) : (
            jobs.map((job) => (
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
                        {formatSalary(job.salary) ? (
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
                          {formatTimeAgo(job.createdAt)}
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
                      {job.description ? job.description.replace(/<[^>]*>/g, '').substring(0, 120) + '...' : 'No description available.'}
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
                      onClick={() => handleViewJob(job._id)}
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
            ))
          )}
        </div>

        {/* Pagination */}
        {totalJobs > 10 && (
          <div className="flex justify-center mt-8">
            <div className="flex gap-2">
              {currentPage > 1 && (
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    darkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
              )}
              
              <span className={`px-4 py-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Page {currentPage} of {Math.ceil(totalJobs / 10)}
              </span>

              {currentPage < Math.ceil(totalJobs / 10) && (
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    darkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
