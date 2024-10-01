import { Router } from "express";
import { addReviewHandler, deleteReviewHandler, getReviewsHandler, updateReviewHandler } from "../controllers/review.controller";

// Prefix: /api/reviews
const reviewRoutes = Router();



/**
 * @route POST /api/reviews/
 * @desc Add a review for a job
 * 
 * @request
 * - Body: { job_id: string; rating: number; text?: string }
 * - Headers: { Authorization: Bearer access_token }
 * 
 * @response
 * - 404 Not found { message: "User not found" }
 * - 409 Conflict { message: "Only client can add reviews" }
 * - 409 Conflict { message: "Only one review per job is allowed" }
 * - 500 Server Error { message: "Something wrong try again later" }
 * - 201 Created { message: "Review Created" }
 */
reviewRoutes.post('/', addReviewHandler);




/**
 * @route GET /api/reviews/job/:jobId
 * @desc Get all reviews for specific job
 * 
 * @request
 * - Headers: { Authorization: Bearer access_token }
 * 
 * @response
 * - 200 OK { reviews: [...] }
 */
reviewRoutes.get('/job/:jobId', getReviewsHandler);


/**
 * @route PATCH /api/reviews/:reviewId
 * @desc update review
 * 
 * @request
 * - Body: { rating?: number, text?: string }
 * - Headers: { Authorization: Bearer access_token }
 * 
 * @response
 * - 401 Unauthorized { message: "Unauthorized to update the review" }
 * - 404 Not found { message: "User not found" }
 * - 404 Not found { message: "Review not found" }
 * - 500 Server Error { message: "Review updation failed. Try again later" }
 * - 200 OK { message: "review updated successfully" }
 */
reviewRoutes.patch('/:reviewId', updateReviewHandler);




/**
 * @route DELETE /api/reviews/:reviewId
 * @desc delete review
 * 
 * @request
 * - Headers: { Authorization: Bearer access_token }
 * 
 * @response
 * - 404 Not found { message: "User not found" }
 * - 404 Not found { message: "Review not found" }
 * - 401 Unauthorized { message: "Unauthorized to delete the review" }
 * - 500 Server Error { message: "Review deletion failed. Try again later" }
 * - 200 OK { message: "review deleted successfully" }
 */
reviewRoutes.delete('/:reviewId', deleteReviewHandler);

export default reviewRoutes;
