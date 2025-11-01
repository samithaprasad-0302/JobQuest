import React, { useState } from 'react';
import { Clock, User, ArrowRight, TrendingUp, Target, Users } from 'lucide-react';
import { newsletterAPI } from '../services/api';

interface CareerAdviceProps {
  darkMode: boolean;
}

const CareerAdvice: React.FC<CareerAdviceProps> = ({ darkMode }) => {
  const [expandedArticle, setExpandedArticle] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [subscriptionMessage, setSubscriptionMessage] = useState('');

  const articles = [
    {
      id: 1,
      title: "10 Essential Tips for Landing Your Dream Job in 2025",
      excerpt: "Navigate the modern job market with confidence using these proven strategies that have helped thousands of professionals secure their ideal positions.",
      author: "Sarah Johnson",
      readTime: "8 min read",
      publishedAt: "2 days ago",
      category: "Job Search",
      image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop",
      icon: Target,
      fullContent: `
        The job market in 2025 is more competitive than ever, but with the right strategies, you can stand out from the crowd:

        1. **Optimize Your LinkedIn Profile** - Make sure your profile is 100% complete with a professional photo and compelling headline.
        
        2. **Tailor Your Resume** - Customize your resume for each application to match the job requirements.
        
        3. **Build Your Personal Brand** - Establish yourself as a thought leader in your industry through content creation.
        
        4. **Network Strategically** - Focus on building genuine relationships rather than just collecting connections.
        
        5. **Practice Your Interview Skills** - Prepare for both technical and behavioral questions.
        
        Remember, job searching is a full-time job itself. Stay persistent and maintain a positive attitude throughout the process.
      `,
      tips: [
        "Update your LinkedIn profile weekly",
        "Follow up within 24 hours after interviews",
        "Research company culture before applying",
        "Prepare specific examples for behavioral questions"
      ]
    },
    {
      id: 2,
      title: "Mastering Remote Work: Best Practices for Productivity",
      excerpt: "Learn how to excel in remote positions with expert advice on communication, time management, and maintaining work-life balance in a digital-first world.",
      author: "Michael Chen",
      readTime: "6 min read",
      publishedAt: "1 week ago",
      category: "Remote Work",
      image: "https://images.pexels.com/photos/4050320/pexels-photo-4050320.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop",
      icon: Users,
      fullContent: `
        Remote work has become the new normal, and mastering it is crucial for career success:

        **Communication Excellence:**
        - Over-communicate rather than under-communicate
        - Use video calls for important discussions
        - Set clear expectations with your team

        **Time Management:**
        - Create a dedicated workspace
        - Establish clear boundaries between work and personal time
        - Use time-blocking techniques for better focus

        **Staying Connected:**
        - Participate actively in virtual team meetings
        - Join informal chat channels
        - Schedule regular one-on-ones with your manager

        The key to remote work success is intentionality in everything you do.
      `,
      tips: [
        "Set up a proper home office environment",
        "Establish morning routines to start your day",
        "Take regular breaks to avoid burnout",
        "Invest in good quality tech equipment"
      ]
    },
    {
      id: 3,
      title: "Salary Negotiation: How to Get What You're Worth",
      excerpt: "Master the art of salary negotiation with data-driven strategies and proven techniques that can increase your earning potential by 20% or more.",
      author: "Emily Rodriguez",
      readTime: "10 min read",
      publishedAt: "3 days ago",
      category: "Career Growth",
      image: "https://images.pexels.com/photos/3184633/pexels-photo-3184633.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop",
      icon: TrendingUp,
      fullContent: `
        Salary negotiation is one of the most important skills you can develop in your career:

        **Before You Negotiate:**
        - Research market rates using sites like Glassdoor and PayScale
        - Document your achievements and contributions
        - Practice your negotiation conversation

        **During the Negotiation:**
        - Lead with your value proposition
        - Be prepared to discuss the entire compensation package
        - Stay professional and positive throughout

        **Beyond Base Salary:**
        - Consider benefits, flexible work arrangements, and professional development
        - Stock options and bonuses can add significant value
        - Think about long-term career growth opportunities

        Remember, negotiation is a normal part of the hiring process, and most employers expect it.
      `,
      tips: [
        "Never accept the first offer immediately",
        "Focus on value, not personal financial needs",
        "Get everything in writing",
        "Consider the total compensation package"
      ]
    }
  ];

  const toggleExpand = (articleId: number) => {
    setExpandedArticle(expandedArticle === articleId ? null : articleId);
  };

  return (
    <section id="career-advice" className={`py-16 px-4 ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className={`text-4xl font-bold mb-4 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Career Advice & Resources
          </h2>
          <p className={`text-xl ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Expert insights to accelerate your career growth
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {articles.map((article) => {
            const IconComponent = article.icon;
            const isExpanded = expandedArticle === article.id;
            
            return (
              <article
                key={article.id}
                className={`group transition-all duration-500 ${
                  darkMode 
                    ? 'bg-gray-700 border border-gray-600' 
                    : 'bg-white border border-gray-200 shadow-lg hover:shadow-xl'
                } rounded-xl overflow-hidden ${
                  isExpanded ? 'lg:col-span-3' : ''
                } hover:scale-105`}
              >
                {/* Article Image */}
                <div className="relative overflow-hidden">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                      <IconComponent className="w-4 h-4 mr-1" />
                      {article.category}
                    </span>
                  </div>
                </div>

                {/* Article Content */}
                <div className="p-6">
                  {/* Meta Information */}
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <User className={`w-4 h-4 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <span className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {article.author}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className={`w-4 h-4 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <span className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {article.readTime}
                      </span>
                    </div>
                    
                    <span className={`text-sm ${
                      darkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {article.publishedAt}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className={`text-xl font-bold mb-3 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  } group-hover:text-blue-600 transition-colors`}>
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  <p className={`text-sm mb-4 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  } line-clamp-3`}>
                    {article.excerpt}
                  </p>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="mb-6 space-y-4">
                      <div className={`prose prose-sm max-w-none ${
                        darkMode ? 'prose-invert' : ''
                      }`}>
                        <div className={`whitespace-pre-line ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {article.fullContent}
                        </div>
                      </div>

                      {/* Action Tips */}
                      <div className={`p-4 rounded-lg ${
                        darkMode ? 'bg-gray-800' : 'bg-blue-50'
                      }`}>
                        <h4 className={`font-semibold mb-3 ${
                          darkMode ? 'text-white' : 'text-blue-900'
                        }`}>
                          Action Tips:
                        </h4>
                        <ul className="space-y-2">
                          {article.tips.map((tip, index) => (
                            <li 
                              key={index}
                              className={`flex items-start space-x-2 text-sm ${
                                darkMode ? 'text-gray-300' : 'text-blue-800'
                              }`}
                            >
                              <ArrowRight className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Read More Button */}
                  <button
                    onClick={() => toggleExpand(article.id)}
                    className={`flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors ${
                      darkMode ? 'text-blue-400 hover:text-blue-300' : ''
                    }`}
                  >
                    <span>{isExpanded ? 'Read Less' : 'Read More'}</span>
                    <ArrowRight className={`w-4 h-4 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Career Resources Section */}
       

        {/* Newsletter Signup */}
        <div className="text-center mt-12">
          <div className={`inline-block p-8 rounded-xl ${
            darkMode ? 'bg-gray-700' : 'bg-white shadow-lg'
          }`}>
            <h3 className={`text-2xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Stay Updated
            </h3>
            <p className={`mb-6 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Get the latest career advice and job market insights delivered to your inbox
            </p>

            {/* Status Message */}
            {subscriptionStatus === 'success' && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 rounded-lg flex items-center space-x-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                <span className="text-green-700 text-sm font-medium">{subscriptionMessage}</span>
              </div>
            )}
            {subscriptionStatus === 'error' && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded-lg flex items-center space-x-2">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">!</div>
                <span className="text-red-700 text-sm font-medium">{subscriptionMessage}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={subscriptionStatus === 'loading'}
                className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                  darkMode 
                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                  subscriptionStatus === 'loading' ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
              <button
                onClick={async () => {
                  if (!email) {
                    setSubscriptionStatus('error');
                    setSubscriptionMessage('Please enter an email address');
                    setTimeout(() => setSubscriptionStatus('idle'), 3000);
                    return;
                  }

                  setSubscriptionStatus('loading');
                  try {
                    await newsletterAPI.subscribe(email);
                    setSubscriptionStatus('success');
                    setSubscriptionMessage('Successfully subscribed! Check your inbox.');
                    setEmail('');
                    setTimeout(() => setSubscriptionStatus('idle'), 5000);
                  } catch (error: any) {
                    setSubscriptionStatus('error');
                    setSubscriptionMessage(error.message || 'Failed to subscribe. Please try again.');
                    setTimeout(() => setSubscriptionStatus('idle'), 5000);
                  }
                }}
                disabled={subscriptionStatus === 'loading'}
                className={`px-6 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 ${
                  subscriptionStatus === 'loading' ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {subscriptionStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CareerAdvice;