import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Calendar, BedDouble, Stethoscope, Pill, FlaskConical,
  Receipt, AlertOctagon, Ambulance, Droplet, Scissors, HeartPulse,
  Video, ScanLine, ShieldCheck, ArrowLeft, ArrowRight, ChevronRight
} from 'lucide-react';
import PublicNavbar from '../../components/PublicNavbar';
import PublicFooter from '../../components/PublicFooter';

const modules = [
  {
    icon: Users, emoji: '🏥', name: 'Patient Management',
    desc: 'Complete end-to-end patient lifecycle management from registration to discharge.',
    bullets: [
      'Digital patient registration with unique IDs',
      'OPD queue and token management',
      'Full medical history and past visit records',
      'Patient demographics and next-of-kin info',
      'Wristband & QR code generation for identification',
    ],
    color: 'blue',
  },
  {
    icon: Calendar, emoji: '📅', name: 'Appointments',
    desc: 'Smart appointment scheduling with automated reminders and queue management.',
    bullets: [
      'Online & walk-in appointment booking',
      'Doctor-wise calendar management',
      'SMS and email appointment reminders',
      'Real-time queue display for patients',
      'Cancellation & rescheduling workflows',
    ],
    color: 'cyan',
  },
  {
    icon: BedDouble, emoji: '🛏️', name: 'IPD Management',
    desc: 'Comprehensive inpatient department management from admission to discharge.',
    bullets: [
      'Real-time ward and bed availability map',
      'Admission, transfer, and discharge workflow',
      'Nursing assignment per bed/room',
      'Daily progress notes and ward rounds',
      'Discharge summary generation',
    ],
    color: 'indigo',
  },
  {
    icon: Stethoscope, emoji: '👨‍⚕️', name: 'Doctor EMR',
    desc: 'Electronic Medical Records and clinical decision support for physicians.',
    bullets: [
      'SOAP note templates for fast documentation',
      'Digital prescription with dosage guidance',
      'ICD-10 diagnosis coding integration',
      'Allergy and medication alerts',
      'Lab and radiology result review inline',
    ],
    color: 'blue',
  },
  {
    icon: Pill, emoji: '💊', name: 'Pharmacy',
    desc: 'Full pharmacy management covering inventory, dispensing, and sales.',
    bullets: [
      'Medicine inventory with expiry tracking',
      'Auto-generate dispensing from EMR prescriptions',
      'Stock alerts for low-quantity items',
      'Batch and supplier management',
      'Pharmacy POS and daily sales reports',
    ],
    color: 'emerald',
  },
  {
    icon: FlaskConical, emoji: '🔬', name: 'Laboratory',
    desc: 'Laboratory information system for test management and reporting.',
    bullets: [
      'Test requisition from OPD/IPD directly',
      'Sample collection tracking and barcode',
      'Digital result entry with reference ranges',
      'Automated result alerts for critical values',
      'PDF report generation and sharing',
    ],
    color: 'amber',
  },
  {
    icon: Receipt, emoji: '💰', name: 'Billing & Invoicing',
    desc: 'Automated billing covering all hospital services with insurance support.',
    bullets: [
      'Auto-generate bills from OPD, IPD, pharmacy, lab',
      'Partial payment, advance deposit management',
      'Insurance claim submission workflow',
      'Tax and discount configuration',
      'Detailed financial reports by department',
    ],
    color: 'green',
  },
  {
    icon: AlertOctagon, emoji: '🚨', name: 'Emergency Triage',
    desc: 'Critical care management with priority-based triage and fast tracking.',
    bullets: [
      '5-level triage severity classification',
      'Real-time ER occupancy dashboard',
      'Rapid admission from ER to ward',
      'Critical alert escalation to doctors',
      'ER visit log and outcome tracking',
    ],
    color: 'rose',
  },
  {
    icon: Ambulance, emoji: '🚑', name: 'Ambulance Service',
    desc: 'Ambulance fleet management with real-time dispatch and tracking.',
    bullets: [
      'Fleet availability and maintenance log',
      'Dispatch management with assignment',
      'GPS route tracking integration',
      'Driver and crew assignment',
      'Ambulance call log and billing',
    ],
    color: 'orange',
  },
  {
    icon: Droplet, emoji: '🩸', name: 'Blood Bank',
    desc: 'Blood bank management from donor registration to requisition fulfilment.',
    bullets: [
      'Blood group-wise inventory tracking',
      'Donor registration and history',
      'Blood requisition from wards',
      'Compatibility matching checks',
      'Expiry tracking and disposal log',
    ],
    color: 'red',
  },
  {
    icon: Scissors, emoji: '🏥', name: 'Operation Theatre',
    desc: 'Surgical scheduling and operation theatre management.',
    bullets: [
      'OT booking and scheduling calendar',
      'Pre-operative checklist management',
      'Anaesthesia and surgeon assignment',
      'Intra-operative surgical records',
      'Post-op recovery and handover notes',
    ],
    color: 'purple',
  },
  {
    icon: HeartPulse, emoji: '👩‍⚕️', name: 'Nursing Station',
    desc: 'Bedside nursing care tools including vitals and medication administration.',
    bullets: [
      'Vital signs charting (BP, SpO2, temp, HR)',
      'Electronic Medication Administration Record (eMAR)',
      'Shift handover notes and task lists',
      'Nurse call and response logging',
      'Care plan creation and monitoring',
    ],
    color: 'pink',
  },
  {
    icon: Video, emoji: '📡', name: 'Telemedicine',
    desc: 'Virtual consultation platform for remote patient care.',
    bullets: [
      'Secure video consultation scheduling',
      'Digital prescription after teleconsult',
      'Patient waiting room management',
      'Recorded session management',
      'Teleconsult billing integration',
    ],
    color: 'teal',
  },
  {
    icon: ScanLine, emoji: '🩻', name: 'Radiology',
    desc: 'Radiology department management with imaging and reporting tools.',
    bullets: [
      'Radiology test ordering from EMR',
      'PACS-compatible image viewer',
      'Radiologist report authoring',
      'Urgent finding alert to referring doctor',
      'Historical image comparison',
    ],
    color: 'sky',
  },
  {
    icon: ShieldCheck, emoji: '🛡️', name: 'Insurance Claims',
    desc: 'End-to-end insurance claim processing and status tracking.',
    bullets: [
      'Policy and coverage verification at admission',
      'Claim form generation and submission',
      'Pre-authorization request management',
      'Claim status tracking dashboard',
      'Rejection reason analysis and resubmission',
    ],
    color: 'violet',
  },
];

