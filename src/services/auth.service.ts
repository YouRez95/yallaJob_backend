import { CONFLICT, FORBIDDEN, INTERNAL_SERVER_ERROR, NOT_FOUND, OK, UNAUTHORIZED } from "../constants/http";
import VerificationCodeType from "../constants/verificationCodeTypes";
import UserModel from "../models/user.model";
import VerificationCodeModel from "../models/verificationCode.model";
import appAssert from "../utils/appAssert";
import SessionModel from "../models/session.model";
import { refreshTokenOptions, signToken, verifyToken } from "../utils/jwt";
import { z } from "zod";
import { loginSchema, registerSchema } from "../utils/zod";
import { sendPasswordReset, sendVerificationEmail } from "../utils/sendVerificationCode";
import { ONE_DAY_MS, thirtyDaysFromNow } from "../utils/date";
import mongoose from "mongoose";
import { hashValue } from "../utils/bcrypt";



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


export const refreshUserAccessToken = async (refreshToken: string) => {
  // Check if the refresh token still valid
  const { payload } = verifyToken(refreshToken, refreshTokenOptions);
  appAssert(payload, UNAUTHORIZED, "Invalid refresh token");

  // Get the session
  const now = Date.now()
  const session = await SessionModel.findById(payload.sessionId);
  appAssert(session && session.expiresAt.getTime() > now, UNAUTHORIZED, 'Session Expired');

  // update the session if the session expired after 24 hours
  const sessionNeedsRefresh = session.expiresAt.getTime() <= ONE_DAY_MS;
  if (sessionNeedsRefresh) {
    session.expiresAt = thirtyDaysFromNow();
    await session.save();
  }

  // Create new Refresh token if session refreshed
  const newRefreshToken = sessionNeedsRefresh ? signToken({ sessionId: session._id }, refreshTokenOptions) : undefined;
  
  // Create new Access Token 
  const accessToken = signToken({sessionId: session._id, userId: session.userId});

  // return tokens
  return {
    accessToken, newRefreshToken,
  }

}


export const forgotPassword = async (email: string) => {
  // Find the user
  const user = await UserModel.findOne({user_email: email});
  appAssert(user, NOT_FOUND, "User not found");

  // send the verification code
  await sendPasswordReset(user._id, email);
}


export const resetPassword = async ({verificationCode, newPassword}: {
  verificationCode: mongoose.Types.ObjectId,
  newPassword: string
}) => {
  // Find the verification code doc
  const validCode = await VerificationCodeModel.findOne({
    type: VerificationCodeType.PasswordReset,
    _id: verificationCode,
    expiresAt: { $gt: new Date() }
  });
  appAssert(validCode, NOT_FOUND, "Invalid or expired verification code");

  // Update the password
  const userUpdated = await UserModel.findByIdAndUpdate(validCode.userId, { password: await hashValue(newPassword) }, {new: true});
  appAssert(userUpdated, INTERNAL_SERVER_ERROR, "Something wrong try again later");

  // Delete the verification code
  await validCode.deleteOne();

  // Delete all sessions
  await SessionModel.deleteMany({userId: userUpdated._id});
}