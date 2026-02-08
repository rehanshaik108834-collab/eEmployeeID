import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Load heavy libs (html2canvas, jsPDF) dynamically when needed to reduce initial bundle size
import { toast } from "react-hot-toast";
import logoImg from "../../assets/logo.svg"; // Use compact company logo to reduce bundle size

// Styles for media-responsive watermark
const styles = `
  .watermark-logo {
    width: 160px !important;
  }
  
  @media print {
    .watermark-logo {
      width: 67px !important;
    }
  }
`;

function PreviewPage() {
  const [employee, setEmployee] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  // Retrieve data from sessionStorage
  useEffect(() => {
    const storedData = sessionStorage.getItem("employeeData");

    if (!storedData) {
      toast.error("Please fill the form before previewing ID card");
      navigate("/form");
      return;
    }

    try {
      setEmployee(JSON.parse(storedData));
    } catch (error) {
      console.error("Error parsing employee data:", error);
      toast.error("Invalid data format. Please fill the form again.");
      navigate("/form");
    }
  }, [navigate]);

  const downloadPDF = async () => {
    try {
      setIsGenerating(true);
      // dynamic imports keep these libraries out of initial bundle
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);

      const cardContainer = document.getElementById("id-card-container");

      if (!cardContainer) {
        toast.error("ID card element not found");
        setIsGenerating(false);
        return;
      }

      const toastId = toast.loading("Generating PDF...");

      // Print settings: CR80 card at ~300 DPI
      const DPI = 300;
      const mmPerInch = 25.4;
      const printWidthMM = 85.6;
      const printHeightMM = 54;
      const printWidthPx = Math.round((printWidthMM / mmPerInch) * DPI);
      const printHeightPx = Math.round((printHeightMM / mmPerInch) * DPI);
      const scale = DPI / 96; // html2canvas scale relative to CSS px baseline

      // Find individual card elements to capture (front/back)
      const cards = cardContainer.querySelectorAll('[data-print-card]');
      if (!cards || cards.length === 0) {
        toast.error('No card elements found for printing', { id: toastId });
        setIsGenerating(false);
        return;
      }

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [printWidthMM, printHeightMM] });

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];

        // Measure the card on-screen to compute proper scale so canvas pixels == print pixels
        const rect = card.getBoundingClientRect();
        const cssWidth = rect.width;
        const cssHeight = rect.height;

        // Compute scale to reach desired print pixels (use min to preserve aspect)
        const scaleX = printWidthPx / cssWidth;
        const scaleY = printHeightPx / cssHeight;
        const usedScale = Math.min(scaleX, scaleY);

        // Clone element without forcing pixel dimensions — keep CSS layout, canvas scale will handle resolution
        const clone = card.cloneNode(true);
        clone.style.position = 'absolute';
        clone.style.left = '-9999px';
        clone.style.top = '-9999px';
        clone.style.margin = '0';
        clone.style.boxShadow = 'none';
        clone.style.borderRadius = '0';
        clone.style.backgroundColor = '#ffffff';
        clone.style.boxSizing = 'border-box';
        // Force the clone to render at the same CSS pixel dimensions as the original
        // This prevents html2canvas from capturing a different layout-sized element
        clone.style.width = `${Math.round(cssWidth)}px`;
        clone.style.height = `${Math.round(cssHeight)}px`;

        // Ensure images inside will be loaded with CORS where possible and allow native resolution
        const imgs = clone.querySelectorAll('img');
        imgs.forEach(img => {
          try { img.setAttribute('crossorigin', 'anonymous'); } catch (e) {}
          img.style.maxWidth = '100%';
          img.style.maxHeight = '100%';
          img.style.width = 'auto';
          img.style.height = 'auto';
        });

        document.body.appendChild(clone);
        // Wait for fonts and images to be ready so rendering matches on-screen preview
        if (document.fonts && document.fonts.ready) {
          try { await document.fonts.ready; } catch (e) { /* ignore */ }
        }
        // allow a short delay for images to render at native resolution
        await new Promise(r => setTimeout(r, 300));

        const canvas = await html2canvas(clone, {
          scale: usedScale,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          logging: false,
          imageTimeout: 0
        });

        const imgData = canvas.toDataURL('image/png');

        if (i > 0) pdf.addPage([printWidthMM, printHeightMM], 'landscape');
        pdf.addImage(imgData, 'PNG', 0, 0, printWidthMM, printHeightMM);

        document.body.removeChild(clone);
      }

      // Save PDF with employee name
      pdf.save(`${employee.firstName || 'Employee'}_ID_Card.pdf`);

      toast.success("PDF downloaded successfully!", { id: toastId });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error(`Failed to generate PDF: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-sm sm:text-base">Loading preview...</p>
        </div>
      </div>
    );
  }

  // --- STYLES ---
  // ID Card Standard Dimensions (Landscape)
  // We use specific pixel dimensions to match the aspect ratio of the reference image.
  const cardWidth = 'min(100%, 480px)';
  const cardHeight = '300px';

  const commonCardStyle = {
    width: cardWidth,
    height: cardHeight,
    minWidth: '280px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #94a3b8',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Arial, sans-serif' // Standard system font looks closest to the ID
  };

  // Label style (The red text on the left of fields)
  const labelStyle = {
    color: '#be123c', // Red shade matching reference
    fontWeight: 'bold',
    fontSize: '10px',
    textTransform: 'uppercase',
    width: '80px', // Slightly narrower to tighten layout
    display: 'inline-block'
  };

  // Value style (The black text)
  const valueStyle = {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: '11px',
    textTransform: 'uppercase'
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 sm:p-8">
      <style>{styles}</style>
      
      <div className="mb-4 sm:mb-6 text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Final ID Card Preview</h1>
        <p className="text-xs sm:text-sm text-slate-500">Please review details before downloading</p>
      </div>

      {/* CONTAINER FOR CAPTURE */}
      <div 
        id="id-card-container" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '20px',
          padding: '12px',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
          width: '100%',
          maxWidth: '600px'
        }}
      >

        {/* ================= FRONT SIDE ================= */}
        <div style={commonCardStyle} data-print-card>
          
          {/* HEADER */}
          <div style={{ display: 'flex', height: '65px', borderBottom: '1px solid #166534' }}>
            {/* Logo Box */}
            <div style={{ 
              width: '70px', 
              backgroundColor: '#fff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderRight: '1px solid #166534'
            }}>
              <img src={logoImg} alt="Logo" style={{ width: '45px', objectFit: 'contain' }} />
            </div>
            {/* Green Title Strip */}
            <div style={{ 
              flex: 1, 
              backgroundColor: '#15803d', // Green
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#ffffff',
              textAlign: 'center',
              padding: '0 10px'
            }}>
              <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                GOVERNMENT OF ANDHRA PRADESH
              </h2>
              <h3 style={{ margin: '2px 0 0 0', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: '#86efac' }}>
                {employee.department || 'Department Name'}
              </h3>
            </div>
          </div>

          {/* BODY CONTENT */}
          <div style={{ padding: '6px 10px', position: 'relative' }}>
            
            {/* Watermark Logo (Optional aesthetics to match reference) */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -35%)',
              opacity: 0.12,
              pointerEvents: 'none',
              zIndex: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img src={logoImg} alt="watermark" className="watermark-logo" style={{ height: 'auto' }} />
            </div>

            {/* Title: IDENTITY CARD */}
            <div style={{ textAlign: 'center', marginBottom: '6px' }}>
              <h4 style={{ 
                margin: 0, 
                color: 'black', // Deep purple/red
                fontSize: '14px', 
                fontWeight: '900',
                textShadow: '1px 1px 0px rgba(0,0,0,0.1)',
                textTransform: 'uppercase'
              }}>
                Identity Card
              </h4>
            </div>

            <div style={{ display: 'flex', gap: '10px', position: 'relative', zIndex: 1, alignItems: 'flex-start' }}>
              
              {/* LEFT COL: Photo & Employee Signature */}
              <div style={{ width: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Photo: taller so it spans NAME -> HRMS ID rows */}
                <div style={{ 
                  width: '92px', 
                  height: '128px', 
                  border: '1px solid white', 
                  marginBottom: '6px',
                  backgroundColor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {employee.photo ? (
                    <img 
                      src={employee.photo} 
                      alt="Emp" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', imageRendering: 'auto' }} 
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#94a3b8' }}>No Photo</div>
                  )}
                </div>
                
                {/* Employee signature moved to absolute bottom-left block; keep photo area only here */}
                <div style={{ height: '4px' }} />
              </div>

              {/* RIGHT COL: Details (aligned grid: label / colon / value) */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '0' }}>
                {/* helper style: colon width to align all colons */}
                {/* Rows: label (fixed), colon (fixed), value (flex) */}

                <div style={{ minHeight: '18px', display: 'flex', alignItems: 'center' }}>
                  <span style={labelStyle}>NAME</span>
                  <span style={{ width: '8px', display: 'inline-block', textAlign: 'center' }}>:</span>
                  <div style={{ ...valueStyle, flex: 1, wordBreak: 'break-word' }}>{employee.firstName} {employee.lastName}</div>
                </div>

                <div style={{ minHeight: '18px', display: 'flex', alignItems: 'center' }}>
                  <span style={labelStyle}>DESIGNATION</span>
                  <span style={{ width: '8px', display: 'inline-block', textAlign: 'center' }}>:</span>
                  <div style={{ ...valueStyle, flex: 1, wordBreak: 'break-word' }}>{employee.designation}</div>
                </div>

                <div style={{ minHeight: '18px', display: 'flex', alignItems: 'center' }}>
                  <span style={labelStyle}>CFMS ID</span>
                  <span style={{ width: '8px', display: 'inline-block', textAlign: 'center' }}>:</span>
                  <div style={{ ...valueStyle, flex: 1 }}>{employee.cfmsId}</div>
                </div>

                <div style={{ minHeight: '18px', display: 'flex', alignItems: 'center' }}>
                  <span style={labelStyle}>HRMS ID</span>
                  <span style={{ width: '8px', display: 'inline-block', textAlign: 'center' }}>:</span>
                  <div style={{ ...valueStyle, flex: 1 }}>{employee.hrmsId}</div>
                </div>

                {/* Office field (must use exact office text provided) */}
                <div style={{ minHeight: '18px', display: 'flex', alignItems: 'center' }}>
                  <span style={labelStyle}>Office</span>
                  <span style={{ width: '8px', display: 'inline-block', textAlign: 'center' }}>:</span>
                  <div style={{ ...valueStyle, flex: 1, wordBreak: 'break-word' }}>{employee.officeLocation}</div>
                </div>

                {/* Authority Signature Area removed from inline flow; reserved absolute block will be placed at card bottom-right for precise positioning */}

              </div>
            </div>

          </div>
            {/* Absolute employee signature block (bottom-left) and office block (bottom-right) placed inside front card */}
            <div style={{ position: 'absolute', left: '16px', bottom: '14px', width: '92px', display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
                <div style={{ height: '28px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {employee.signature ? (
                    <img src={employee.signature} alt="EmpSign" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} crossOrigin="anonymous" />
                  ) : null}
                </div>
                <div style={{ fontSize: '9px', color: '#475569', textAlign: 'center', lineHeight: '1.1' }}>
                  Signature of the Employee
                </div>
            </div>

            <div style={{ position: 'absolute', right: '16px', bottom: '14px', width: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
                <div style={{ height: '40px', width: '100%' }} />
                <div style={{ fontSize: '9px', color: '#475569', textAlign: 'center', lineHeight: '1.1' }}>
                  {employee.officeLocation ? (
                    employee.officeLocation.split('\n').map((line, idx) => (
                      <span key={idx}>{line}{idx < employee.officeLocation.split('\n').length - 1 ? <br/> : null}</span>
                    ))
                  ) : (
                    <>
                      Joint Director of Agriculture<br/>SPSR Nellore Dt.
                    </>
                  )}
                </div>
            </div>

        </div>

        {/* ================= BACK SIDE ================= */}
        <div style={commonCardStyle} data-print-card>
            <div style={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center',
                padding: '0 40px',
                position: 'relative',
                zIndex: 1
            }}>
                
                {/* Address */}
                <div style={{ display: 'flex', marginBottom: '15px' }}>
                    <div style={{ ...labelStyle, width: '110px' }}>Address</div>
                    <div style={{ ...valueStyle, flex: 1, lineHeight: '1.4' }}>
                        : {employee.address}
                    </div>
                </div>

                {/* Aadhar */}
                <div style={{ display: 'flex', marginBottom: '15px' }}>
                    <div style={{ ...labelStyle, width: '110px' }}>Aadhaar no</div>
                    <div style={{ ...valueStyle, flex: 1 }}>
                        : {employee.aadhaarNumber}
                    </div>
                </div>

                {/* Mobile */}
                <div style={{ display: 'flex', marginBottom: '15px' }}>
                    <div style={{ ...labelStyle, width: '110px' }}>Cell Number</div>
                    <div style={{ ...valueStyle, flex: 1 }}>
                        : {employee.mobileNumber}
                    </div>
                </div>

                {/* Blood Group (New Addition) */}
                <div style={{ display: 'flex' }}>
                    <div style={{ ...labelStyle, width: '110px' }}>Blood Group</div>
                    <div style={{ ...valueStyle, flex: 1 }}>
                        : {employee.bloodGroup}
                    </div>
                </div>

            </div>
        </div>

      </div>

      {/* ACTION BUTTONS */}
      <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-600px px-4">
        <button
          onClick={() => navigate("/form")}
          className="flex-1 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors shadow-sm text-sm sm:text-base"
          disabled={isGenerating}
        >
          Edit Details
        </button>

        <button
          onClick={downloadPDF}
          disabled={isGenerating}
          className="flex-1 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white/30 border-t-white"></div>
              <span className="hidden sm:inline">Generating PDF...</span>
              <span className="sm:hidden">Generating...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              <span className="hidden sm:inline">Download ID Card</span>
              <span className="sm:hidden">Download</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}

export default PreviewPage;