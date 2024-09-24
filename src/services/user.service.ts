import mongoose from "mongoose";
import { UpdateUserType } from "../utils/zod";
import UserModel from "../models/user.model";
import appAssert from "../utils/appAssert";
import { BAD_REQUEST, NOT_FOUND } from "../constants/http";
import { removeImageFromFirebase, uploadImageToFirebase } from "../utils/handleImages";
import JobModel from "../models/job.model";


type UpdateUserParams = {
  image: Express.Multer.File | undefined;
  userId: mongoose.Types.ObjectId;
} & UpdateUserType

export const updateUser = async ({userId, image, ...userData}: UpdateUserParams) => {
  // Find the user
  let user = await UserModel.findById(userId);
  appAssert(user, NOT_FOUND, "User not found");

  // Update the user
  let imageUrl;
  if (image) {
    imageUrl = await uploadImageToFirebase(image, 'users');
  }

  if (imageUrl && user.user_photo !== 'default.png') {
    await removeImageFromFirebase(user.user_photo);
  }

  user.user_name = userData.user_name || user.user_name;
  user.user_mobile = userData.user_mobile || user.user_mobile;
  user.user_photo = imageUrl || user.user_photo;
  await user.save();
}


type toggleFavoriteParams = {
  userId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
}

export const toggleFavoriteJobs = async ({userId, jobId}: toggleFavoriteParams) => {
  // Find the user
  const user = await UserModel.findById(userId);
  appAssert(user, NOT_FOUND, "User not found");

  // Check if the job exist
  const exist = await JobModel.exists({_id: jobId});
  appAssert(exist, BAD_REQUEST, "Job not found or deleted");

  // Toggle the job
  let message;
  if (user.favorites.includes(jobId)) {
    user.favorites.pull(jobId)
    message = 'job removed from favorites'
  } else {
    user.favorites.addToSet(jobId)
    message = 'job added to favorites'
  }

  await user.save();

  return {
    message
  }
}