import mongoose from "mongoose";
import { BAD_REQUEST, CREATED, OK } from "../constants/http";
import { createUser, verifyEmail } from "../services/auth.service";
import catchErrors from "../utils/catchErrors";
import { registerSchema } from "../utils/zod";
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