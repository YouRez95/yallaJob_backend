import { Router } from 'express';
import { registerHandler, verifyEmailHandler } from '../controllers/auth.controller';

const authRoutes = Router();

// Prefix: /api/auth

// Register user
authRoutes.post('/register', registerHandler);

// Verify Email
authRoutes.get('/verify-email/:code', verifyEmailHandler);

export default authRoutes;