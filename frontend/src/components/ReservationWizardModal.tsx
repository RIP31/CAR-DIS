import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  FileText,
  Sliders,
  CheckCircle,
  Briefcase,
  Info
} from 'lucide-react';
import type { Vehicle } from '../types';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getCarImage } from './VehicleCard';
import { parseVehicleDescription } from '../utils/vehicleHelper';

interface ReservationWizardModalProps {
  vehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (reservationNumber: string) => void;
}

export const ReservationWizardModal: React.FC<ReservationWizardModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Wizard Steps: 1 (Personal), 2 (Address), 3 (Identity), 4 (Preferences), 5 (Review), 6 (Success)
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [reservationResult, setReservationResult] = useState<{
    reservationNumber: string;
    status: string;
    estimatedDealerResponse: string;
  } | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    // Step 1
    customer_name: '',
    customer_email: '',
    phone: '',
    alternate_phone: '',

    // Step 2
    address_line: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',

    // Step 3
    govt_id_type: 'Driver License',
    govt_id_number: '',
    driving_license_number: '',
    date_of_birth: '',

    // Step 4
    finance_required: false,
    trade_in_required: false,
    preferred_visit_date: '',
    preferred_visit_time: '10:00 AM',
    customer_notes: '',
  });

  // Errors for validations
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-fill profile info
  useEffect(() => {
    if (user && isOpen) {
      setFormData((prev) => ({
        ...prev,
        customer_name: user.name || '',
        customer_email: user.email || '',
      }));
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));
    
    // Clear error
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.customer_name.trim()) newErrors.customer_name = 'Full name is required';
      if (!formData.customer_email.trim()) newErrors.customer_email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.customer_email)) newErrors.customer_email = 'Invalid email address';
      if (!formData.phone.trim()) newErrors.phone = 'Mobile number is required';
    } else if (currentStep === 2) {
      if (!formData.address_line.trim()) newErrors.address_line = 'Address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.state.trim()) newErrors.state = 'State is required';
      if (!formData.country.trim()) newErrors.country = 'Country is required';
      if (!formData.postal_code.trim()) newErrors.postal_code = 'Postal code is required';
    } else if (currentStep === 3) {
      if (!formData.govt_id_type.trim()) newErrors.govt_id_type = 'Government ID type is required';
      if (!formData.govt_id_number.trim()) newErrors.govt_id_number = 'Government ID number is required';
      if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    } else if (currentStep === 4) {
      if (!formData.preferred_visit_date) newErrors.preferred_visit_date = 'Preferred visit date is required';
      if (!formData.preferred_visit_time) newErrors.preferred_visit_time = 'Preferred visit time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!termsAccepted) {
      showToast('Please accept the Terms & Conditions', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/purchases', {
        vehicle_id: vehicle.id,
        quantity: 1,
        ...formData,
      });

      const resData = response.data;
      setReservationResult({
        reservationNumber: resData.reservation_number || 'RES-PENDING',
        status: resData.reservation_status || 'Reservation Submitted',
        estimatedDealerResponse: '24 to 48 Hours',
      });
      showToast('Reservation Request Submitted Successfully!', 'success');
      onSuccess(resData.reservation_number || 'RES-PENDING');
      setStep(6); // Success screen
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to submit reservation. Please try again.';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToReservations = () => {
    onClose();
    navigate('/my-reservations');
  };

  const { variant, images } = parseVehicleDescription(vehicle.description || null, vehicle.model, vehicle.image_url || null);
  const imageUrl = images[0] || getCarImage(vehicle.category, vehicle.image_url || undefined);

  // Stepper Header
  const stepsList = [
    { num: 1, label: 'Profile', icon: User },
    { num: 2, label: 'Address', icon: MapPin },
    { num: 3, label: 'Identity', icon: FileText },
    { num: 4, label: 'Preferences', icon: Sliders },
    { num: 5, label: 'Review', icon: CheckCircle },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
        onClick={step === 6 ? undefined : onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col animate-fade-in-up border border-slate-100">
        
        {/* Close button (only available if not completed) */}
        {step < 6 && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 bg-slate-100 hover:bg-slate-200 rounded-full border border-slate-200 transition-colors cursor-pointer z-10"
          >
            <X className="h-4 w-4 text-slate-700" />
          </button>
        )}

        {/* Header (Stepper) */}
        {step < 6 && (
          <div className="bg-slate-900 text-white p-6 rounded-t-3xl shrink-0">
            <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
              <span className="bg-blue-600 px-3 py-1 rounded-full text-xs font-extrabold uppercase">RESERVE</span>
              {vehicle.make} {vehicle.model}
            </h2>
            
            {/* Visual Stepper */}
            <div className="flex justify-between items-center relative z-0">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-700 -z-10 transform -translate-y-1/2" />
              {stepsList.map((s) => {
                const isCompleted = step > s.num;
                const isActive = step === s.num;
                return (
                  <div key={s.num} className="flex flex-col items-center gap-1.5 bg-slate-900 px-2">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCompleted
                          ? 'bg-emerald-600 text-white border-2 border-emerald-600 scale-105'
                          : isActive
                          ? 'bg-blue-600 text-white border-2 border-blue-600 ring-4 ring-blue-600/30 scale-110'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {isCompleted ? <CheckCircle className="h-4 w-4" /> : s.num}
                    </div>
                    <span className={`text-[10px] uppercase font-bold tracking-wider hidden md:inline ${isActive ? 'text-blue-400' : 'text-slate-400'}`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-800 uppercase tracking-wide">Personal Details</h3>
                <p className="text-xs text-slate-500 mt-1">Please provide your primary contact details. We will use these to coordinate your vehicle reservation.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
                      errors.customer_name ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-100'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.customer_name && <p className="text-rose-600 text-[10px] font-bold mt-1">{errors.customer_name}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    name="customer_email"
                    value={formData.customer_email}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
                      errors.customer_email ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-100'
                    }`}
                    placeholder="Enter your email"
                  />
                  {errors.customer_email && <p className="text-rose-600 text-[10px] font-bold mt-1">{errors.customer_email}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Mobile Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
                      errors.phone ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-100'
                    }`}
                    placeholder="Enter mobile number"
                  />
                  {errors.phone && <p className="text-rose-600 text-[10px] font-bold mt-1">{errors.phone}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Alternate Phone <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <input
                    type="text"
                    name="alternate_phone"
                    value={formData.alternate_phone}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter alternate number"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-800 uppercase tracking-wide">Residence Address</h3>
                <p className="text-xs text-slate-500 mt-1">Please provide your billing or primary residential address.</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Address Line</label>
                  <input
                    type="text"
                    name="address_line"
                    value={formData.address_line}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
                      errors.address_line ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-100'
                    }`}
                    placeholder="Street Address, Suite, Apartment"
                  />
                  {errors.address_line && <p className="text-rose-600 text-[10px] font-bold mt-1">{errors.address_line}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full p-3 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
                        errors.city ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-100'
                      }`}
                      placeholder="City Name"
                    />
                    {errors.city && <p className="text-rose-600 text-[10px] font-bold mt-1">{errors.city}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">State / Province</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className={`w-full p-3 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
                        errors.state ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-100'
                      }`}
                      placeholder="State Name"
                    />
                    {errors.state && <p className="text-rose-600 text-[10px] font-bold mt-1">{errors.state}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className={`w-full p-3 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
                        errors.country ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-100'
                      }`}
                      placeholder="Country Name"
                    />
                    {errors.country && <p className="text-rose-600 text-[10px] font-bold mt-1">{errors.country}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Postal Code</label>
                    <input
                      type="text"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleChange}
                      className={`w-full p-3 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
                        errors.postal_code ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-100'
                      }`}
                      placeholder="Zip/Postal Code"
                    />
                    {errors.postal_code && <p className="text-rose-600 text-[10px] font-bold mt-1">{errors.postal_code}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-800 uppercase tracking-wide">Identity Information</h3>
                <p className="text-xs text-slate-500 mt-1">To verify your eligibility for dealership purchases, we require valid identity credentials.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Government ID Type</label>
                  <select
                    name="govt_id_type"
                    value={formData.govt_id_type}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Driver License">Driver License</option>
                    <option value="Passport">Passport</option>
                    <option value="SSN">SSN / National ID</option>
                    <option value="Other ID">Other ID</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Government ID Number</label>
                  <input
                    type="text"
                    name="govt_id_number"
                    value={formData.govt_id_number}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
                      errors.govt_id_number ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-100'
                    }`}
                    placeholder="Enter ID Number"
                  />
                  {errors.govt_id_number && <p className="text-rose-600 text-[10px] font-bold mt-1">{errors.govt_id_number}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Driving License Number <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <input
                    type="text"
                    name="driving_license_number"
                    value={formData.driving_license_number}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter Driving License"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
                      errors.date_of_birth ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-100'
                    }`}
                  />
                  {errors.date_of_birth && <p className="text-rose-600 text-[10px] font-bold mt-1">{errors.date_of_birth}</p>}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-800 uppercase tracking-wide">Purchase Preferences</h3>
                <p className="text-xs text-slate-500 mt-1">Tailor your luxury dealership visit and checkout details.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Finance and Trade-in switches */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-slate-800">Finance Required</p>
                      <p className="text-[10px] text-slate-400">Do you need a car loan scheme?</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="finance_required"
                        checked={formData.finance_required}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <hr className="border-slate-200" />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-slate-800">Trade-In Vehicle</p>
                      <p className="text-[10px] text-slate-400">Do you wish to swap your current car?</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="trade_in_required"
                        checked={formData.trade_in_required}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                {/* Visit timing */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Preferred visit date</label>
                    <div className="relative">
                      <input
                        type="date"
                        name="preferred_visit_date"
                        value={formData.preferred_visit_date}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full p-3 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
                          errors.preferred_visit_date ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-100'
                        }`}
                      />
                      {errors.preferred_visit_date && <p className="text-rose-600 text-[10px] font-bold mt-1">{errors.preferred_visit_date}</p>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Preferred visit time</label>
                    <select
                      name="preferred_visit_time"
                      value={formData.preferred_visit_time}
                      onChange={handleChange}
                      className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="09:00 AM">09:00 AM - Morning Slot</option>
                      <option value="11:00 AM">11:00 AM - Morning Slot</option>
                      <option value="01:00 PM">01:00 PM - Afternoon Slot</option>
                      <option value="03:00 PM">03:00 PM - Afternoon Slot</option>
                      <option value="05:00 PM">05:00 PM - Evening Slot</option>
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Notes for Dealer <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <textarea
                    name="customer_notes"
                    value={formData.customer_notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                    placeholder="Enter any special requests, questions about configurations, or instructions."
                  />
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-800 uppercase tracking-wide">Review details</h3>
                <p className="text-xs text-slate-500 mt-1">Please confirm that all details are accurate before submitting.</p>
              </div>

              {/* Vehicle info summary */}
              <div className="flex gap-4 items-center bg-slate-900 text-white rounded-2xl p-4">
                <img
                  src={imageUrl}
                  alt={vehicle.model}
                  className="h-16 w-24 rounded-lg object-cover bg-slate-800 shrink-0"
                />
                <div>
                  <h4 className="text-base font-bold leading-tight">{vehicle.make} {vehicle.model}</h4>
                  {variant && variant !== 'Standard' && <p className="text-xs text-slate-400">{variant}</p>}
                  <p className="text-sm font-semibold text-blue-400 font-['Outfit'] mt-1">
                    ${vehicle.price.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Review sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-slate-700">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-blue-600" />
                    Customer Details
                  </h4>
                  <p><span className="font-semibold text-slate-500">Name:</span> {formData.customer_name}</p>
                  <p><span className="font-semibold text-slate-500">Email:</span> {formData.customer_email}</p>
                  <p><span className="font-semibold text-slate-500">Phone:</span> {formData.phone}</p>
                  <p><span className="font-semibold text-slate-500">Alternate:</span> {formData.alternate_phone || 'N/A'}</p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-blue-600" />
                    Address details
                  </h4>
                  <p className="leading-relaxed">{formData.address_line}</p>
                  <p>{formData.city}, {formData.state}, {formData.postal_code}</p>
                  <p>{formData.country}</p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-blue-600" />
                    Identity Info
                  </h4>
                  <p><span className="font-semibold text-slate-500">Type:</span> {formData.govt_id_type}</p>
                  <p><span className="font-semibold text-slate-500">ID Number:</span> {formData.govt_id_number}</p>
                  <p><span className="font-semibold text-slate-500">DL:</span> {formData.driving_license_number || 'N/A'}</p>
                  <p><span className="font-semibold text-slate-500">DOB:</span> {formData.date_of_birth}</p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-blue-600" />
                    Preferences
                  </h4>
                  <p><span className="font-semibold text-slate-500">Finance Req:</span> {formData.finance_required ? 'Yes' : 'No'}</p>
                  <p><span className="font-semibold text-slate-500">Trade-In:</span> {formData.trade_in_required ? 'Yes' : 'No'}</p>
                  <p><span className="font-semibold text-slate-500">Visit:</span> {formData.preferred_visit_date} @ {formData.preferred_visit_time}</p>
                </div>
              </div>

              {/* T&C checkbox */}
              <div className="flex items-start gap-3 bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 h-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer focus:ring-blue-500"
                />
                <label htmlFor="terms" className="text-xs text-slate-600 leading-relaxed cursor-pointer font-medium select-none">
                  I confirm that all provided profile information and identity credentials are true. I agree to pay the dealership booking amount upon visit verification and accept the standard Car Dealership Purchase workflow terms.
                </label>
              </div>
            </div>
          )}

          {step === 6 && reservationResult && (
            <div className="text-center py-6 space-y-6">
              <div className="flex justify-center">
                <div className="h-20 w-20 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-500">
                  <CheckCircle className="h-10 w-10 animate-bounce" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Reservation Confirmed</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Your luxury car reservation request has been transmitted successfully to our dealer representatives.
                </p>
              </div>

              {/* Invoice / Reservation Detail Box */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 max-w-sm mx-auto text-sm space-y-3.5 shadow-sm text-left">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-800">Reservation No</span>
                  <span className="font-extrabold text-blue-600 font-mono tracking-wider">{reservationResult.reservationNumber}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Status</span>
                  <span className="bg-blue-50 border border-blue-100 text-blue-700 px-3 py-0.5 rounded-full font-bold uppercase text-[9px] tracking-wider">
                    {reservationResult.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Estimated Response</span>
                  <span className="font-semibold text-slate-700">{reservationResult.estimatedDealerResponse}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Booking Price</span>
                  <span className="font-bold text-slate-900 font-['Outfit']">${vehicle.price.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-start gap-2 bg-amber-50/60 border border-amber-100 p-2.5 rounded-xl">
                  <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-800 leading-normal">
                    Note: An invoice will be generated and ready for download after Payment is Received.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-center pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-3 text-xs font-bold uppercase tracking-wider rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={handleGoToReservations}
                  className="px-6 py-3 text-xs font-bold uppercase tracking-wider rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/10 transition-all cursor-pointer flex items-center gap-1.5 border-none"
                >
                  My Reservations
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer (Actions) */}
        {step < 6 && (
          <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex justify-between shrink-0">
            <button
              onClick={handleBack}
              disabled={step === 1 || loading}
              className={`py-3 px-5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-slate-200 flex items-center gap-1.5 bg-white text-slate-700 hover:bg-slate-50 ${
                step === 1 ? 'opacity-0 pointer-events-none' : ''
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>

            {step < 5 ? (
              <button
                onClick={handleNext}
                className="py-3 px-6 text-xs font-bold uppercase tracking-wider rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/15 transition-all cursor-pointer flex items-center gap-1.5 border-none"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="py-3 px-8 text-xs font-bold uppercase tracking-wider rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/15 transition-all cursor-pointer flex items-center gap-2 border-none font-extrabold"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Briefcase className="h-4 w-4" />
                    Submit Reservation
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
