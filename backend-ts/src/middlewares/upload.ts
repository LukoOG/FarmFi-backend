import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary";

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // const folder = req.body.folder || "product_images"; 
        const folder = (req as any).folder || "product_images"; 
        console.log(folder)
        return {
            folder,
            allowed_formats: ["jpg", "jpeg", "png"],
            resource_type:"image"
        };
    }
});

const upload = multer({ storage });
export default upload
