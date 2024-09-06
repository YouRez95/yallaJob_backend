import { z } from "zod";

export const userDetailSchema = z.object({
  user_id: z.string().min(6).max(128),
  user_name: z.string().min(1, 'user name is required'),
  user_email: z.string().email({message: 'Invalid email address'}),
  user_mobile: z.string().min(1).max(10),
  user_role: z.enum(["Freelancer", "Client"], {
    errorMap: () => ({message: "Invalid user role, must be either 'Client' or 'Freelancer'"})
  })
})