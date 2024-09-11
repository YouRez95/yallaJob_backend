import { Request } from 'express';
import multer, { memoryStorage, MulterError } from  'multer';

const upload = multer({ storage: memoryStorage(), fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
    cb(null, true);
  } else {
    const error = new MulterError("LIMIT_UNEXPECTED_FILE")
    error.message = 'Invalid image type. Please upload an image file (jpeg, png, or jpg).'
    return cb(error);
  }
}})

export default upload;