import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import { application } from "express";

const getAccessAndRefreshToken = async(userId)=>{
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave:false});
    return{
      accessToken,
      refreshToken
    }
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while genrating the refres and generating"
    );
  }
}
const registerUser =asyncHandler(async(req,res)=>{
  //get user data from frontend
  //check all the fields are empty or not 
  //check if alredy user exsit or not
  //if not exist then create a user
  //then return te data to the frontend

  const {username,email,phoneNo,password} = req.body;
  
  console.log(username);

 if(!username || !email || !password || !phoneNo){
  throw new ApiError(400,"All fielss are required")
 }

 const userExist = await  User.findOne({
   $or: [{ username },{ email }]
 })


 if(userExist){
   throw new ApiError(401, "User already exist")
 }
 const user = await User.create({username,email,phoneNo,password})

 const createdUser = await User.findById(user._id).select("-password")

 if(!createdUser){
   throw new ApiError(404, "failed to register user")
 }
 return res.status(201).json(new ApiResponse(200,createdUser,"user registerd Sucessfully"))

});
const loginUser = asyncHandler(async(req,res)=>{
  const {username,password} = req.body
  if(!username  || ! password){
    throw new ApiError(400,"All fields are required")
  }
  const user =  await User.findOne({username})
   if(!user){
    throw new ApiError(404,"User not found")
   }

   const isPasswordCorrect  = await user.isPasswordCorrect(password);

   if(!isPasswordCorrect){
    throw new ApiError(401,"Invalid password")
   }

   const {accessToken,refreshToken} = await getAccessAndRefreshToken(user._id);

   const loogedInUser = await User.findById(user._id).select("-password -refreshToken");

   const options= {
    httpOnly:true,
    secure:true,
    sameSite:"None"
   }

   return res.status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(new ApiResponse(200,{
    user:loogedInUser,
    accessToken,
   },
   "user SucessFully LoogedIn"
  ))
})
const userProfile = asyncHandler(async(req,res)=>{
  return res
    .status(200)
    .json(new ApiResponse(200,req.user,"user fetched Successfully"));
})
const logOut = asyncHandler(async(req,res)=>{
const user = await User.findByIdAndUpdate(
  req.user?._id,
  {
    $unset:{
      refreshToken:1
    }
  },
  {
    new :true,
  }
);
const options = {
  httpOnly:true,
  secure:true,
  sameSite:"None"
}
return res.status(200)
.clearCookie("accessToken",options)
.clearCookie("refreshToken",options)
.json(new ApiResponse(200,{},"user log out Successfully"))
})
const contact = asyncHandler(async(req,res)=>{
  const {message} = req.body

  if(message.trim() === ""){
    throw  new ApiError(401 ,{}, "Plese write some message")
  }
  console.log(message);
  const user = await User.findByIdAndUpdate(req.user?._id,
    {
      $set:{
        message:message
      }
    },
    {
      new:true
    }
  );
  if(!user){
    throw new ApiError(404,"user not found")
  }
  res.status(200).json(new ApiResponse(200,{},"message sent succesfully"))
})

export {registerUser,loginUser,userProfile,logOut,contact}