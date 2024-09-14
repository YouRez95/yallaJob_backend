import { z } from "zod";


export const userIdSchema = z.string().min(6, "Invalid user id").max(128, "Invalid user id");
export const userNameSchema = z.string().min(1, 'user name is required');
export const userMobileSchema = z.string().min(1).max(10);
export const jobIdSchema = z.string().length(24, "Invalid job id");
export const freelancerIdSchema = z.string().min(6, "Invalid freelancer id").max(128, "Invalid freelancer id");


export const userDetailSchema = z.object({
  user_id: userIdSchema,
  user_name: userNameSchema,
  user_email: z.string().email({message: 'Invalid email address'}),
  user_mobile: userMobileSchema,
  user_role: z.enum(["Freelancer", "Client"], {
    errorMap: () => ({message: "Invalid user role, must be either 'Client' or 'Freelancer'"})
  })
})



export const jobDetailSchema = z.object({
  freelancer_id : freelancerIdSchema,
  title: z.string().min(1, "Title is required"),
  desc: z.string().min(10, "Description is too short. Please provide more details"),
  job_location: z.string().min(1, 'Job Location is required'),
  job_category: z.string().min(1, "Job category is required"),
  job_option: z.string().min(1, "Job option is required"),
  job_pricing: z.string().transform(val => Number(val))
                .refine(val => !isNaN(val), {message: "Price must be a valid number"})
                .refine(val => val >= 50, {message: 'Price must be at least 50'})
})


export const jobEditSchema = jobDetailSchema.partial();
