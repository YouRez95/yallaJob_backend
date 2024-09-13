import { z } from "zod";


export const userIdSchema = z.string().min(6, "Invalid user id").max(128, "Invalid user id");
export const userNameSchema = z.string().min(1, 'user name is required');
export const userMobileSchema = z.string().min(1).max(10);
export const jobIdSchema = z.string().length(24, "Invalid job id");


export const userDetailSchema = z.object({
  user_id: userIdSchema,
  user_name: userNameSchema,
  user_email: z.string().email({message: 'Invalid email address'}),
  user_mobile: userMobileSchema,
  user_role: z.enum(["Freelancer", "Client"], {
    errorMap: () => ({message: "Invalid user role, must be either 'Client' or 'Freelancer'"})
  })
})

