import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Building,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  
  Search,
  
  ExternalLink,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { applicationsAPI } from '../services/api';

interface Application {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    company?: {
      _id: string;
      name: string;
      logo?: string;
    };
    companyName?: string;
    location: string;
    salary: {
      min: number;
      max: number;
      currency: string;
      period: string;
    };
    jobType: string;
    category: string;
    isRemote: boolean;
  };
  jobTitle: string;
  companyName: string;
  appliedAt: string;
  applicationMethod: string;
  status: string;
  contactEmail: string;
  notes?: string;
  lastUpdated: string;
}

interface ApplicationStats {
  total: number;
  applied: number;
  under_review: number;
  interview_scheduled: number;
  offered: number;
  rejected: number;
  withdrawn: number;
}

interface MyApplicationsProps {
  darkMode: boolean;
}

const MyApplications: React.FC<MyApplicationsProps> = ({ darkMode }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('appliedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user, filterStatus, sortBy, sortOrder, currentPage]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      console.log('🎯 Fetching applications...');
      console.log('🎯 User:', user);
      console.log('🎯 Token:', localStorage.getItem('jobquest_token'));
      
      const params = {
        status: filterStatus,
        sortBy: sortBy,
        sortOrder: sortOrder,
        page: currentPage,
        limit: 10
      };

      console.log('🎯 API params:', params);
      const data = await applicationsAPI.getApplications(params);
      console.log('🎯 API response:', data);
      setApplications(data.applications);
      setStats(data.statistics);
    } catch (error) {
      console.error('🎯 Error fetching applications:', error);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'interview_scheduled':
        return 'bg-purple-100 text-purple-800';
      case 'offered':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied':
        return <Clock className="w-4 h-4" />;
      case 'under_review':
        return <AlertCircle className="w-4 h-4" />;
      case 'interview_scheduled':
        return <Users className="w-4 h-4" />;
      case 'offered':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'withdrawn':
        return <ArrowLeft className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const formatSalary = (salary: any) => {
    if (!salary) return 'Not specified';
    const { min, max, currency, period } = salary;
    
    // Check if required values exist
    if (!min || !max || !currency) return 'Not specified';
    
    const formatNumber = (num: number) => {
      if (!num || typeof num !== 'number') return '0';
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
      return num.toString();
    };
    
    return `${currency}${formatNumber(min)} - ${currency}${formatNumber(max)}${period ? ` ${period}` : ''}`;
  };

  const getMethodDisplay = (method: string) => {
    switch (method) {
      case 'gmail':
        return 'Gmail';
      case 'outlook':
        return 'Outlook';
      case 'email_client':
        return 'Email Client';
      case 'external':
        return 'External';
      default:
        return method;
    }
  };

  const filteredApplications = applications.filter(app =>
    app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Please Sign In
          </h2>
          <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            You need to be signed in to view your applications.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Error Loading Applications
            </h1>
            <p className={`text-lg mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {error}
            </p>
            <button
              onClick={() => fetchApplications()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className={`mb-4 flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
              darkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          
          <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            My Applications
          </h1>
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Track and manage your job applications
          </p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.total}
                  </p>
                </div>
                <Briefcase className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Applied</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.applied}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Review</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.under_review}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
            </div>

            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Interview</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.interview_scheduled}
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Offered</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.offered}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rejected</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.rejected}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Withdrawn</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.withdrawn}
                  </p>
                </div>
                <ArrowLeft className="w-8 h-8 text-gray-600" />
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by job title or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">All Status</option>
                <option value="applied">Applied</option>
                <option value="under_review">Under Review</option>
                <option value="interview_scheduled">Interview Scheduled</option>
                <option value="offered">Offered</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="appliedAt-desc">Newest First</option>
                <option value="appliedAt-asc">Oldest First</option>
                <option value="jobTitle-asc">Job Title A-Z</option>
                <option value="jobTitle-desc">Job Title Z-A</option>
                <option value="companyName-asc">Company A-Z</option>
                <option value="companyName-desc">Company Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className={`text-center py-16 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <Briefcase className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {searchTerm || filterStatus !== 'all' ? 'No matching applications' : 'No applications yet'}
            </h3>
            <p className={`text-lg mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Start applying to jobs to see them here'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button
                onClick={() => navigate('/jobs')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Jobs
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <div
                key={application._id}
                className={`p-6 rounded-lg border transition-colors hover:shadow-md ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Job Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {/* Company Logo */}
                      <div className="flex-shrink-0">
                        {application.jobId?.company?.logo ? (
                          <img
                            src={application.jobId.company.logo}
                            alt={application.companyName}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            darkMode ? 'bg-gray-700' : 'bg-gray-100'
                          }`}>
                            <Building className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          </div>
                        )}
                      </div>

                      {/* Job Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-lg font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {application.jobTitle}
                        </h3>
                        
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center gap-1">
                            <Building className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {application.companyName}
                            </span>
                          </div>
                          
                          {application.jobId?.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {application.jobId.location}
                                {application.jobId.isRemote && ' (Remote)'}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              Applied {formatDate(application.appliedAt)}
                            </span>
                          </div>

                          {application.jobId?.salary && (
                            <div className="flex items-center gap-1">
                              <DollarSign className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {formatSalary(application.jobId.salary)}
                              </span>
                            </div>
                          )}

                          <span className={`px-2 py-1 rounded text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                            via {getMethodDisplay(application.applicationMethod)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex flex-col lg:items-end gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        {application.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/job/${application.jobId._id}`)}
                        className={`flex items-center gap-1 px-3 py-1 text-sm rounded border transition-colors ${
                          darkMode 
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Job
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {application.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <strong>Notes:</strong> {application.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {/* Pagination */}
            {filteredApplications.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    currentPage === 1
                      ? darkMode
                        ? 'border-gray-600 text-gray-500 cursor-not-allowed'
                        : 'border-gray-300 text-gray-400 cursor-not-allowed'
                      : darkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>

                <div className={`flex items-center gap-1`}>
                  {Array.from({ length: Math.ceil(applications.length / 10) }).map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-lg border transition-colors ${
                        currentPage === i + 1
                          ? 'bg-blue-600 text-white border-blue-600'
                          : darkMode
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= Math.ceil(applications.length / 10)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    currentPage >= Math.ceil(applications.length / 10)
                      ? darkMode
                        ? 'border-gray-600 text-gray-500 cursor-not-allowed'
                        : 'border-gray-300 text-gray-400 cursor-not-allowed'
                      : darkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;