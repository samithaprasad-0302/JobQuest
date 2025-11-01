import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin as LinkedIn, Instagram, Mail, Heart } from 'lucide-react';

interface FooterProps {
  darkMode: boolean;
}

const Footer: React.FC<FooterProps> = ({ darkMode }) => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "For Job Seekers",
      links: [
        { name: "Browse Jobs", href: "#find-jobs" },
        { name: "Career Advice", href: "#career-advice" },
        { name: "My Applications", href: "/my-applications" }
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "#" },
        { name: "Our Mission", href: "#" },
        { name: "Contact Us", href: "/contact" }
      ]
    }
  ];

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "#" },
    { name: "Twitter", icon: Twitter, href: "#" },
    { name: "LinkedIn", icon: LinkedIn, href: "#" },
    { name: "Instagram", icon: Instagram, href: "#" }
  ];

  return (
    <footer className={`${
      darkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-900 border-gray-800'
    } border-t text-white`}>
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">
                <span className="text-blue-400">Job</span>
                <span className="text-teal-400">Quest</span>
              </h2>
              <p className="text-gray-400 mt-2">
                Connecting talented professionals with amazing opportunities worldwide. 
                Your dream job is just a click away.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400">contact@jobquest.com</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4 mt-6">
              {socialLinks.map((social) => {
                const SocialIcon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                    aria-label={social.name}
                  >
                    <SocialIcon className="w-5 h-5 text-gray-400 hover:text-white" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {link.href.startsWith('/') ? (
                      <Link
                        to={link.href}
                        className="text-gray-400 hover:text-white transition-colors text-sm"
                      >
                        {link.name}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-gray-400 hover:text-white transition-colors text-sm"
                      >
                        {link.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

     

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            {/* Copyright */}
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-gray-400 text-sm">
                © {currentYear} JobQuest. All rights reserved.
              </span>
              <span className="text-gray-600">•</span>
              <span className="flex items-center space-x-1 text-gray-400 text-sm">
                <span>Made with</span>
                <Heart className="w-4 h-4 text-red-500 fill-current" />
                <span>for job seekers</span>
              </span>
            </div>

            {/* Legal Links */}
            <div className="flex items-center space-x-6">
              <a 
                href="#" 
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Terms of Service
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Cookie Policy
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                GDPR
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;