import React, { ChangeEvent, useContext, useEffect, useState } from 'react';
import { PhotoIcon } from '@heroicons/react/16/solid';
import { FieldValues, UseFormSetValue } from 'react-hook-form';
import { IFieldProps } from './useDynamicForm';
import { ImagePreviewContext } from '../App';

const InputFile: React.FC<IFieldProps> = ({ field, setValue }) => {
    const [isDragging, setIsDragging] = useState(false);

    const { previewImages, setPreviewImages } = useContext(ImagePreviewContext)

    const handleChange = <T extends FieldValues>(
        e: ChangeEvent<HTMLInputElement>,
        name: string,
        multiple: boolean,
        setValue: UseFormSetValue<T>
    ) => {
        const { files } = e.target;

        if (files && files.length > 0) {
            setValue(name as any, files as any, { shouldValidate: true });

            if (multiple) {
                const newPreviews = Array.from(files).map((file) => URL.createObjectURL(file));
                setPreviewImages([...previewImages, ...newPreviews]);
            } else {
                setPreviewImages([URL.createObjectURL(files[0])])
            }
        }
    };

    // Handle drag over event
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    // Handle drag leave event
    const handleDragLeave = () => {
        setIsDragging(false);
    };

    // Handle file drop event
    const handleDrop = <T extends FieldValues>(
        e: React.DragEvent<HTMLDivElement>,
        name: string,
        multiple: boolean,
        setValue: UseFormSetValue<T>
    ) => {
        e.preventDefault();
        setIsDragging(false);

        const { files } = e.dataTransfer;
        if (files && files.length > 0) {
            setValue(name as any, files as any, { shouldValidate: true });

            if (multiple) {
                const newPreviews = Array.from(files).map((file) => URL.createObjectURL(file));
                setPreviewImages([...previewImages, ...newPreviews]);
            } else {
                setPreviewImages([URL.createObjectURL(files[0])])
            }
        }
    };

    useEffect(() => {
        setPreviewImages([])
    }, [])


    return (
        <div className="col-span-full my-2">
            <div
                className={`flex flex-col justify-center items-center rounded-lg border border-dashed px-6 py-10 transition-all ${isDragging ? 'border-cyan-600 bg-cyan-100' : 'border-gray-900/25'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, field.name, field.multiple!, setValue!)}
            >

                <div className="text-center">
                    <PhotoIcon aria-hidden="true" className="mx-auto size-12 text-gray-300" />
                    <div className="mt-4 flex text-sm text-gray-600">
                        <label
                            htmlFor={field.name}
                            className="relative cursor-pointer rounded-md bg-white font-semibold text-cyan-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-cyan-600 focus-within:ring-offset-2 hover:text-cyan-500"
                        >
                            <span>Upload a file</span>
                            <input
                                type="file"
                                id={field.name}
                                onChange={(e) => {
                                    if (setValue) {
                                        handleChange(e, field.name, field.multiple!, setValue);
                                    }
                                }}
                                className="sr-only"
                                accept={field.accept || '*'}
                                multiple={field.multiple || false}
                            />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-600">PNG, JPG, GIF up to 10MB</p>
                </div>

                {previewImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-4 mt-4">
                        {previewImages.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={`preview-${index}`}
                                className="w-28 h-24 object-cover rounded-md shadow-md"
                            />
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default InputFile;

