import mongoose from "mongoose";



export interface ReviewDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  job_id: mongoose.Types.ObjectId;
  rating: number; // from 0 ---> 5
  text: string;
}


const reviewSchema = new mongoose.Schema<ReviewDocument>({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Job',
  },
  rating: {
    type: Number,
    required: true,
  },
  text: {
    type: String,
  },
}, { timestamps: true });


const ReviewModel = mongoose.model<ReviewDocument>('Review', reviewSchema);

export default ReviewModel;