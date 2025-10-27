import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import type { Platform } from "@shared/schema";

interface PlatformCardProps {
  platform: Platform;
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    "Project Management": "bg-blue-100 text-blue-800",
    "Financial Analytics": "bg-green-100 text-green-800",
    "Customer Service": "bg-purple-100 text-purple-800",
    "Marketing Automation": "bg-orange-100 text-orange-800",
    "Human Resources": "bg-teal-100 text-teal-800",
    "E-Commerce": "bg-red-100 text-red-800",
  };
  return colors[category] || "bg-gray-100 text-gray-800";
};

export default function PlatformCard({ platform }: PlatformCardProps) {
  return (
    <Card className="bg-white border border-slate-200 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {platform.logo && (
          <img 
            src={platform.logo} 
            alt={`${platform.name} Platform`} 
            className="w-full h-48 object-cover rounded-lg mb-4" 
          />
        )}
        <h3 className="text-xl font-semibold text-lamplight-primary mb-2">{platform.name}</h3>
        <p className="text-slate-600 mb-4">{platform.description}</p>
        <div className="flex items-center justify-between">
          <Badge className={getCategoryColor(platform.category)}>
            {platform.category}
          </Badge>
          <a 
            href={platform.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-lamplight-accent hover:text-blue-600 font-medium flex items-center"
          >
            Launch Platform 
            <ExternalLink className="h-4 w-4 ml-1" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
