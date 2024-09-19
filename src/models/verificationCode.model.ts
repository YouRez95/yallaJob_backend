import mongoose from "mongoose";
import VerificationCodeType from "../constants/verificationCodeTypes";



export interface VerificationCodeDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  type: VerificationCodeType; // now this type in unlock with those two values 'email_verification' or 'password_reset'
  expiresAt: Date;
  createdAt: Date; 
}


const verificationCodeSchema = new mongoose.Schema<VerificationCodeDocument>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // index bcs we are query by the userId and that will be fast with index
  type: {type: String, required: true},
  createdAt: {type: Date, required: true, default: Date.now()},
  expiresAt: {type: Date, required: true},
})

const VerificationCodeModel = mongoose.model<VerificationCodeDocument>("verificationCode", verificationCodeSchema, "verification_codes");

export default VerificationCodeModel;