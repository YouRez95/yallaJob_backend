import { CREATED, OK } from "../constants/http";
import ReviewModel from "../models/review.model";
import { createReview, deleteReview, updateReview } from "../services/review.service";
import catchErrors from "../utils/catchErrors";
import { jobIdSchema, reviewIdSchema, reviewSchema } from "../utils/zod";


export const addReviewHandler = catchErrors(async (req, res) => {
  // Validate the body
  const reviewData = reviewSchema.parse(req.body);
  const userId = req.userId;

  // Call the service
  await createReview({...reviewData, userId});

  // Return the response
  return res.status(CREATED).json({message: "Review created"});
})


export const getReviewsHandler = catchErrors(async (req, res) => {
  // Validate the job id
  const jobId = jobIdSchema.parse(req.params.jobId);

  // Get all reviews
  const reviews = await ReviewModel.find({job_id: jobId}).populate('user_id', 'id user_name user_email user_photo').sort({ rating: -1 });

  // Return the response
  return res.status(OK).json(reviews);
})


export const updateReviewHandler = catchErrors(async (req, res) => {
  // Validate the review id
  const reviewId = reviewIdSchema.parse(req.params.reviewId);
  const { rating, text } = req.body;

  // Call the service
  await updateReview({userId: req.userId, reviewId, rating, text});

  // Return the response
  return res.status(OK).json({message: "review updated successfully"});
})


export const deleteReviewHandler = catchErrors(async (req, res) => {
  // Validate the review id
  const reviewId = reviewIdSchema.parse(req.params.reviewId);

  // Call the service
  await deleteReview({userId: req.userId, reviewId});

  // return the response
  return res.status(OK).json({message: "review deleted successfully"})
})