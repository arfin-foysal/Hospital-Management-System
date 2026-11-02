import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, Shield, Users, Globe, DollarSign, Clock,
  LayoutDashboard, Calendar, BedDouble, Stethoscope,
  Pill, FlaskConical, Receipt, AlertOctagon, Ambulance,
  Droplet, Scissors, HeartPulse, Video, ScanLine, ShieldCheck,
  ChevronRight, Star, ArrowRight, Zap, CheckCircle2, Phone
} from 'lucide-react';
import PublicNavbar from '../../components/PublicNavbar';
import PublicFooter from '../../components/PublicFooter';

// ── data ────────────────────────────────────────────────────────────────────

const features = [
  { icon: LayoutDashboard, title: 'Real-time Dashboard', desc: 'Live hospital metrics, occupancy rates, and KPIs at a glance.' },
  { icon: Shield, title: 'Secure & Compliant', desc: 'Role-based access control, audit logs, and encrypted data at rest.' },
  { icon: Users, title: 'Multi-role Access', desc: '7 distinct roles: Admin, Doctor, Nurse, Pharmacist, Lab Tech, Accountant, Patient.' },
  { icon: Globe, title: 'Bilingual Support', desc: 'Full English and Bangla (বাংলা) interface for every staff member.' },
  { icon: DollarSign, title: 'BDT / USD Currency', desc: 'Dual-currency billing and reporting tailored to Bangladesh healthcare.' },
  { icon: Clock, title: '24/7 Operations', desc: 'Built for round-the-clock hospital workflows without downtime.' },
];

const modules = [
  { icon: Users, emoji: '🏥', name: 'Patient Management', desc: 'Registration, OPD, full medical history' },
  { icon: Calendar, emoji: '📅', name: 'Appointments', desc: 'Schedule, reminders, queue management' },
  { icon: BedDouble, emoji: '🛏️', name: 'IPD Management', desc: 'Ward/bed allocation, admissions' },
  { icon: Stethoscope, emoji: '👨‍⚕️', name: 'Doctor EMR', desc: 'Electronic medical records, prescriptions' },
  { icon: Pill, emoji: '💊', name: 'Pharmacy', desc: 'Inventory, dispensing, sales' },
  { icon: FlaskConical, emoji: '🔬', name: 'Laboratory', desc: 'Tests, results, digital reports' },
  { icon: Receipt, emoji: '💰', name: 'Billing & Invoicing', desc: 'Auto billing, insurance, invoices' },
  { icon: AlertOctagon, emoji: '🚨', name: 'Emergency Triage', desc: 'Critical care, priority queue' },
  { icon: Ambulance, emoji: '🚑', name: 'Ambulance Service', desc: 'Fleet tracking, dispatch management' },
  { icon: Droplet, emoji: '🩸', name: 'Blood Bank', desc: 'Donors, inventory, requisitions' },
  { icon: Scissors, emoji: '🏥', name: 'Operation Theatre', desc: 'Scheduling, surgical records' },
  { icon: HeartPulse, emoji: '👩‍⚕️', name: 'Nursing Station', desc: 'Vitals, eMAR, bedside care' },
  { icon: Video, emoji: '📡', name: 'Telemedicine', desc: 'Virtual consultations, video calls' },
  { icon: ScanLine, emoji: '🩻', name: 'Radiology', desc: 'Imaging, PACS, reports' },
  { icon: ShieldCheck, emoji: '🛡️', name: 'Insurance Claims', desc: 'Processing, status tracking' },
];

