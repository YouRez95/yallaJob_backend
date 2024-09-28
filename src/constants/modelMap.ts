import mongoose from "mongoose";
import JobModel from "../models/job.model";
import UserModel from "../models/user.model";


// Define the map that links folder names to Mongoose models
export const modelMap: Record<string, mongoose.Model<any>> = {
  jobs: JobModel,
  users: UserModel,
}