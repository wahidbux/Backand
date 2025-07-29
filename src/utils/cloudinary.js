import {v2 as cloudinary } from 'cloudinary'
import fs from 'fs'


  // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAM,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

const uploadOnCloudinary = async (localFilePath)=>{
    try {
        if(!localFilePath) return null;
        // uploading a file on clodinary 
        const response = await cloudinary.uploader.upload(localFilePath,
                               {resource_type:"auto"});
        // file has been uploaded on successfully on cloudinary
        console.log("file is uplaoded on clodinary.........",response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary 
        // as the upload opreation got failed.
        return null
    }
}

export default uploadOnCloudinary