"use client";
import { useState, useEffect, useRef } from "react";
import {
  CarFront, MapPin, Users, Coins, ArrowRight,
  Upload, UserCog, FileText, CheckCircle, X, ShieldUser, Banknote
} from "lucide-react";

export default function EditLeadModal({ isOpen, onClose, leadData, onUpdate }) {
  // Prevent rendering if not open
  if (!isOpen) return null;

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [wizardError, setWizardError] = useState("");
  const [errors, setErrors] = useState({});

  // Initial State
  const [formData, setFormData] = useState({
    locationName: "", capacity: "", waitTime: "", mapsUrl: "",
    latitude: "", longitude: "", timing: "", address: "",
    lobbies: "", keyRooms: "", distance: "",
    supervisorUser: "no", validationUser: "no", reportUser: "no",
    ticketType: "pre-printed", feeType: "fixed", ticketPricing: "", vatType: "inclusive",
    driverCount: "", driverList: "",
    adminName: "", adminEmail: "", adminPhone: "", trainingRequired: "yes",
    logoCompany: null, logoClient: null, vatCertificate: null, tradeLicense: null,
    documentSubmitMethod: ""
  });

  // Existing file names (for display purposes)
  const [existingFiles, setExistingFiles] = useState({});

  // POPULATE DATA WHEN MODAL OPENS
  useEffect(() => {
    if (leadData) {
      setFormData((prev) => ({
        ...prev,
        locationName: leadData.locationName || "",
        capacity: leadData.capacity || "",
        waitTime: leadData.waitTime || "",
        mapsUrl: leadData.mapsUrl || "",
        latitude: leadData.latitude || "",
        longitude: leadData.longitude || "",
        timing: leadData.timing || "",
        address: leadData.address || "",
        lobbies: leadData.lobbies || "",
        keyRooms: leadData.keyRooms || "",
        distance: leadData.distance || "",
        supervisorUser: leadData.supervisorUser || "no",
        validationUser: leadData.validationUser || "no",
        reportUser: leadData.reportUser || "no",
        ticketType: leadData.ticketType || "pre-printed",
        feeType: leadData.feeType || "fixed",
        ticketPricing: leadData.ticketPricing || "",
        vatType: leadData.vatType || "inclusive",
        driverCount: leadData.driverCount || "",
        driverList: leadData.driverList || "",
        adminName: leadData.adminName || "",
        adminEmail: leadData.adminEmail || "",
        adminPhone: leadData.adminPhone || "",
        trainingRequired: leadData.trainingRequired || "yes",
        documentSubmitMethod: leadData.documentSubmitMethod || "",
        logoCompany: null,
        logoClient: null,
        vatCertificate: null,
        tradeLicense: null,
      }));

      if (leadData.attachments && Array.isArray(leadData.attachments)) {
        const fileMap = {};
        leadData.attachments.forEach(file => {
            fileMap[file.fieldname] = file.filename;
        });
        setExistingFiles(fileMap);
      }
    }
    setCurrentStep(1); 
  }, [leadData]);

  // --- VALIDATION LOGIC ---
  const validateStep1 = () => {
    let newErrors = {};
    if (!formData.locationName?.trim()) newErrors.locationName = "Required";
    if (!String(formData.capacity)?.trim()) newErrors.capacity = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateStep5 = () => {
    let newErrors = {};
    if (!formData.adminName?.trim()) newErrors.adminName = "Required";
    if (!formData.adminEmail?.trim()) newErrors.adminEmail = "Required";
    if (!formData.adminPhone?.trim()) newErrors.adminPhone = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateBeforeJump = (targetStep) => {
    setWizardError("");
    setCurrentStep(targetStep);
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 5 && !validateStep5()) return;
    setCurrentStep((prev) => prev + 1);
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // --- SUBMIT UPDATE ---
  const handleUpdateSubmit = async () => {
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && typeof value !== "object") {
        formDataToSend.append(key, value);
      }
    });

    if (formData.logoCompany) formDataToSend.append("companyLogo", formData.logoCompany);
    if (formData.logoClient) formDataToSend.append("clientLogo", formData.logoClient);
    if (formData.vatCertificate) formDataToSend.append("vatCertificate", formData.vatCertificate);
    if (formData.tradeLicense) formDataToSend.append("tradeLicense", formData.tradeLicense);

    try {
      const res = await fetch(`/api/all-leads/${leadData._id}`, {
        method: "PUT",
        body: formDataToSend,
      });
      const data = await res.json();
      
      if (data.success) {
        setIsSubmitted(true);
        if (onUpdate) onUpdate(); 
        setTimeout(() => {
            setIsSubmitted(false);
            onClose(); 
        }, 1500);
      } else {
        alert("⚠️ Update failed: " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("❌ Error submitting form.");
    }
  };

  // --- FILE UPLOAD COMPONENT ---
  const FileUploadBlock = ({ label, name, accept, file, currentFileName }) => {
    const fileRef = useRef(null);
    return (
      <div className="border rounded-lg p-2 bg-gray-50 flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-900">{label}</label>
        <input
          ref={fileRef}
          type="file"
          accept={accept}
          name={name}
          onChange={(e) => setFormData((prev) => ({ ...prev, [name]: e.target.files?.[0] }))}
          className="hidden"
        />
        <div className="flex flex-col gap-1">
            {!file && currentFileName && (
                <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mb-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Current: {currentFileName}
                </div>
            )}
            <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center justify-between border border-gray-300 bg-white rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
            >
            <span className="truncate">
                {file ? `New: ${file.name}` : "Change File"}
            </span>
            {file ? <Upload className="w-4 h-4 text-blue-600" /> : <Upload className="w-4 h-4 text-gray-400" />}
            </button>
        </div>
      </div>
    );
  };

  // --- RENDER ---
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-[9999]">
      
      {/* --- MODAL CONTAINER --- */}
      <div className="w-full max-w-5xl bg-white dark:bg-gray-900 border border-gray-400 dark:border-gray-600 rounded-xl max-h-[90vh] overflow-y-auto shadow-xl relative flex flex-col">
        
        {/* --- STICKY HEADER --- */}
        <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700 px-5 py-3 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <UserCog className="w-5 h-5 text-blue-600" /> 
              Edit Lead Details
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Update client information</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <X size={18} />
          </button>
        </div>

        {/* --- CONTENT BODY --- */}
        <div className="p-4 sm:p-6 space-y-4 flex-1">
          
          {/* 1. TABS NAVIGATION (Scroll Wrapper style) */}
          <div className="w-full flex items-center justify-center py-2">
            <div className="flex gap-1 overflow-x-auto no-scrollbar scroll-smooth rounded-lg border border-gray-300 bg-white shadow-sm px-2 py-1"
                style={{ WebkitOverflowScrolling: "touch" }}>
                {[
                { label: "Location", icon: <MapPin size={16} /> },
                { label: "On-Site Users", icon: <Users size={16} /> },
                { label: "Pricing", icon: <Coins size={16} /> },
                { label: "Drivers", icon: <CarFront size={16} /> },
                { label: "Admin Setup", icon: <UserCog size={16} /> },
                { label: "Documents", icon: <FileText size={16} /> },
                ].map((tab, index) => {
                const stepNumber = index + 1;
                const isActive = currentStep === stepNumber;
                const isCompleted = currentStep > stepNumber;
                return (
                    <button
                    key={tab.label}
                    onClick={() => validateBeforeJump(stepNumber)}
                    className={`
                        flex items-center gap-2 px-5 py-2 text-sm font-medium whitespace-nowrap rounded-md
                        transition-all duration-300 ease-out select-none
                        ${isActive
                            ? "bg-blue-600 text-white shadow-md scale-[1.05]"
                            : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                        }
                    `}
                    >
                    {tab.icon} {tab.label}
                    </button>
                );
                })}
            </div>
          </div>

          {/* 2. PROGRESS BAR */}
          <div className="border-b pb-4">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Step {currentStep} of 6
                </p>
                <div className="w-full bg-gray-200 h-1.5 mt-2 rounded-full overflow-hidden">
                    <div 
                        className="bg-blue-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${(currentStep / 6) * 100}%` }}
                    ></div>
                </div>
           </div>

          {/* WIZARD ERROR MESSAGE */}
          {wizardError && (
            <div className="text-red-600 text-sm bg-red-100 border border-red-300 px-3 py-2 rounded-lg text-center">
              ⚠️ {wizardError}
            </div>
          )}

          {/* SUCCESS MESSAGE */}
          {isSubmitted ? (
            <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 p-8 rounded-lg text-center flex flex-col items-center gap-3">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
              <h3 className="text-xl font-bold">Updated Successfully!</h3>
              <p>Closing form...</p>
            </div>
          ) : (
            
            /* --- FORM FIELDS START --- */
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              
              {/* STEP 1: LOCATION */}
              {currentStep === 1 && (
                <div className="space-y-3">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Location Information</h2>
                    <p className="text-xs sm:text-sm text-gray-500">Basic details about the property where valet parking will be operated.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-1">
                      <label className="text-sm font-medium text-gray-900">Location Name *</label>
                      <input type="text" name="locationName" value={formData.locationName} onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.locationName ? "border-red-500" : "border-gray-300"}`} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-900">Capacity *</label>
                      <input type="number" name="capacity" value={formData.capacity} onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.capacity ? "border-red-500" : "border-gray-300"}`} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-900">Avg Wait Time</label>
                      <input type="text" name="waitTime" value={formData.waitTime} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-900">Maps URL</label>
                      <input type="url" name="mapsUrl" value={formData.mapsUrl} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-900">Latitude</label>
                      <input type="text" name="latitude" value={formData.latitude} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-900">Longitude</label>
                      <input type="text" name="longitude" value={formData.longitude} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-900">Operation Timing</label>
                      <input type="text" name="timing" value={formData.timing} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-sm font-medium text-gray-900">Address / TRN</label>
                      <textarea rows={2} name="address" value={formData.address} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: USERS */}
              {currentStep === 2 && (
                <div className="space-y-3">
                   <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">On-Site User Setup</h2>
                        <p className="text-xs sm:text-sm text-gray-500">Internal users + operational setup details.</p>
                    </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-900">Lobbies</label>
                      <input type="number" name="lobbies" value={formData.lobbies} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-900">Key Rooms</label>
                      <input type="number" name="keyRooms" value={formData.keyRooms} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-900">Distance</label>
                      <input type="text" name="distance" value={formData.distance} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    {/* Radios */}
                    {['supervisorUser', 'validationUser', 'reportUser'].map(field => (
                      <div key={field} className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                        <p className="text-sm font-medium text-gray-900 mb-1 capitalize">{field.replace('User', '')} Access?</p>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                            <input type="radio" name={field} value="yes" checked={formData[field] === "yes"} onChange={handleChange} className="text-blue-600 focus:ring-blue-500" /> Yes
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                            <input type="radio" name={field} value="no" checked={formData[field] === "no"} onChange={handleChange} className="text-blue-600 focus:ring-blue-500" /> No
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: PRICING */}
              {currentStep === 3 && (
                <div className="space-y-3">
                   <div>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">Valet Ticket & Pricing</h2>
                        <p className="text-xs text-gray-500">Tell us how tickets are generated and how you charge guests.</p>
                    </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                      <label className="block text-sm font-medium text-gray-900 mb-2">Ticket Type</label>
                      <div className="flex flex-col gap-2">
                        <label className="flex gap-2 text-sm text-gray-700"><input type="radio" name="ticketType" value="pre-printed" checked={formData.ticketType === "pre-printed"} onChange={handleChange} className="text-blue-600" /> Pre-printed</label>
                        <label className="flex gap-2 text-sm text-gray-700"><input type="radio" name="ticketType" value="system-generated" checked={formData.ticketType === "system-generated"} onChange={handleChange} className="text-blue-600" /> System Generated</label>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                      <label className="block text-sm font-medium text-gray-900 mb-2">Fee Type</label>
                      <div className="flex gap-4 flex-wrap">
                        <label className="flex gap-2 text-sm text-gray-700"><input type="radio" name="feeType" value="fixed" checked={formData.feeType === "fixed"} onChange={handleChange} className="text-blue-600" /> Fixed</label>
                        <label className="flex gap-2 text-sm text-gray-700"><input type="radio" name="feeType" value="hourly" checked={formData.feeType === "hourly"} onChange={handleChange} className="text-blue-600" /> Hourly</label>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        Ticket Prices (AED) <Banknote className="w-4 h-4 text-gray-400" />
                        </label>
                      <textarea rows={2} name="ticketPricing" value={formData.ticketPricing} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: DRIVERS */}
              {currentStep === 4 && (
                <div className="space-y-3">
                   <div>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2"><UserCog className="w-5 h-5 text-blue-600" /> Drivers / CVA Team</h2>
                        <p className="text-sm text-gray-500">Details of drivers who will be mapped to this location.</p>
                    </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-900">Driver Count</label>
                      <input type="number" name="driverCount" value={formData.driverCount} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-900">Driver List</label>
                      <textarea rows={5} name="driverList" value={formData.driverList} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm" />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: ADMIN */}
              {currentStep === 5 && (
                <div className="space-y-3">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2"><ShieldUser className="w-5 h-5 text-blue-600" /> Super Admin Contact</h2>
                        <p className="text-sm text-gray-500">Main person responsible for valet operations & application access.</p>
                    </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-900">Admin Name *</label>
                      <input type="text" name="adminName" value={formData.adminName} onChange={handleChange} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.adminName ? "border-red-500" : "border-gray-300"}`} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-900">Email *</label>
                      <input type="email" name="adminEmail" value={formData.adminEmail} onChange={handleChange} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.adminEmail ? "border-red-500" : "border-gray-300"}`} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-900">Phone *</label>
                      <input type="tel" name="adminPhone" value={formData.adminPhone} onChange={handleChange} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.adminPhone ? "border-red-500" : "border-gray-300"}`} />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: DOCUMENTS */}
              {currentStep === 6 && (
                <div className="space-y-3">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">📎 Required Documents</h2>
                        <p className="text-xs text-gray-500">Upload now or submit later via email/WhatsApp.</p>
                    </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FileUploadBlock label="Company Logo" name="logoCompany" accept="image/*" file={formData.logoCompany} currentFileName={existingFiles.companyLogo} />
                    <FileUploadBlock label="Client Logo" name="logoClient" accept="image/*" file={formData.logoClient} currentFileName={existingFiles.clientLogo} />
                    <FileUploadBlock label="VAT Cert" name="vatCertificate" accept="application/pdf" file={formData.vatCertificate} currentFileName={existingFiles.vatCertificate} />
                    <FileUploadBlock label="Trade License" name="tradeLicense" accept="application/pdf" file={formData.tradeLicense} currentFileName={existingFiles.tradeLicense} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-900">Submission Method</label>
                    <textarea rows={2} name="documentSubmitMethod" value={formData.documentSubmitMethod} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- STICKY FOOTER ACTIONS --- */}
        {!isSubmitted && (
          <div className="sticky bottom-0 z-10 bg-white dark:bg-gray-900 border-t border-gray-300 dark:border-gray-700 p-4 flex justify-between shrink-0">
            {currentStep > 1 ? (
              <button onClick={() => setCurrentStep(prev => prev - 1)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium">
                ← Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 6 ? (
              <button onClick={handleNext} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition">
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleUpdateSubmit} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition shadow-sm">
                Update Lead
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}