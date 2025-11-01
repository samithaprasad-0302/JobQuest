import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../services/api';
import { getResumeUrl } from '../constants/api';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  FileText, 
  Save, 
  X,
  Edit3,
  Award
} from 'lucide-react';

interface MyProfileProps {
  darkMode: boolean;
  onClose: () => void;
}

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  skills: string[];
  experience: string;
  resume?: {
    filename: string;
    originalName: string;
    uploadDate: string;
  };
}

const MyProfile: React.FC<MyProfileProps> = ({ darkMode, onClose }) => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    skills: [],
    experience: 'entry'
  });
  const [newResume, setNewResume] = useState<File | null>(null);

  useEffect(() => {
    // Fetch fresh user data when component mounts
    const fetchUserData = async () => {
      try {
        console.log('🔄 MyProfile - Fetching fresh user data from database...');
        const response = await authAPI.getCurrentUser();
        console.log('🔄 MyProfile - Fresh user data from DB:', response.user);
        
        // Update the auth context with fresh data
        updateUser(response.user);
        
        // Set profile data with fresh data
        setProfileData({
          firstName: response.user.firstName || '',
          lastName: response.user.lastName || '',
          email: response.user.email || '',
          phone: response.user.phone || '',
          location: response.user.location || '',
          bio: response.user.bio || '',
          skills: response.user.skills || [],
          experience: response.user.experience || 'entry',
          resume: response.user.resume
        });
        console.log('✅ MyProfile - Profile data updated with fresh data');
      } catch (error) {
        console.error('❌ MyProfile - Error fetching user data:', error);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, []); // Only run once when component mounts

  // Also update when user context changes (for real-time updates)
  useEffect(() => {
    if (user) {
      console.log('🔍 MyProfile - User context updated:', user);
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        skills: user.skills || [],
        experience: user.experience || 'entry',
        resume: user.resume
      });
      console.log('🔍 MyProfile - Profile data set with fresh data');
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skillsArray = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill);
    setProfileData(prev => ({
      ...prev,
      skills: skillsArray
    }));
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewResume(file);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      const formData = new FormData();
      
      // Add text fields
      Object.entries(profileData).forEach(([key, value]) => {
        if (key === 'skills') {
          (value as string[]).forEach(skill => {
            formData.append('skills[]', skill);
          });
        } else if (key !== 'resume') {
          formData.append(key, value as string);
        }
      });

      // Add files if they exist
      if (newResume) {
        formData.append('resume', newResume);
      }

      const response = await authAPI.updateProfile(formData);
      console.log('📝 MyProfile - Profile update response:', response);
      
      // Update user context
      updateUser({
        ...user,
        ...profileData,
        resume: response.resume || profileData.resume
      });

      // IMPORTANT: Also update the local profileData state with the new data
      setProfileData(prev => ({
        ...prev,
        ...profileData,
        resume: response.resume || prev.resume
      }));

      setIsEditing(false);
      setNewResume(null);
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewResume(null);
    // Reset form data
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        skills: user.skills || [],
        experience: user.experience || 'entry',
        resume: user.resume
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className={`relative max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${
          darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        } rounded-t-2xl`}>
          <h2 className={`text-2xl font-bold ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            My Profile
          </h2>
          <div className="flex items-center space-x-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleCancel}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    darkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <X className="w-4 h-4 mr-2 inline" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* User Info Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="text-center">
              <h3 className={`text-xl font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {profileData.firstName} {profileData.lastName}
              </h3>
              <p className={`${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {profileData.email}
              </p>
            </div>
          </div>

          {/* Personal Information */}
          <div className={`p-6 rounded-lg ${
            darkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <h4 className={`text-lg font-semibold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Personal Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <User className="w-4 h-4 inline mr-2" />
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                      darkMode 
                        ? 'bg-gray-600 border-gray-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                ) : (
                  <p className={`px-3 py-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {profileData.firstName || 'Not provided'}
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <User className="w-4 h-4 inline mr-2" />
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                      darkMode 
                        ? 'bg-gray-600 border-gray-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                ) : (
                  <p className={`px-3 py-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {profileData.lastName || 'Not provided'}
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                      darkMode 
                        ? 'bg-gray-600 border-gray-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                ) : (
                  <p className={`px-3 py-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {profileData.email || 'Not provided'}
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                      darkMode 
                        ? 'bg-gray-600 border-gray-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                ) : (
                  <p className={`px-3 py-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {profileData.phone || 'Not provided'}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={profileData.location}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                      darkMode 
                        ? 'bg-gray-600 border-gray-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                ) : (
                  <p className={`px-3 py-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {profileData.location || 'Not provided'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className={`p-6 rounded-lg ${
            darkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <h4 className={`text-lg font-semibold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Professional Information
            </h4>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <Briefcase className="w-4 h-4 inline mr-2" />
                  Experience Level
                </label>
                {isEditing ? (
                  <select
                    name="experience"
                    value={profileData.experience}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                      darkMode 
                        ? 'bg-gray-600 border-gray-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="lead">Lead</option>
                    <option value="executive">Executive</option>
                  </select>
                ) : (
                  <p className={`px-3 py-2 capitalize ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {profileData.experience?.replace('_', ' ') || 'Not provided'}
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <Award className="w-4 h-4 inline mr-2" />
                  Skills
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.skills.join(', ')}
                    onChange={handleSkillsChange}
                    placeholder="Enter skills separated by commas"
                    className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                      darkMode 
                        ? 'bg-gray-600 border-gray-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                ) : (
                  <div className="flex flex-wrap gap-2 px-3 py-2">
                    {profileData.skills.length > 0 ? (
                      profileData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1 rounded-full text-sm ${
                            darkMode 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        No skills added
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <FileText className="w-4 h-4 inline mr-2" />
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Tell us about yourself..."
                    className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                      darkMode 
                        ? 'bg-gray-600 border-gray-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                ) : (
                  <p className={`px-3 py-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {profileData.bio || 'No bio provided'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Resume Section */}
          <div className={`p-6 rounded-lg ${
            darkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <h4 className={`text-lg font-semibold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Resume
            </h4>
            <div className="space-y-4">
              {profileData.resume && (
                <div className={`p-4 rounded-lg border ${
                  darkMode ? 'border-gray-600' : 'border-gray-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className={`font-medium ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {profileData.resume.originalName || 'Resume.pdf'}
                        </p>
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Uploaded: {new Date(profileData.resume.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <a
                      href={getResumeUrl(profileData.resume.filename) || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View
                    </a>
                  </div>
                </div>
              )}
              
              {isEditing && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Upload New Resume
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeChange}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                      darkMode 
                        ? 'bg-gray-600 border-gray-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  {newResume && (
                    <p className={`mt-2 text-sm ${
                      darkMode ? 'text-green-400' : 'text-green-600'
                    }`}>
                      New resume selected: {newResume.name}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;