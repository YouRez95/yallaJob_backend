import { Router } from 'express';
import { addJobHandler, editJobHandler, getJobsHandler, getMyJobsHandler, getSingleJobHandler } from '../controllers/job.controller';
import upload from '../config/multer';

const jobRoutes = Router();

// Prefix: /api/jobs

// Add job
jobRoutes.post('/add', upload.single('job_image'), addJobHandler);

// Get all jobs
jobRoutes.get('/', getJobsHandler);

// Get single job
jobRoutes.get('/:job_id', getSingleJobHandler);

// Get my jobs
jobRoutes.get('/freelancer/:user_id', getMyJobsHandler);

// Edit Job
jobRoutes.patch('/edit/:job_id', upload.single('job_image'), editJobHandler) 


export default jobRoutes;