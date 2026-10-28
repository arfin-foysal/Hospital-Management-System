import React, { useState } from 'react';
import { X, Printer, ShieldAlert, Heart, QrCode, Tag, Sparkles } from 'lucide-react';
import QRCodeSVG from './QRCodeSVG';

const PatientWristbandModal = ({ isOpen, onClose, patient, bedInfo, admissionInfo }) => {
  const [activeTab, setActiveTab] = useState('wristband'); // 'wristband' | 'specimen'

  if (!isOpen || !patient) return null;

  const handlePrint = () => {
    window.print();
  };

  const hasAllergy = patient.allergies && patient.allergies.toLowerCase() !== 'none' && patient.allergies !== '';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 print:hidden">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Hospital Wristband & Specimen Barcode Generator
              </h3>
              <p className="text-xs text-slate-500">Thermal label output for IPD admissions and pathology vacutainers</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex space-x-2 mt-4 print:hidden">
          <button
            onClick={() => setActiveTab('wristband')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg border transition ${
              activeTab === 'wristband'
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Waterproof Patient Wristband
          </button>
          <button
            onClick={() => setActiveTab('specimen')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg border transition ${
              activeTab === 'specimen'
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Phlebotomy Specimen Tube Labels (x3)
          </button>
        </div>

        {/* PRINTABLE PREVIEWS */}
        <div className="py-6 flex flex-col items-center justify-center">
          {activeTab === 'wristband' ? (
            /* WRISTBAND BAND MOCKUP */
            <div className="w-full bg-white border-4 border-dashed border-slate-300 p-4 rounded-xl flex items-center justify-center">
              <div className="w-full max-w-xl h-36 bg-gradient-to-r from-blue-50 via-white to-blue-50 border-2 border-blue-400 rounded-2xl shadow-md p-3 flex items-center justify-between relative overflow-hidden font-sans">
                {/* Allergy warning stripe */}
                {hasAllergy && (
                  <div className="absolute top-0 inset-x-0 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider py-0.5 text-center flex items-center justify-center space-x-1 shadow-sm">
                    <ShieldAlert className="w-3 h-3" />
                    <span>⚠️ ALLERGY ALERT: {patient.allergies}</span>
                  </div>
                )}

                {/* Left QR & UHID */}
                <div className={`flex flex-col items-center justify-center pr-3 border-r border-slate-200 ${hasAllergy ? 'mt-3' : ''}`}>
                  <QRCodeSVG
                    value={`UHID:${patient.patient_id || patient.id}|NAME:${patient.name}|BLOOD:${patient.blood_group || 'O+'}`}
                    size={68}
                  />
                  <span className="text-[10px] font-mono font-black text-slate-800 mt-1">{patient.patient_id}</span>
                </div>

                {/* Center Clinical Demographics */}
                <div className={`flex-1 px-4 ${hasAllergy ? 'mt-3' : ''}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">CareSync Hospital Inpatient</span>
                    <span className="text-[10px] font-bold text-slate-500">DOB: {patient.age}Y • {patient.gender}</span>
                  </div>

                  <h2 className="text-base font-black text-slate-900 leading-tight mt-0.5">{patient.name}</h2>

                  <div className="mt-1 flex items-center space-x-3 text-xs">
                    <span className="font-bold text-slate-700">Bed: {bedInfo || 'Cabin 304'}</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-600 text-[11px]">Adm: {new Date().toLocaleDateString()}</span>
                  </div>

                  <div className="mt-1 text-[10px] text-slate-500 truncate">
                    Emergency Contact: {patient.phone || patient.emergency_contact || 'N/A'}
                  </div>
                </div>

                {/* Right Blood Badge */}
                <div className={`flex flex-col items-center justify-center pl-3 border-l border-slate-200 text-center ${hasAllergy ? 'mt-3' : ''}`}>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Blood</span>
                  <div className="w-10 h-10 rounded-full bg-rose-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                    {patient.blood_group?.replace(/_POS/g, '+')?.replace(/_NEG/g, '-') || 'O+'}
                  </div>
                  <span className="text-[8px] text-slate-400 mt-1">WATERPROOF</span>
                </div>
              </div>
            </div>
          ) : (
            /* SPECIMEN TUBE LABELS */
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3">
              {['K2-EDTA (Hematology / CBC)', 'Serum SST (Biochemistry)', 'Sodium Fluoride (Blood Sugar)'].map((testType, i) => (
                <div key={i} className="border-2 border-slate-300 p-2.5 rounded-xl bg-white shadow-sm text-xs font-mono">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <span className="font-bold text-[10px] text-rose-600">{patient.patient_id}</span>
                    <span className="text-[9px] text-slate-500">CareSync Lab</span>
                  </div>
                  <p className="font-bold text-slate-900 truncate mt-1 text-[11px]">{patient.name}</p>
                  <p className="text-[10px] text-slate-600">{patient.age}Y • {patient.gender} • {patient.blood_group?.replace(/_POS/g, '+')}</p>
                  <div className="my-1.5 flex items-center justify-between bg-slate-50 p-1 rounded">
                    <QRCodeSVG value={`TUBE:${patient.patient_id}-${i+1}`} size={36} />
                    <span className="text-[9px] text-slate-700 font-bold text-right">{testType}</span>
                  </div>
                  <p className="text-[8px] text-slate-400 text-right">{new Date().toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 print:hidden">
          <p className="text-xs text-slate-400">Standard 25mm × 280mm Thermal Band Compatible</p>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/30 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Thermal Labels</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientWristbandModal;
