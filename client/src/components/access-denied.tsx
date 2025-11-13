import { ShieldAlert, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AccessDeniedProps {
  onClose: () => void;
}

export default function AccessDenied({ onClose }: AccessDeniedProps) {
  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
          data-testid="button-close-access-denied"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <ShieldAlert className="h-8 w-8 text-red-600" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            Access Denied
          </h2>

          <p className="text-slate-600 mb-6 leading-relaxed">
            You don't have permission to access the admin panel. This area is restricted to authorized administrators only.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-700">
              <strong>Need admin access?</strong><br />
              Contact your system administrator to request access.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={onClose}
              className="w-full bg-lamplight-accent hover:bg-blue-600 text-white"
              data-testid="button-return-home"
            >
              Return to Home
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full"
              data-testid="button-logout-access-denied"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
