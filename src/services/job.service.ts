import mongoose from "mongoose";
import { CONFLICT, NOT_FOUND, UNAUTHORIZED } from "../constants/http";
import JobModel from "../models/job.model";
import UserModel from "../models/user.model";
import appAssert from "../utils/appAssert";
import { removeImageFromFirebase, uploadImageToFirebase } from "../utils/handleImages";
import { JobDetailType, JobEditType } from "../utils/zod";
import jobQueue from "../config/jobQueue";

type CreateJobParams = {
  user_id: mongoose.Types.ObjectId;
  image: Express.Multer.File,
} & JobDetailType

export const createJob = async (jobData: CreateJobParams) => {
  const user = await UserModel.findById(jobData.user_id);
  appAssert(user, NOT_FOUND, 'user not found');

  // Check if the user is Freelancer
  const isFreelancer = user.user_role === 'Freelancer';
  appAssert(isFreelancer, UNAUTHORIZED, 'Clients not authorized to add jobs');

  // Check if the user already create a job with that specific title
  const existJob = await JobModel.exists({user_id: jobData.user_id, title: jobData.title});
  appAssert(!existJob, CONFLICT, 'You already have a job with this title. Please choose a different title for this job');

  // Upload image to firebase
  const job_image = await uploadImageToFirebase(jobData.image, "jobs");

  // Create the job
  const { image, ...rest } = jobData;
  await JobModel.create({...rest, job_image});
}




type EditJobParams = {
  userId: mongoose.Types.ObjectId;
  jobId: string;
  image: Express.Multer.File | undefined;
} & JobEditType

export const editJobService = async (jobEditData: EditJobParams) => {
  // Find the job for that specific user
  const job = await JobModel.findOne({_id: jobEditData.jobId, user_id: jobEditData.userId});
  appAssert(job, NOT_FOUND, "Job deleted or not found");

  // Checking for existing title for that specific user
  const existTitle = await JobModel.exists({user_id: job.user_id, title: jobEditData.title});
  appAssert(!existTitle || job.title === jobEditData.title, CONFLICT, 'You already have a job with this title. Please choose a different title for this job');

  // Handle image
  const image = jobEditData.image;
  let newImageUrl;
  if (image) {
    newImageUrl = await uploadImageToFirebase(image, 'jobs');
  }

  if (newImageUrl && job.job_image) {
    jobQueue.add({type: "deleteImage", imageUrl: job.job_image}, {priority: JobPriority.NORMAL});
  }

  // Update the job
  const finalJobData = {...jobEditData, job_image: newImageUrl};
  for (const [key, value] of Object.entries(finalJobData)) {
    if (value){
      (job as any)[key] = value;
    }
  }
  await job.save();
}




type DeleteJobParams = {
  userId: mongoose.Types.ObjectId;
  jobId: string;
}

export const deleteJob = async (jodDeleteData: DeleteJobParams) => {
  // Find the job
  const job = await JobModel.findOne({_id: jodDeleteData.jobId, user_id: jodDeleteData.userId});
  appAssert(job, NOT_FOUND, "Job already deleted or not found");

  // Delete the job
  const jobImage = job.job_image
  const isDeleted = await job.deleteOne();
  if (isDeleted) {
    jobQueue.add({type: "deleteImage", imageUrl: jobImage}, {priority: JobPriority.NORMAL});
  }
}