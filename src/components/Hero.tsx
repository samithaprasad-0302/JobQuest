import React from 'react';
import { Search, MapPin, TrendingUp, Briefcase } from 'lucide-react';

interface HeroProps {
  darkMode: boolean;
}

const Hero: React.FC<HeroProps> = ({ darkMode }) => {
  return (
    <section className={`relative py-20 px-4 overflow-hidden ${
      darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600'
    }`}>
      {/* Background Image Placeholder */}
      <div className="absolute inset-0 opacity-20">
        <img 
          src="https://images.pexels.com/photos/3184460/pexels-photo-3184460.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop" 
          alt="Professional workplace background"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative max-w-7xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Find Your Dream Job
            <span className="block text-2xl md:text-4xl font-normal mt-2 text-blue-100">
              Where Opportunities Meet Talent
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Discover thousands of job opportunities from top companies worldwide. 
            Your next career move is just a click away.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-center mb-4">
              <Briefcase className="w-8 h-8 text-blue-200" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">10,000+</h3>
            <p className="text-blue-100">Active Job Listings</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-teal-200" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">500+</h3>
            <p className="text-blue-100">Trusted Companies</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-green-200" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">98%</h3>
            <p className="text-blue-100">Success Rate</p>
          </div>
        </div>

        {/* CTA Buttons */}
       
      </div>
    </section>
  );
};

export default Hero;