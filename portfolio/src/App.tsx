import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import { createContext, useState } from "react";
import PageNotFound from "./pages/PageNotFound";
import ClinicRegistration from "./pages/ClinicRegistration";
import UserRegistration from "./pages/UserRegistration";


interface ImagePreviewContextType {
  previewImages: string[];
  setPreviewImages: (images: string[]) => void;
}
export const ImagePreviewContext = createContext<ImagePreviewContextType>({
  previewImages: [],
  setPreviewImages: () => { }
})

const App = () => {
  const [previewImages, setPreviewImages] = useState<string[]>([])
  return <>
    <div className="min-h-screen bg-gray-50 text-gray-900">

      <ImagePreviewContext.Provider value={{ previewImages, setPreviewImages }}>
        <BrowserRouter>
          <Navbar />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register-clinic" element={<ClinicRegistration />} />
            <Route path="/register-user/:id" element={<UserRegistration />} />
            <Route path="/*" element={<PageNotFound />} />
          </Routes>
        </BrowserRouter>
      </ImagePreviewContext.Provider>
    </div>
  </>
};

export default App;
