import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import PlatformCard from "@/components/platform-card";
import AdminPanel from "@/components/admin-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChartLine, Shield, Users } from "lucide-react";
import type { Company, Platform } from "@shared/schema";

export default function Home() {
  const [showAdmin, setShowAdmin] = useState(false);

  const { data: company, isLoading: companyLoading } = useQuery<Company>({
    queryKey: ["/api/company"],
  });

  const { data: platforms = [], isLoading: platformsLoading } = useQuery<Platform[]>({
    queryKey: ["/api/platforms"],
  });

  if (companyLoading || platformsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-dawn-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation onAdminClick={() => setShowAdmin(true)} />
      
      <main>
        <HeroSection company={company} />
        
        {/* Company Overview */}
        <section id="about" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-dawn-primary mb-4">
                {company?.aboutTitle || "Building the Future of Software"}
              </h2>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                {company?.aboutDescription}
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChartLine className="h-8 w-8 text-dawn-accent" />
                </div>
                <h3 className="text-xl font-semibold text-dawn-primary mb-2">Growth Focused</h3>
                <p className="text-slate-600">Accelerating business growth through innovative technology solutions</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-dawn-success" />
                </div>
                <h3 className="text-xl font-semibold text-dawn-primary mb-2">Enterprise Security</h3>
                <p className="text-slate-600">Bank-level security and compliance across all our platforms</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-dawn-primary mb-2">Customer Success</h3>
                <p className="text-slate-600">Dedicated support and success teams for every platform</p>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Showcase */}
        <section id="platforms" className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-dawn-primary mb-4">Our SaaS Platforms</h2>
              <p className="text-lg text-slate-600">Discover our comprehensive suite of business software solutions</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {platforms.map((platform) => (
                <PlatformCard key={platform.id} platform={platform} />
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-dawn-primary mb-4">Get in Touch</h2>
              <p className="text-lg text-slate-600 mb-8">Ready to transform your business with our SaaS platforms?</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-dawn-accent hover:bg-blue-600 text-white px-8 py-3">
                  Contact Sales
                </Button>
                <Button variant="outline" className="border-dawn-accent text-dawn-accent hover:bg-dawn-accent hover:text-white px-8 py-3">
                  Schedule Demo
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {showAdmin && (
        <AdminPanel 
          company={company} 
          platforms={platforms} 
          onClose={() => setShowAdmin(false)} 
        />
      )}
    </div>
  );
}
