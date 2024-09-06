import { Router } from 'express';

const jobRoutes = Router();

// Prefix: /api/jobs

jobRoutes.get('/', (req, res) => res.json({message: 'job route'}))

export default jobRoutes;