const colorMap = {
  blue: 'bg-blue-600/10 border-blue-500/20 text-blue-400',
  cyan: 'bg-cyan-600/10 border-cyan-500/20 text-cyan-400',
  indigo: 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400',
  emerald: 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400',
  amber: 'bg-amber-600/10 border-amber-500/20 text-amber-400',
  green: 'bg-green-600/10 border-green-500/20 text-green-400',
  rose: 'bg-rose-600/10 border-rose-500/20 text-rose-400',
  orange: 'bg-orange-600/10 border-orange-500/20 text-orange-400',
  red: 'bg-red-600/10 border-red-500/20 text-red-400',
  purple: 'bg-purple-600/10 border-purple-500/20 text-purple-400',
  pink: 'bg-pink-600/10 border-pink-500/20 text-pink-400',
  teal: 'bg-teal-600/10 border-teal-500/20 text-teal-400',
  sky: 'bg-sky-600/10 border-sky-500/20 text-sky-400',
  violet: 'bg-violet-600/10 border-violet-500/20 text-violet-400',
};

const FeaturesPage = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <PublicNavbar />

      {/* Header */}
      <section className="relative pt-28 pb-16 bg-gradient-to-br from-slate-900 to-blue-950 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-5">
            15 Integrated Modules
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5">
            Comprehensive Hospital Features
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Every module built for real-world hospital workflows, deeply integrated so
            data flows seamlessly across departments.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all"
            >
              Login to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Module cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((m) => {
              const Icon = m.icon;
              const iconCls = colorMap[m.color] || colorMap.blue;
              return (
                <div
                  key={m.name}
                  className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-2xl p-6 transition-all hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${iconCls}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-lg mr-1 inline">{m.emoji}</div>
                      <h3 className="text-lg font-semibold text-white inline ml-1">{m.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{m.desc}</p>
                    </div>
                  </div>
                  <ul className="space-y-2 mt-4">
                    {m.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm text-slate-400">
                        <ChevronRight className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-slate-900 border-t border-slate-800">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to see it in action?</h2>
          <p className="text-slate-400 mb-7">Log in with a demo account and explore every module live.</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-lg shadow-blue-500/20"
          >
            Login to Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default FeaturesPage;

