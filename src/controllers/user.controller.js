import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async(userId)=>{

    try {
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };

} catch (error) {
    console.error("Error while generating tokens:", error);
    throw new ApiError(500, "Something went wrong while generating Access and Refresh tokens");
}

}

const userRegister = asyncHandler (async (req , res)=>{
    
    // Destructure input fields from the request body
    // validation -- not empty 
    // check if user already exists: username, email
    // check for image and check for avator
    // upload them to cloudinary avator 
    // create user object - create entry in db 
    // remove password and refresh token form field form response 
    // check for user creation 
    // return response.....

   // Destructure input fields from the request body
      const { fullname, email, username, password } = req.body;
      let avatar = req.body.avatar;
      let coverImage = req.body.coverimage;

   // Validate required fields
    if ([fullname, email, username, password].some(field => !field?.trim())) {
    throw new ApiError(400, "All fields are required.");
    }


    // Check if user with given username or email already exists
    const existedUser = await User.findOne({
    $or: [{ username }, { email }]
    });

    if (existedUser) {
    throw new ApiError(409, "User with email or username already exists.");
    }

    //Log the received request data (for debugging)
    console.log("Checking the request body...............", req.body);

    // Upload avatar and cover image to Cloudinary
    const uploadedAvatar = await uploadOnCloudinary(avatar);
    const uploadedCoverImage = await uploadOnCloudinary(coverImage);

    //Create a new user in the database
    const user = await User.create({
     fullname,
     avatar: uploadedAvatar?.url || "",         
     coverimage: uploadedCoverImage?.url || "",
     email,
     password,
     username: username.toLowerCase()                 
  });

    //Select user data without sensitive fields
     const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
    );

    //Check if user creation failed
    if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user.");
    }

    //Send success response
    return res.status(201).json(
    new ApiResponse(200, createdUser, "User created successfully.")
   );

})

const loginUser = asyncHandler (async (req , res)=>{

    // req body ------> data 
    // login with username or email
    // find the user 
    // check password 
    // genrate accesss and refresh tokens
    // send these tokens in cookies 


    // getting data form the req body.
    const {username , email , password }= req.body

    if(!username && !email){
        throw new ApiError(400, "Username or Email is required.");
    }

    const user = await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"User dose not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid ){
        throw new ApiError(401,"Password is invalid.")
    }

    const {accessToken, refreshToken} = await 
    generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    const options ={
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)  
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200,
            {
                user: loggedInUser ,accessToken, refreshToken
            },
            "User logged in Successfully.........."
        )
    )
})

const logoutUser = asyncHandler (async (req, res)=>{
     await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
     )
     const options ={
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200 , {} , "User logged out Successfully........"))
})

const refreshAccessToken = asyncHandler (async(req , res )=>{

   const incomingRefreshToken = req.cookies.refreshToken|| 
    req.body.refreshToken

    if(!incomingRefreshToken){
       throw new ApiError(401 , "Unauthorized request ")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id);
    
        if(!user){
           throw new ApiError(401 , "Invalid refresh token  ")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
           throw new ApiError(401 , "Refresh token is expired or used ")
        }
    
        const options ={
            httpOnly: true,
            secure: true
        }
    
        const {accessToken , newRefreshToken } =await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                  accessToken ,refreshToken : newRefreshToken
                },
                "Access Token refreshed successfully........"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

export { 
    userRegister,
    loginUser,
    logoutUser,
    refreshAccessToken

}
