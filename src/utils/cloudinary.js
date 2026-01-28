import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // fs : file system(read, write, delete, etc.)

// cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// Function to upload a file to Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
    try {
        // If file path is not provided, stop execution
        if (!localFilePath) return null;

        // Upload file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto" // allows Cloudinary to detect file type
        })

        // file has been uploaded successfully
        console.log("file is uploaded on cloudinary", response.url);

        return response;
    } catch (error) {
        // remove the locallay saved temparary file as the upload operation got failed
        fs.unlinkSync(localFilePath)
    }
}

export { uploadOnCloudinary }