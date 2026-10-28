import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Nav
    dashboard: 'Dashboard',
    patients: 'Patients',
    appointments: 'Appointments & OPD',
    ipdBeds: 'IPD & Bed Allocation',
    emergency: 'Emergency & Triage',
    nursingStation: 'Nursing Station & eMAR',
    operationTheatre: 'Operation Theatre (OT)',
    doctorEmr: 'Doctor EMR & Rx',
    pharmacy: 'Pharmacy & Stock',
    laboratory: 'Laboratory & Tests',
    bloodBank: 'Blood Bank',
    ambulance: 'Ambulance Service',
    billing: 'Billing & Invoicing',
    myRecords: 'My Medical Records',
    users: 'Staff & Roles',
    notifications: 'SMS & Notifications',
    logout: 'Logout',
    // Common
    quickSearch: 'Quick Search...',
    filter: 'Filter',
    status: 'Status',
    actions: 'Actions',
    date: 'Date',
    patient: 'Patient',
    doctor: 'Doctor',
    total: 'Total',
    available: 'Available',
    occupied: 'Occupied',
    paid: 'Paid',
    unpaid: 'Unpaid',
    save: 'Save',
    cancel: 'Cancel',
    print: 'Print'
  },
  bn: {
    // Nav
    dashboard: 'ড্যাশবোর্ড',
    patients: 'রোগী ব্যবস্থাপনা',
    appointments: 'অ্যাপয়েন্টমেন্ট ও ওপিডি',
    ipdBeds: 'আইপিডি ও বেড বরাদ্দ',
    emergency: 'জরুরি ও ট্রায়াজ বিভাগ',
    nursingStation: 'নার্সিং স্টেশন ও ই-মার',
    operationTheatre: 'অপারেশন থিয়েটার (ওটি)',
    doctorEmr: 'ডিজিটাল প্রেসক্রিপশন',
    pharmacy: 'ফার্মেসি ও স্টক',
    laboratory: 'ল্যাবরেটরি ও টেস্ট',
    bloodBank: 'ব্লাড ব্যাংক ও ট্রান্সফিউশন',
    ambulance: 'অ্যাম্বুলেন্স সার্ভিস',
    billing: 'বিলিং ও ফাইন্যান্স',
    myRecords: 'আমার স্বাস্থ্য রেকর্ড',
    users: 'স্টাফ ও রোল নিয়ন্ত্রণ',
    notifications: 'এসএমএস ও নোটিফিকেশন',
    logout: 'লগআউট',
    // Common
    quickSearch: 'দ্রুত অনুসন্ধান...',
    filter: 'ফিল্টার',
    status: 'অবস্থা',
    actions: 'কার্যক্রম',
    date: 'তারিখ',
    patient: 'রোগী',
    doctor: 'ডাক্তার',
    total: 'মোট',
    available: 'খালি',
    occupied: 'ভর্তি',
    paid: 'পরিশোধিত',
    unpaid: 'বকেয়া',
    save: 'সংরক্ষণ',
    cancel: 'বাতিল',
    print: 'প্রিন্ট'
  }
};

const LocaleContext = createContext(null);

export const LocaleProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('hms_lang') || 'en');
  const [currency, setCurrency] = useState(() => localStorage.getItem('hms_currency') || 'BDT');

  useEffect(() => {
    localStorage.setItem('hms_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('hms_currency', currency);
  }, [currency]);

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'bn' : 'en');
  };

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'BDT' ? 'USD' : 'BDT');
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations.en[key] || key;
  };

  const formatMoney = (amount) => {
    const num = parseFloat(amount || 0);
    if (currency === 'BDT') {
      return `৳${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <LocaleContext.Provider value={{ lang, currency, toggleLang, toggleCurrency, t, formatMoney }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within a LocaleProvider');
  return ctx;
};

