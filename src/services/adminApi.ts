// API utility functions
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || 'Something went wrong');
  }

  return response.json();
};

// Helper functions for different HTTP methods
const get = (endpoint: string, params?: Record<string, string | number | boolean>) => {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }
  return apiRequest(url.pathname + url.search);
};

const patch = (endpoint: string, data?: any) => apiRequest(endpoint, {
  method: 'PATCH',
  body: data ? JSON.stringify(data) : undefined,
});

// Admin Dashboard
export const getAdminDashboard = async () => {
  try {
    const response = await get('/api/admin/dashboard');
    return response;
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    throw error;
  }
};

// Admin Permissions
export const getAdminPermissions = async () => {
  try {
    const response = await get('/api/admin/permissions');
    return response;
  } catch (error) {
    console.error('Get admin permissions error:', error);
    throw error;
  }
};

// User Management
export const getUsers = async (params: Record<string, string | number | boolean> = {}) => {
  try {
    const response = await get('/api/admin/users', params);
    return response;
  } catch (error) {
    console.error('Get users error:', error);
    throw error;
  }
};

export const getUserDetails = async (userId: string) => {
  try {
    const response = await get(`/api/admin/users/${userId}`);
    return response;
  } catch (error) {
    console.error('Get user details error:', error);
    throw error;
  }
};

export const updateUserStatus = async (userId: string, isActive: boolean) => {
  try {
    const response = await patch(`/api/admin/users/${userId}/status`, { isActive });
    return response;
  } catch (error) {
    console.error('Update user status error:', error);
    throw error;
  }
};

export const updateUserRole = async (userId: string, role: 'user' | 'employer' | 'admin' | 'super_admin') => {
  try {
    const response = await patch(`/api/admin/users/${userId}/role`, { role });
    return response;
  } catch (error) {
    console.error('Update user role error:', error);
    throw error;
  }
};

// Job Management
export const getAdminJobs = async (params: Record<string, string | number | boolean> = {}) => {
  try {
    const response = await get('/api/admin/jobs', params);
    return response;
  } catch (error) {
    console.error('Get admin jobs error:', error);
    throw error;
  }
};

export const updateJobStatus = async (jobId: string, status: 'pending' | 'active' | 'rejected' | 'expired') => {
  try {
    const response = await patch(`/api/admin/jobs/${jobId}/status`, { status });
    return response;
  } catch (error) {
    console.error('Update job status error:', error);
    throw error;
  }
};

// Company Management
export const getAdminCompanies = async (params: Record<string, string | number | boolean> = {}) => {
  try {
    const response = await get('/api/admin/companies', params);
    return response;
  } catch (error) {
    console.error('Get admin companies error:', error);
    throw error;
  }
};

export const updateCompanyVerification = async (companyId: string, isVerified: boolean) => {
  try {
    const response = await patch(`/api/admin/companies/${companyId}/verify`, { isVerified });
    return response;
  } catch (error) {
    console.error('Update company verification error:', error);
    throw error;
  }
};

// Guest Application Management
export const getGuestApplications = async (params: Record<string, string | number | boolean> = {}) => {
  try {
    const response = await get('/api/admin/guest-applications', params);
    return response;
  } catch (error) {
    console.error('Get guest applications error:', error);
    throw error;
  }
};

export const getGuestApplicationStats = async () => {
  try {
    const response = await get('/api/admin/guest-applications/stats');
    return response;
  } catch (error) {
    console.error('Get guest application stats error:', error);
    throw error;
  }
};

export const updateGuestApplicationStatus = async (
  applicationId: string, 
  status: 'pending' | 'reviewed' | 'rejected' | 'accepted',
  notes?: string
) => {
  try {
    const response = await patch(`/api/admin/guest-applications/${applicationId}/status`, { 
      status, 
      notes 
    });
    return response;
  } catch (error) {
    console.error('Update guest application status error:', error);
    throw error;
  }
};

export const deleteGuestApplication = async (applicationId: string) => {
  try {
    const response = await apiRequest(`/api/admin/guest-applications/${applicationId}`, {
      method: 'DELETE'
    });
    return response;
  } catch (error) {
    console.error('Delete guest application error:', error);
    throw error;
  }
};

export const downloadGuestApplicationsCSV = async () => {
  try {
    const token = localStorage.getItem('jobquest_token');
    
    const response = await fetch(`${API_BASE_URL}/api/admin/guest-applications/export/csv`, {
      method: 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Failed to download CSV');
    }

    // Get the CSV content
    const csvContent = await response.text();
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Generate filename with current date
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `guest-applications-${timestamp}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up URL
    URL.revokeObjectURL(url);
    
    return { success: true, filename };
  } catch (error) {
    console.error('Download guest applications CSV error:', error);
    throw error;
  }
};