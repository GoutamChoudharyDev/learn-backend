import multer from "multer";

// Configure storage
const storage = multer.diskStorage({
    // Destination folder for uploaded files
    destination: function (req, file, cb) {
        cb(null, "./public/temp");
    },

    // Rename file to avoid conflicts
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Create multer upload middleware
export const upload = multer({
    storage,
});