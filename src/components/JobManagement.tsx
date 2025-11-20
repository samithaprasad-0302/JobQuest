import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Star,
  Search,
  X,
  Save
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company?: {
    id: string;
    name: string;
    logo: string;
    location: string;
  };
  Company?: {
    id: string;
    name: string;
    logo: string;
    location: string;
    size?: string;
    rating?: number;
  };
  companyName?: string;
  companyId?: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  location: string;
  isRemote: boolean;
  jobType: string;
  experienceLevel?: string;
  salary: {
    min: number;
    max: number;
    currency: string;
    period?: string;
  };
  benefits: string[];
  category: string;
  status: string;
  featured: boolean;
  urgent: boolean;
  applicationDeadline?: string;
  link?: string;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  applicationCount?: number;
  postedByUser?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  image?: string | {
    filename: string;
    originalName: string;
    path: string;
    uploadDate: string;
  };
}

interface JobManagementProps {
  darkMode: boolean;
}

const JobManagement: React.FC<JobManagementProps> = ({ darkMode }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    description: '',
    requirements: [''],
    responsibilities: [''],
    skills: [''],
    location: '',
    isRemote: false,
    jobType: '',
    experienceLevel: '',
    salary: {
      min: '',
      max: '',
      currency: 'USD',
      period: 'yearly'
    },
    benefits: [''],
    category: '',
    featured: false,
    urgent: false,
    applicationDeadline: '',
    tags: [''],
    link: ''
  });

  const [jobImage, setJobImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const categories = [
    'technology', 'design', 'marketing', 'sales', 'finance', 
    'healthcare', 'education', 'engineering', 'hr', 'operations',
    'customer-service', 'legal', 'consulting', 'research', 'other'
  ];

  const jobTypes = ['full-time', 'part-time', 'contract', 'freelance', 'internship'];
  const experienceLevels = ['entry', 'mid', 'senior', 'executive'];
  const statuses = ['draft', 'active', 'paused', 'closed', 'expired'];

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('jobquest_token');
      const response = await fetch('http://localhost:5000/api/jobs/admin', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data = await response.json();
      setJobs(data.jobs);
    } catch (err) {
      setError('Failed to load jobs');
      console.error('Fetch jobs error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).map((item: string, i: number) => 
        i === index ? value : item
      )
    }));
  };

  const addArrayItem = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field as keyof typeof prev] as string[]), '']
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter((_: any, i: number) => i !== index)
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      setJobImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setJobImage(null);
    setImagePreview(null);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      companyName: '',
      description: '',
      requirements: [''],
      responsibilities: [''],
      skills: [''],
      location: '',
      isRemote: false,
      jobType: '',
      experienceLevel: '',
      salary: {
        min: '',
        max: '',
        currency: 'USD',
        period: 'yearly'
      },
      benefits: [''],
      category: '',
      featured: false,
      urgent: false,
      applicationDeadline: '',
      tags: [''],
      link: ''
    });
    setJobImage(null);
    setImagePreview(null);
    setEditingJob(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Form submitted with data:', formData);
    
    try {
      const token = localStorage.getItem('jobquest_token');
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add all form fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('companyName', formData.companyName);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('isRemote', formData.isRemote.toString());
      formDataToSend.append('jobType', formData.jobType);
      
      // Only include experience level if it has a value
      if (formData.experienceLevel) {
        formDataToSend.append('experienceLevel', formData.experienceLevel);
      }
      
      formDataToSend.append('category', formData.category);
      formDataToSend.append('featured', formData.featured.toString());
      formDataToSend.append('urgent', formData.urgent.toString());
      
      // Add salary data (only if values are provided)
      const salaryData = {
        min: formData.salary.min || '',
        max: formData.salary.max || '',
        currency: formData.salary.currency
      };
      
      // Only include salary if at least one field has a value
      if (salaryData.min || salaryData.max) {
        formDataToSend.append('salary', JSON.stringify(salaryData));
      }
      
      // Add arrays (filter out empty strings)
      const cleanRequirements = formData.requirements.filter(req => req.trim());
      const cleanResponsibilities = formData.responsibilities.filter(resp => resp.trim());
      const cleanSkills = formData.skills.filter(skill => skill.trim());
      const cleanBenefits = formData.benefits.filter(benefit => benefit.trim());
      const cleanTags = formData.tags.filter(tag => tag.trim());
      
      formDataToSend.append('requirements', JSON.stringify(cleanRequirements));
      formDataToSend.append('responsibilities', JSON.stringify(cleanResponsibilities));
      formDataToSend.append('skills', JSON.stringify(cleanSkills));
      formDataToSend.append('benefits', JSON.stringify(cleanBenefits));
      formDataToSend.append('tags', JSON.stringify(cleanTags));
      
      if (formData.applicationDeadline) {
        formDataToSend.append('applicationDeadline', formData.applicationDeadline);
      }

      // Add link field
      if (formData.link) {
        formDataToSend.append('link', formData.link);
      }

      // Add image if selected
      if (jobImage) {
        formDataToSend.append('jobImage', jobImage);
      }

      const url = editingJob 
        ? `http://localhost:5000/api/jobs/admin/${editingJob.id}`
        : 'http://localhost:5000/api/jobs/admin';
      
      const method = editingJob ? 'PUT' : 'POST';

      console.log('📡 Making request to:', url, 'with method:', method);
      console.log('📦 Form data being sent:', {
        title: formData.title,
        companyName: formData.companyName,
        link: formData.link,
        hasImage: !!jobImage
      });

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type header, let browser set it for FormData
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('❌ Server response error:', response.status, errorData);
        throw new Error(errorData.message || (editingJob ? 'Failed to update job' : 'Failed to create job'));
      }

      console.log('✅ Job created/updated successfully');
      await fetchJobs();
      setShowCreateForm(false);
      setEditingJob(null);
      resetForm();
    } catch (err: any) {
      console.error('❌ Form submission error:', err);
      setError(err.message || (editingJob ? 'Failed to update job' : 'Failed to create job'));
      console.error('Submit job error:', err);
    }
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      companyName: job.Company?.name || job.company?.name || job.companyName || '',
      description: job.description,
      requirements: job.requirements.length ? job.requirements : [''],
      responsibilities: job.responsibilities.length ? job.responsibilities : [''],
      skills: job.skills.length ? job.skills : [''],
      location: job.location,
      isRemote: job.isRemote,
      jobType: job.jobType,
      experienceLevel: job.experienceLevel || '',
      salary: {
        min: job.salary?.min?.toString() || '',
        max: job.salary?.max?.toString() || '',
        currency: job.salary?.currency || 'USD',
        period: job.salary?.period || 'yearly'
      },
      benefits: job.benefits.length ? job.benefits : [''],
      category: job.category,
      featured: job.featured,
      urgent: job.urgent,
      applicationDeadline: job.applicationDeadline ? job.applicationDeadline.split('T')[0] : '',
      tags: job.tags.length ? job.tags : [''],
      link: job.link || ''
    });
    
    // Handle existing job image
    if (job.image) {
      if (typeof job.image === 'string') {
        setImagePreview(`http://localhost:5000${job.image}`);
      } else {
        setImagePreview(`http://localhost:5000/api/uploads/jobs/${job.image.filename}`);
      }
    }
    
    setShowCreateForm(true);
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      const token = localStorage.getItem('jobquest_token');
      const response = await fetch(`http://localhost:5000/api/jobs/admin/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete job');
      }

      await fetchJobs();
    } catch (err) {
      setError('Failed to delete job');
      console.error('Delete job error:', err);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || job.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Job Management
        </h1>
        <button
          onClick={() => {
            setShowCreateForm(true);
            setEditingJob(null);
            resetForm();
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Job
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className={`p-4 rounded-lg border mb-6 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search jobs..."
                className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCategoryFilter('all');
              }}
              className={`px-4 py-2 border rounded-lg transition-colors ${
                darkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Job List */}
      <div className={`rounded-lg border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Job
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Company
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Applications
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Created
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredJobs.map((job) => (
                <tr key={job.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {job.title}
                        {job.featured && (
                          <Star className="inline w-4 h-4 ml-2 text-yellow-500" />
                        )}
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <MapPin className="inline w-4 h-4 mr-1" />
                        {job.location} {job.isRemote && '(Remote)'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-sm mr-3">
                        {(job.company?.name || job.companyName || 'C').charAt(0).toUpperCase()}
                      </div>
                      <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {job.company?.name || job.companyName || 'Company'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      job.status === 'active' ? 'bg-green-100 text-green-800' :
                      job.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      job.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                      job.status === 'closed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {job.applicationCount || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(job.createdAt).toLocaleDateString('en-US', { 
                        timeZone: 'UTC',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(job)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Job Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowCreateForm(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <form onSubmit={handleSubmit} className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {editingJob ? 'Edit Job' : 'Create New Job'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className={`p-2 rounded-lg hover:bg-gray-100 ${darkMode ? 'hover:bg-gray-700' : ''}`}
                  >
                    <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Basic Information
                    </h3>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Job Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Company Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        placeholder="Enter company name"
                        className={`w-full px-3 py-2 border rounded-lg ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Job Post Image
                      </label>
                      <div className={`border-2 border-dashed rounded-lg p-4 ${
                        darkMode 
                          ? 'border-gray-600 bg-gray-700' 
                          : 'border-gray-300 bg-gray-50'
                      }`}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="job-image-upload"
                        />
                        <label
                          htmlFor="job-image-upload"
                          className={`cursor-pointer flex flex-col items-center justify-center py-4 ${
                            darkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}
                        >
                          {imagePreview ? (
                            <div className="relative">
                              <img
                                src={imagePreview}
                                alt="Job post preview"
                                className="max-w-full h-32 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={removeImage}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <>
                              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              <span className="text-sm">Click to upload job post image</span>
                              <span className="text-xs mt-1">PNG, JPG, GIF up to 5MB</span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Location *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isRemote"
                        checked={formData.isRemote}
                        onChange={(e) => handleInputChange('isRemote', e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="isRemote" className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Remote Position
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Job Type *
                        </label>
                        <select
                          required
                          value={formData.jobType}
                          onChange={(e) => handleInputChange('jobType', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="">Select Job Type</option>
                          {jobTypes.map(type => (
                            <option key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Experience Level
                        </label>
                        <select
                          value={formData.experienceLevel}
                          onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="">Select Experience Level (Optional)</option>
                          {experienceLevels.map(level => (
                            <option key={level} value={level}>
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Category *
                      </label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-4">
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Job Details
                    </h3>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Description *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>

                    {/* Salary */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Salary Range
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="number"
                          placeholder="Min Salary (Optional)"
                          value={formData.salary.min}
                          onChange={(e) => handleInputChange('salary.min', e.target.value)}
                          className={`px-3 py-2 border rounded-lg ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                        <input
                          type="number"
                          placeholder="Max Salary (Optional)"
                          value={formData.salary.max}
                          onChange={(e) => handleInputChange('salary.max', e.target.value)}
                          className={`px-3 py-2 border rounded-lg ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                        <select
                          value={formData.salary.currency}
                          onChange={(e) => handleInputChange('salary.currency', e.target.value)}
                          className={`px-3 py-2 border rounded-lg ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="USD">USD</option>
                          <option value="LKR">LKR</option>
                          <option value="INR">INR</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Application Deadline
                      </label>
                      <input
                        type="date"
                        value={formData.applicationDeadline}
                        onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Contact Email (Optional)
                      </label>
                      <input
                        type="email"
                        value={formData.link}
                        onChange={(e) => handleInputChange('link', e.target.value)}
                        placeholder="hr@company.com"
                        className={`w-full px-3 py-2 border rounded-lg ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="featured"
                          checked={formData.featured}
                          onChange={(e) => handleInputChange('featured', e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor="featured" className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Featured Job
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="urgent"
                          checked={formData.urgent}
                          onChange={(e) => handleInputChange('urgent', e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor="urgent" className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Urgent Hiring
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="mt-6">
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Required Skills
                  </label>
                  {formData.skills.map((skill, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => handleArrayChange('skills', index, e.target.value)}
                        className={`flex-1 px-3 py-2 border rounded-lg mr-2 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="e.g., React, TypeScript"
                      />
                      {formData.skills.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('skills', index)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('skills')}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Skill
                  </button>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4 mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                    }}
                    className={`px-4 py-2 border rounded-lg ${
                      darkMode
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingJob ? 'Update Job' : 'Create Job'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobManagement;

