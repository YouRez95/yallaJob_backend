import mongoose from 'mongoose';

// Type of the job schema
export interface JobDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  freelancer_id: string;
  title: string;
  desc: string;
  job_location: string;
  job_category: string;
  job_image: string;
  job_option: string;
  job_pricing: number;
  job_rating: number;
}

// Job Schema
const jobSchema = new mongoose.Schema<JobDocument>({
  freelancer_id: {
    type: String,
    required: true,
    index: true
},
title: {
    type: String,
    required: true,
},
desc: {
    type: String,
    required: true,
},
job_location: {
    type: String,
    required: true
},
job_category: {
    type: String,
    required: true
},
job_image: {
    type: String,
    required: true
},
job_option: {
    type: String,
    required: true
},
job_pricing: {
    type: Number,
    required: true,
    min: 50,
},
job_rating: {
    type: Number,
    default: 0
}
},  { timestamps: true })

// Create index for search
jobSchema.index({ title: 'text', desc: 'text' });

const JobModel = mongoose.model<JobDocument>('Job', jobSchema)

export default JobModel;