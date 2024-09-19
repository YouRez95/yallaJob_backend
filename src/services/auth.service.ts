import { ORIGIN } from "../constants/env";
import { CONFLICT, INTERNAL_SERVER_ERROR, NOT_FOUND } from "../constants/http";
import VerificationCodeType from "../constants/verificationCodeTypes";
import UserModel from "../models/user.model";
import VerificationCodeModel from "../models/verificationCode.model";
import appAssert from "../utils/appAssert";
import { oneYearFromNow } from "../utils/date";
import { sendMail } from "../utils/sendMail";
import { getVerifyEmailTemplate } from '../utils/emailTemplate';
import SessionModel from "../models/session.model";
import { refreshTokenOptions, signToken } from "../utils/jwt";

type UserDataParams = {
  user_name: string;
  user_email: string;
  password: string;
  user_mobile: string;
  user_role: "Freelancer" | "Client";
  user_device?: string;
}

export const createUser = async (userData: UserDataParams) => {
  // Checking for user existence
  // TODO: checking for phone number exist
  const isExist = await UserModel.exists({user_email: userData.user_email});
  appAssert(!isExist, CONFLICT, "Email already exist");

  // Create User
  const user = await UserModel.create(userData);

  // Create the verification code
  const userId = user._id;
  const verificationCode = await VerificationCodeModel.create({
    userId: user._id,
    type: VerificationCodeType.EmailVerification,
    // TODO: onWeek if the verification still exist will delete verificationcode and the user that can create another account
    expiresAt: oneYearFromNow(),
  })

  // Send verification email
  const url = `${ORIGIN}/email/verify/${verificationCode._id}`;
  
  const { error } = await sendMail({
    to: user.user_email,
    ...getVerifyEmailTemplate(url),
  })

  if (error) {
    console.log(error);
  }
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