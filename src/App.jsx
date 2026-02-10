import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./Pages/Home";
import FormPage from "./Pages/Form";
import PreviewPage from "./Pages/Preview";
function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/form" element={<FormPage />} />
        <Route path="/preview" element={<PreviewPage />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;