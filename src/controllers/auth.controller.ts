import mongoose from "mongoose";
import { BAD_REQUEST, CREATED, OK, UNAUTHORIZED } from "../constants/http";
import { createUser, forgotPassword, loginUser, refreshUserAccessToken, resendVerificationEmail, resetPassword, verifyEmail } from "../services/auth.service";
import catchErrors from "../utils/catchErrors";
import { loginSchema, registerSchema, userEmailSchema, userPasswordSchema } from "../utils/zod";
import appAssert from "../utils/appAssert";
import { verifyToken } from "../utils/jwt";
import SessionModel from "../models/session.model";


export const registerHandler = catchErrors(async (req, res) => {
  // Check the body data
  const registerData = registerSchema.parse(req.body);

  // Call the service
  await createUser(registerData)

  // Return the success message
  return res.status(CREATED).json({message: "Account Created"});
})


export const verifyEmailHandler = catchErrors(async (req, res) => {
  // Check the code
  const { code } = req.params;
  const isVerified = mongoose.Types.ObjectId.isValid(code);
  appAssert(isVerified, BAD_REQUEST, "Invalid or expired verification code");

  // Call the service
  const { user, accessToken, refreshToken } = await verifyEmail(code);

  // Return tokens and user data
  return res.status(OK).json({user, accessToken, refreshToken})
})


export const loginHandler = catchErrors(async (req, res) => {
  // Validate the body
  const loginData = loginSchema.parse(req.body);
  
  // Call the service
  const { accessToken, refreshToken, user } = await loginUser(loginData);

  // Return tokens and user data
  return res.status(OK).json({user, accessToken, refreshToken})
})


export const resendEmailHandler = catchErrors(async (req, res) => {
  // Valid the body
  const email = userEmailSchema.parse(req.body.user_email);

  // Call the service
  await resendVerificationEmail(email);

  // Return the response
  return res.status(OK).json({message: "Email verification sent"});
})

export const logoutHandler = catchErrors(async (req, res) => {
  // Get the access token
  const authorizationHeader = req.headers['authorization'];
  appAssert(authorizationHeader && authorizationHeader.startsWith('Bearer '), UNAUTHORIZED, "Authorization header is missing or invalid")
  
  const accessToken = authorizationHeader.split(" ")[1];

  // Verify token
  const { payload } = verifyToken(accessToken);

  // Delete session from db
  if (payload) {
    await SessionModel.findByIdAndDelete(payload.sessionId);
  }

  // Return response
  return res.status(OK).json({ message: 'Logout successfuly'});
})

export const refreshHandler = catchErrors(async (req, res) => {
  // Get the refresh Token
  const authorizationHeader = req.headers['authorization'];
  appAssert(authorizationHeader && authorizationHeader.startsWith('Bearer '), UNAUTHORIZED, "Authorization header is missing or invalid")

  const refreshToken = authorizationHeader.split(" ")[1];

  // Call the service
  const { accessToken, newRefreshToken } = await refreshUserAccessToken(refreshToken);

  // Return response
  return res.status(OK).json({
    accessToken,
    refreshToken: newRefreshToken ? newRefreshToken : refreshToken,
    message: "Access Token Refreshed"
  });
})

export const forgotPasswordHandler = catchErrors(async (req, res) => {
  // Validate the email
  const email = userEmailSchema.parse(req.body.email);

  // Call the service
  await forgotPassword(email);

  // Return response
  return res.status(OK).json({message: "forgot password code sent"});
})

export const resetPasswordhandler = catchErrors(async (req, res) => {
  // Validate the body
  const verificationCode = req.body.verificationCode;
  const isValidCode = mongoose.Types.ObjectId.isValid(verificationCode)
  appAssert(isValidCode, BAD_REQUEST, "Invalid or expired verification code");
  const newPassword = userPasswordSchema.parse(req.body.password);

  // Call the service
  await resetPassword({verificationCode, newPassword});

  // Return the response
  return res.status(OK).json({message: "password updated"});
})

