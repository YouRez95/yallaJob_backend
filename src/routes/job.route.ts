import { Router } from 'express';
import { addJobHandler, deleteJobHandler, editJobHandler, getJobsHandler, getMyJobsHandler, getSingleJobHandler, searchJobHandler } from '../controllers/job.controller';
import upload from '../config/multer';

const jobRoutes = Router();

// Prefix: /api/jobs

// Add job
jobRoutes.post('/add', upload.single('job_image'), addJobHandler);

// Get all jobs
jobRoutes.get('/', getJobsHandler);

// Search Job
jobRoutes.get('/search', searchJobHandler);

// Get single job
jobRoutes.get('/:job_id', getSingleJobHandler);

// Get my jobs
jobRoutes.get('/freelancer/:user_id', getMyJobsHandler);

// Edit Job
jobRoutes.patch('/edit/:job_id', upload.single('job_image'), editJobHandler);

// Delete job
jobRoutes.delete('/delete/:job_id/:user_id', deleteJobHandler);



export default jobRoutes;