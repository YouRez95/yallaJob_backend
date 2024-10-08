import mongoose from "mongoose";
import { z } from "zod";


// --------------------- GLOBAL SCHEMAS ----------------------------

export const userNameSchema = z.string().min(1, 'user name is required');
export const userMobileSchema = z.string().min(1).max(10);
export const userEmailSchema = z.string().email({message: 'Invalid email address'});
export const userPasswordSchema = z.string({message: "Password is required"}).min(5, "Password must be at least 5 characters");
export const jobIdSchema = z.string().refine(val => mongoose.isValidObjectId(val), {
  message: "Invalid job id"
})
export const reviewIdSchema = z.string().refine(val => mongoose.isValidObjectId(val), {
  message: "Invalid review id"
})

// --------------- REGISTRATION SCHEMAS ---------------------------

export const registerSchema = z.object({
  user_name: userNameSchema,
  user_email: userEmailSchema,
  password: userPasswordSchema,
  user_mobile: userMobileSchema,
  user_device: z.string().optional(),
  user_role: z.enum(["Freelancer", "Client"], {
    errorMap: () => ({message: "Invalid user role, must be either 'Client' or 'Freelancer'"})
  })
})

export type UserRegisterParams = z.infer<typeof registerSchema>


// --------------- LOGIN SCHEMAS ----------------------------------

export const loginSchema = z.object({
  user_email: userEmailSchema,
  password: userPasswordSchema,
  user_device: z.string().optional(),
})

export type UserLoginParams = z.infer<typeof loginSchema>

// -------------------- UPDATE USER SCHEMA -------------------------

export const updateUserSchema = z.object({
  user_name: userNameSchema.optional(),
  user_mobile: userMobileSchema.optional(),
})

export type UpdateUserType = z.infer<typeof updateUserSchema>

// --------------- JOB ADD SCHEMAS -------------

export const jobDetailSchema = z.object({
  title: z.string().min(1, "Title is required"),
  desc: z.string().min(10, "Description is too short. Please provide more details"),
  job_location: z.string().min(1, 'Job Location is required'),
  job_category: z.string().min(1, "Job category is required"),
  job_option: z.string().min(1, "Job option is required"),
  job_pricing: z.string().transform(val => Number(val))
                .refine(val => !isNaN(val), {message: "Price must be a valid number"})
                .refine(val => val >= 50, {message: 'Price must be at least 50'})
})

export type JobDetailType = z.infer<typeof jobDetailSchema>


// --------------- JOB EDIT SCHEMAS -------------

export const jobEditSchema = jobDetailSchema.partial();
export type JobEditType = z.infer<typeof jobEditSchema>



// --------------- REVIEW SCHEMAS -------------



export const reviewSchema = z.object({
  job_id: jobIdSchema,
  rating: z.number().min(1).max(5),
  text: z.string().optional()
});
export type reviewType = z.infer<typeof reviewSchema>;