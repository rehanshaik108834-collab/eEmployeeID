import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster } from "react-hot-toast"; // <--- Import this

// Lazy Load Pages
// Ensure these paths match your actual folder structure!
const HomePage = lazy(() => import("./Pages/Home/index"));
const FormPage = lazy(() => import("./Pages/Form/index"));
const PreviewPage = lazy(() => import("./Pages/Preview/index"));

function App() {
  return (
    <>
      {/* 1. Add Toaster so your toasts in PreviewPage actually show up */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* 2. Wrap Routes in Suspense to handle lazy loading */}
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/form" element={<FormPage />} />
          <Route path="/preview" element={<PreviewPage />} />

          {/* Fallback route */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;