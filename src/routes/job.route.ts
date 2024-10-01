import { Router } from 'express';
import { addJobHandler, deleteJobHandler, editJobHandler, getJobsHandler, getMyJobsHandler, getSingleJobHandler, searchJobHandler } from '../controllers/job.controller';
import upload from '../config/multer';

// Prefix: /api/jobs
const jobRoutes = Router();



/**
 * @route POST /api/jobs/add
 * @desc Add new Job
 * 
 * @request
 * - Body: { title: string, desc: string, job_location: string, job_category: string,
            job_option: string, job_pricing: number, job_image: file }
 * - Headers: { Authorization: Bearer access_token }
 * 
 * @response
 * - 400 Bad Request { errors: [{ path: "title", message: "title required" }, {...}]}
 * - 404 Not found { message: "User not found" }
 * - 401 Unauthorized { message: "Clients not authorized to add jobs" }
 * - 409 Conflict { message: "You already have a job with this title. Please choose a different title for this job" }
 * - 201 Created { message: "Job Created" }
 */
jobRoutes.post('/add', upload.single('job_image'), addJobHandler);




/**
 * @route GET /api/jobs/
 * @desc Get all jobs
 * 
 * @request
 * - Headers: { Authorization: Bearer access_token }
 * 
 * @response
 * - 200 OK { jobs: [...] }
 */
jobRoutes.get('/', getJobsHandler);




/**
 * @route GET /api/jobs/search?query=text
 * @desc Search Jobs
 * 
 * @request
 * - Headers: { Authorization: Bearer access_token }
 * 
 * @response
 * - 200 OK { jobs: [...] }
 */
jobRoutes.get('/search', searchJobHandler);




/**
 * @route GET /api/jobs/me
 * @desc get my Jobs
 * 
 * @request
 * - Headers: { Authorization: Bearer access_token }
 * 
 * @response
 * - 200 OK { jobs: [...] }
 */
jobRoutes.get('/me', getMyJobsHandler);




/**
 * @route GET /api/jobs/:job_id
 * @desc get single job
 * 
 * @request
 * - Headers: { Authorization: Bearer access_token }
 * 
 * @response
 * - 400 Bad Request { message: "Invalid Job Id" }
 * - 404 Not found { message: "Job not found" }
 * - 200 OK { job: {} }
 */
jobRoutes.get('/:job_id', getSingleJobHandler);




/**
 * @route PATCH /api/jobs/:job_id
 * @desc update Job
 * 
 * @request
 * - Body: { title?: string, desc?: string, job_location?: string, job_category?: string,
            job_option?: string, job_pricing?: number, job_image?: file }
 * - Headers: { Authorization: Bearer access_token }
 * 
 * @response
 * - 400 Bad Request { message: "Invalid job id" }
 * - 404 Not found { message: "Job deleted or not found" }
 * - 409 Conflict { message: "You already have a job with this title. Please choose a different title for this job" }
 * - 200 OK { message: "Job Updated" }
 */
jobRoutes.patch('/:job_id', upload.single('job_image'), editJobHandler);




/**
 * @route DELETE /api/jobs/:job_id
 * @desc delete Job
 * 
 * @request
 * - Headers: { Authorization: Bearer access_token }
 * 
 * @response
 * - 400 Bad Request { message: "Invalid job id" }
 * - 404 Not found { message: "Job deleted or not found" }
 * - 200 OK { message: "Job deleted" }
 */
jobRoutes.delete('/:job_id', deleteJobHandler);




export default jobRoutes;