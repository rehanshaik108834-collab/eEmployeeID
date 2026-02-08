import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
const HomePage = lazy(() => import("./Pages/Home"));
const FormPage = lazy(() => import("./Pages/Form"));
const PreviewPage = lazy(() => import("./Pages/Preview"));
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Suspense fallback={<div style={{padding:20,textAlign:'center'}}>Loading…</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/form" element={<FormPage />} />
          <Route path="/preview" element={<PreviewPage />} />

          {/* Fallback route – always LAST */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
