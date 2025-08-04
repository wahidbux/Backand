import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

const userRegister = asyncHandler (async (req , res)=>{
    
    // get user details form frontend
    // validation -- not empty 
    // check if user already exists: username, email
    // check for image and check for avator
    // upload them to cloudinary avator 
    // create user object - create entry in db 
    // remove password and refresh token form field form response 
    // check for user creation 
    // return response.....

    const {Fullname ,email , username , password } =req.body
    console.log("Email", email);

    if (
        [Fullname, email, username , password].some((field)=>
         field?.trim()==="")
    ){
        throw new ApiError(400 , "All fields are required..........")
    }

    const existedUser = User.findOne(
       {
        $or:[{ username },{ email }]
       }
    )

    if(existedUser){
        throw new ApiError(409, "user with email or username already exist.")      
    }

    const avatarLoaclPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLoaclPath){
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLoaclPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400, "Avatar file is required");
    }

    const user = await User.create({
        Fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500 ,"Something went wrong while registring the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser ,"User created Successfully")
    )
})

export default userRegister