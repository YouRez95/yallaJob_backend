import { Router } from 'express';
import { forgotPasswordHandler, loginHandler, logoutHandler, refreshHandler, registerHandler, resendEmailHandler, resetPasswordhandler, verifyEmailHandler } from '../controllers/auth.controller';

const authRoutes = Router();

// Prefix: /api/auth


/**
 * @route POST /api/auth/register
 * @desc Register New user
 * 
 * @request
 * - Body: { user_name: string, user_email: string, password: string,
 *           user_mobile: string, user_role: "Freelancer" | "Client",
 *          user_device?: string }
 * 
 * @response
 * - 400 Bad Request { errors: [{ path: "user_email", message: "Invalid email address" }, {...}]}
 * - 409 Conflict { message: "Email already exist" }
 * - 201 Created { message: "Account Created" }
 */
authRoutes.post('/register', registerHandler);



/**
 * @route POST /api/auth/verify-email/resend
 * @desc Resend verification Email for account not verified yet
 * 
 * @request
 * - Body: { user_email: string }
 * 
 * @response
 * - 400 Bad Request { errors: [{ path: "user_email", message: "Invalid email address" }]}
 * - 401 Unauthorized { message: "User not found" }
 * - 200 OK { message: "Email verification sent" }
 */
authRoutes.post('/verify-email/resend', resendEmailHandler)



/**
 * @route GET /api/auth/verify-email/:code
 * @desc Verification email
 * 
 * @request
 * - Params: { code: string }
 * 
 * @response
 * - 400 Bad Request { message: "Invalid or expired verification code" }
 * - 404 Not Found { message: "Invalid or expired verification code" }
 * - 500 Server Error { message: "Failed to verify Email Try again later" }
 * - 200 OK {user: object, accessToken: string, refreshToken: string}
 */
authRoutes.get('/verify-email/:code', verifyEmailHandler);



/**
 * @route POST /api/auth/login
 * @desc login user
 * 
 * @request
 * - Body: { user_email: string, password: string, user_device?: string }
 * 
 * @response
 * - 401 Unauthorized { message: "Invalid email or password" }
 * - 403 Forbidden { message: "Your account is not yet verified" }
 * - 200 OK {user: object, accessToken: string, refreshToken: string}
 */
authRoutes.post('/login', loginHandler)



/**
 * @route GET /api/auth/logout
 * @desc logout user by deleting the session
 * 
 * @request
 * - Headers: { Authorization: Bearer access_token }
 * 
 * @response
 * - 401 Unauthorized { message: "Authorization header is missing or invalid" } 
 * - 200 OK { message: "Logout successfuly" }
 */
authRoutes.get('/logout', logoutHandler);



/**
 * @route GET /api/auth/refresh
 * @desc refresh access token if it expire
 * 
 * @request
 * - Headers: { Authorization: Bearer refresh_token }
 *
 * @response
 * - 401 Unauthorized { message: "Authorization header is missing or invalid" || "Invalid refresh token" || "Session Expired" }
 * - 200 OK { accessToken: string, refreshToken: string, message: "Access Token Refreshed" }
 */
authRoutes.get('/refresh', refreshHandler);



authRoutes.post('/forgot-password', forgotPasswordHandler);


authRoutes.post('/reset-password', resetPasswordhandler);



export default authRoutes;