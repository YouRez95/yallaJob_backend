import mongoose from "mongoose";
import { thirtyDaysFromNow } from "../utils/date";



export interface SessionDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userDevice?: string;
  createdAt: Date;
  expiresAt: Date;
}

const sessionSchema = new mongoose.Schema<SessionDocument>({
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true},
  userDevice: {type: String},
  createdAt: {type: Date, default: Date.now(), required: true},
  expiresAt: {type: Date, default: thirtyDaysFromNow},
})


const SessionModel = mongoose.model<SessionDocument>("Session", sessionSchema);

export default SessionModel;