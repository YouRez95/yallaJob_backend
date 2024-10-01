import mongoose from "mongoose"
import { reviewType } from "../utils/zod";
import UserModel from "../models/user.model";
import appAssert from "../utils/appAssert";
import { BAD_REQUEST, CONFLICT, INTERNAL_SERVER_ERROR, NOT_FOUND, UNAUTHORIZED } from "../constants/http";
import JobModel from "../models/job.model";
import ReviewModel from "../models/review.model";
import jobQueue from "../config/jobQueue";


type CreateReviewParams = {
  userId: mongoose.Types.ObjectId;
} & reviewType;


export const createReview = async ({ userId, job_id, rating, text } : CreateReviewParams) => {
  // Find the user
  const user = await UserModel.findById(userId);
  appAssert(user, NOT_FOUND, "User not found");

  const isClient = user.user_role === 'Client';
  appAssert(isClient, CONFLICT, "Only client can add reviews");

  // Find the job
  const job = await JobModel.findById(job_id);
  appAssert(job, NOT_FOUND, "Job not found");

  const reviewExist = await ReviewModel.exists({user_id: userId, job_id});
  appAssert(!reviewExist, CONFLICT, "Only one review per job is allowed");

  // Create the review
  const reviewCreated = await ReviewModel.create({
    user_id: userId,
    job_id,
    rating,
    text
  })
  appAssert(reviewCreated._id, INTERNAL_SERVER_ERROR, "Something wrong try again later");

  // Update the total review for that specific job on the jobQueue
  jobQueue.add({ type: 'reviewActions', jobId: job._id, newRating: rating, action: ReviewActionType.AddNewReview }, { priority: JobPriority.NORMAL });

  return {
    ...reviewCreated.toObject()
  }
}

type UpdateReviewParams = {
  userId: mongoose.Types.ObjectId;
  reviewId: string;
  rating: number | undefined;
  text: string | undefined 
}

export const updateReview = async({ userId, reviewId, rating, text }: UpdateReviewParams) => {
  // Find the user
  const user = await UserModel.findById(userId);
  appAssert(user, NOT_FOUND, "User not found");

  // Find the review
  const review = await ReviewModel.findById(reviewId);
  appAssert(review, NOT_FOUND, "Review not found");

  // Check the owner of review
  const isMine = String(review.user_id) === String(user._id);
  appAssert(isMine, UNAUTHORIZED, "Unauthorized to update the review");

  // Update the review
  let oldRating;
  if (rating) {
    oldRating = review.rating;
    review.rating = rating || review.rating;
  }
  review.text = text || review.text;
  const isReviewed = await review.save();
  appAssert(isReviewed._id, INTERNAL_SERVER_ERROR, "Review updation failed. Try again later");


  // Create the jobQueue for update the review
  if (oldRating) {
    jobQueue.add({ type: "reviewActions",  jobId: review.job_id, newRating: rating, oldRating, action: ReviewActionType.UpdateOldReview }, {priority: JobPriority.NORMAL});
  }
}


export const deleteReview = async ({userId, reviewId}: {
  userId: mongoose.Types.ObjectId,
  reviewId: string,
}) => {
  // Find the user
  const user = await UserModel.findById(userId);
  appAssert(user, NOT_FOUND, "User not found");

  // Find the review
  const review = await ReviewModel.findById(reviewId);
  appAssert(review, NOT_FOUND, "Review not found");

  // Check the owner of review
  const isMine = String(review.user_id) === String(user._id);
  appAssert(isMine, UNAUTHORIZED, "Unauthorized to delete the review");

  // Delete the review
  const oldRating = review.rating;
  const jobId = review.job_id;
  const isDeleted = await review.deleteOne();
  appAssert(isDeleted, INTERNAL_SERVER_ERROR, "Review deletion failed. Try again later");

  // Create the jobQueue for delete review
  jobQueue.add({ type: "reviewActions", jobId, oldRating, action: ReviewActionType.DeleteOldReview }, {priority: JobPriority.NORMAL});
}