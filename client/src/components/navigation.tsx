import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, Menu, LogIn, LogOut, User } from "lucide-react";
import type { Company } from "@shared/schema";

interface NavigationProps {
  onAdminClick: () => void;
  company?: Company;
  isAuthenticated?: boolean;
}

export default function Navigation({ onAdminClick, company, isAuthenticated = false }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {company?.logo ? (
              <img 
                src={company.logo} 
                alt={company.name}
                className="h-10 w-auto object-contain"
                data-testid="img-company-logo"
              />
            ) : (
              <h1 className="text-2xl font-bold text-lamplight-primary" data-testid="text-company-name">
                {company?.name || "Lamplight Technology"}
              </h1>
            )}
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button 
                onClick={() => scrollToSection('home')}
                className="text-lamplight-primary hover:text-lamplight-accent px-3 py-2 text-sm font-medium transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('platforms')}
                className="text-slate-500 hover:text-lamplight-accent px-3 py-2 text-sm font-medium transition-colors"
              >
                Platforms
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className="text-slate-500 hover:text-lamplight-accent px-3 py-2 text-sm font-medium transition-colors"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-slate-500 hover:text-lamplight-accent px-3 py-2 text-sm font-medium transition-colors"
              >
                Contact
              </button>
              {isAuthenticated ? (
                <>
                  <Button 
                    onClick={onAdminClick}
                    className="bg-lamplight-accent text-white hover:bg-blue-600"
                    size="sm"
                    data-testid="button-admin"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                  <Button 
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    data-testid="button-logout"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={handleLogin}
                  className="bg-lamplight-accent text-white hover:bg-blue-600"
                  size="sm"
                  data-testid="button-login"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              )}
            </div>
          </div>
          
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4">
            <div className="flex flex-col space-y-2">
              <button 
                onClick={() => scrollToSection('home')}
                className="text-left px-3 py-2 text-sm font-medium text-slate-600 hover:text-lamplight-accent"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('platforms')}
                className="text-left px-3 py-2 text-sm font-medium text-slate-600 hover:text-lamplight-accent"
              >
                Platforms
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className="text-left px-3 py-2 text-sm font-medium text-slate-600 hover:text-lamplight-accent"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-left px-3 py-2 text-sm font-medium text-slate-600 hover:text-lamplight-accent"
              >
                Contact
              </button>
              {isAuthenticated ? (
                <>
                  <Button 
                    onClick={onAdminClick}
                    className="bg-lamplight-accent text-white hover:bg-blue-600 mx-3"
                    size="sm"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                  <Button 
                    onClick={handleLogout}
                    variant="outline"
                    className="mx-3"
                    size="sm"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={handleLogin}
                  className="bg-lamplight-accent text-white hover:bg-blue-600 mx-3"
                  size="sm"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
