import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BriefcaseIcon, 
  UserGroupIcon, 
  ClipboardDocumentCheckIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Jobs', href: '/jobs', icon: BriefcaseIcon },
    { name: 'Candidates', href: '/candidates', icon: UserGroupIcon },
    { name: 'Assessments', href: '/assessments', icon: ClipboardDocumentCheckIcon },
  ];

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <header className="relative z-50">
      {}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {}
            <Link to="/" className="flex items-center space-x-3 hover-lift">
              <div className="relative">
                <div className="w-8 h-8 bg-primary-gradient rounded-lg flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-gradient rounded-full animate-ping"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  TalentFlow
                </h1>
                <p className="text-xs text-gray-500 -mt-1">Hiring Platform</p>
              </div>
            </Link>

            {}
            <div className="hidden md:block">
              <div className="flex items-center space-x-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'bg-primary-gradient text-white shadow-lg'
                          : 'text-gray-700 hover:bg-white/50 hover:text-purple-600'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mr-2 ${
                        active ? 'text-white' : 'text-gray-400 group-hover:text-purple-600'
                      }`} />
                      {item.name}
                      {active && (
                        <div className="ml-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 hover:text-purple-600 transition-colors"
              >
                {isMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`group flex items-center px-3 py-2 rounded-xl text-base font-medium transition-all duration-200 ${
                      active
                        ? 'bg-primary-gradient text-white shadow-lg'
                        : 'text-gray-700 hover:bg-white/50 hover:text-purple-600'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${
                      active ? 'text-white' : 'text-gray-400 group-hover:text-purple-600'
                    }`} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;