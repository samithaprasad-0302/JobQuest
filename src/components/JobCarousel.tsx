import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MapPin, Clock, Bookmark, AlertCircle, X, Share2, Mail, Linkedin, Twitter, MessageCircle, Copy } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSavedJobsContext } from '../contexts/SavedJobsContext';

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
  image?: string | {
    filename: string;
    originalName: string;
    path: string;
    uploadDate: string;
  };
}

interface JobCarouselProps {
  darkMode: boolean;
}

const JobCarousel: React.FC<JobCarouselProps> = ({ darkMode }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isJobSaved, toggleBookmark } = useSavedJobsContext();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookmarkError, setShowBookmarkError] = useState(false);
  const [openShareMenu, setOpenShareMenu] = useState<string | null>(null);
  const [itemsPerSlide, setItemsPerSlide] = useState(3);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    fetchFeaturedJobs();
  }, []);

  // Update items per slide based on screen size
  useEffect(() => {
    const updateItemsPerSlide = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setItemsPerSlide(1); // Mobile: 1 item per slide
      } else if (width < 1024) {
        setItemsPerSlide(2); // Tablet: 2 items per slide
      } else {
        setItemsPerSlide(3); // Desktop: 3 items per slide
      }
    };

    updateItemsPerSlide();
    window.addEventListener('resize', updateItemsPerSlide);
    return () => window.removeEventListener('resize', updateItemsPerSlide);
  }, []);

  // Reset current slide when items per slide changes or jobs change
  useEffect(() => {
    setCurrentSlide(0);
  }, [itemsPerSlide, featuredJobs.length]);

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

  const fetchFeaturedJobs = async () => {
    try {
      console.log('🔍 Fetching jobs from API...');
      const response = await fetch('http://localhost:5000/api/jobs');
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      const data = await response.json();
      console.log('📊 API Response:', data);
      
      // The /api/jobs endpoint returns { jobs: [...], totalPages, currentPage, total }
      // But /api/jobs/featured returns the jobs array directly
      const jobsArray = data.jobs || data; // Handle both response formats
      console.log('📋 Jobs array:', jobsArray);
      setFeaturedJobs(jobsArray);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      // Fallback to empty array if fetch fails
      setFeaturedJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSaveJob = (jobId: string) => {
    if (!user) {
      // Show error message for guest users
      setShowBookmarkError(true);
      setTimeout(() => setShowBookmarkError(false), 5000); // Hide after 5 seconds
      return;
    }
    // If user is authenticated, proceed with bookmark toggle
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

  const getTimeAgo = (dateString: string) => {
    const jobDate = new Date(dateString);
    const now = new Date();
    
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
  };

  const getDeadlineInfo = (deadlineString?: string) => {
    if (!deadlineString) return null;
    
    const deadline = new Date(deadlineString);
    const now = new Date();
    
    // Calculate the difference in milliseconds
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffTime < 0) {
      return { text: 'Expired', color: 'text-red-600 bg-red-100', urgent: false };
    } else if (diffDays === 0) {
      return { text: 'Today', color: 'text-red-600 bg-red-100', urgent: true };
    } else if (diffDays === 1) {
      return { text: '1 day left', color: 'text-orange-600 bg-orange-100', urgent: true };
    } else if (diffDays <= 3) {
      return { text: `${diffDays} days left`, color: 'text-orange-600 bg-orange-100', urgent: true };
    } else if (diffDays <= 7) {
      return { text: `${diffDays} days left`, color: 'text-yellow-600 bg-yellow-100', urgent: false };
    } else {
      return { text: `${diffDays} days left`, color: 'text-green-600 bg-green-100', urgent: false };
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(featuredJobs.length / itemsPerSlide));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(featuredJobs.length / itemsPerSlide)) % Math.ceil(featuredJobs.length / itemsPerSlide));
  };

  const getVisibleJobs = () => {
    const start = currentSlide * itemsPerSlide;
    return featuredJobs.slice(start, start + itemsPerSlide);
  };

  const totalSlides = Math.ceil(featuredJobs.length / itemsPerSlide);
  const showNavigation = totalSlides > 1;

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0); // Reset touch end
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && showNavigation) {
      nextSlide();
    }
    if (isRightSwipe && showNavigation) {
      prevSlide();
    }
  };

  if (loading) {
    return (
      <section className={`py-16 px-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Featured Jobs
            </h2>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (featuredJobs.length === 0) {
    return (
      <section className={`py-16 px-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Featured Jobs
            </h2>
          </div>
          <div className="text-center py-16">
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No jobs available at the moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="featured-jobs" className={`py-16 px-4 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
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

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className={`text-4xl font-bold mb-4 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Latest Job Opportunities
          </h2>
          <p className={`text-xl ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Discover exciting career opportunities from top employers
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative px-8 md:px-0">
          {/* Navigation Buttons - Only show when there are multiple slides */}
          {showNavigation && (
            <>
              <button
                onClick={prevSlide}
                className={`absolute left-0 md:-left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 md:p-3 rounded-full shadow-lg transition-all duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-white hover:bg-gray-50 text-gray-900'
                } hover:scale-110`}
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              <button
                onClick={nextSlide}
                className={`absolute right-0 md:-right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 md:p-3 rounded-full shadow-lg transition-all duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-white hover:bg-gray-50 text-gray-900'
                } hover:scale-110`}
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </>
          )}

          {/* Jobs Grid */}
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {getVisibleJobs().map((job) => (
              <div
                key={job._id}
                className={`group relative rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                  darkMode 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-white border border-gray-100'
                }`}
              >
                {/* Job Card Content */}
                <div className="p-3 md:p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2 md:mb-3">
                    <div>
                      <h3 className={`font-bold text-base md:text-lg ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {job.title}
                      </h3>
                      <p className={`text-xs md:text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {job.company?.name || job.companyName || 'Company'}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => toggleSaveJob(job._id)}
                      className={`p-1.5 md:p-2 rounded-lg transition-colors ${
                        isJobSaved(job._id)
                          ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
                          : darkMode
                          ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-700'
                          : 'text-gray-400 hover:text-blue-600 hover:bg-gray-100'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 md:w-5 md:h-5 ${isJobSaved(job._id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Job Image - Center */}
                  {job.image && (
                    <div className="mb-2 md:mb-3">
                      <img
                        src={
                          typeof job.image === 'string' 
                            ? `http://localhost:5000${job.image}` 
                            : `http://localhost:5000/api/uploads/jobs/${job.image.filename}`
                        }
                        alt="Job post"
                        className="w-full h-20 md:h-32 object-cover rounded-lg"
                        onLoad={() => {
                          console.log('✅ Job image loaded successfully');
                        }}
                        onError={(e) => {
                          const imageUrl = typeof job.image === 'string' 
                            ? `http://localhost:5000${job.image}` 
                            : `http://localhost:5000/api/uploads/jobs/${job.image?.filename}`;
                          console.error('❌ Image failed to load:', imageUrl);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Job Details */}
                  <div className="space-y-1.5 md:space-y-2 mb-2 md:mb-3">
                    <div className="flex items-center space-x-1 md:space-x-2">
                      <MapPin className={`w-3 h-3 md:w-4 md:h-4 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <span className={`text-xs md:text-sm ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {job.location} {job.isRemote && '(Remote)'}
                      </span>
                      <span className="px-1.5 py-0.5 md:px-2 md:py-1 bg-green-100 text-green-800 text-xs rounded-full dark:bg-green-900/20 dark:text-green-400">
                        {job.jobType}
                      </span>
                    </div>

                    {/* Application Deadline */}
                    <div className="min-h-[20px] md:min-h-[24px] mb-1.5 md:mb-2">
                      {job.applicationDeadline && (() => {
                        const deadlineInfo = getDeadlineInfo(job.applicationDeadline);
                        return deadlineInfo && (
                          <div className="flex items-center space-x-1 md:space-x-2">
                            <Clock className={`w-3 h-3 md:w-4 md:h-4 ${
                              deadlineInfo.urgent ? 'text-red-500' : darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`} />
                            <span className={`text-xs px-1.5 py-0.5 md:px-2 md:py-1 rounded-full font-medium ${deadlineInfo.color}`}>
                              Application {deadlineInfo.text}
                            </span>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="flex items-center justify-between mb-2 md:mb-3">
                      {/* Salary section - always maintain space */}
                      <div className="flex items-center space-x-1 md:space-x-2">
                        {hasSalaryInfo(job.salary) && formatSalary(job.salary) && (
                          <span className={`text-xs md:text-sm font-medium ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {formatSalary(job.salary)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1 md:space-x-2">
                        <Clock className={`w-3 h-3 md:w-4 md:h-4 ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        <span className={`text-xs md:text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {getTimeAgo(job.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className={`text-xs md:text-sm mb-2 md:mb-3 line-clamp-2 min-h-[32px] md:min-h-[40px] ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {job.description || 'No description available.'}
                  </p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1 mb-3 md:mb-4 min-h-[28px] md:min-h-[32px]">
                    {job.skills && job.skills.length > 0 && (
                      <>
                        {job.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className={`px-1.5 py-0.5 md:px-2 md:py-1 text-xs rounded-full ${
                              darkMode 
                                ? 'bg-gray-700 text-gray-300 border border-gray-600' 
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 3 && (
                          <span className={`px-1.5 py-0.5 md:px-2 md:py-1 text-xs rounded-full ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            +{job.skills.length - 3} more
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 md:space-x-3">
                    <button 
                      onClick={() => navigate(`/job/${job._id}`)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium hover:from-blue-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105"
                    >
                      Apply Now
                    </button>
                    
                    {/* Enhanced Share Menu */}
                    <div className="relative share-menu-container">
                      <button 
                        onClick={(e) => toggleShareMenu(job._id, e)}
                        className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg border-2 transition-all duration-300 ${
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

          {/* Dots Indicator - Only show when there are multiple slides */}
          {showNavigation && (
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentSlide === index
                      ? 'bg-blue-600 scale-125'
                      : darkMode
                      ? 'bg-gray-600 hover:bg-gray-500'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* View All Jobs Button */}
        <div className="text-center mt-12">
          <button 
            onClick={() => navigate('/all-jobs')}
            className={`px-8 py-3 rounded-lg border-2 font-medium transition-all duration-300 hover:scale-105 ${
              darkMode 
                ? 'border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white' 
                : 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
            }`}
          >
            View All Jobs
          </button>
        </div>
      </div>
    </section>
  );
};

export default JobCarousel;