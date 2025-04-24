import React, { ChangeEvent, useEffect, useState } from "react";
import { Box, Typography, Button, IconButton, Paper, Grid2 } from "@mui/material";
import BurstModeIcon from '@mui/icons-material/BurstMode';
import { FieldValues, UseFormSetValue } from "react-hook-form";
import { IFieldProps } from "../hooks/useDynamicForm";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useImagePreview } from "../context/ImageContext";

const InputFile: React.FC<IFieldProps> = ({ field, setValue }) => {
    const [isDragging, setIsDragging] = useState(false);
    const { previewImages, setPreviewImages } = useImagePreview()

    const handleChange = <T extends FieldValues>(
        e: ChangeEvent<HTMLInputElement>,
        name: string,
        multiple: boolean,
        setValue: UseFormSetValue<T>
    ) => {
        const { files } = e.target;

        if (files && files.length > 0) {
            setValue(name as any, files as any, { shouldValidate: true });

            const newPreviews = Array.from(files).map((file) =>
                URL.createObjectURL(file)
            );
            setPreviewImages(multiple ? [...previewImages, ...newPreviews] : newPreviews);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

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

            const newPreviews = Array.from(files).map((file) =>
                URL.createObjectURL(file)
            );
            setPreviewImages(multiple ? [...previewImages, ...newPreviews] : newPreviews);
        }
    };

    useEffect(() => {
        setPreviewImages([]);
    }, []);

    return (
        <Paper>
            <Box
                sx={{
                    borderRadius: "8px",
                    p: 3,
                    textAlign: "center",
                    backgroundColor: isDragging ? "#f3f4ff" : "transparent",
                    transition: "all 0.2s ease-in-out",
                    cursor: "pointer",
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, field.name, field.multiple!, setValue!)}
            >
                <IconButton color="primary">
                    <BurstModeIcon sx={{ fontSize: 40, color: "lightgrey" }} />
                </IconButton>
                <Typography variant="body1" sx={{ my: 1 }}>
                    Drag and drop a file here, or
                </Typography>
                <Box>
                    <label htmlFor={field.name}>
                        <input
                            type="file"
                            id={field.name}
                            onChange={(e) => setValue && handleChange(e, field.name, field.multiple!, setValue)}
                            style={{ display: "none" }}
                            accept={field.accept || "*"}
                            multiple={field.multiple || false}
                        />
                        <Button variant="contained" size="small" component="span" sx={{ my: 1, background: "#0772ed", color: "white" }}>
                            <FileUploadIcon fontSize="small" sx={{ color: "white", marginRight: 1 }} />
                            Upload File
                        </Button>
                    </label>
                </Box>

                <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                    PNG, JPG, GIF up to 10MB
                </Typography>

                {previewImages.length > 0 &&
                    <Grid2 container spacing={2} >
                        {previewImages.map((image, index) => <Grid2 key={index} size={{ xs: 6, sm: 4, lg: 3, xl: 2 }}>
                            <img
                                src={image}
                                alt={`preview-${index}`}
                                style={{
                                    width: "100%",
                                    height: "150px",
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                    boxShadow: "0px 0px 5px rgba(0,0,0,0.2)",
                                }}
                            />
                        </Grid2>
                        )}
                    </Grid2>
                }

            </Box>


        </Paper >
    );
};

export default InputFile;
