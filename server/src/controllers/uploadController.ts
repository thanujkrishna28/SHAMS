import { Request, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req: any, file) => {
        const isPdf = file.mimetype === 'application/pdf';
        const userId = req.user?._id || 'guest';
        return {
            folder: `SHAMS/user_${userId}`,
            allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
            resource_type: isPdf ? 'raw' : 'image',
            public_id: `${file.fieldname}-${Date.now()}`,
        };
    },
});

function checkFileType(file: Express.Multer.File, cb: any) {
    const filetypes = /jpg|jpeg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Images and PDFs only!'));
    }
}

export const upload = multer({
    storage,
    limits: { fileSize: 4 * 1024 * 1024 }, // STRICT 4MB LIMIT
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

export const uploadFile = (req: Request, res: Response) => {
    if (req.file) {
        // req.file.path will be the Cloudinary URL
        res.send(req.file.path);
    } else {
        res.status(400);
        throw new Error('No file uploaded');
    }
};
