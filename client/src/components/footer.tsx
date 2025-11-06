import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-2">
            <h3 className="text-xl font-bold mb-4 text-blue-400">Lamplight Technology</h3>
            <p className="text-slate-300 mb-4">Specializing in cutting-edge SaaS platforms that transform how businesses operate, scale, and succeed in the digital economy.</p>
            <div className="flex items-center gap-2 text-slate-300 mb-2">
              <Mail className="h-4 w-4" />
              <span>info@llt.llc</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-blue-400">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#home" className="text-slate-300 hover:text-blue-400 transition-colors">Home</a></li>
              <li><a href="#about" className="text-slate-300 hover:text-blue-400 transition-colors">About Us</a></li>
              <li><a href="#platforms" className="text-slate-300 hover:text-blue-400 transition-colors">Our Platforms</a></li>
              <li><a href="#contact" className="text-slate-300 hover:text-blue-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-blue-400">Legal</h4>
            <ul className="space-y-2">
              <li><a href="/privacy" className="text-slate-300 hover:text-blue-400 transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="text-slate-300 hover:text-blue-400 transition-colors">Terms of Service</a></li>
              <li><a href="/cookies" className="text-slate-300 hover:text-blue-400 transition-colors">Cookie Policy</a></li>
              <li><a href="/support" className="text-slate-300 hover:text-blue-400 transition-colors">Support</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-slate-400 text-sm mb-4 md:mb-0">
            © 2024 Lamplight Technology. All rights reserved.
          </div>
          <div className="text-slate-400 text-sm">
            Website designed and developed by <span className="text-blue-400">Lamplight Software</span>
          </div>
        </div>
      </div>
    </footer>
  );
}