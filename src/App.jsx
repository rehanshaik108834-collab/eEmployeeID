import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// --- STANDARD IMPORTS (No Lazy Loading) ---

// ⚠️ CHECK YOUR PATHS CAREFULLY ⚠️
// If your files are in folders like src/Pages/Home/home.jsx, use this:
import HomePage from "./Pages/Home/index";
import FormPage from "./Pages/Form/index";
import PreviewPage from "./Pages/Preview/index";

// OR...
// If your files are all sitting together in the 'src' folder, use this instead:
// import HomePage from "./home";
// import FormPage from "./form";
// import PreviewPage from "./preview";


function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      {/* No Suspense needed for standard imports */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/form" element={<FormPage />} />
        <Route path="/preview" element={<PreviewPage />} />

        {/* Fallback route */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </>
  );
}

export default App;