import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Home = () => {
  const navigate = useNavigate(); // Initialize hook

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 50,
        damping: 20,
      },
    },
  };

  const titleVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-slate-950 text-white selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* --- Background Elements --- */}
      
      {/* Deep Green Gradient Base */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-emerald-950/40 to-slate-950 z-0" />
      
      {/* Animated Subtle Gradient Orb */}
      <motion.div 
        className="absolute top-[-20%] left-[-10%] w-[80vw] sm:w-[60vw] md:w-[50vw] h-[80vw] sm:h-[60vw] md:h-[50vw] bg-emerald-900/20 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] z-0"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3], 
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Subtle Noise/Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiLz4KPC9zdmc+')] mix-blend-overlay" />

      {/* --- Main Content --- */}
      
      <motion.div 
        className="relative z-10 max-w-5xl w-full px-4 sm:px-6 md:px-12 flex flex-col items-center text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Main Headline */}
        <motion.h1 
          variants={titleVariants}
          className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-4 sm:mb-6 leading-[1.1]"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
            Employee Identity Card
          </span>
          <br />
          <span className="text-emerald-500/90 drop-shadow-2xl">
             Generation Platform
          </span>
        </motion.h1>

        {/* Supporting Text */}
        <motion.p 
          variants={itemVariants}
          className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mb-8 sm:mb-10 font-light leading-relaxed px-2"
        >
          Create, preview, and download professional employee ID cards instantly.
          Engineered for enterprise reliability and precision design.
        </motion.p>

        {/* CTA Button with Navigation */}
        <motion.div variants={itemVariants} className="mb-16 group">
          <motion.button
            onClick={() => navigate('/form')} // Redirects to /from
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative overflow-hidden rounded-lg bg-emerald-600 px-8 py-4 text-white shadow-lg transition-all duration-300 hover:bg-emerald-500 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] border border-emerald-500/50 cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
            <span className="relative flex items-center font-semibold tracking-wide">
              Generate ID Card 
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.button>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 w-full max-w-4xl border-t border-slate-800/60 pt-10"
        >
          {[
            "High-Quality Layout",
            "Print-Ready PDF",
            "Instant Download"
          ].map((feature, index) => (
            <motion.div 
              key={index}
              whileHover={{ y: -2 }}
              className="flex flex-col items-center justify-center p-4 rounded-xl hover:bg-slate-900/40 transition-colors duration-300"
            >
              <div className="mb-3 p-3 bg-slate-900 rounded-full border border-slate-800 shadow-sm">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <span className="text-slate-300 font-medium tracking-wide">
                {feature}
              </span>
            </motion.div>
          ))}
        </motion.div>

      </motion.div>

      {/* --- Disclaimer --- */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-6 w-full px-6 text-center z-10"
      >
        <p className="text-[10px] md:text-xs text-slate-600 font-medium uppercase tracking-wider max-w-xl mx-auto">
          Disclaimer: ID cards generated using this platform are not verified or issued by any government authority.
        </p>
      </motion.div>

    </div>
  );
};

export default Home;