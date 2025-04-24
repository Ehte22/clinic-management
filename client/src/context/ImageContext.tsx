import { createContext, useContext, useState } from "react";

interface ImagePreviewContextProps {
    previewImages: string[];
    setPreviewImages: (images: string[]) => void;
}

const ImagePreviewContext = createContext<ImagePreviewContextProps>({
    previewImages: [],
    setPreviewImages: () => { }
})

export const ImageContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [previewImages, setPreviewImages] = useState<string[]>([])
    return <>
        <ImagePreviewContext.Provider value={{ previewImages, setPreviewImages }}>
            {children}
        </ImagePreviewContext.Provider>
    </>
}

export const useImagePreview = (): ImagePreviewContextProps => {
    const context = useContext(ImagePreviewContext)
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
