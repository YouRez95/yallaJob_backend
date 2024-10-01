import { Router } from 'express';
import { deleteUserHandler, editUserHandler, getSingleUserHandler, toggleFavoriteHandler } from '../controllers/user.controller';
import upload from '../config/multer';

// Prefix: /api/users
const userRoutes = Router();


/**
 * @route GET /api/users/me
 * @desc Get the data about the login user
 * 
 * @request
 * - Headers: { Authorization: Bearer access_token }
 * 
 * @response
 * - 404 Not found { message: "User not found" }
 * - 200 OK { ...user }
 */
userRoutes.get('/me', getSingleUserHandler);




/**
 * @route PATCH /api/users/me
 * @desc update user data
 * 
 * @request
 * - Body: { user_name?: string, user_mobile?: string, file: imageData }
 * - Headers: { Authorization: Bearer access_token }
 * 
 * @response
 * - 404 Not found { message: "User not found" }
 * - 200 OK { message: "user updated" }
 */
userRoutes.patch('/me', upload.single('file'), editUserHandler);




/**
 * @route POST /api/users/favorites
 * @desc Adding/removing jobs to/from the user favorites
 * 
 * @request
 * - Body: { job_id: string }
 * - Headers: { Authorization: Bearer access_token }
 * 
 * @response
 * - 400 Bad Request { message: "Job id not valid"}
 * - 400 Bad Request { message: "Job not found or deleted"}
 * - 404 Not found { message: "User not found" }
 * - 200 OK { message: "job added/removed to/from favorites" }
 */
userRoutes.post('/favorites', toggleFavoriteHandler)




/**
 * @route DELETE /api/users/me
 * @desc delete the user login
 * 
 * @request
 * - Body: { password : string }
 * - Headers: { Authorization: Bearer access_token }
 * 
 * @response
 * - 400 Bad Request { message: "Password is incorrect" }
 * - 404 Not found { message: "User not found" }
 * - 200 OK { message: "Account deleted" }
 */
userRoutes.delete('/me', deleteUserHandler)


export default userRoutes;