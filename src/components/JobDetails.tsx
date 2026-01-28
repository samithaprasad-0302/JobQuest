import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building,
  Mail,
  ArrowLeft,
  X,
  Download,
  ChevronDown,
  FileText,
  CheckCircle,
  Target,
  Award,
  MapPin,
  Clock,
  DollarSign
} from 'lucide-react';
import GuestApplicationModal from './GuestApplicationModal';
import SignupModal from './SignupModal';
import { useAuth } from '../hooks/useAuth';
import { applicationsAPI } from '../services/api';

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
  experienceLevel?: string;
  salary: {
    min: number;
    max: number;
    currency: string;
    period: string;
  };
  createdAt: string;
  applicationDeadline?: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  benefits: string[];
  category: string;
  link?: string;
  image?: string | {
    filename: string;
    originalName: string;
    path: string;
    uploadDate: string;
  };
  imageUrl?: string | null;
}

interface JobDetailsProps {
  darkMode: boolean;
}


const JobDetails: React.FC<JobDetailsProps> = ({ darkMode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showGuestApplicationModal, setShowGuestApplicationModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Handler to open signup modal and close guest modal
  const handleOpenSignup = () => {
    setShowGuestApplicationModal(false);
    setShowSignupModal(true);
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`https://jobquest-backend-36x6.onrender.com/api/jobs/${id}?t=${Date.now()}`);
      if (!response.ok) {
        throw new Error('Job not found');
      }
      const data = await response.json();
      setJob(data);
      console.log('Job fetched:', data);
    } catch (error) {
      console.error('Error fetching job details:', error);
      setError('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const downloadJobPoster = async () => {
    if (!job?.imageUrl) return;
    
    try {
      const imageUrl = job.imageUrl.startsWith('http') 
        ? job.imageUrl 
        : `https://jobquest-backend-36x6.onrender.com${job.imageUrl}`;
      
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const jobTitle = job.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const companyName = (job.company?.name || job.companyName || 'company').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const extension = job.imageUrl.split('.').pop() || 'jpg';
      
      link.download = `${jobTitle}_${companyName}_job_poster.${extension}`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading job poster:', error);
      alert('Failed to download job poster. Please try again.');
    }
  };

  const handleApplyNow = () => {
    console.log('Apply button clicked - user:', user ? 'logged in' : 'not logged in');
    if (user) {
      // User is logged in, show the email modal
      console.log('Setting showEmailModal to true');
      setShowEmailModal(true);
    } else {
      // User is not logged in, show guest application modal
      console.log('Setting showGuestApplicationModal to true');
      setShowGuestApplicationModal(true);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Email copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Email copied to clipboard!');
    }
  };

  const saveApplication = async (applicationMethod: string, emailSubject: string, emailBody: string) => {
    if (!user || !job) return;
    
    try {
      setSaving(true);
      
      const applicationData = {
        jobId: job.id,
        applicationMethod: applicationMethod,
        contactEmail: job.link,
        emailSubject: decodeURIComponent(emailSubject),
        emailBody: decodeURIComponent(emailBody)
      };

      const response = await applicationsAPI.createApplication(applicationData);
      console.log('Application saved successfully:', response);
      
    } catch (error: any) {
      console.error('Error saving application:', error);
      // Handle error (e.g., duplicate application)
      if (error.message.includes('already applied')) {
        console.log('User has already applied for this job');
      }
    } finally {
      setSaving(false);
    }
  };

  const openOutlook = async () => {
    if (job?.link) {
      const subject = encodeURIComponent(`Application for ${job.title} position`);
      const body = encodeURIComponent(
        `Dear Hiring Manager,

I am writing to express my interest in the ${job.title} position at ${job.company?.name || job.companyName}.

I have attached my resume and cover letter for your review. I would welcome the opportunity to discuss how my skills and experience align with your needs.

Thank you for your consideration.

Best regards,
[Your Name]`
      );
      
      // Save application to database
      await saveApplication('outlook', subject, body);
      
      const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(job.link)}&subject=${subject}&body=${body}`;
      window.open(outlookUrl, '_blank');
      setShowEmailModal(false);
    }
  };

  const openGmail = async () => {
    if (job?.link) {
      const subject = encodeURIComponent(`Application for ${job.title} position`);
      const body = encodeURIComponent(
        `Dear Hiring Manager,

I am writing to express my interest in the ${job.title} position at ${job.company?.name || job.companyName}.

I have attached my resume and cover letter for your review. I would welcome the opportunity to discuss how my skills and experience align with your needs.

Thank you for your consideration.

Best regards,
[Your Name]`
      );
      
      // Save application to database
      await saveApplication('gmail', subject, body);
      
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(job.link)}&subject=${subject}&body=${body}`;
      window.open(gmailUrl, '_blank');
      setShowEmailModal(false);
    }
  };

  const openEmailClient = async () => {
    if (job?.link) {
      const subject = encodeURIComponent(`Application for ${job.title} position`);
      const body = encodeURIComponent(
        `Dear Hiring Manager,

I am writing to express my interest in the ${job.title} position at ${job.company?.name || job.companyName}.

I have attached my resume and cover letter for your review. I would welcome the opportunity to discuss how my skills and experience align with your needs.

Thank you for your consideration.

Best regards,
[Your Name]`
      );
      
      // Save application to database
      await saveApplication('email_client', subject, body);
      
      const mailtoLink = `mailto:${job.link}?subject=${subject}&body=${body}`;
      window.location.href = mailtoLink;
      setShowEmailModal(false);
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

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate(-1)}
            className={`mb-6 flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
              darkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          
          <div className="text-center py-16">
            <h1 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Job Not Found
            </h1>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              The job you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className={`mb-6 flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
            darkMode 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Job Header */}
        <div className={`rounded-lg p-8 mb-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          {/* Job Title and Company Above Image */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {job.title}
              </h1>
              <div className="flex items-center space-x-2">
                <Building className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {job.company?.name || job.companyName}
                </span>
              </div>
            </div>
            
            {/* Job Type Badge */}
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium dark:bg-blue-900/20 dark:text-blue-400">
              {job.jobType}
            </span>
          </div>

          {/* Job Poster Image - Large Display */}
          {job.imageUrl && (
            <div className="mb-8 relative">
              <div className="flex justify-center">
                <img
                  src={
                    job.imageUrl.startsWith('http') 
                      ? job.imageUrl 
                      : `https://jobquest-backend-36x6.onrender.com${job.imageUrl}`
                  }
                  alt="Job Poster"
                  className="w-full max-w-3xl h-auto rounded-lg shadow-lg object-contain bg-gray-100 dark:bg-gray-700"
                  style={{ minHeight: '400px', maxHeight: '600px' }}
                />
              </div>
              
              {/* Download Button - Positioned over the image */}
              <button
                onClick={downloadJobPoster}
                className="absolute top-4 right-4 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all duration-200 group"
                title="Download Job Poster"
              >
                <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          )}

          {/* Job Summary Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-blue-50'} border ${darkMode ? 'border-gray-600' : 'border-blue-100'}`}>
              <div className="flex items-center space-x-2">
                <MapPin className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Location</p>
                  <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {job.location} {job.isRemote && '(Remote)'}
                  </p>
                </div>
              </div>
            </div>

            {job.experienceLevel && (
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-green-50'} border ${darkMode ? 'border-gray-600' : 'border-green-100'}`}>
                <div className="flex items-center space-x-2">
                  <Clock className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Experience</p>
                    <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {job.experienceLevel}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {job.salary && (job.salary.min || job.salary.max) && (
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-purple-50'} border ${darkMode ? 'border-gray-600' : 'border-purple-100'}`}>
                <div className="flex items-center space-x-2">
                  <DollarSign className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Salary</p>
                    <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {job.salary.currency} {job.salary.min && job.salary.max 
                        ? `${Number(job.salary.min).toLocaleString()} - ${Number(job.salary.max).toLocaleString()}`
                        : job.salary.min 
                          ? `${Number(job.salary.min).toLocaleString()}+`
                          : job.salary.max
                            ? `Up to ${Number(job.salary.max).toLocaleString()}`
                            : 'Negotiable'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Application Deadline */}
            {job.applicationDeadline && getDeadlineInfo(job.applicationDeadline) && (
              <div className={`p-4 rounded-lg border ${
                getDeadlineInfo(job.applicationDeadline)?.isExpired
                  ? darkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'
                  : getDeadlineInfo(job.applicationDeadline)?.isUrgent
                  ? darkMode ? 'bg-orange-900/20 border-orange-700' : 'bg-orange-50 border-orange-200'
                  : darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center space-x-2">
                  <Clock className={`w-5 h-5 ${
                    getDeadlineInfo(job.applicationDeadline)?.isExpired
                      ? darkMode ? 'text-red-400' : 'text-red-600'
                      : getDeadlineInfo(job.applicationDeadline)?.isUrgent
                      ? darkMode ? 'text-orange-400' : 'text-orange-600'
                      : darkMode ? 'text-green-400' : 'text-green-600'
                  }`} />
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Application Deadline</p>
                    <p className={`font-medium ${
                      getDeadlineInfo(job.applicationDeadline)?.isExpired
                        ? darkMode ? 'text-red-300' : 'text-red-700'
                        : getDeadlineInfo(job.applicationDeadline)?.isUrgent
                        ? darkMode ? 'text-orange-300' : 'text-orange-700'
                        : darkMode ? 'text-green-300' : 'text-green-700'
                    }`}>
                      {getDeadlineInfo(job.applicationDeadline)?.text}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* View Details Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className={`w-full p-4 rounded-lg border-2 border-dashed transition-all duration-300 transform hover:scale-[1.02] ${
                showDetails 
                  ? darkMode 
                    ? 'border-blue-400 bg-blue-500/10' 
                    : 'border-blue-500 bg-blue-50'
                  : darkMode 
                    ? 'border-gray-600 bg-gray-700/30 hover:border-gray-500 hover:bg-gray-700/50' 
                    : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center space-x-3">
                <FileText className={`w-6 h-6 ${
                  showDetails 
                    ? darkMode ? 'text-blue-400' : 'text-blue-600'
                    : darkMode ? 'text-gray-400' : 'text-gray-600'
                }`} />
                <span className={`text-lg font-semibold ${
                  showDetails 
                    ? darkMode ? 'text-blue-400' : 'text-blue-600'
                    : darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {showDetails ? 'Hide Job Details' : 'View Job Details'}
                </span>
                <div className={`transition-transform duration-300 ${showDetails ? 'rotate-180' : 'rotate-0'}`}>
                  <ChevronDown className={`w-6 h-6 ${
                    showDetails 
                      ? darkMode ? 'text-blue-400' : 'text-blue-600'
                      : darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`} />
                </div>
              </div>
            </button>
          </div>

          {/* Expandable Job Details */}
          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
            showDetails ? 'max-h-[2000px] opacity-100 mb-8' : 'max-h-0 opacity-0'
          }`}>
            <div className={`rounded-lg p-6 ${darkMode ? 'bg-gray-700/30' : 'bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
              
              {/* Job Description */}
              {job.description && (
                <div className="mb-8">
                  <div className="flex items-center space-x-2 mb-4">
                    <FileText className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Job Description
                    </h3>
                  </div>
                  <div className={`prose max-w-none ${darkMode ? 'prose-invert' : ''}`}>
                    <p className={`text-base leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {job.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center space-x-2 mb-4">
                    <CheckCircle className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                    <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Requirements
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {job.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${darkMode ? 'bg-green-400' : 'bg-green-500'}`}></div>
                        <span className={`text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {requirement}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Responsibilities */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center space-x-2 mb-4">
                    <Target className={`w-5 h-5 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                    <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Key Responsibilities
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {job.responsibilities.map((responsibility, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${darkMode ? 'bg-orange-400' : 'bg-orange-500'}`}></div>
                        <span className={`text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {responsibility}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills */}
              {job.skills && job.skills.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center space-x-2 mb-4">
                    <Award className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Required Skills
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                          darkMode 
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' 
                            : 'bg-purple-100 text-purple-800 border border-purple-200'
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefits */}
              {job.benefits && job.benefits.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Award className={`w-5 h-5 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`} />
                    <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Benefits & Perks
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {job.benefits.map((benefit, index) => (
                      <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg ${darkMode ? 'bg-gray-600/30' : 'bg-white'} border ${darkMode ? 'border-gray-600' : 'border-gray-100'}`}>
                        <CheckCircle className={`w-4 h-4 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`} />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Job Details Section */}
          {/* Apply Button */}
          <div className="flex justify-center">
            <button
              onClick={handleApplyNow}
              className={`px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                !saving
                  ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:from-blue-700 hover:to-teal-700' 
                  : 'bg-gray-400 text-white cursor-not-allowed'
              } ${saving ? 'opacity-75' : ''}`}
              disabled={saving}
            >
              <div className="flex items-center justify-center space-x-2">
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving Application...</span>
                  </>
                ) : (
                  <>
                    <span>Send Application</span>
                    <Mail className="w-4 h-4" />
                  </>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Email Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-lg p-6 w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Send Application
                </h3>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Send to:
                  </label>
                  <div className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {job?.link || <span className="text-red-500">No contact email found</span>}
                    </span>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Subject:
                  </label>
                  <div className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                    Application for {job.title} position
                  </div>
                </div>

                <div className="space-y-3">
                  {!job?.link && (
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'}`}>
                      <p className="text-sm">No contact email found for this job. Please contact the company directly.</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={openGmail}
                      disabled={!job?.link}
                      className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        darkMode 
                          ? 'bg-gray-700 border border-gray-600 text-gray-100 hover:bg-gray-600 disabled:hover:bg-gray-700' 
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:hover:bg-white'
                      }`}
                    >
                      <img 
                        src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico" 
                        alt="Gmail" 
                        className="w-5 h-5"
                        onError={(e) => {
                          // Fallback to a data URI Gmail logo if the external image fails
                          e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTI0IDVWMTlDMjQgMjAuMSAyMy4xIDIxIDIyIDIxSDJDMC45IDIxIDAgMjAuMSAwIDE5VjVDMCAzLjkgMC45IDMgMiAzSDIyQzIzLjEgMyAyNCAzLjkgMjQgNVoiIGZpbGw9IiNFQTQzMzUiLz4KPHBhdGggZD0iTTI0IDVIOC4yTDEyIDlMMTUuOCA1SDI0WiIgZmlsbD0iIzM0QTg1MyIvPgo8cGF0aCBkPSJNMCA1SDE1LjhMMTIgOUw4LjIgNUgwWiIgZmlsbD0iIzNCODhGRiIvPgo8cGF0aCBkPSJNOC4yIDVMMTIgOUwxNS44IDVWMTlIOC4yVjVaIiBmaWxsPSIjRkJCQzA0Ii8+Cjwvc3ZnPgo=";
                        }}
                      />
                      <span>Gmail</span>
                    </button>
                    
                    <button
                      onClick={openOutlook}
                      disabled={!job?.link}
                      className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        darkMode 
                          ? 'bg-gray-700 border border-gray-600 text-gray-100 hover:bg-gray-600 disabled:hover:bg-gray-700' 
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:hover:bg-white'
                      }`}
                    >
                      <img 
                        src="https://res.cdn.office.net/assets/mail/v1.9.3/icons/mail-16x.png" 
                        alt="Outlook" 
                        className="w-5 h-5"
                        onError={(e) => {
                          // Fallback to a data URI Outlook logo if the external image fails
                          e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIgM0gyMkMyMy4xIDMgMjQgMy45IDI0IDVWMTlDMjQgMjAuMSAyMy4xIDIxIDIyIDIxSDJDMC45IDIxIDAgMjAuMSAwIDE5VjVDMCAzLjkgMC45IDMgMiAzWiIgZmlsbD0iIzAwNzNEMiIvPgo8cGF0aCBkPSJNMTIgMTJMMjIgNUgyWkwxMiAxMloiIGZpbGw9IiNGRkZGRkYiLz4KPHBhdGggZD0iTTIgNUwxMiAxMkwyMiA1VjE5SDJWNVoiIGZpbGw9IiMwMDczRDIiLz4KPC9zdmc+";
                        }}
                      />
                      <span>Outlook</span>
                    </button>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={openEmailClient}
                      disabled={!job?.link}
                      className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        darkMode 
                          ? 'bg-gray-600 text-white disabled:hover:bg-gray-600' 
                          : 'bg-gray-600 text-white disabled:hover:bg-gray-600'
                      }`}
                    >
                      <Mail className="w-4 h-4" />
                      <span>Other App</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        const emailBody = `Job Title: ${job.title}\nCompany: ${job.company?.name || job.companyName}\nEmail: ${job.link}`;
                        copyToClipboard(emailBody);
                      }}
                      disabled={!job?.link}
                      className={`flex-1 px-3 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        darkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:hover:bg-gray-700' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:hover:bg-gray-100'
                      }`}
                    >
                      Copy Email
                    </button>
                  </div>
                </div>

                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <p className="mb-2">You can also manually compose an email with:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Attach your resume and cover letter</li>
                    <li>Include a personalized message</li>
                    <li>Mention where you found this job posting</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guest Application Modal - Only for non-logged-in users */}
        {job && !user && (
          <>
            <GuestApplicationModal
              isOpen={showGuestApplicationModal}
              onClose={() => setShowGuestApplicationModal(false)}
              onSignUp={handleOpenSignup}
              job={{
                id: job.id,
                title: job.title,
                company: job.company?.name || job.companyName || '',
                location: job.location,
                salary: job.salary && job.salary.min && job.salary.max 
                  ? `${job.salary.currency || ''} ${Number(job.salary.min).toLocaleString()} - ${Number(job.salary.max).toLocaleString()}`.trim()
                  : job.salary && job.salary.min 
                    ? `${job.salary.currency || ''} ${Number(job.salary.min).toLocaleString()}+`.trim()
                    : undefined,
                link: job.link
              }}
            />
            {showSignupModal && (
              <SignupModal
                onClose={() => setShowSignupModal(false)}
                darkMode={darkMode}
                onSwitchToSignIn={() => {}}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default JobDetails;

