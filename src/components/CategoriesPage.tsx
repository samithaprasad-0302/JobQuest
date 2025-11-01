import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Code, 
  Palette, 
  BarChart3, 
  Megaphone, 
  Users, 
  DollarSign, 
  Stethoscope, 
  GraduationCap,
  Building,
  Wrench,
  Globe,
  Truck,
  Camera,
  Music,
  Utensils,
  Shield,
  Scale,
  Briefcase,
  ArrowRight
} from 'lucide-react';
import { jobsAPI } from '../services/api';

interface CategoriesPageProps {
  darkMode: boolean;
}

interface Category {
  name: string;
  count: number;
  icon: any;
  color: string;
  bgColor: string;
  textColor: string;
  searchCategory: string;
  description: string;
}

const CategoriesPage: React.FC<CategoriesPageProps> = ({ darkMode }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [categoryStats, setCategoryStats] = useState<Record<string, number>>({});

  const allCategories: Category[] = [
    {
      name: "Technology",
      count: 0,
      icon: Code,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
      searchCategory: "Technology",
      description: "Software development, IT, cybersecurity, data science"
    },
    {
      name: "Design",
      count: 0,
      icon: Palette,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400",
      searchCategory: "Design",
      description: "UI/UX, graphic design, product design, creative arts"
    },
    {
      name: "Data & Analytics",
      count: 0,
      icon: BarChart3,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      textColor: "text-green-600 dark:text-green-400",
      searchCategory: "Data Science",
      description: "Data analysis, business intelligence, machine learning"
    },
    {
      name: "Marketing",
      count: 0,
      icon: Megaphone,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      textColor: "text-orange-600 dark:text-orange-400",
      searchCategory: "Marketing",
      description: "Digital marketing, content creation, social media, branding"
    },
    {
      name: "Human Resources",
      count: 0,
      icon: Users,
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-100 dark:bg-teal-900/20",
      textColor: "text-teal-600 dark:text-teal-400",
      searchCategory: "Human Resources",
      description: "Recruitment, talent acquisition, employee relations"
    },
    {
      name: "Finance",
      count: 0,
      icon: DollarSign,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
      textColor: "text-yellow-600 dark:text-yellow-400",
      searchCategory: "Finance",
      description: "Banking, accounting, investment, financial planning"
    },
    {
      name: "Healthcare",
      count: 0,
      icon: Stethoscope,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      textColor: "text-red-600 dark:text-red-400",
      searchCategory: "Healthcare",
      description: "Medical, nursing, pharmacy, healthcare administration"
    },
    {
      name: "Education",
      count: 0,
      icon: GraduationCap,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/20",
      textColor: "text-indigo-600 dark:text-indigo-400",
      searchCategory: "Education",
      description: "Teaching, training, academic research, e-learning"
    },
    {
      name: "Engineering",
      count: 0,
      icon: Wrench,
      color: "from-gray-500 to-gray-600",
      bgColor: "bg-gray-100 dark:bg-gray-900/20",
      textColor: "text-gray-600 dark:text-gray-400",
      searchCategory: "Engineering",
      description: "Mechanical, electrical, civil, chemical engineering"
    },
    {
      name: "Sales",
      count: 0,
      icon: Briefcase,
      color: "from-cyan-500 to-cyan-600",
      bgColor: "bg-cyan-100 dark:bg-cyan-900/20",
      textColor: "text-cyan-600 dark:text-cyan-400",
      searchCategory: "Sales",
      description: "Business development, account management, retail sales"
    },
    {
      name: "Construction",
      count: 0,
      icon: Building,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-100 dark:bg-amber-900/20",
      textColor: "text-amber-600 dark:text-amber-400",
      searchCategory: "Construction",
      description: "Building, architecture, project management, trades"
    },
    {
      name: "Transportation",
      count: 0,
      icon: Truck,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
      textColor: "text-emerald-600 dark:text-emerald-400",
      searchCategory: "Transportation",
      description: "Logistics, supply chain, driving, shipping"
    },
    {
      name: "Media & Communications",
      count: 0,
      icon: Camera,
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-100 dark:bg-pink-900/20",
      textColor: "text-pink-600 dark:text-pink-400",
      searchCategory: "Media",
      description: "Journalism, photography, video production, PR"
    },
    {
      name: "Entertainment",
      count: 0,
      icon: Music,
      color: "from-violet-500 to-violet-600",
      bgColor: "bg-violet-100 dark:bg-violet-900/20",
      textColor: "text-violet-600 dark:text-violet-400",
      searchCategory: "Entertainment",
      description: "Music, gaming, sports, events, hospitality"
    },
    {
      name: "Food & Beverage",
      count: 0,
      icon: Utensils,
      color: "from-lime-500 to-lime-600",
      bgColor: "bg-lime-100 dark:bg-lime-900/20",
      textColor: "text-lime-600 dark:text-lime-400",
      searchCategory: "Food Service",
      description: "Restaurant, culinary arts, food production, catering"
    },
    {
      name: "Security",
      count: 0,
      icon: Shield,
      color: "from-slate-500 to-slate-600",
      bgColor: "bg-slate-100 dark:bg-slate-900/20",
      textColor: "text-slate-600 dark:text-slate-400",
      searchCategory: "Security",
      description: "Physical security, cybersecurity, law enforcement"
    },
    {
      name: "Legal",
      count: 0,
      icon: Scale,
      color: "from-stone-500 to-stone-600",
      bgColor: "bg-stone-100 dark:bg-stone-900/20",
      textColor: "text-stone-600 dark:text-stone-400",
      searchCategory: "Legal",
      description: "Law, paralegal, compliance, legal research"
    },
    {
      name: "Non-Profit",
      count: 0,
      icon: Globe,
      color: "from-rose-500 to-rose-600",
      bgColor: "bg-rose-100 dark:bg-rose-900/20",
      textColor: "text-rose-600 dark:text-rose-400",
      searchCategory: "Non-Profit",
      description: "Social services, community outreach, fundraising"
    }
  ];

  useEffect(() => {
    fetchCategoryStats();
  }, []);

  const fetchCategoryStats = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getCategoryStats();
      console.log('📊 Category stats response:', response);
      
      // Convert array format to object format
      const statsObject: Record<string, number> = {};
      if (Array.isArray(response)) {
        response.forEach((item: any) => {
          if (item._id && typeof item.count === 'number') {
            statsObject[item._id] = item.count;
          }
        });
      }
      
      setCategoryStats(statsObject);
    } catch (error) {
      console.error('Error fetching category stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = allCategories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCategoryClick = (category: string) => {
    navigate(`/search?category=${encodeURIComponent(category)}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <button
              onClick={handleBack}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>

          <div className="text-center">
            <h1 className={`text-4xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Browse All Job Categories
            </h1>
            <p className={`text-xl mb-8 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Discover opportunities across {allCategories.length} different industries and specializations
            </p>

            {/* Search Bar */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Loading categories...
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {filteredCategories.map((category, index) => {
                const IconComponent = category.icon;
                const jobCount = categoryStats[category.searchCategory] || category.count;
                
                return (
                  <div
                    key={category.name}
                    onClick={() => handleCategoryClick(category.searchCategory)}
                    className={`group relative overflow-hidden rounded-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer ${
                      darkMode 
                        ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700' 
                        : 'bg-white border border-gray-200 hover:shadow-lg'
                    }`}
                    style={{
                      animationDelay: `${(index % 8) * 50}ms`
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
                        <p className={`text-sm mb-2 ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {jobCount > 0 ? `${jobCount.toLocaleString()} jobs` : 'Explore opportunities'}
                        </p>
                        <p className={`text-xs ${
                          darkMode ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          {category.description}
                        </p>
                      </div>

                      {/* Hover Arrow */}
                      <div className={`flex items-center text-sm font-medium transition-all duration-300 ${
                        category.textColor
                      } opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0`}>
                        <span className="mr-2">View Jobs</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Animated Border */}
                    <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${category.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
                  </div>
                );
              })}
            </div>

            {/* No Results */}
            {filteredCategories.length === 0 && (
              <div className="text-center py-12">
                <div className={`text-lg mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  No categories found matching "{searchQuery}"
                </div>
                <button
                  onClick={() => setSearchQuery('')}
                  className={`text-blue-500 hover:text-blue-600 transition-colors`}
                >
                  Clear search
                </button>
              </div>
            )}

            {/* Stats Section */}
            
          </>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;