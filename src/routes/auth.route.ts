import { Router } from 'express';
import { loginHandler, registerHandler, resendEmailHandler, verifyEmailHandler } from '../controllers/auth.controller';

const authRoutes = Router();

// Prefix: /api/auth

// Register user
authRoutes.post('/register', registerHandler);

// Resend verification Email
authRoutes.post('/verify-email/resend', resendEmailHandler)

// Verify Email
authRoutes.get('/verify-email/:code', verifyEmailHandler);

// Login user
authRoutes.get('/login', loginHandler)

export default authRoutes;