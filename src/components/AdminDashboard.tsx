import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Briefcase, 
  Building, 
  Shield,
  TrendingUp,
  AlertCircle,
  UserPlus,
  Mail,
  Trash2,
  MessageSquare,
  Reply,
  X
} from 'lucide-react';
import { getAdminDashboard } from '../services/adminApi';
import { newsletterAPI, contactAPI } from '../services/api';

interface DashboardStats {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
    inactive: number;
  };
  jobs: {
    total: number;
    active: number;
    pending: number;
    expired: number;
  };
  companies: {
    total: number;
    verified: number;
    pending: number;
    unverified: number;
  };
  guestApplications: {
    total: number;
    pending: number;
    newThisMonth: number;
    processed: number;
  };
}

interface RecentActivity {
  users: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    createdAt: string;
    isActive: boolean;
  }>;
  jobs: Array<{
    _id: string;
    title: string;
    company: {
      _id: string;
      name: string;
    };
    status: string;
    createdAt: string;
  }>;
  guestApplications: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    jobTitle: string;
    companyName: string;
    status: string;
    appliedAt: string;
  }>;
}

interface AdminDashboardProps {
  darkMode: boolean;
}

interface Contact {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  reply?: string;
  createdAt: string;
  repliedAt?: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ darkMode }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [loadingNewsletter, setLoadingNewsletter] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactStats, setContactStats] = useState<any>(null);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [contactFilter, setContactFilter] = useState<'new' | 'all'>('new');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await getAdminDashboard();
        setStats(data.statistics);
        setRecentActivity(data.recentActivity);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchNewsletterData = async () => {
      try {
        setLoadingNewsletter(true);
        const data = await newsletterAPI.getSubscribers();
        setSubscribers(data.subscribers || []);
        setSubscriberCount(data.totalSubscribers || 0);
      } catch (err: any) {
        console.error('Failed to load newsletter subscribers:', err);
        console.error('Error details:', err.message);
        // Silently fail - newsletter is optional feature
      } finally {
        setLoadingNewsletter(false);
      }
    };

    const fetchContactsData = async () => {
      try {
        setLoadingContacts(true);
        const [contactsData, statsData] = await Promise.all([
          contactAPI.getContacts('new', 1, 10),
          contactAPI.getContactStats()
        ]);
        setContacts(contactsData.contacts || []);
        setContactStats(statsData);
      } catch (err: any) {
        console.error('Failed to load contacts:', err);
        // Silently fail - contact system is optional feature
      } finally {
        setLoadingContacts(false);
      }
    };

    fetchDashboardData();
    fetchNewsletterData();
    fetchContactsData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 rounded-lg border ${
        darkMode 
          ? 'bg-red-900/20 border-red-800 text-red-300' 
          : 'bg-red-50 border-red-200 text-red-700'
      }`}>
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users.total || 0,
      icon: Users,
      color: 'blue',
      subtitle: `${stats?.users.active || 0} active`,
      change: `+${stats?.users.newThisMonth || 0} this month`
    },
    {
      title: 'Total Jobs',
      value: stats?.jobs.total || 0,
      icon: Briefcase,
      color: 'green',
      subtitle: `${stats?.jobs.active || 0} active`,
      change: `${stats?.jobs.pending || 0} pending approval`
    },
    {
      title: 'Companies',
      value: stats?.companies.total || 0,
      icon: Building,
      color: 'purple',
      subtitle: `${stats?.companies.verified || 0} verified`,
      change: `${stats?.companies.pending || 0} pending verification`
    },
    {
      title: 'Guest Applications',
      value: stats?.guestApplications.total || 0,
      icon: UserPlus,
      color: 'orange',
      subtitle: `${stats?.guestApplications.pending || 0} pending review`,
      change: `+${stats?.guestApplications.newThisMonth || 0} this month`
    },
    {
      title: 'Newsletter Subscribers',
      value: subscriberCount,
      icon: Mail,
      color: 'indigo',
      subtitle: 'Active subscribers',
      change: 'Connected for updates'
    },
    {
      title: 'Contact Messages',
      value: contactStats?.total || 0,
      icon: MessageSquare,
      color: 'rose',
      subtitle: `${contactStats?.new || 0} new`,
      change: `${contactStats?.replied || 0} replied`
    },
    {
      title: 'System Health',
      value: '99.9%',
      icon: Shield,
      color: 'emerald',
      subtitle: 'Uptime',
      change: 'All systems operational'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: darkMode 
        ? 'bg-blue-900/20 border-blue-800 text-blue-300' 
        : 'bg-blue-50 border-blue-200 text-blue-700',
      green: darkMode 
        ? 'bg-green-900/20 border-green-800 text-green-300' 
        : 'bg-green-50 border-green-200 text-green-700',
      purple: darkMode 
        ? 'bg-purple-900/20 border-purple-800 text-purple-300' 
        : 'bg-purple-50 border-purple-200 text-purple-700',
      orange: darkMode 
        ? 'bg-orange-900/20 border-orange-800 text-orange-300' 
        : 'bg-orange-50 border-orange-200 text-orange-700',
      indigo: darkMode 
        ? 'bg-indigo-900/20 border-indigo-800 text-indigo-300' 
        : 'bg-indigo-50 border-indigo-200 text-indigo-700',
      rose: darkMode 
        ? 'bg-rose-900/20 border-rose-800 text-rose-300' 
        : 'bg-rose-50 border-rose-200 text-rose-700',
      emerald: darkMode 
        ? 'bg-emerald-900/20 border-emerald-800 text-emerald-300' 
        : 'bg-emerald-50 border-emerald-200 text-emerald-700'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-2 pt-0"> {/* Removed top padding */}
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-1">
        <div>
          <h1 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Admin Dashboard
          </h1>
          <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Platform overview and management
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">
          <TrendingUp className={`w-3 h-3 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
          <span className={`text-xs font-medium ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
            Platform is growing
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`p-2 lg:p-3 rounded border ${getColorClasses(card.color)} hover:shadow-lg transition-all duration-200`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium opacity-80 truncate">{card.title}</p>
                  <p className="text-lg lg:text-xl font-bold mt-1">{card.value.toLocaleString()}</p>
                  <p className="text-xs mt-1 opacity-70 truncate">{card.subtitle}</p>
                </div>
                <Icon className="w-5 h-5 lg:w-6 lg:h-6 opacity-80 flex-shrink-0 ml-2" />
              </div>
              <div className="mt-1 lg:mt-2 pt-1 lg:pt-2 border-t border-current/20">
                <p className="text-xs opacity-70 truncate">{card.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
        {/* Recent Users */}
        <div className={`p-3 rounded-lg border ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Recent Users
          </h3>
          <div className="space-y-2">
            {recentActivity?.users.slice(0, 5).map((user) => (
              <div key={user._id || user.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium text-xs">
                      {user.firstName?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`font-medium text-xs truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {user.firstName} {user.lastName}
                    </p>
                    <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                    user.role === 'admin' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                      : user.role === 'employer'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {user.role}
                  </span>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {(!recentActivity?.users || recentActivity.users.length === 0) && (
              <p className={`text-sm text-center py-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No recent users found
              </p>
            )}
          </div>
        </div>

        {/* Recent Jobs */}
        <div className={`p-3 rounded-lg border ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Recent Jobs
          </h3>
          <div className="space-y-2">
            {recentActivity?.jobs.slice(0, 5).map((job) => (
              <div key={job._id || job.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {job.title}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {job.company?.name || 'Unknown Company'}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    job.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                      : job.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {job.status}
                  </span>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {(!recentActivity?.jobs || recentActivity.jobs.length === 0) && (
              <p className={`text-sm text-center py-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No recent jobs found
              </p>
            )}
          </div>
        </div>

        {/* Recent Guest Applications */}
        <div className={`p-3 rounded-lg border ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Recent Guest Applications
          </h3>
          <div className="space-y-2">
            {recentActivity?.guestApplications?.slice(0, 5).map((application) => (
              <div key={application._id || application.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-7 h-7 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium text-xs">
                      {application.firstName?.charAt(0) || 'G'}{application.lastName?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`font-medium text-xs truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {application.firstName} {application.lastName}
                    </p>
                    <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Applied for {application.jobTitle} at {application.companyName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    application.status === 'accepted'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                      : application.status === 'rejected'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                      : application.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {application.status}
                  </span>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {new Date(application.appliedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {(!recentActivity?.guestApplications || recentActivity.guestApplications.length === 0) && (
              <p className={`text-sm text-center py-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No recent guest applications found
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Newsletter Subscribers Section */}
      <div className={`p-3 rounded-lg border ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <Mail className="w-4 h-4" />
          Newsletter Subscribers ({subscriberCount})
        </h3>
        {loadingNewsletter ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : subscribers.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {subscribers.slice(0, 10).map((subscriber) => (
              <div key={subscriber._id || subscriber.id} className="flex items-center justify-between gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {subscriber.email}
                  </p>
                  <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Subscribed {new Date(subscriber.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={async () => {
                    if (confirm('Delete this subscriber?')) {
                      try {
                        await newsletterAPI.deleteSubscriber(subscriber._id);
                        setSubscribers(subscribers.filter(s => s._id !== subscriber._id));
                        setSubscriberCount(subscriberCount - 1);
                      } catch (err) {
                        console.error('Failed to delete subscriber:', err);
                      }
                    }
                  }}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className={`text-sm text-center py-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No newsletter subscribers yet
          </p>
        )}
      </div>

      {/* Contact Messages Section */}
      <div className={`p-3 rounded-lg border ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-sm font-semibold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <MessageSquare className="w-4 h-4" />
            Contact Messages ({contactStats?.total || 0})
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setContactFilter('new')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                contactFilter === 'new'
                  ? 'bg-blue-600 text-white'
                  : darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              New ({contactStats?.new || 0})
            </button>
            <button
              onClick={() => setContactFilter('all')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                contactFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
          </div>
        </div>

        {loadingContacts ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : contacts.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {contacts.map((contact) => (
              <div
                key={contact._id || contact.id}
                className={`p-2 rounded border cursor-pointer transition-colors ${
                  selectedContact?._id === contact._id
                    ? darkMode
                      ? 'bg-blue-900/20 border-blue-700'
                      : 'bg-blue-50 border-blue-300'
                    : darkMode
                    ? 'border-gray-700 hover:bg-gray-700/50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedContact(contact)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {contact.firstName} {contact.lastName}
                    </p>
                    <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {contact.subject}
                    </p>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      contact.status === 'new'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                        : contact.status === 'read'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                        : contact.status === 'replied'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {contact.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={`text-sm text-center py-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No contact messages found
          </p>
        )}

        {/* Selected Contact Detail */}
        {selectedContact && (
          <div className={`mt-4 p-3 rounded border ${
            darkMode
              ? 'bg-gray-700/50 border-gray-600'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Message Details
              </h4>
              <button
                onClick={() => setSelectedContact(null)}
                className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>From:</p>
                <p className={darkMode ? 'text-gray-200' : 'text-gray-900'}>
                  {selectedContact.firstName} {selectedContact.lastName}
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {selectedContact.email}
                  {selectedContact.phone && ` • ${selectedContact.phone}`}
                </p>
              </div>

              <div>
                <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Subject:</p>
                <p className={darkMode ? 'text-gray-200' : 'text-gray-900'}>{selectedContact.subject}</p>
              </div>

              <div>
                <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Message:</p>
                <p className={`${darkMode ? 'text-gray-200' : 'text-gray-900'} whitespace-pre-wrap`}>
                  {selectedContact.message}
                </p>
              </div>

              {selectedContact.reply && (
                <div className={`p-2 rounded ${darkMode ? 'bg-gray-600/50' : 'bg-white'}`}>
                  <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Our Reply:</p>
                  <p className={`${darkMode ? 'text-gray-200' : 'text-gray-900'} whitespace-pre-wrap`}>
                    {selectedContact.reply}
                  </p>
                </div>
              )}

              {!selectedContact.reply && selectedContact.status !== 'replied' && (
                <div>
                  <label className={`text-xs font-medium block mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Send Reply:
                  </label>
                  <textarea
                    value={replyingTo === selectedContact._id ? replyText : ''}
                    onChange={(e) => setReplyText(e.target.value)}
                    onClick={() => setReplyingTo(selectedContact._id)}
                    placeholder="Type your reply..."
                    className={`w-full px-2 py-1 rounded text-xs border ${
                      darkMode
                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none`}
                    rows={3}
                  />
                  {replyingTo === selectedContact._id && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={async () => {
                          if (!replyText.trim()) {
                            alert('Please type a reply');
                            return;
                          }
                          try {
                            await contactAPI.replyToContact(selectedContact._id, replyText);
                            setSelectedContact({
                              ...selectedContact,
                              reply: replyText,
                              status: 'replied'
                            });
                            setReplyText('');
                            setReplyingTo(null);
                            // Update contacts list
                            setContacts(contacts.map(c =>
                              c._id === selectedContact._id
                                ? { ...c, reply: replyText, status: 'replied' }
                                : c
                            ));
                          } catch (err) {
                            alert('Failed to send reply');
                            console.error(err);
                          }
                        }}
                        className="flex-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                      >
                        <Reply className="w-3 h-3 inline mr-1" />
                        Send Reply
                      </button>
                      <button
                        onClick={() => {
                          setReplyText('');
                          setReplyingTo(null);
                        }}
                        className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${
                          darkMode
                            ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-gray-600 dark:border-gray-500">
                <button
                  onClick={async () => {
                    if (confirm('Delete this message?')) {
                      try {
                        await contactAPI.deleteContact(selectedContact._id);
                        setContacts(contacts.filter(c => c._id !== selectedContact._id));
                        setSelectedContact(null);
                      } catch (err) {
                        alert('Failed to delete message');
                        console.error(err);
                      }
                    }
                  }}
                  className="flex-1 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-3 h-3 inline mr-1" />
                  Delete
                </button>
                <select
                  value={selectedContact.status}
                  onChange={async (e) => {
                    const newStatus = e.target.value;
                    try {
                      await contactAPI.updateContactStatus(selectedContact._id, newStatus);
                      setSelectedContact({
                        ...selectedContact,
                        status: newStatus as Contact['status']
                      });
                      setContacts(contacts.map(c =>
                        c._id === selectedContact._id
                          ? { ...c, status: newStatus as Contact['status'] }
                          : c
                      ));
                    } catch (err) {
                      alert('Failed to update status');
                      console.error(err);
                    }
                  }}
                  className={`flex-1 px-2 py-1 rounded text-xs border ${
                    darkMode
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-1 focus:ring-blue-500 focus:outline-none`}
                >
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;