import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { contactAPI } from '../services/api';

interface ContactUsProps {
  darkMode: boolean;
}

const ContactUs: React.FC<ContactUsProps> = ({ darkMode }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.subject || !formData.message) {
      setStatus('error');
      setMessage('Please fill in all required fields');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    setStatus('loading');
    try {
      await contactAPI.submitContact(formData);
      setStatus('success');
      setMessage('Thank you for contacting us! We will get back to you soon.');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Failed to send message. Please try again.');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <section id="contact-us" className={`py-12 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Get in Touch
          </h2>
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Have a question? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Info */}
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
            <div className="flex items-center mb-4">
              <Mail className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Email</h3>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  contact@jobquest.com
                </p>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
            <div className="flex items-center mb-4">
              <Phone className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Phone</h3>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  +1 (555) 000-0000
                </p>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
            <div className="flex items-center mb-4">
              <MapPin className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Location</h3>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  San Francisco, CA
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className={`max-w-2xl mx-auto p-8 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
          {/* Status Message */}
          {status === 'success' && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 rounded-lg">
              <p className="text-green-700 font-medium">{message}</p>
            </div>
          )}
          {status === 'error' && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded-lg">
              <p className="text-red-700 font-medium">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={status === 'loading'}
                  className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                    status === 'loading' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  placeholder="John"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={status === 'loading'}
                  className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                    status === 'loading' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={status === 'loading'}
                  className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                    status === 'loading' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={status === 'loading'}
                  className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                    status === 'loading' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Subject *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                disabled={status === 'loading'}
                className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                  status === 'loading' ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                placeholder="How can we help?"
              />
            </div>

            {/* Message */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                disabled={status === 'loading'}
                rows={5}
                className={`w-full px-4 py-2 rounded-lg border transition-colors resize-none ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                  status === 'loading' ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                placeholder="Tell us more about your inquiry..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === 'loading'}
              className={`w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-2 ${
                status === 'loading' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Send className="w-5 h-5" />
              {status === 'loading' ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
