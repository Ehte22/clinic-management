import multer from "multer"
import path from "path"
import { v4 } from "uuid"
import { Request } from "express";

const multerMiddleware = (fileTypes: string[] = [], fileSize: number = 10) => {
    const storage = multer.diskStorage({
        filename: (req, file, cb) => {
            cb(null, v4() + path.extname(file.originalname))
        }
    });

    const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
        if (fileTypes.length > 0 && !fileTypes.includes(file.mimetype)) {
            return cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
        }
        cb(null, true);
    };

    const maxFileSize = fileSize * 1024 * 1024

    return multer({
        storage,
        limits: { fileSize: maxFileSize },
        fileFilter,
    });
};

export default multerMiddleware;
