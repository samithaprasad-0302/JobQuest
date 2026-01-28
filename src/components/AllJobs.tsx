import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Bookmark, ArrowLeft, AlertCircle, X, Share2, Mail, Linkedin, Twitter, MessageCircle, Copy, Search } from 'lucide-react';
import { jobsAPI } from '../services/api';
import { useSavedJobsContext } from '../contexts/SavedJobsContext';
import { useAuth } from '../hooks/useAuth';

interface Job {
  id: string;
  title: string;
  company?: {
    id: string;
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
  image?: string | {
    filename: string;
    originalName: string;
  };
  imageUrl?: string | null;
}

interface AllJobsProps {
  darkMode: boolean;
}

const AllJobs: React.FC<AllJobsProps> = ({ darkMode }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isJobSaved, toggleBookmark } = useSavedJobsContext();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookmarkError, setShowBookmarkError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [openShareMenu, setOpenShareMenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);

  useEffect(() => {
    fetchAllJobs();
  }, [currentPage]);

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

  const fetchAllJobs = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 12, // Show 12 jobs per page
        sortBy: 'createdAt',
        sortOrder: 'desc' as const
      };

      const response = await jobsAPI.getJobs(params);
      console.log('✅ All Jobs Response:', response);
      console.log('📊 Jobs count - totalJobs:', response.totalJobs, 'total:', response.total, 'jobs length:', response.jobs?.length);
      
      setJobs(response.jobs || []);
      setTotalPages(response.totalPages || 1);
      // Handle both 'totalJobs' and 'total' from different API endpoints
      const totalCount = response.totalJobs || response.total || (response.jobs ? response.jobs.length : 0);
      console.log('🔢 Final total count set to:', totalCount);
      setTotalJobs(totalCount);
    } catch (error) {
      console.error('❌ Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkClick = (jobId: string) => {
    if (!user) {
      setShowBookmarkError(true);
      setTimeout(() => setShowBookmarkError(false), 5000);
      return;
    }
    toggleBookmark(jobId);
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
  };

  const shareViaEmail = (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();
    const jobUrl = `${window.location.origin}/job/${job.id}`;
    const subject = `Check out this job: ${job.title}`;
    const body = `I found this job opportunity that might interest you:\n\n${job.title} at ${job.company?.name || job.companyName}\nLocation: ${job.location}\n\n${jobUrl}`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
    closeShareMenu();
  };

  const shareOnLinkedIn = (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();
    const jobUrl = `${window.location.origin}/job/${job.id}`;
    const text = `Check out this job opportunity: ${job.title} at ${job.company?.name || job.companyName}`;
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}&title=${encodeURIComponent(text)}`;
    window.open(linkedinUrl, '_blank');
    closeShareMenu();
  };

  const shareOnTwitter = (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();
    const jobUrl = `${window.location.origin}/job/${job.id}`;
    const text = `🔍 Job Alert: ${job.title} at ${job.company?.name || job.companyName} in ${job.location}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(jobUrl)}`;
    window.open(twitterUrl, '_blank');
    closeShareMenu();
  };

  const shareOnWhatsApp = (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();
    const jobUrl = `${window.location.origin}/job/${job.id}`;
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

  // Live search filtering function
  const filterJobs = (jobs: Job[], query: string) => {
    if (!query.trim()) return jobs;
    
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    return jobs.filter(job => {
      const searchableText = [
        job.title?.toLowerCase() || '',
        job.company?.name?.toLowerCase() || job.companyName?.toLowerCase() || '',
        job.location?.toLowerCase() || '',
        job.description?.toLowerCase() || '',
        ...(job.skills || []).map(skill => skill.toLowerCase())
      ].join(' ');

      return searchTerms.every(term => searchableText.includes(term));
    });
  };

  // Update filtered jobs when search query or jobs change
  useEffect(() => {
    const filtered = filterJobs(jobs, searchQuery);
    setFilteredJobs(filtered);
  }, [jobs, searchQuery]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`sticky top-0 z-50 ${darkMode ? 'bg-gray-900' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
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
                All Jobs
              </h1>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className={`inline-block animate-spin rounded-full h-8 w-8 border-b-2 ${
              darkMode ? 'border-blue-400' : 'border-blue-600'
            }`}></div>
            <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading jobs...</p>
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
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
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
              All Jobs
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className={`text-4xl font-bold mb-4 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            All Job Opportunities
          </h2>
          <p className={`text-xl mb-8 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {searchQuery ? `Found ${filteredJobs.length} jobs matching "${searchQuery}"` : `Showing ${totalJobs} available positions`}
          </p>

          {/* Search Input */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className={`w-5 h-5 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs by title, company, location..."
                className={`block w-full pl-10 pr-12 py-3 rounded-lg border-2 transition-all duration-300 ${
                  darkMode
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500/20 focus:outline-none`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className={`w-5 h-5 ${
                    darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                  } transition-colors cursor-pointer`} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Jobs Grid */}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <div className={`text-6xl mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>
              {searchQuery ? '🔍' : '💼'}
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {searchQuery ? 'No matching jobs found' : 'No jobs found'}
            </h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {searchQuery 
                ? `Try adjusting your search terms or clear the search to see all jobs.`
                : 'Please check back later for new opportunities.'
              }
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
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
                      onClick={() => handleBookmarkClick(job.id)}
                      className={`p-1 md:p-2 rounded-md md:rounded-lg transition-colors ml-1 ${
                        isJobSaved(job.id)
                          ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
                          : darkMode
                          ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-700'
                          : 'text-gray-400 hover:text-blue-600 hover:bg-gray-100'
                      }`}
                    >
                      <Bookmark className={`w-3 h-3 md:w-5 md:h-5 ${isJobSaved(job.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Job Image - Compact for mobile - Fixed Height */}
                  <div className="mb-1 md:mb-3 min-h-[64px] md:min-h-[128px]">
                    {job.imageUrl ? (
                      <img
                        src={job.imageUrl}
                        alt="Job post"
                        className="w-full h-16 md:h-32 object-cover rounded-md md:rounded-lg"
                        onLoad={() => {
                          console.log('✅ Job image loaded successfully');
                        }}
                        onError={(e) => {
                          console.error('❌ Image failed to load:', job.imageUrl);
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
                    {Array.isArray(job.skills) && job.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {job.skills.slice(0, 2).map((skill: string) => (
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
                      onClick={() => navigate(`/job/${job.id}`)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 text-white px-2 py-1 md:px-4 md:py-2 rounded-md md:rounded-lg text-xs md:text-sm font-medium hover:from-blue-700 hover:to-teal-700 transition-all duration-300"
                    >
                      Apply
                    </button>
                    
                    {/* Enhanced Share Menu */}
                    <div className="relative share-menu-container">
                      <button 
                        onClick={(e) => toggleShareMenu(job.id, e)}
                        className={`px-2 py-1 md:px-4 md:py-2 rounded-md md:rounded-lg border transition-all duration-300 ${
                          openShareMenu === job.id
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
                      {openShareMenu === job.id && (
                        <div className={`absolute right-0 bottom-full mb-2 z-[60] w-48 rounded-lg shadow-lg border ${
                          darkMode
                            ? 'bg-gray-800 border-gray-700'
                            : 'bg-white border-gray-200'
                        }`}>
                          <div className="p-2 space-y-1">
                            {/* Copy Link */}
                            <button
                              onClick={(e) => copyJobLink(job.id, e)}
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

        {/* Pagination - only show when not searching */}
        {!searchQuery && totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-12">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 1
                  ? darkMode ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed'
                  : darkMode
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }).map((_, index) => {
              const page = index + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : darkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === totalPages
                  ? darkMode ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed'
                  : darkMode
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllJobs;

