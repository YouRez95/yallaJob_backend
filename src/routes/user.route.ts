import { Router } from 'express';
import { deleteUserHandler, editUserHandler, getSingleUserHandler, toggleFavoriteHandler } from '../controllers/user.controller';
import upload from '../config/multer';

const userRoutes = Router();

// Prefix: /api/users

// Get single user
userRoutes.get('/me', getSingleUserHandler);


// Update User
userRoutes.patch('/me', upload.single('file'), editUserHandler);


// Toggle favorite
userRoutes.post('/favorites', toggleFavoriteHandler)


// Delete Account
userRoutes.delete('/me', deleteUserHandler)


export default userRoutes;