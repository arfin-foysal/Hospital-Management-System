import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Phone, Mail, Clock, Send, CheckCircle2, ArrowRight, ChevronRight
} from 'lucide-react';
import PublicNavbar from '../../components/PublicNavbar';
import PublicFooter from '../../components/PublicFooter';

const contactInfo = [
  {
    icon: MapPin,
    title: 'Address',
    lines: ['CareSync Super-Specialty Hospital', 'Gulshan-2, Dhaka-1212, Bangladesh'],
    color: 'text-blue-400',
    bg: 'bg-blue-600/10 border-blue-500/20',
  },
  {
    icon: Phone,
    title: 'Phone',
    lines: ['+880-2-9888123', '+880-1700-000000 (Emergency)'],
    color: 'text-emerald-400',
    bg: 'bg-emerald-600/10 border-emerald-500/20',
  },
  {
    icon: Mail,
    title: 'Email',
    lines: ['info@caresync.health', 'support@caresync.health'],
    color: 'text-rose-400',
    bg: 'bg-rose-600/10 border-rose-500/20',
  },
  {
    icon: Clock,
    title: 'Working Hours',
    lines: ['Emergency: 24/7', 'Administration: Sun–Thu 9AM–5PM'],
    color: 'text-amber-400',
    bg: 'bg-amber-600/10 border-amber-500/20',
  },
];

const ContactPage = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [form, setForm] = useState({ name: '', email: '', phone: '', hospital: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    // Simulate async
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <PublicNavbar />

      {/* Header */}
      <section className="relative pt-28 pb-16 bg-gradient-to-br from-slate-900 to-blue-950 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-5">
            Get in Touch
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5">Contact CareSync HMS</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Have questions about our system? Want to schedule a demo? Our team is ready to help.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {contactInfo.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.title} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 text-center">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mx-auto mb-4 ${c.bg}`}>
                    <Icon className={`w-6 h-6 ${c.color}`} />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-2">{c.title}</h3>
                  {c.lines.map((l) => (
                    <p key={l} className="text-xs text-slate-400">{l}</p>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Form + Map */}
      <section className="py-10 pb-24 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Form */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-white mb-6">Send us a message</h2>

              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Message Sent!</h3>
                  <p className="text-slate-400 text-sm max-w-xs">
                    Thank you for reaching out. Our team will get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', hospital: '', message: '' }); }}
                    className="mt-6 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Dr. John Doe"
                        className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-600 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@hospital.com"
                        className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-600 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+880-XXXXXXXXXX"
                        className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-600 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Hospital Name</label>
                      <input
                        type="text"
                        name="hospital"
                        value={form.hospital}
                        onChange={handleChange}
                        placeholder="Your Hospital Name"
                        className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-600 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Message *</label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us about your hospital and what you're looking for..."
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-600 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all disabled:opacity-60"
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Map placeholder + Quick links */}
            <div className="flex flex-col gap-5">
              {/* Map */}
              <div className="flex-1 min-h-64 bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <MapPin className="w-14 h-14 text-blue-500 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-1">CareSync HMS</h3>
                  <p className="text-slate-400 text-sm">Gulshan-2, Dhaka, Bangladesh</p>
                  <a
                    href="https://maps.google.com/?q=Gulshan-2,Dhaka,Bangladesh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 text-sm font-medium transition-colors"
                  >
                    Open in Google Maps
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)] pointer-events-none" />
              </div>

              {/* Quick links */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-white mb-4">Quick Links</h3>
                <div className="space-y-2">
                  {[
                    { label: 'View All Features', to: '/features' },
                    { label: 'About CareSync HMS', to: '/about' },
                    { label: 'Login to Dashboard', to: '/login' },
                  ].map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-700/50 text-sm text-slate-300 hover:text-white transition-colors group"
                    >
                      {l.label}
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default ContactPage;

