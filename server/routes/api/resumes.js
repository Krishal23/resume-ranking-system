import { Router } from 'express';
import multer, { diskStorage } from 'multer';
import { extname } from 'path';
import { uploadResume, getResumes, getResumeById, deleteResume } from '../../controllers/resumeController.js';
import auth from '../../middleware/auth.js';
const router = Router();

// Configure multer for file uploads
const storage = diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
}
});


const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/msword', // .doc
        'text/plain' // .txt
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, DOCX, DOC, and TXT are allowed.'));
    }
};

const upload = multer({ storage, fileFilter });

router.get(
    '/', 
    getResumes
);

router.post(
    '/', 
    upload.single('resume'),
    uploadResume
);
router.get(
    '/:id', 
    getResumeById
);
router.delete(
    '/:id', 
    // auth, 
    deleteResume
);

export default router;
