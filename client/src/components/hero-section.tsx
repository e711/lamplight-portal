import { Button } from "@/components/ui/button";
import { Rocket, Info } from "lucide-react";
import type { Company } from "@shared/schema";

interface HeroSectionProps {
  company?: Company;
}

export default function HeroSection({ company }: HeroSectionProps) {
  const scrollToPlatforms = () => {
    const element = document.getElementById('platforms');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToAbout = () => {
    const element = document.getElementById('about');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="home" className="bg-gradient-to-br from-lamplight-primary to-lamplight-secondary text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {company?.heroTitle ? (
              <>
                {company.heroTitle.split('Software Innovation')[0]}
                <span className="text-blue-400">Software Innovation</span>
              </>
            ) : (
              <>
                Empowering Business Through{' '}
                <span className="text-blue-400">Software Innovation</span>
              </>
            )}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            {company?.heroDescription || "Lamplight Technology is a leading holding company specializing in cutting-edge SaaS platforms that transform how businesses operate, scale, and succeed in the digital economy."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={scrollToPlatforms}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3"
              size="lg"
            >
              <Rocket className="h-5 w-5 mr-2" />
              Explore Our Platforms
            </Button>
            <Button 
              onClick={scrollToAbout}
              variant="outline" 
              className="border-blue-300 text-blue-100 hover:bg-blue-500 hover:text-white px-8 py-3"
              size="lg"
            >
              <Info className="h-5 w-5 mr-2" />
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
