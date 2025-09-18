import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const AppLayout = () => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100">
      
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-slide-in-up">
            <Outlet />
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AppLayout;
