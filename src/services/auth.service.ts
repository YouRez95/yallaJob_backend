import { CONFLICT, FORBIDDEN, INTERNAL_SERVER_ERROR, NOT_FOUND, OK, UNAUTHORIZED } from "../constants/http";
import VerificationCodeType from "../constants/verificationCodeTypes";
import UserModel from "../models/user.model";
import VerificationCodeModel from "../models/verificationCode.model";
import appAssert from "../utils/appAssert";
import SessionModel from "../models/session.model";
import { refreshTokenOptions, signToken } from "../utils/jwt";
import { z } from "zod";
import { loginSchema, registerSchema } from "../utils/zod";
import { sendVerificationEmail } from "../utils/sendVerificationEmail";



type UserRegisterParams = z.infer<typeof registerSchema>

export const createUser = async (userData: UserRegisterParams) => {
  // Checking for user existence
  // TODO: checking for phone number exist
  const isExist = await UserModel.exists({user_email: userData.user_email});
  appAssert(!isExist, CONFLICT, "Email already exist");

  // Create User
  const user = await UserModel.create(userData);

  // Send verification email
  await sendVerificationEmail(user._id, user.user_email);
}


export const verifyEmail = async (code: string) => {
  // Get the verificationCode model
  const verificationCode = await VerificationCodeModel.findOne({
    _id: code,
    type: VerificationCodeType.EmailVerification,
    expiresAt: { $gt : new Date() },
  })
  appAssert(verificationCode, NOT_FOUND, "Invalid or expired verification code")

  // Update the user
  const userUpdated = await UserModel.findByIdAndUpdate(verificationCode.userId, { verified: true }, { new: true });
  appAssert(userUpdated, INTERNAL_SERVER_ERROR, 'Failed to verify Email Try again later');

  // Delete the verificationCode
  await verificationCode.deleteOne();

   // create session
   const userId = userUpdated._id;

   const session = await SessionModel.create({
    userId,
    userDevice: userUpdated.user_device,
  })

  // sign accessToken & refreshToken
  const refreshToken = signToken({
    sessionId: session._id
  }, refreshTokenOptions)

  const accessToken = signToken({
    userId,
    sessionId: session._id
  })

  // Return user
  return {
    user: userUpdated.omitPassword(),
    accessToken,
    refreshToken
  }
}

type UserLoginParams = z.infer<typeof loginSchema>

export const loginUser = async (userData: UserLoginParams) =>{
  // Find the user
  const user = await UserModel.findOne({user_email: userData.user_email});
  appAssert(user, UNAUTHORIZED, 'Invalid email or password');

  // Check password
  const isValid = await user.comparePassword(userData.password);
  appAssert(isValid, UNAUTHORIZED, 'Invalid email or password');

  // Check the account is verified
  const isVerified = user.verified;
  // Send that response if we need email
  // appAssert(isVerified, FORBIDDEN, `${user.user_email} is not yet verified`);
  appAssert(isVerified, FORBIDDEN, `Your account is not yet verified`);

  // TODO: Checking if the user has already session open in other device to alert them


  // Create the session
  const session = await SessionModel.create({
    userId: user._id,
    userDevice: userData.user_device,
  })

  // sign accessToken & refreshToken
  const refreshToken = signToken({
    sessionId: session._id
  }, refreshTokenOptions)

  const accessToken = signToken({
    userId: user._id,
    sessionId: session._id
  })

  // Return user
  return {
    user: user.omitPassword(),
    accessToken,
    refreshToken
  }
}


export const resendVerificationEmail = async (email: string) => {
  // find the user
  const user = await UserModel.findOne({user_email: email});
  appAssert(user, UNAUTHORIZED, 'User not found');

  // Check if the account already verified
  appAssert(!user.verified, CONFLICT, 'Account already verified');

  // Send the verification code
  await sendVerificationEmail(user._id, email);
}