const techStack = [
  { name: 'React 18', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  { name: 'Node.js', color: 'bg-green-500/10 text-green-400 border-green-500/30' },
  { name: 'MySQL', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  { name: 'Prisma ORM', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  { name: 'Tailwind CSS', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
  { name: 'Express.js', color: 'bg-slate-500/10 text-slate-300 border-slate-500/30' },
];

const stats = [
  { value: '10,000+', label: 'Patients Managed' },
  { value: '500+', label: 'Daily Appointments' },
  { value: '99.9%', label: 'System Uptime' },
  { value: '24/7', label: 'Support' },
];

const testimonials = [
  {
    quote: 'CareSync HMS transformed our 500-bed hospital. Billing errors dropped by 90% and patient throughput doubled in 6 months.',
    name: 'Dr. Ahsan Kabir',
    role: 'Director, Dhaka Medical Center',
    avatar: 'AK',
    color: 'bg-blue-600',
  },
  {
    quote: 'The bilingual interface was a game-changer. Our staff shifted to paperless records within two weeks — zero training friction.',
    name: 'Dr. Nusrat Rahman',
    role: 'Chief of Medicine, Square Hospital',
    avatar: 'NR',
    color: 'bg-emerald-600',
  },
  {
    quote: 'Emergency triage and ambulance dispatch in one screen saved us critical minutes. We recommend CareSync to every hospital.',
    name: 'Prof. Kamal Hossain',
    role: 'Hospital Director, Chittagong General',
    avatar: 'KH',
    color: 'bg-rose-600',
  },
];

// ── component ────────────────────────────────────────────────────────────────

const LandingPage = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <PublicNavbar />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950">
        {/* Decorative blurs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDJlM2YiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0tNCA0aC0ydi0yaDJ2MnptMC00aC0ydi0yaDJ2MnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/30 text-blue-400 text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            <span>Bangladesh's Leading Hospital Management System</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight">
            Revolutionizing{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Hospital Care
            </span>
            <br />with CareSync HMS
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            A comprehensive, end-to-end Hospital Management System purpose-built for Bangladesh's healthcare ecosystem —
            from emergency triage to telemedicine, in both English and বাংলা.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5"
            >
              Login to Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/features"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-base transition-all hover:-translate-y-0.5"
            >
              Explore Features
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { value: '500+', label: 'Patients' },
              { value: '50+', label: 'Doctors' },
              { value: '15+', label: 'Modules' },
              { value: '99.9%', label: 'Uptime' },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl px-4 py-5"
              >
                <div className="text-3xl font-extrabold text-white">{s.value}</div>
                <div className="text-sm text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
              Why CareSync
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Built for Modern Healthcare</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Every feature engineered for the realities of Bangladesh's hospitals — from district clinics to super-specialty centres.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/40 rounded-2xl p-6 transition-all hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:bg-blue-600/20 transition-colors">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Modules ── */}
      <section className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-600/10 border border-rose-500/30 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-4">
              15 Integrated Modules
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Everything Your Hospital Needs</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              One platform. 15 specialised modules. Seamlessly integrated so data flows where it's needed.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {modules.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.name}
                  className="bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 hover:border-slate-600 rounded-2xl p-5 transition-all hover:-translate-y-0.5 group"
                >
                  <div className="text-2xl mb-3">{m.emoji}</div>
                  <h3 className="text-sm font-semibold text-white mb-1 leading-snug">{m.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{m.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/features"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm font-semibold transition-all"
            >
              View All Features
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="py-16 bg-slate-900 border-y border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-8">Powered by</p>
          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map((t) => (
              <span
                key={t.name}
                className={`px-4 py-2 rounded-xl border text-sm font-semibold ${t.color}`}
              >
                {t.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Banner ── */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-5xl font-extrabold text-white mb-2">{s.value}</div>
                <div className="text-slate-300 text-sm font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-600/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
              Trusted by Hospitals
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">What Healthcare Leaders Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 flex flex-col"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed flex-1 mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white text-sm font-bold`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-gradient-to-br from-blue-900 to-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <CheckCircle2 className="w-14 h-14 text-blue-400 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to transform your hospital?
          </h2>
          <p className="text-slate-300 text-lg mb-8">
            Join the hospitals already running on CareSync HMS. Get started in minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base transition-all shadow-xl shadow-blue-500/30 hover:-translate-y-0.5"
            >
              Login to Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-base transition-all hover:-translate-y-0.5"
            >
              <Phone className="w-5 h-5" />
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default LandingPage;

