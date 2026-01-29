const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://jobquest-backend-36x6.onrender.com';

// API utility functions
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('jobquest_token');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  console.log('🌐 API Request:', `${API_BASE_URL}${endpoint}`, 'Status:', response.status);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    console.error('🌐 API Error:', response.status, error);
    throw new Error(error.message || 'Something went wrong');
  }

  const result = await response.json();
  console.log('🌐 API Response:', result);
  return result;
};

// Auth API
export const authAPI = {
  signup: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    return apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  signin: async (credentials: { email: string; password: string }) => {
    return apiRequest('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  updateProfile: async (profileData: FormData) => {
    console.log('Sending profile update request');
    const token = localStorage.getItem('jobquest_token');
    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: profileData,
      credentials: 'include'
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Something went wrong');
    }
    
    return response.json();
  },

  socialAuth: async (socialData: {
    provider: string;
    socialId: string;
    email: string;
    firstName: string;
    lastName: string;
  }) => {
    return apiRequest('/api/auth/social', {
      method: 'POST',
      body: JSON.stringify(socialData),
    });
  },

  getCurrentUser: async () => {
    return apiRequest('/api/auth/me');
  },

  forgotPassword: async (email: string) => {
    return apiRequest('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, password: string) => {
    return apiRequest('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },
};

// Jobs API
export const jobsAPI = {
  getJobs: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    location?: string;
    category?: string;
    jobType?: string;
    experienceLevel?: string;
    remote?: boolean;
    featured?: boolean;
    sortBy?: string;
    sortOrder?: string;
  } = {}) => {
    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    return apiRequest(`/api/jobs?${queryString}`);
  },

  getFeaturedJobs: async () => {
    return apiRequest('/api/jobs/featured');
  },

  getJob: async (id: string) => {
    return apiRequest(`/api/jobs/${id}`);
  },

  createJob: async (jobData: any) => {
    return apiRequest('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  },

  applyToJob: async (jobId: string, applicationData: { coverLetter?: string }) => {
    return apiRequest(`/api/jobs/${jobId}/apply`, {
      method: 'PUT',
      body: JSON.stringify(applicationData),
    });
  },

  saveJob: async (jobId: string) => {
    return apiRequest(`/api/jobs/${jobId}/save`, {
      method: 'PUT',
    });
  },

  getCategoryStats: async () => {
    return apiRequest('/api/jobs/categories/stats');
  },
};

// Users API
export const usersAPI = {
  getProfile: async () => {
    return apiRequest('/api/users/profile');
  },

  updateProfile: async (profileData: FormData) => {
    const token = localStorage.getItem('jobquest_token');
    
    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: profileData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Something went wrong');
    }

    return response.json();
  },

  getSavedJobs: async () => {
    return apiRequest('/api/users/saved-jobs');
  },

  saveJob: async (jobId: string) => {
    return apiRequest(`/api/users/save-job/${jobId}`, {
      method: 'POST',
    });
  },

  unsaveJob: async (jobId: string) => {
    return apiRequest(`/api/users/unsave-job/${jobId}`, {
      method: 'DELETE',
    });
  },

  getAppliedJobs: async () => {
    return apiRequest('/api/users/applied-jobs');
  },

  updatePreferences: async (preferences: {
    jobAlerts?: boolean;
    newsletter?: boolean;
    darkMode?: boolean;
  }) => {
    return apiRequest('/api/users/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  },

  deleteAccount: async () => {
    return apiRequest('/api/users/account', {
      method: 'DELETE',
    });
  },
};

// Companies API
export const companiesAPI = {
  getCompanies: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    industry?: string;
    size?: string;
    featured?: boolean;
  } = {}) => {
    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    return apiRequest(`/api/companies?${queryString}`);
  },

  getFeaturedCompanies: async () => {
    return apiRequest('/api/companies/featured');
  },

  getCompany: async (id: string) => {
    return apiRequest(`/api/companies/${id}`);
  },

  getCompanyJobs: async (id: string, params: { page?: number; limit?: number } = {}) => {
    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        // Only include the parameter if it has a valid value
        if (typeof value === 'number') {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    return apiRequest(`/api/companies/${id}/jobs?${queryString}`);
  },

  followCompany: async (id: string) => {
    return apiRequest(`/api/companies/${id}/follow`, {
      method: 'PUT',
    });
  },
};

// Applications API
export const applicationsAPI = {
  // Create a new application
  createApplication: async (applicationData: {
    jobId: string;
    applicationMethod: string;
    contactEmail?: string;
    emailSubject?: string;
    emailBody?: string;
    notes?: string;
  }) => {
    return apiRequest('/api/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  },

  // Get user's applications
  getApplications: async (params: {
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  } = {}) => {
    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    return apiRequest(`/api/applications?${queryString}`);
  },

  // Get a specific application
  getApplication: async (id: string) => {
    return apiRequest(`/api/applications/${id}`);
  },

  // Update application status and notes
  updateApplication: async (id: string, updateData: {
    status?: string;
    notes?: string;
  }) => {
    return apiRequest(`/api/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  // Delete an application
  deleteApplication: async (id: string) => {
    return apiRequest(`/api/applications/${id}`, {
      method: 'DELETE',
    });
  },

  // Get application statistics
  getApplicationStats: async () => {
    return apiRequest('/api/applications/stats/summary');
  },
};

// Newsletter API
export const newsletterAPI = {
  subscribe: async (email: string) => {
    return apiRequest('/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  getSubscribers: async () => {
    return apiRequest('/api/newsletter/subscribers', {
      method: 'GET',
    });
  },

  getSubscriberCount: async () => {
    return apiRequest('/api/newsletter/subscribers/count', {
      method: 'GET',
    });
  },

  unsubscribe: async (email: string) => {
    return apiRequest('/api/newsletter/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  deleteSubscriber: async (id: string) => {
    return apiRequest(`/api/newsletter/subscribers/${id}`, {
      method: 'DELETE',
    });
  },
};

// Contact API
export const contactAPI = {
  submitContact: async (contactData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) => {
    return apiRequest('/api/contact/submit', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  },

  getContacts: async (status?: string, page = 1, limit = 10) => {
    let url = `/api/contact?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    return apiRequest(url, {
      method: 'GET',
    });
  },

  getContactStats: async () => {
    return apiRequest('/api/contact/stats/summary', {
      method: 'GET',
    });
  },

  getContactDetail: async (id: string) => {
    return apiRequest(`/api/contact/${id}`, {
      method: 'GET',
    });
  },

  replyToContact: async (id: string, reply: string) => {
    return apiRequest(`/api/contact/${id}/reply`, {
      method: 'PUT',
      body: JSON.stringify({ reply }),
    });
  },

  updateContactStatus: async (id: string, status: string) => {
    return apiRequest(`/api/contact/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  deleteContact: async (id: string) => {
    return apiRequest(`/api/contact/${id}`, {
      method: 'DELETE',
    });
  },
};

// Utility functions
export const setAuthToken = (token: string) => {
  localStorage.setItem('jobquest_token', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('jobquest_token');
};

export const getAuthToken = () => {
  return localStorage.getItem('jobquest_token');
};