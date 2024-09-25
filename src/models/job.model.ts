import mongoose from 'mongoose';
import UserModel from './user.model';

// Type of the job schema
export interface JobDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
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
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
    ref: 'User',
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


// Hooks
jobSchema.pre('deleteOne', { document: true } ,async function (next) {
  // Find all users who have this job in their favorites
  await UserModel.updateMany({ favorites: this._id }, { $pull: { favorites: this._id }});
  next()
})

jobSchema.pre('deleteMany', async function (next) {
  const filter = this.getFilter();
  const jobs = await this.model.find(filter);

  // Loop through each job and update the UserModel
  for (const job of jobs) {
    await UserModel.updateMany({ favorites: job._id }, { $pull: { favorites: job._id } });
  }

  next();
});

const JobModel = mongoose.model<JobDocument>('Job', jobSchema)

export default JobModel;