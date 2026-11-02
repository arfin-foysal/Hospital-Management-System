import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Target, Eye, Heart, Zap, Globe, Shield,
  ArrowRight, MapPin, Phone, Mail, Clock
} from 'lucide-react';
import PublicNavbar from '../../components/PublicNavbar';
import PublicFooter from '../../components/PublicFooter';

const team = [
  { name: 'Dr. Faisal Ahmed', role: 'Chief Executive Officer', initials: 'FA', color: 'bg-blue-600', desc: 'MBBS, MBA — 20+ years in hospital administration and digital health transformation.' },
  { name: 'Tahmina Begum', role: 'Chief Technology Officer', initials: 'TB', color: 'bg-emerald-600', desc: 'MSc Computer Science — Architect of CareSync\'s core microservices platform.' },
  { name: 'Dr. Rezaul Karim', role: 'Chief Medical Officer', initials: 'RK', color: 'bg-purple-600', desc: 'FCPS Medicine — Leads clinical workflow design and EMR protocol standards.' },
  { name: 'Sadia Islam', role: 'Head of Product Design', initials: 'SI', color: 'bg-rose-600', desc: 'UX specialist focused on making complex healthcare workflows intuitive for all staff.' },
];

const values = [
  { icon: Heart, title: 'Patient First', desc: 'Every feature decision starts by asking: does this improve patient outcomes?' },
  { icon: Shield, title: 'Security & Privacy', desc: 'Encrypted data, role-based access, and full audit trails protect every record.' },
  { icon: Zap, title: 'Speed & Reliability', desc: '99.9% uptime SLA with sub-second response times, even under peak load.' },
  { icon: Globe, title: 'Local Context', desc: 'Built in Bangladesh, for Bangladesh — bilingual, BDT-native, and regulation-aware.' },
];

const AboutPage = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <PublicNavbar />

      {/* Header */}
      <section className="relative pt-28 pb-16 bg-gradient-to-br from-slate-900 to-blue-950 overflow-hidden">
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-5">
            About CareSync HMS
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5">
            Driven by a Mission to Transform Healthcare
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            CareSync HMS was founded on the belief that every hospital in Bangladesh deserves
            world-class digital infrastructure — regardless of size or budget.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-900/50 to-slate-800/50 border border-blue-500/20 rounded-2xl p-8">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-5">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-slate-300 leading-relaxed">
                To empower hospitals across Bangladesh with an integrated, affordable, and intuitive
                HMS that reduces administrative burden, eliminates paper records, and puts clinicians
                back in control of patient care.
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-900/30 to-slate-800/50 border border-emerald-500/20 rounded-2xl p-8">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center mb-5">
                <Eye className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Our Vision</h2>
              <p className="text-slate-300 leading-relaxed">
                A Bangladesh where every hospital — from rural health centres to super-specialty
                institutions — runs on fully digital, interoperable health infrastructure that
                saves lives through speed and accuracy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hospital Info */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Our Flagship Hospital</h2>
            <p className="text-slate-400">Where CareSync HMS was born and continues to evolve every day.</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">CareSync Super-Specialty Hospital</h3>
              <p className="text-blue-400 font-medium mb-4">Dhaka, Bangladesh</p>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                A 500-bed tertiary-care hospital offering 25 specialties under one roof.
                Accredited by the Bangladesh Medical and Dental Council, the hospital serves
                over 1,000 outpatients and 200 inpatients daily.
              </p>
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  Gulshan-2, Dhaka-1212, Bangladesh
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  +880-2-9888123
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  info@caresync.health
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  24/7 Emergency Services
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '500+', label: 'Beds' },
                { value: '25+', label: 'Specialties' },
                { value: '200+', label: 'Doctors' },
                { value: '1000+', label: 'Daily OPD' },
              ].map((s) => (
                <div key={s.label} className="bg-slate-900/60 rounded-xl p-5 text-center border border-slate-700">
                  <div className="text-3xl font-extrabold text-white">{s.value}</div>
                  <div className="text-xs text-slate-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{v.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Leadership Team</h2>
            <p className="text-slate-400">The people behind CareSync's mission.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((m) => (
              <div key={m.name} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 text-center">
                <div className={`w-16 h-16 rounded-full ${m.color} flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 shadow-lg`}>
                  {m.initials}
                </div>
                <h3 className="text-base font-semibold text-white">{m.name}</h3>
                <p className="text-xs text-blue-400 font-medium mb-3">{m.role}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-900 to-slate-900 border-t border-slate-800">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Join our growing network of hospitals</h2>
          <p className="text-slate-300 mb-7">Experience CareSync HMS with a full demo — no commitment needed.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/login" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all">
              Login to Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/contact" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default AboutPage;

