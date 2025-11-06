import { useQuery } from "@tanstack/react-query";
import AdminPanel from "@/components/admin-panel";

export default function AdminPage() {
  const { data: company } = useQuery({
    queryKey: ["/api/company"],
    queryFn: async () => {
      const response = await fetch("/api/company");
      if (!response.ok) {
        throw new Error("Failed to fetch company data");
      }
      return response.json();
    },
  });

  const { data: platforms } = useQuery({
    queryKey: ["/api/platforms"],
    queryFn: async () => {
      const response = await fetch("/api/platforms");
      if (!response.ok) {
        throw new Error("Failed to fetch platforms");
      }
      return response.json();
    },
  });

  if (!company || !platforms) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminPanel 
        company={company} 
        platforms={platforms} 
        onClose={() => window.history.back()} 
      />
    </div>
  );
}