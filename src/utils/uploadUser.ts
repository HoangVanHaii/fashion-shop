import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(process.cwd(), "uploads", "users"));
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})
const upload = multer({storage});
export const uploadUser = upload.single('avatar');