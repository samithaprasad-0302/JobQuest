import React, { useState } from 'react';
import { ExternalLink, MapPin, Users, Star } from 'lucide-react';

interface FeaturedEmployersProps {
  darkMode: boolean;
}

const FeaturedEmployers: React.FC<FeaturedEmployersProps> = ({ darkMode }) => {
  const [hoveredEmployer, setHoveredEmployer] = useState<number | null>(null);

  const employers = [
    {
      id: 1,
      name: "Google",
      industry: "Technology",
      location: "Mountain View, CA",
      employees: "100,000+",
      rating: 4.8,
      openJobs: 245,
      logo: "https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop",
      description: "A multinational technology company that specializes in Internet-related services and products.",
      benefits: ["Health Insurance", "Stock Options", "Flexible Hours", "Remote Work"],
      culture: "Innovation-focused environment with emphasis on creativity and collaboration."
    },
    {
      id: 2,
      name: "Microsoft",
      industry: "Technology",
      location: "Redmond, WA",
      employees: "180,000+",
      rating: 4.7,
      openJobs: 189,
      logo: "https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop",
      description: "Leading technology corporation developing computer software, consumer electronics, and services.",
      benefits: ["Comprehensive Healthcare", "Retirement Plans", "Learning Budget", "Wellness Programs"],
      culture: "Inclusive culture that empowers every employee to achieve more and make a difference."
    },
    {
      id: 3,
      name: "Apple",
      industry: "Technology",
      location: "Cupertino, CA",
      employees: "150,000+",
      rating: 4.6,
      openJobs: 167,
      logo: "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop",
      description: "World's most valuable company designing and manufacturing consumer electronics and software.",
      benefits: ["Premium Healthcare", "Employee Discounts", "Sabbatical Programs", "Fitness Centers"],
      culture: "Think different mentality with focus on innovation, quality, and user experience."
    },
    {
      id: 4,
      name: "Amazon",
      industry: "E-commerce & Cloud",
      location: "Seattle, WA",
      employees: "1,500,000+",
      rating: 4.4,
      openJobs: 312,
      logo: "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop",
      description: "Multinational technology company focusing on e-commerce, cloud computing, and artificial intelligence.",
      benefits: ["Career Choice Program", "Parental Leave", "Health Savings Account", "Mental Health Resources"],
      culture: "Customer-obsessed culture with high standards and bias for action."
    },
    {
      id: 5,
      name: "Meta",
      industry: "Social Media",
      location: "Menlo Park, CA",
      employees: "70,000+",
      rating: 4.3,
      openJobs: 134,
      logo: "https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop",
      description: "Social technology company building technologies that help people connect and share.",
      benefits: ["Generous PTO", "Free Meals", "Transportation", "Family Support"],
      culture: "Move fast and break things mentality with focus on connecting the world."
    },
    {
      id: 6,
      name: "Netflix",
      industry: "Entertainment",
      location: "Los Gatos, CA",
      employees: "15,000+",
      rating: 4.5,
      openJobs: 87,
      logo: "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop",
      description: "Streaming entertainment service with content production and technology at its core.",
      benefits: ["Unlimited Vacation", "Top-tier Healthcare", "Stock Options", "Parental Leave"],
      culture: "Freedom and responsibility culture with focus on high performance and innovation."
    }
  ];

  return (
    <section id="featured-employers" className={`py-16 px-4 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className={`text-4xl font-bold mb-4 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Featured Employers
          </h2>
          <p className={`text-xl ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Join the world's most innovative companies
          </p>
        </div>

        {/* Employers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {employers.map((employer) => (
            <div
              key={employer.id}
              className={`relative group cursor-pointer transition-all duration-500 ${
                darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700' 
                  : 'bg-white hover:shadow-xl'
              } rounded-xl overflow-hidden border ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              } hover:scale-105 hover:shadow-2xl`}
              onMouseEnter={() => setHoveredEmployer(employer.id)}
              onMouseLeave={() => setHoveredEmployer(null)}
            >
              {/* Main Card Content */}
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={employer.logo} 
                      alt={`${employer.name} logo`}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className={`font-bold text-lg ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {employer.name}
                      </h3>
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {employer.industry}
                      </p>
                    </div>
                  </div>
                  
                  <ExternalLink className={`w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`} />
                </div>

                {/* Basic Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className={`w-4 h-4 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <span className={`text-sm ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {employer.location}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className={`w-4 h-4 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <span className={`text-sm ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {employer.employees} employees
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className={`text-sm font-medium ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {employer.rating}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Open Jobs */}
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full dark:bg-blue-900/20 dark:text-blue-400">
                    {employer.openJobs} open positions
                  </span>
                </div>

                {/* Description */}
                <p className={`text-sm mb-4 line-clamp-3 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {employer.description}
                </p>

                {/* View Jobs Button */}
                <button className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105">
                  View All Jobs
                </button>
              </div>

              {/* Hover Details Overlay */}
              {hoveredEmployer === employer.id && (
                <div className={`absolute inset-0 p-6 transition-all duration-300 ${
                  darkMode ? 'bg-gray-800/95' : 'bg-white/95'
                } backdrop-blur-sm`}>
                  <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-4">
                      <img 
                        src={employer.logo} 
                        alt={`${employer.name} logo`}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className={`font-bold ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {employer.name}
                        </h3>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className={`text-sm ${
                            darkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {employer.rating} rating
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Culture */}
                    <div className="mb-4">
                      <h4 className={`font-medium mb-2 ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Company Culture
                      </h4>
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {employer.culture}
                      </p>
                    </div>

                    {/* Benefits */}
                    <div className="mb-4 flex-grow">
                      <h4 className={`font-medium mb-2 ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Key Benefits
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {employer.benefits.map((benefit) => (
                          <span
                            key={benefit}
                            className={`px-2 py-1 text-xs rounded-full ${
                              darkMode 
                                ? 'bg-gray-700 text-gray-300' 
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-teal-700 transition-all duration-300">
                        View Jobs
                      </button>
                      <button className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        darkMode 
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}>
                        Follow
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <button className={`px-8 py-3 rounded-lg border-2 font-medium transition-all duration-300 hover:scale-105 ${
            darkMode 
              ? 'border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white' 
              : 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
          }`}>
            View All Companies
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedEmployers;