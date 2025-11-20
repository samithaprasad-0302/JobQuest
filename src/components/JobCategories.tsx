import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Code, 
  Palette, 
  BarChart3, 
  Megaphone, 
  Users, 
  DollarSign, 
  Stethoscope, 
  GraduationCap,
  ArrowRight 
} from 'lucide-react';
import { jobsAPI } from '../services/api';

interface JobCategoriesProps {
  darkMode: boolean;
}

const JobCategories: React.FC<JobCategoriesProps> = ({ darkMode }) => {
  const navigate = useNavigate();
  const [categoryStats, setCategoryStats] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchCategoryStats();
  }, []);

  const fetchCategoryStats = async () => {
    try {
      const response = await jobsAPI.getCategoryStats();
      console.log('📊 Category stats response:', response);
      
      // Convert array format to object format
      const statsObject: Record<string, number> = {};
      if (Array.isArray(response)) {
        response.forEach((item: any) => {
          if (item._id && typeof item.count === 'number') {
            statsObject[item._id] = item.count;
            console.log(`📂 Found category: "${item._id}" with ${item.count} jobs`);
          }
        });
      }
      
      console.log('📊 Final category stats object:', statsObject);
      setCategoryStats(statsObject);
    } catch (error) {
      console.error('Error fetching category stats:', error);
    }
  };

  const categories = [
    {
      name: "Technology",
      count: categoryStats["technology"] || 0,
      icon: Code,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
      searchCategory: "Technology"
    },
    {
      name: "Design",
      count: categoryStats["design"] || 0, 
      icon: Palette,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400",
      searchCategory: "Design"
    },
    {
      name: "Data & Analytics",
      count: categoryStats["data science"] || categoryStats["data"] || categoryStats["analytics"] || 0,
      icon: BarChart3,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      textColor: "text-green-600 dark:text-green-400",
      searchCategory: "Data Science"
    },
    {
      name: "Marketing",
      count: categoryStats["marketing"] || 0,
      icon: Megaphone,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      textColor: "text-orange-600 dark:text-orange-400",
      searchCategory: "Marketing"
    },
    {
      name: "Human Resources",
      count: categoryStats["human resources"] || categoryStats["hr"] || 0,
      icon: Users,
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-100 dark:bg-teal-900/20",
      textColor: "text-teal-600 dark:text-teal-400",
      searchCategory: "Human Resources"
    },
    {
      name: "Finance",
      count: categoryStats["finance"] || 0,
      icon: DollarSign,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
      textColor: "text-yellow-600 dark:text-yellow-400",
      searchCategory: "Finance"
    },
    {
      name: "Healthcare",
      count: categoryStats["healthcare"] || categoryStats["health"] || 0,
      icon: Stethoscope,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      textColor: "text-red-600 dark:text-red-400",
      searchCategory: "Healthcare"
    },
    {
      name: "Education",
      count: categoryStats["education"] || 0,
      icon: GraduationCap,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/20",
      textColor: "text-indigo-600 dark:text-indigo-400",
      searchCategory: "Education"
    }
  ];

  const handleCategoryClick = (category: string) => {
    // Convert to lowercase to match database format
    const searchCategory = category.toLowerCase();
    console.log(`🔍 Searching for category: ${searchCategory} (original: ${category})`);
    navigate(`/search?category=${encodeURIComponent(searchCategory)}`);
  };

  const handleBrowseAllClick = () => {
    navigate('/categories');
  };

  return (
    <section className={`py-16 px-4 ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className={`text-4xl font-bold mb-4 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Popular Job Categories
          </h2>
          <p className={`text-xl ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Explore opportunities across different industries
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            
            return (
              <div
                key={category.name}
                onClick={() => handleCategoryClick(category.searchCategory)}
                className={`group relative overflow-hidden rounded-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer ${
                  darkMode 
                    ? 'bg-gray-700 border border-gray-600 hover:bg-gray-600' 
                    : 'bg-white border border-gray-200 hover:shadow-lg'
                }`}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative p-6">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${category.bgColor} transition-all duration-300 group-hover:scale-110`}>
                    <IconComponent className={`w-6 h-6 ${category.textColor}`} />
                  </div>

                  {/* Category Info */}
                  <div className="mb-4">
                    <h3 className={`text-lg font-bold mb-2 transition-colors ${
                      darkMode 
                        ? 'text-white group-hover:text-blue-300' 
                        : 'text-gray-900 group-hover:text-blue-600'
                    }`}>
                      {category.name}
                    </h3>
                    <p className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {category.count > 0 ? `${category.count.toLocaleString()} jobs` : 'Explore opportunities'}
                    </p>
                  </div>

                  {/* Hover Arrow */}
                  <div className={`flex items-center text-sm font-medium transition-all duration-300 ${
                    category.textColor
                  } opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0`}>
                    <span className="mr-2">Explore Jobs</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Animated Border */}
                <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${category.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className={`mb-6 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Can't find your ideal category? We have jobs in many other fields too.
          </p>
          
          <button 
            onClick={handleBrowseAllClick}
            className={`px-8 py-3 rounded-lg border-2 font-medium transition-all duration-300 hover:scale-105 ${
              darkMode 
                ? 'border-teal-500 text-teal-400 hover:bg-teal-500 hover:text-white' 
                : 'border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white'
            }`}>
            Browse All Categories
          </button>
        </div>

        {/* Stats Section */}
        
      </div>
    </section>
  );
};

export default JobCategories;
