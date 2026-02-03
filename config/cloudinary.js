
import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";

(async function() {

    // Configuration
    cloudinary.config({ 
        cloud_name: CLOUD_NAME, 
        api_key: CLOUD_API_KEY, 
        api_secret: CLOUD_URL
    });
    
});