import { Router } from 'express';
import { addUserHandler, editUserHandler, getSingleUserHandler, getUsersHandler } from '../controllers/user.controller';
import upload from '../config/multer';

const userRoutes = Router();

// Prefix: /api/users

// Add user
userRoutes.post('/add', addUserHandler)

// Get all users
userRoutes.get('/', getUsersHandler);


// Get single user
userRoutes.get('/:user_id', getSingleUserHandler);


// Update User
userRoutes.patch('/edit/:user_id', upload.single('file'), editUserHandler);


export default userRoutes;