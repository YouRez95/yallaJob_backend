import mongoose from "mongoose";
import { BAD_REQUEST, CONFLICT, CREATED, NOT_FOUND, OK, UNAUTHORIZED } from "../constants/http";
import JobModel, { JobDocument } from "../models/job.model";
import UserModel from "../models/user.model";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErrors";
import { removeImageFromFirebase, uploadImageToFirebase } from "../utils/handleImages";
import { jobDetailSchema, jobEditSchema, userIdSchema } from "../utils/zod";


export const addJobHandler = catchErrors(async (req, res) => {
  // Validate the body
  const image = req.file;
  appAssert(image, BAD_REQUEST, "Image is required, adding an image helps attract more clients");
  const jobData = jobDetailSchema.parse(req.body);

  // Search the user
  const user = await UserModel.findOne({user_id: jobData.freelancer_id});
  appAssert(user, NOT_FOUND, 'user not found');

  // Check if the user is Freelancer
  const isFreelancer = user.user_role === 'Freelancer';
  appAssert(isFreelancer, UNAUTHORIZED, 'Clients not authorized to add jobs');

  // Check if the user already create a job with that specific title
  const existJob = await JobModel.exists({freelancer_id: jobData.freelancer_id, title: jobData.title});
  appAssert(!existJob, CONFLICT, 'You already have a job with this title. Please choose a different title for this job');

  // Upload image to firebase
  const job_image = await uploadImageToFirebase(image);

  // Create the job
  await JobModel.create({
    ...jobData,
    job_image
  });

  // Return the response
  return res.status(CREATED).json({message: 'Job Created'});
})

export const getJobsHandler = catchErrors(async (req, res) => {
    const jobs = await JobModel.find();
    return res.status(OK).json(jobs);
})

export const getSingleJobHandler = catchErrors(async (req, res) => {
  // Validate the jobId
  const jobId = req.params.job_id;
  const validJobId = mongoose.Types.ObjectId.isValid(jobId);
  appAssert(validJobId, BAD_REQUEST, 'Invalid Job Id');

  // Find the job by _id
  const job = await JobModel.findById(jobId);
  appAssert(job, NOT_FOUND, 'Job not found');

  // Return the response
  return res.status(OK).json(job);
})

export const getMyJobsHandler = catchErrors(async (req, res) => {
  // Validate user id
  const userId =  userIdSchema.parse(req.params.user_id);

  // Get jobs
  const jobs = await JobModel.find({freelancer_id: userId});
  
  // Return the response
  if (jobs.length === 0) return res.status(200).json({ message: "This freelancer have 0 jobs" });
  return res.status(200).json(jobs);
})

export const editJobHandler = catchErrors(async (req, res) => {
  // Validate the job id
  const jobId = req.params.job_id;
  const validJobId = mongoose.Types.ObjectId.isValid(jobId);
  appAssert(validJobId, BAD_REQUEST, 'Invalid Job Id');

  // Validate the body
  const jobData = jobEditSchema.parse(req.body);

  // Find the job
  const job = await JobModel.findById(jobId);
  appAssert(job, NOT_FOUND, 'Job not found');

  // Checking for existing title for that specific user
  const existTitle = await JobModel.exists({freelancer_id: job.freelancer_id, title: jobData.title})
  appAssert(!existTitle || job.title === jobData.title, CONFLICT, 'You already have a job with this title. Please choose a different title for this job')
  
  // Checking for new image
  let job_image: string | undefined;

  if (req.file) {
    job_image = await uploadImageToFirebase(req.file);
  }

  // Delete the old image
  if (job_image) {
    await removeImageFromFirebase(job.job_image)
  }

  // Update the job
  const finalJobData = {...jobData, job_image};
  for (const [key, value] of Object.entries(finalJobData)) {
    if (value){
      (job as any)[key] = value;
    }
  }
  await job.save()

  // Return the response
  return res.status(OK).json({message: 'Job updated'})
})
