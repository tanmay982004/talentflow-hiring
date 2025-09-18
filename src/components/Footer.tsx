import { HeartIcon, SparklesIcon } from '@heroicons/react/24/outline';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-16">
      {/* Decorative top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent"></div>
      
      <div className="glass-strong border-t border-white/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Brand */}
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary-gradient rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  TalentFlow
                </h3>
                <p className="text-xs text-gray-500 -mt-1">Hiring Platform</p>
              </div>
            </div>

            {/* Copyright */}
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>
                © {currentYear} TalentFlow. Crafted with
              </span>
              <HeartIcon className="w-4 h-4 text-red-500 animate-pulse" />
              <span>for amazing teams</span>
            </div>
          </div>
          
          {/* Additional info */}
          <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
            <div className="flex items-center space-x-4 mb-2 sm:mb-0">
              <span>🚀 Modern Hiring Solutions</span>
              <span>•</span>
              <span>⚡ Real-time Updates</span>
              <span>•</span>
              <span>🎯 Smart Matching</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
