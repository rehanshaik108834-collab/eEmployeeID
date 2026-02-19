import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import logoImg from "../../assets/logo.svg"; 

const styles = `
  .watermark-logo {
    width: 160px !important;
  }
  .print-button {
    display: inline-flex;
  }
  @media print {
    .watermark-logo {
      width: 67px !important;
    }
    .print-button {
      display: none !important;
    }
  }
`;

function PreviewPage() {
  const [employee, setEmployee] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // --- 1. Load Data ---
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
      toast.error("Invalid data format.");
      navigate("/form");
    }
  }, [navigate]);

  // --- 2. Calculate Scale for Mobile ---
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // 480px is our target card width. 
        // We add 40px buffer for padding.
        // If screen is smaller than 520px, we calculate a scale ratio.
        const desiredScale = Math.min(containerWidth / 520, 1);
        setScale(desiredScale);
      }
    };

    // Initial calc
    handleResize();
    
    // Listen for resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- 3. Download PDF Logic ---
  const downloadPDF = async () => {
    try {
      setIsGenerating(true);
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);

      const cardContainer = document.getElementById("id-card-content"); // Target inner content
      if (!cardContainer) {
        toast.error("ID card element not found");
        return;
      }

      const toastId = toast.loading("Generating High-Quality PDF...");

      // PDF Page Size (Standard ID Card: 85.6mm x 54mm)
      const PAPER_W = 85.6; 
      const PAPER_H = 54;
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [PAPER_W, PAPER_H]
      });

      const cards = cardContainer.querySelectorAll('[data-print-card]');
      const FIXED_WIDTH = 480;
      const FIXED_HEIGHT = 300;

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];

        // Clone so we don't mess up the UI
        const clone = card.cloneNode(true);
        
        // RESET SCALE for the clone (Important!)
        // We want the PDF to be full size, not the mobile scaled size.
        clone.style.transform = 'none'; 
        
        // Force Desktop Layout styles
        Object.assign(clone.style, {
          position: 'fixed',
          top: '-9999px',
          left: '0',
          width: `${FIXED_WIDTH}px`,
          height: `${FIXED_HEIGHT}px`,
          margin: '0',
          zIndex: '-9999', 
          backgroundColor: '#ffffff',
          borderRadius: '0',
        });

        // Ensure images cover their boxes
        const imgs = clone.querySelectorAll('img');
        imgs.forEach(img => {
            img.style.objectFit = 'cover';
            img.style.width = '100%';
            img.style.height = '100%';
        });

        document.body.appendChild(clone);
        
        // Wait for images
        await new Promise(resolve => setTimeout(resolve, 250));

        // Capture
        const canvas = await html2canvas(clone, {
          scale: 4, // High Resolution
          useCORS: true,
          width: FIXED_WIDTH,
          height: FIXED_HEIGHT,
          backgroundColor: '#ffffff',
          logging: false
        });

        const imgData = canvas.toDataURL('image/png', 1.0);

        if (i > 0) pdf.addPage([PAPER_W, PAPER_H], 'landscape');
        pdf.addImage(imgData, 'PNG', 0, 0, PAPER_W, PAPER_H);

        document.body.removeChild(clone);
      }

      pdf.save("ID_Card_Final.pdf");
      toast.success("PDF generated!", { id: toastId });

    } catch (error) {
      console.error("PDF Error:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!employee) return null;

  // --- STYLES ---
  // We use a fixed width of 480px. The transform: scale() handles the responsiveness.
  const cardWidth = '480px'; 
  const cardHeight = '300px';

  const commonCardStyle = {
    width: cardWidth,
    height: cardHeight,
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #94a3b8',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Arial, sans-serif',
    flexShrink: 0 
  };

  const labelStyle = {
    color: '#be123c', 
    fontWeight: 'bold',
    fontSize: '10px',
    textTransform: 'uppercase',
    width: '80px', 
    display: 'inline-block'
  };

  const valueStyle = {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: '11px',
    textTransform: 'uppercase'
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <style>{styles}</style>
      
      <div className="mb-6 text-center z-10">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Final ID Card Preview</h1>
        <p className="text-xs sm:text-sm text-slate-500">Review details below</p>
      </div>

      {/* SCALING CONTAINER 
         This div tracks the screen width and applies the scale to the inner content.
      */}
      <div 
        ref={containerRef}
        className="w-full flex justify-center items-start overflow-hidden"
        style={{ perspective: '1000px' }} // Helps with rendering
      >
        <div 
            id="id-card-content"
            style={{ 
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
              // We need to set height explicitly because scaling doesn't affect flow layout height
              height: `${(300 * 2 + 20) * scale}px`, // 2 cards * 300px + 20px gap
              width: '480px', // The fixed width container
              display: 'flex', 
              flexDirection: 'column', 
              gap: '20px', 
            }}
        >

            {/* ================= FRONT SIDE ================= */}
            <div style={commonCardStyle} data-print-card>
            
            {/* HEADER */}
            <div style={{ display: 'flex', height: '65px', borderBottom: '1px solid #166534' }}>
                <div style={{ width: '70px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #166534' }}>
                <img src={logoImg} alt="Logo" style={{ width: '45px', objectFit: 'contain' }} />
                </div>
                <div style={{ flex: 1, backgroundColor: '#15803d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ffffff', textAlign: 'center', padding: '0 10px' }}>
                <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', letterSpacing: '0.5px' }}>GOVERNMENT OF ANDHRA PRADESH</h2>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: '#86efac' }}>{employee.department || 'Department Name'}</h3>
                </div>
            </div>

            {/* BODY CONTENT */}
            <div style={{ padding: '6px 10px', position: 'relative' }}>
                
                {/* Watermark */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -35%)', opacity: 0.08, pointerEvents: 'none', zIndex: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={logoImg} alt="watermark" className="watermark-logo" style={{ height: 'auto' }} />
                </div>

                <div style={{ textAlign: 'center', marginBottom: '6px' }}>
                <h4 style={{ margin: 0, color: 'black', fontSize: '14px', fontWeight: '900', textShadow: '1px 1px 0px rgba(0,0,0,0.1)', textTransform: 'uppercase' }}>Identity Card</h4>
                </div>

                <div style={{ display: 'flex', gap: '10px', position: 'relative', zIndex: 1, alignItems: 'flex-start' }}>
                
                {/* LEFT COL: Photo */}
                <div style={{ width: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div 
                    data-photo-box="true" 
                    style={{ width: '92px', height: '128px', border: '1px solid white', marginBottom: '6px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '8px' }}
                    >
                    {employee.photo ? (
                        <img src={employee.photo} alt="Emp" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} crossOrigin="anonymous" />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#94a3b8' }}>No Photo</div>
                    )}
                    </div>
                    <div style={{ height: '4px' }} />
                </div>

                {/* RIGHT COL: Details */}
                <div 
                    data-details-box="true"
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '128px', justifyContent: 'space-between', paddingLeft: '10px' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', lineHeight: '1' }}>
                    <span style={labelStyle}>NAME</span>
                    <div style={{ ...valueStyle, flex: 1, wordBreak: 'break-word' }}>&nbsp;&nbsp;: {employee.firstName} {employee.lastName}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', lineHeight: '1' }}>
                    <span style={labelStyle}>DESIGNATION</span>
                    <div style={{ ...valueStyle, flex: 1, wordBreak: 'break-word' }}>&nbsp;&nbsp;: {employee.designation}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', lineHeight: '1' }}>
                    <span style={labelStyle}>CFMS ID</span>
                    <div style={{ ...valueStyle, flex: 1 }}>&nbsp;&nbsp;: {employee.cfmsId}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', lineHeight: '1' }}>
                    <span style={labelStyle}>HRMS ID</span>
                    <div style={{ ...valueStyle, flex: 1 }}>&nbsp;&nbsp;: {employee.hrmsId}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', lineHeight: '1' }}>
                    <span style={labelStyle}>Office</span>
                    <div style={{ ...valueStyle, flex: 1, wordBreak: 'break-word' }}>&nbsp;&nbsp;: {employee.officeLocation}</div>
                    </div>
                </div>
                </div>

            </div>
            
            {/* Employee Signature Area - Blank for Manual Signing */}
            <div style={{ position: 'absolute', left: '16px', bottom: '14px', width: '92px', display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
                <div style={{ fontSize: '9px', color: '#475569', textAlign: 'center', lineHeight: '1.1' }}>Employee Signature</div>
            </div>

            <div style={{ position: 'absolute', right: '16px', bottom: '14px', width: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
                <div style={{ height: '40px', width: '100%' }} />
                <div style={{ fontSize: '9px', color: '#475569', textAlign: 'center', lineHeight: '1.1' }}>
                {employee.officeLocation ? (
                    employee.officeLocation.split('\n').map((line, idx) => (
                    <span key={idx}>{line}{idx < employee.officeLocation.split('\n').length - 1 ? <br/> : null}</span>
                    ))
                ) : (
                    <>Joint Director of Agriculture<br/>SPSR Nellore Dt.</>
                )}
                </div>
            </div>
            </div>

            {/* ================= BACK SIDE ================= */}
            <div style={commonCardStyle} data-print-card>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.08, pointerEvents: 'none', zIndex: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={logoImg} alt="watermark" className="watermark-logo" style={{ height: 'auto' }} />
            </div>
            
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 40px', position: 'relative', zIndex: 1 }}>
                
                {/* Address */}
                <div style={{ display: 'flex', marginBottom: '25px' }}>
                <div style={{ ...labelStyle, width: '110px' }}>Address</div>
                <div style={{ ...valueStyle, flex: 1, lineHeight: '1.4' }}>: {employee.address}</div>
                </div>
                
                {/* Mobile */}
                <div style={{ display: 'flex', marginBottom: '25px' }}>
                <div style={{ ...labelStyle, width: '110px' }}>Cell Number</div>
                <div style={{ ...valueStyle, flex: 1 }}>: {employee.mobileNumber}</div>
                </div>
                
                {/* Blood Group */}
                <div style={{ display: 'flex' }}>
                <div style={{ ...labelStyle, width: '110px' }}>Blood Group</div>
                <div style={{ ...valueStyle, flex: 1 }}>: {employee.bloodGroup}</div>
                </div>

            </div>
            </div>

        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full max-w-lg px-4 z-10">
        <button onClick={() => navigate("/form")} className="flex-1 px-6 py-3 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors shadow-sm text-base" disabled={isGenerating}>Edit Details</button>
        <button onClick={() => window.print()} className="print-button flex-1 px-6 py-3 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors shadow-sm text-base">Print Card</button>
        <button onClick={downloadPDF} disabled={isGenerating} className="flex-1 px-6 py-3 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 text-base">
          {isGenerating ? "Generating PDF..." : "Download ID Card"}
        </button>
      </div>
    </div>
  );
}

export default PreviewPage;