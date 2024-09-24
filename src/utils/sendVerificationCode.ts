import mongoose from "mongoose";
import VerificationCodeModel from "../models/verificationCode.model";
import VerificationCodeType from "../constants/verificationCodeTypes";
import { oneHourFromNow, oneYearFromNow } from "./date";
import { ORIGIN } from "../constants/env";
import { sendMail } from "./sendMail";
import { getVerifyEmailTemplate, getPasswordResetTemplate } from './emailTemplate';


export const sendVerificationEmail = async (userId: mongoose.Types.ObjectId, userEmail: string) => {
  // Delete old verificationCode
  await VerificationCodeModel.findOneAndDelete({userId, type: VerificationCodeType.EmailVerification});

  // Create VerificationCode
  const verificationCode = await VerificationCodeModel.create({
    userId,
    type: VerificationCodeType.EmailVerification,
    expiresAt: oneYearFromNow(),
  })

  // Send verification Email
  const url = `${ORIGIN}/email/verify/${verificationCode._id}`;

  const { error } = await sendMail({
    to: userEmail,
    ...getVerifyEmailTemplate(url),
  })

  if (error) {
    console.log(error);
  }
}

export const sendPasswordReset = async (userId: mongoose.Types.ObjectId, userEmail: string) => {
  // Delete old verificationCode
  await VerificationCodeModel.findOneAndDelete({userId, type: VerificationCodeType.PasswordReset});

  // Create VerificationCode
  const verificationCode = await VerificationCodeModel.create({
    userId,
    type: VerificationCodeType.PasswordReset,
    expiresAt: oneHourFromNow(),
  })

  // Send verification Email
  const url = `${ORIGIN}/password-reset/${verificationCode._id}`;

  const { error } = await sendMail({
    to: userEmail,
    ...getPasswordResetTemplate(url),
  })

  if (error) {
    console.log(error);
  }
}