import mongoose from "mongoose";
import { BAD_REQUEST, CREATED, OK } from "../constants/http";
import { createUser, loginUser, resendVerificationEmail, verifyEmail } from "../services/auth.service";
import catchErrors from "../utils/catchErrors";
import { loginSchema, registerSchema, userEmailSchema } from "../utils/zod";
import appAssert from "../utils/appAssert";


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