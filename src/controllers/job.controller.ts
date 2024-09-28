import mongoose from "mongoose";
import { BAD_REQUEST, CREATED, NOT_FOUND, OK } from "../constants/http";
import JobModel from "../models/job.model";
import { createJob, deleteJob, editJobService } from "../services/job.service";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErrors";
import { jobDetailSchema, jobEditSchema } from "../utils/zod";



export const addJobHandler = catchErrors(async (req, res) => {
  // Validate the body
  const image = req.file;
  appAssert(image, BAD_REQUEST, "Image is required, adding an image helps attract more clients");
  const jobData = jobDetailSchema.parse(req.body);

  // Call the service
  await createJob({user_id: req.userId, image, ...jobData})

  // Return the response
  return res.status(CREATED).json({message: 'Job Created'});
})


export const getJobsHandler = catchErrors(async (req, res) => {
  // TODO: Pagination and filter by most searched jobs and reviews
  const jobs = await JobModel.find();
  return res.status(OK).json(jobs);
})


export const searchJobHandler = catchErrors(async (req, res) => {
  // Get the query
  const { query } = req.query;

  // Search for the jobs
  if (typeof query !== 'string') {
    const jobs = await JobModel.find();
    return res.status(OK).json(jobs);
  }

  const jobs = await JobModel.find({ $text : { $search: query}})
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
  const userId = req.userId;

  // Get jobs
  const jobs = await JobModel.find({user_id: userId});

  // Return the response
  return res.status(200).json(jobs);
})


export const editJobHandler = catchErrors(async (req, res) => {
  // Validate the job id
  const jobId = req.params.job_id;
  const validJobId = mongoose.Types.ObjectId.isValid(jobId);
  appAssert(validJobId, BAD_REQUEST, 'Invalid Job Id');

  // Validate the body
  const jobData = jobEditSchema.parse(req.body);

  // Call the service
  await editJobService({...jobData, image: req.file, jobId, userId: req.userId})


  return res.status(OK).json({message: 'Job updated succesfully'})
})


export const deleteJobHandler = catchErrors(async (req, res) => {
  // Validate the job id
  const jobId = req.params.job_id;
  const validJobId = mongoose.Types.ObjectId.isValid(jobId);
  appAssert(validJobId, BAD_REQUEST, 'Invalid Job Id');

  await deleteJob({jobId, userId: req.userId});

  // Return the response
  return res.status(OK).json({message: "job deleted"});
})
