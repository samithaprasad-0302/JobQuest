import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Phone, 
  Briefcase, 
  Building, 
  Calendar,
  ChevronDown,
  ChevronUp,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Filter,
  Search,
  Download
} from 'lucide-react';
import { 
  getGuestApplications, 
  updateGuestApplicationStatus, 
  deleteGuestApplication,
  downloadGuestApplicationsCSV
} from '../services/adminApi';

interface GuestApplication {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  jobId: string;
  jobTitle?: string;
  companyName?: string;
  coverLetter?: string;
  resume?: any;
  status: 'pending' | 'reviewed' | 'rejected';
  ipAddress?: string;
  userAgent?: string;
  appliedAt: string;
  createdAt: string;
  updatedAt: string;
  Job?: {
    id: string;
    title: string;
    category: string;
  };
}

interface GuestApplicationManagementProps {
  darkMode: boolean;
}

const GuestApplicationManagement: React.FC<GuestApplicationManagementProps> = ({ darkMode }) => {
  const [applications, setApplications] = useState<GuestApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // UI states
  const [expandedApplications, setExpandedApplications] = useState<Set<string>>(new Set());
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [downloadingCSV, setDownloadingCSV] = useState(false);

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'reviewed', label: 'Reviewed' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const statusStyles = {
    pending: { 
      bg: darkMode ? 'bg-yellow-900/20' : 'bg-yellow-100', 
      text: darkMode ? 'text-yellow-300' : 'text-yellow-800',
      icon: AlertCircle
    },
    reviewed: { 
      bg: darkMode ? 'bg-blue-900/20' : 'bg-blue-100', 
      text: darkMode ? 'text-blue-300' : 'text-blue-800',
      icon: Eye
    },
    rejected: { 
      bg: darkMode ? 'bg-red-900/20' : 'bg-red-100', 
      text: darkMode ? 'text-red-300' : 'text-red-800',
      icon: XCircle
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        page: currentPage,
        limit: 20
      };
      
      if (statusFilter) params.status = statusFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const response = await getGuestApplications(params);
      setApplications(response.applications || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalItems(response.pagination?.totalItems || 0);
    } catch (err) {
      console.error('Error fetching guest applications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch guest applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [currentPage, statusFilter, searchTerm]);

  const handleStatusUpdate = async (applicationId: string, newStatus: string, notes?: string) => {
    try {
      setUpdatingStatus(applicationId);
      await updateGuestApplicationStatus(applicationId, newStatus as any, notes);
      await fetchApplications(); // Refresh the list
    } catch (err) {
      console.error('Error updating application status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update application status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeleteApplication = async (applicationId: string) => {
    if (!confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteGuestApplication(applicationId);
      await fetchApplications(); // Refresh the list
    } catch (err) {
      console.error('Error deleting application:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete application');
    }
  };

  const handleDownloadCSV = async () => {
    try {
      setDownloadingCSV(true);
      setError(null);
      await downloadGuestApplicationsCSV();
      // Success message could be shown here, but the download should be obvious to the user
    } catch (err) {
      console.error('Error downloading CSV:', err);
      setError(err instanceof Error ? err.message : 'Failed to download CSV file');
    } finally {
      setDownloadingCSV(false);
    }
  };

  const toggleExpanded = (applicationId: string) => {
    const newExpanded = new Set(expandedApplications);
    if (newExpanded.has(applicationId)) {
      newExpanded.delete(applicationId);
    } else {
      newExpanded.add(applicationId);
    }
    setExpandedApplications(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error) {
    return (
      <div className={`p-6 rounded-lg border ${
        darkMode ? 'bg-red-900/20 border-red-800 text-red-300' : 'bg-red-50 border-red-200 text-red-800'
      }`}>
        <p className="font-medium">Error loading guest applications</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={() => {
            setError(null);
            fetchApplications();
          }}
          className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium ${
            darkMode 
              ? 'bg-red-800 hover:bg-red-700 text-white' 
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Guest Applications
          </h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage applications from guest users ({totalItems} total)
          </p>
        </div>
        
        {/* Download CSV Button */}
        <button
          onClick={handleDownloadCSV}
          disabled={downloadingCSV || totalItems === 0}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            darkMode
              ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-700'
              : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400'
          }`}
          title={totalItems === 0 ? 'No data to export' : 'Download all guest applications as CSV'}
        >
          <Download className="w-4 h-4" />
          <span>{downloadingCSV ? 'Downloading...' : 'Export CSV'}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`pl-10 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading guest applications...</p>
          </div>
        </div>
      ) : applications.length === 0 ? (
        <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No guest applications found</p>
          <p>Guest applications will appear here when users apply for jobs without creating accounts.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => {
            const isExpanded = expandedApplications.has(application.id);
            const StatusIcon = statusStyles[application.status].icon;
            
            return (
              <div
                key={application.id}
                className={`border rounded-lg p-4 transition-all ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Application Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center`}>
                        <span className="text-white font-medium text-sm">
                          {application.firstName.charAt(0)}{application.lastName.charAt(0)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {application.firstName} {application.lastName}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className={`flex items-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <Mail className="h-3 w-3 mr-1" />
                          {application.email}
                        </span>
                        {application.phone && (
                          <span className={`flex items-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <Phone className="h-3 w-3 mr-1" />
                            {application.phone}
                          </span>
                        )}
                        <span className={`flex items-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <Briefcase className="h-3 w-3 mr-1" />
                          {application.jobTitle || application.Job?.title || 'Job'}
                        </span>
                        <span className={`flex items-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <Building className="h-3 w-3 mr-1" />
                          {application.Company?.name || 'Company'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Status Badge */}
                    <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusStyles[application.status].bg} ${statusStyles[application.status].text}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>

                    {/* Applied Date */}
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {formatDate(application.appliedAt)}
                    </span>

                    {/* Toggle Button */}
                    <button
                      onClick={() => toggleExpanded(application.id)}
                      className={`p-1 rounded-lg transition-colors ${
                        darkMode 
                          ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                          : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Application Details */}
                      <div className="space-y-4">
                        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Application Details
                        </h4>
                        
                        {application.coverLetter && (
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Cover Letter
                            </label>
                            <div className={`p-3 rounded-lg text-sm ${
                              darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700'
                            }`}>
                              {application.coverLetter}
                            </div>
                          </div>
                        )}

                        {application.resume && (
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Resume
                            </label>
                            <a 
                              href={application.resume} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                            >
                              Download Resume
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="space-y-4">
                        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Actions
                        </h4>
                        
                        <div className="space-y-3">
                          {/* Status Update Buttons */}
                          <div className="grid grid-cols-2 gap-2">
                            {['reviewed', 'rejected'].map((status) => (
                              <button
                                key={status}
                                onClick={() => handleStatusUpdate(application.id, status)}
                                disabled={updatingStatus === application.id || application.status === status}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                  application.status === status
                                    ? statusStyles[status as keyof typeof statusStyles].bg + ' ' + statusStyles[status as keyof typeof statusStyles].text
                                    : darkMode
                                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {updatingStatus === application.id ? 'Updating...' : 
                                 status.charAt(0).toUpperCase() + status.slice(1)}
                              </button>
                            ))}
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteApplication(application.id)}
                            className={`w-full flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              darkMode
                                ? 'bg-red-900/20 text-red-300 hover:bg-red-900/30 border border-red-800'
                                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                            }`}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Application
                          </button>
                        </div>

                        {/* Timestamps */}
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                          <h5 className={`text-xs font-medium uppercase tracking-wider mb-2 ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            Details
                          </h5>
                          <div className="space-y-1 text-xs">
                            <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                              <span className="font-medium">Applied:</span> {formatDate(application.appliedAt)}
                            </div>
                            <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                              <span className="font-medium">Created:</span> {formatDate(application.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6">
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Showing {Math.min((currentPage - 1) * 20 + 1, totalItems)} to {Math.min(currentPage * 20, totalItems)} of {totalItems} applications
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Previous
            </button>
            
            <span className={`px-3 py-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestApplicationManagement;