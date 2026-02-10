import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";

// --- Icons ---
const Icons = {
  CheckCircle: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Upload: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>,
  Pen: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
  Image: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  ChevronRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>,
  Shield: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
};

// --- Reusable Components ---

const SectionHeader = ({ number, title, subtitle }) => (
  <div className="mb-6 border-b border-slate-100 pb-4">
    <h2 className="text-xl font-bold text-slate-800">{title}</h2>
    <p className="text-sm text-slate-500">{subtitle}</p>
  </div>
);

const InputGroup = ({ label, required, children }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-sm font-semibold text-slate-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const TextInput = ({ placeholder, type = "text", ...props }) => (
  <input
    type={type}
    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
    placeholder={placeholder}
    {...props}
  />
);

const TextArea = ({ placeholder, ...props }) => (
  <textarea
    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400 min-h-[80px]"
    placeholder={placeholder}
    {...props}
  />
);

const SelectInput = ({ options, placeholder, ...props }) => (
  <div className="relative w-full">
    <select
      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none cursor-pointer"
      {...props}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
    </div>
  </div>
);

// --- Main Page Component ---

function FormPage() {
  const navigate = useNavigate(); 
  const [completion, setCompletion] = useState(0);
  const [signatureMode, setSignatureMode] = useState('draw');
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // --- 1. Centralized Form Data ---
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    bloodGroup: '',
    department: '', // <--- NEW FIELD ADDED
    designation: '',
    officeLocation: '',
    cfmsId: '',
    hrmsId: '',
    address: '',
    mobileNumber: '',
    photo: null,
    signature: null
  });

  // --- 2. Load Existing Data on Mount ---
  useEffect(() => {
    const storedData = sessionStorage.getItem('employeeData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setFormData(parsedData);
      } catch (error) {
        console.error('Error loading stored data:', error);
      }
    }
  }, []);

  // --- 3. Calculate Completion Percentage ---
  useEffect(() => {
    // Both CFMS and HRMS are now required
    const requiredFields = [
      'firstName', 'lastName', 'bloodGroup', 
      'department', // <--- NEW FIELD ADDED TO VALIDATION
      'designation', 'officeLocation', 
      'cfmsId', 'hrmsId', 
      'address', 'mobileNumber', 
      'photo', 'signature'
    ];

    const filledCount = requiredFields.filter(field => {
      const val = formData[field];
      return val && val.toString().trim() !== '';
    }).length;

    const percentage = Math.round((filledCount / requiredFields.length) * 100);
    setCompletion(percentage);
  }, [formData]);

  // --- Handlers ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, photo: null }));
  };

  // --- Signature Logic ---
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      // Automatically save to state on stop
      const canvas = canvasRef.current;
      setFormData(prev => ({ ...prev, signature: canvas.toDataURL() }));
    }
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, signature: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSignature = () => {
    setFormData(prev => ({ ...prev, signature: null }));
    
    if (signatureMode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // --- Final Submission ---
  const handleSubmit = () => {
    if (completion < 100) {
      console.warn("Form is incomplete");
      alert("Please complete all required fields (100%) before previewing.");
      return;
    }
    sessionStorage.setItem(
      "employeeData",
      JSON.stringify(formData)
    );
    navigate("/preview");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-32 sm:pb-28 pt-6 sm:pt-8">
      
      <div className="max-w-5xl mx-auto px-3 sm:px-4 space-y-6 sm:space-y-8">
        
        {/* Page Title & Progress */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Employee Details Form</h1>
          <p className="text-sm sm:text-base text-slate-500 mb-6 sm:mb-8">Complete all sections to generate your official ID card</p>

          <div className="space-y-2">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-bold text-slate-700">Form Completion</span>
              <span className={`text-2xl font-bold ${completion === 100 ? 'text-emerald-600' : 'text-slate-700'}`}>
                {completion}%
              </span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-emerald-500" 
                initial={{ width: 0 }}
                animate={{ width: `${completion}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 font-medium pt-1">
              <span className="hidden sm:inline">Started</span>
              <span className="hidden sm:inline">In Progress</span>
              <span className="hidden sm:inline">Complete</span>
              <span className="sm:hidden">0%</span>
              <span className="sm:hidden">50%</span>
              <span className="sm:hidden">100%</span>
            </div>
          </div>
        </div>

        {/* --- FORM SECTIONS --- */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
          <SectionHeader number="1" title="Personal Information" subtitle="Name and blood group details" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <InputGroup label="First Name" required>
              <TextInput 
                name="firstName" 
                value={formData.firstName} 
                onChange={handleInputChange} 
                placeholder="First Name" 
              />
            </InputGroup>
            
            <InputGroup label="Middle Name">
              <TextInput 
                name="middleName" 
                value={formData.middleName} 
                onChange={handleInputChange} 
                placeholder="Middle (Optional)" 
              />
            </InputGroup>
            
            <InputGroup label="Last Name" required>
              <TextInput 
                name="lastName" 
                value={formData.lastName} 
                onChange={handleInputChange} 
                placeholder="Last Name" 
              />
            </InputGroup>

            <InputGroup label="Blood Group" required>
              <SelectInput 
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleInputChange}
                options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']} 
                placeholder="Select Group" 
              />
            </InputGroup>
          </div>
        </div>

        {/* 2. Employment Details (Designation, Office, CFMS & HRMS) */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
          <SectionHeader number="2" title="Employment Details" subtitle="Job role, Department and official IDs" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* NEW FIELD: Department (Full width on medium screens) */}
            <div className="md:col-span-2">
                <InputGroup label="Government Department" required>
                <TextInput 
                    name="department" 
                    value={formData.department} 
                    onChange={handleInputChange} 
                    placeholder="e.g. Revenue Department, School Education, Medical & Health" 
                />
                </InputGroup>
            </div>
            
            <InputGroup label="Designation" required>
               <TextInput 
                name="designation" 
                value={formData.designation} 
                onChange={handleInputChange} 
                placeholder="e.g. Software Engineer" 
              />
            </InputGroup>

            <InputGroup label="Office / Location" required>
              <TextInput 
                name="officeLocation" 
                value={formData.officeLocation} 
                onChange={handleInputChange} 
                placeholder="e.g. Head Office, Vijayawada" 
              />
            </InputGroup>

            <InputGroup label="CFMS ID" required>
              <TextInput
                name="cfmsId"
                value={formData.cfmsId}
                onChange={handleInputChange}
                placeholder="Enter CFMS ID"
              />
            </InputGroup>

            <InputGroup label="HRMS ID" required>
              <TextInput
                name="hrmsId"
                value={formData.hrmsId}
                onChange={handleInputChange}
                placeholder="Enter HRMS ID"
              />
            </InputGroup>

          </div>
        </div>

        {/* 3. Contact & Identification */}
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
          <SectionHeader number="3" title="Contact & Identification" subtitle="Address and Mobile Number" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            
            <div className="md:col-span-2">
              <InputGroup label="Permanent Address" required>
                <TextArea 
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Full address including House No, Street, City, District and Pincode" 
                />
              </InputGroup>
            </div>

            <InputGroup label="Mobile Number" required>
              <TextInput 
                name="mobileNumber" 
                value={formData.mobileNumber} 
                onChange={handleInputChange} 
                type="tel"
                placeholder="10-digit mobile number" 
                maxLength={10}
              />
            </InputGroup>

          </div>
        </div>

        {/* 4. Photo Upload */}
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
          <SectionHeader number="4" title="Photo Upload" subtitle="Upload passport-size photograph" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 sm:p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors">
              <div className="bg-emerald-100 text-emerald-600 p-3 rounded-full mb-3"><Icons.Upload /></div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">Upload Photo</h3>
              <p className="text-xs sm:text-sm text-slate-500 mb-4">Drag and drop or click to browse</p>
              
              <label className="cursor-pointer bg-white border border-slate-300 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm text-slate-700">
                Choose File
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </label>
            </div>

            {/* Preview Area */}
            <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 relative">
              <h4 className="absolute top-4 left-4 text-xs font-bold text-slate-400 uppercase">Photo Preview</h4>
              {formData.photo ? (
                <div className="relative group">
                  <img src={formData.photo} alt="Preview" className="w-24 sm:w-32 h-32 sm:h-40 object-cover rounded-lg shadow-sm" />
                  <button 
                    onClick={removePhoto}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Icons.Trash />
                  </button>
                </div>
              ) : (
                <div className="w-24 sm:w-32 h-32 sm:h-40 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400">
                  <span className="text-xs text-center">No photo uploaded</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 5. Signature */}
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
          <SectionHeader number="5" title="Signature" subtitle="Draw or upload your signature" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
            {/* Input Area */}
            <div>
              {/* Mode toggle buttons */}
              <div className="flex gap-2 mb-4 bg-slate-100 p-1 rounded-lg w-fit">
                <button 
                  onClick={() => setSignatureMode('draw')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${signatureMode === 'draw' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Icons.Pen /> Draw
                </button>
                <button 
                  onClick={() => setSignatureMode('upload')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${signatureMode === 'upload' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Icons.Upload /> Upload
                </button>
              </div>

              {/* Draw Mode */}
              {signatureMode === 'draw' && (
                <div className="relative">
                  <canvas 
                    ref={canvasRef}
                    width={400} 
                    height={200}
                    className="w-full h-40 sm:h-48 border-2 border-slate-200 rounded-xl bg-white cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                  <div className="flex gap-3 mt-3">
                    <button onClick={removeSignature} className="px-4 py-2 text-xs sm:text-sm text-slate-500 hover:bg-slate-100 rounded-lg font-medium transition-colors border border-transparent hover:border-slate-200">
                      Clear
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Sign within the box</p>
                </div>
              )}

              {/* Upload Mode */}
              {signatureMode === 'upload' && (
                <div>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 sm:p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors h-40 sm:h-48">
                    <div className="bg-emerald-100 text-emerald-600 p-3 rounded-full mb-3"><Icons.Upload /></div>
                    <p className="text-xs sm:text-sm text-slate-500 mb-4">Drag and drop or click to browse</p>
                    
                    <label className="cursor-pointer bg-white border border-slate-300 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm text-slate-700">
                      Choose File
                      <input type="file" className="hidden" accept="image/*" onChange={handleSignatureUpload} />
                    </label>
                  </div>
                  <p className="text-xs text-slate-400 mt-3">💡 Tip: For best results, upload a PNG image with transparent background (no white box)</p>
                </div>
              )}
            </div>

            {/* Preview Area */}
            <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 relative min-h-[160px] sm:min-h-[200px]">
              <h4 className="absolute top-4 left-4 text-xs font-bold text-slate-400 uppercase">Signature Preview</h4>
              {formData.signature ? (
                <div className="relative group w-full h-full flex items-center justify-center">
                  <img src={formData.signature} alt="Signature" className="max-w-[80%] max-h-32 object-contain" style={{ backgroundColor: 'transparent', mixBlendMode: 'multiply' }} />
                  <button 
                    onClick={removeSignature}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Icons.Trash />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-slate-400 gap-2">
                  <Icons.Pen />
                  <span className="text-sm">No signature added</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Persistent Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 sm:p-4 shadow-lg z-40">
        <div className="max-w-5xl mx-auto flex justify-between items-center gap-3">
          <button onClick={() => navigate("/")} className="text-xs sm:text-sm text-slate-500 font-semibold hover:text-slate-800 transition-colors">
             ← Back
          </button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            className={`px-4 sm:px-8 py-2 sm:py-3 rounded-lg font-bold shadow-lg transition-all flex items-center gap-2 text-sm sm:text-base ${
                completion === 100 
                ? 'bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-700' 
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span className="hidden sm:inline">Preview ID Card</span>
            <span className="sm:hidden">Preview</span>
            <Icons.ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>
        </div>
      </div>
      
    </div>
  );
}

export default FormPage;