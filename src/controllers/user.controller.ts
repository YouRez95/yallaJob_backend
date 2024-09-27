import mongoose from "mongoose";
import { BAD_REQUEST, NOT_FOUND, OK } from "../constants/http";
import UserModel from "../models/user.model";
import { deleteAccount, toggleFavoriteJobs, updateUser } from "../services/user.service";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErrors";
import { jobEditSchema, updateUserSchema, userPasswordSchema } from "../utils/zod";


export const getSingleUserHandler = catchErrors(async (req, res) => {
  // Extract userId from req
  const userId = req.userId;

  // Find the user
  const user = await UserModel.findById(userId);
  appAssert(user, NOT_FOUND, "User not found");

  // Return the response
  return res.status(OK).json(user.omitPassword());
})



export const editUserHandler = catchErrors(async (req, res) => {
  // validate the body
  const updatedUserDetail = updateUserSchema.parse(req.body);

  // Call the service
  console.log("from controller file", req.file);
  await updateUser({...updatedUserDetail, image: req.file, userId: req.userId})

  // Return the response
  return res.status(OK).json({message: "user updated"});
})



export const toggleFavoriteHandler = catchErrors(async (req, res) => {
  // Validate the body
  const jobId = req.body.job_id;
  const isValidJobId = mongoose.Types.ObjectId.isValid(jobId);
  appAssert(isValidJobId, BAD_REQUEST, "Job id not valid");
  
  // Call the service
  const { message } = await toggleFavoriteJobs({userId: req.userId, jobId});

  // return the response
  res.status(OK).json({message});
})


export const deleteUserHandler = catchErrors(async (req, res) => {
  // Validate the body
  const password = userPasswordSchema.parse(req.body.password);

  // Call the service
  await deleteAccount({userId: req.userId, password});

  // return the response
  return res.status(OK).json({message: "Account deleted"});
})