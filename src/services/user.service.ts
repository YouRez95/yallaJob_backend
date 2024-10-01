import mongoose from "mongoose";
import { UpdateUserType } from "../utils/zod";
import UserModel from "../models/user.model";
import appAssert from "../utils/appAssert";
import { BAD_REQUEST, NOT_FOUND } from "../constants/http";
import JobModel from "../models/job.model";
import { compareValue } from "../utils/bcrypt";
import SessionModel from "../models/session.model";
import jobQueue from "../config/jobQueue";
import ReviewModel from "../models/review.model";


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
    // Add the upload image to the jobQueue
    jobQueue.add({type: "uploadImage", documentId: user._id ,image, folder: "users"}, { priority: JobPriority.HIGH });
    imageUrl = "Processing..."
  }

  if (imageUrl && user.user_photo !== 'default.png' && user.user_photo !== 'Failed...') {
    // Add the remove image to the jobQueue
    jobQueue.add({type: "deleteImage", imageUrl: user.user_photo})
  }

  // Update user data
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


type DeleteAccountParams = {
  userId: mongoose.Types.ObjectId;
  password: string;
}

export const deleteAccount = async ({userId, password}: DeleteAccountParams) => {
  // Find the user
  const user = await UserModel.findById(userId);
  appAssert(user, NOT_FOUND, "User Not found");

  // Check password
  const passwordIsCorrect = await compareValue(password, user.password);
  appAssert(passwordIsCorrect, BAD_REQUEST, "Password is incorrect");

  // Delete user profil
  if (user.user_photo !== 'default.png') {
    // await removeImageFromFirebase(user.user_photo);
    jobQueue.add({type: "deleteImage", imageUrl: user.user_photo})
  }


  // Find all jobs and reviews concurrently
  const [jobs, reviews] = await Promise.all([
    JobModel.find({user_id: userId}).select('job_image'),
    ReviewModel.find({user_id: userId}),
  ])

  // Add job images to deletion queue
  const imageUrl = jobs.map(job => job.job_image).filter(Boolean);
  if (imageUrl.length > 0) {
    jobQueue.add({ type: 'deleteImage', imageUrl }, { priority: JobPriority.LOW });
  }

  // Collect old review ratings for queue processing
  const reviewsDeleted = reviews.map(review => ({
    oldRating: review.rating,
    jobId: review.job_id,
  }))

  // Delete jobs, reviews, and session concurrently
  await Promise.all([
    JobModel.deleteMany({user_id: userId}),
    ReviewModel.deleteMany({user_id: userId}),
    SessionModel.deleteMany({userId}),
  ])

  // Queue review actions
  reviewsDeleted.forEach(({oldRating, jobId}) => {
    jobQueue.add(
      { type: "reviewActions", jobId, oldRating, action: ReviewActionType.DeleteOldReview },
      { priority: JobPriority.NORMAL }
    );
  })
  
  // Delete account
  await user.deleteOne();
}
