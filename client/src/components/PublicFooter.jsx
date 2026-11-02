import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Github, Twitter, Linkedin, Mail } from 'lucide-react';

const PublicFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* About */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div className="leading-none">
                <span className="font-bold text-white text-lg block">CareSync</span>
                <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">HMS</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Comprehensive Hospital Management System designed for Bangladesh's modern healthcare facilities.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[
                { icon: Github, href: '#' },
                { icon: Twitter, href: '#' },
                { icon: Linkedin, href: '#' },
                { icon: Mail, href: 'mailto:info@caresync.health' },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Home', to: '/' },
                { label: 'Features', to: '/features' },
                { label: 'About Us', to: '/about' },
                { label: 'Contact', to: '/contact' },
                { label: 'Login to Dashboard', to: '/login' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Modules */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Modules</h3>
            <ul className="space-y-2.5">
              {[
                'Patient Management',
                'Appointments',
                'IPD Management',
                'Doctor EMR',
                'Pharmacy',
                'Laboratory',
                'Billing & Invoicing',
                'Emergency Triage',
              ].map((m) => (
                <li key={m}>
                  <span className="text-sm text-slate-400">{m}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>🏥 CareSync Super-Specialty Hospital</li>
              <li>📍 Gulshan-2, Dhaka-1212, Bangladesh</li>
              <li>📞 +880-2-9888123</li>
              <li>
                <a href="mailto:info@caresync.health" className="hover:text-blue-400 transition-colors">
                  ✉️ info@caresync.health
                </a>
              </li>
              <li>🕐 24/7 Operations</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © {year} CareSync HMS. Built for Bangladesh Healthcare.
          </p>
          <p className="text-xs text-slate-500">
            Powered by React · Node.js · MySQL · Prisma ORM
          </p>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;

