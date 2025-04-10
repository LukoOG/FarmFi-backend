import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary";

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: "product_images",
            allowed_formats: ["jpg", "jpeg", "png"],
            resource_type:"image"
        };
    }
});

const upload = multer({ storage });
export default upload
