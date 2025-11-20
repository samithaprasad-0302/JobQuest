import React, { useState } from 'react';
import { X, Briefcase, Building, Mail, Phone, User, Send } from 'lucide-react';

interface GuestApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUp?: () => void;
  job: {
    _id: string;
    title: string;
    company: string;
    location?: string;
    salary?: string;
    link?: string;
  };
}

const GuestApplicationModal: React.FC<GuestApplicationModalProps> = ({
  isOpen,
  onClose,
  onSignUp,
  job
}) => {
  console.log('🚀 GuestApplicationModal rendered with:', { isOpen, job });
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setErrorMessage('Please fill in all required fields.');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const applicationData = {
        ...formData,
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.company
      };

      const response = await fetch('http://localhost:5000/api/guest-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setSubmitStatus('success');
      
      // After successful submission, wait briefly then show email modal if email exists
      setTimeout(() => {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: ''
        });
        setSubmitStatus('idle');
        
        if (job?.link) {
          setShowEmailModal(true); // Show email modal only if company email exists
        } else {
          onClose(); // Just close if no email available
        }
      }, 800); // Reduced from 2000ms to 800ms for faster experience

    } catch (error) {
      console.error('Error submitting guest application:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit application');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
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

  const openOutlook = () => {
    if (job?.link) {
      const subject = encodeURIComponent(`Application for ${job.title} position`);
      const body = encodeURIComponent(
        `Dear Hiring Manager,

I am writing to express my interest in the ${job.title} position at ${job.company}.

My contact details:
Name: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Phone: ${formData.phone}

I would welcome the opportunity to discuss how my skills and experience align with your needs.

Thank you for your consideration.

Best regards,
${formData.firstName} ${formData.lastName}`
      );
      
      const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(job.link)}&subject=${subject}&body=${body}`;
      window.open(outlookUrl, '_blank');
      setShowEmailModal(false);
      onClose();
    }
  };

  const openGmail = () => {
    if (job?.link) {
      const subject = encodeURIComponent(`Application for ${job.title} position`);
      const body = encodeURIComponent(
        `Dear Hiring Manager,

I am writing to express my interest in the ${job.title} position at ${job.company}.

My contact details:
Name: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Phone: ${formData.phone}

I would welcome the opportunity to discuss how my skills and experience align with your needs.

Thank you for your consideration.

Best regards,
${formData.firstName} ${formData.lastName}`
      );
      
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(job.link)}&subject=${subject}&body=${body}`;
      window.open(gmailUrl, '_blank');
      setShowEmailModal(false);
      onClose();
    }
  };

  const openEmailClient = () => {
    if (job?.link) {
      const subject = encodeURIComponent(`Application for ${job.title} position`);
      const body = encodeURIComponent(
        `Dear Hiring Manager,

I am writing to express my interest in the ${job.title} position at ${job.company}.

My contact details:
Name: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Phone: ${formData.phone}

I would welcome the opportunity to discuss how my skills and experience align with your needs.

Thank you for your consideration.

Best regards,
${formData.firstName} ${formData.lastName}`
      );
      
      const mailtoUrl = `mailto:${job.link}?subject=${subject}&body=${body}`;
      window.location.href = mailtoUrl;
      setShowEmailModal(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Apply for Position</h3>
              <p className="text-sm text-gray-600">Submit your application as a guest</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Job Details */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-start space-x-3">
            <Building className="h-5 w-5 text-gray-400 mt-1" />
            <div>
              <h4 className="font-semibold text-gray-900">{job.title}</h4>
              <p className="text-gray-600">{job.company}</p>
              {job.location && (
                <p className="text-sm text-gray-500">{job.location}</p>
              )}
              {job.salary && (
                <p className="text-sm text-green-600 font-medium">{job.salary}</p>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4" />
                  <span>First Name *</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4" />
                  <span>Last Name *</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            {/* Contact Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4" />
                  <span>Email Address *</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <label htmlFor="phone" className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4" />
                  <span>Phone Number</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(123) 456-7890"
                />
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {submitStatus === 'error' && errorMessage && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}

          {submitStatus === 'success' && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">
                ✅ Application submitted successfully! We'll contact you soon.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || submitStatus === 'success'}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Submit Application</span>
                </>
              )}
            </button>
          </div>

          {/* Guest Notice */}
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="text-blue-500">💡</div>
              <div>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Guest Application:</strong> You're applying without an account.
                </p>
                <p className="text-xs text-gray-600 mb-3">
                  Want to track your applications and get personalized job recommendations?
                </p>
                <button 
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onSignUp) {
                      onSignUp();
                    } else {
                      // Fallback: trigger signup modal by dispatching a custom event
                      window.dispatchEvent(new CustomEvent('openSignupModal'));
                    }
                  }}
                  className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors"
                >
                  Create Free Account
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Send Application
              </h3>
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  onClose();
                }}
                className="p-1 rounded hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Send to:
                </label>
                <div className="p-3 rounded-lg border bg-gray-50 border-gray-200">
                  <span className="text-gray-700">
                    {job.link || 'Company email not available'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Subject:
                </label>
                <div className="p-3 rounded-lg border bg-gray-50 border-gray-200 text-gray-700">
                  Application for {job.title} position
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={openGmail}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <img 
                      src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico" 
                      alt="Gmail" 
                      className="w-5 h-5"
                      onError={(e) => {
                        e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTI0IDVWMTlDMjQgMjAuMSAyMy4xIDIxIDIyIDIxSDJDMC45IDIxIDAgMjAuMSAwIDE5VjVDMCAzLjkgMC45IDMgMiAzSDIyQzIzLjEgMyAyNCAzLjkgMjQgNVoiIGZpbGw9IiNFQTQzMzUiLz4KPHBhdGggZD0iTTI0IDVIOC4yTDEyIDlMMTUuOCA1SDI0WiIgZmlsbD0iIzM0QTg1MyIvPgo8cGF0aCBkPSJNMCA1SDE1LjhMMTIgOUw4LjIgNUgwWiIgZmlsbD0iIzNCODhGRiIvPgo8cGF0aCBkPSJNOC4yIDVMMTIgOUwxNS44IDVWMTlIOC4yVjVaIiBmaWxsPSIjRkJCQzA0Ii8+Cjwvc3ZnPgo=";
                      }}
                    />
                    <span>Gmail</span>
                  </button>
                  
                  <button
                    onClick={openOutlook}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <img 
                      src="https://res.cdn.office.net/assets/mail/v1.9.3/icons/mail-16x.png" 
                      alt="Outlook" 
                      className="w-5 h-5"
                      onError={(e) => {
                        e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIgM0gyMkMyMy4xIDMgMjQgMy45IDI0IDVWMTlDMjQgMjAuMSAyMy4xIDIxIDIyIDIxSDJDMC45IDIxIDAgMjAuMSAwIDE5VjVDMCAzLjkgMC45IDMgMiAzWiIgZmlsbD0iIzAwNzNEMiIvPgo8cGF0aCBkPSJNMTIgMTJMMjIgNUgyWkwxMiAxMloiIGZpbGw9IiNGRkZGRkYiLz4KPHBhdGggZD0iTTIgNUwxMiAxMkwyMiA1VjE5SDJWNVoiIGZpbGw9IiMwMDczRDIiLz4KPC9zdmc+";
                      }}
                    />
                    <span>Outlook</span>
                  </button>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={openEmailClient}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Other App</span>
                  </button>
                  
                  <button
                    onClick={() => copyToClipboard(job.link || 'Email not available')}
                    className="flex-1 px-3 py-2 rounded-lg transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Copy Email
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-600">
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
    </div>
  );
};

export default GuestApplicationModal;
