import { Router } from 'express';
import { editUserHandler, getSingleUserHandler, toggleFavoriteHandler } from '../controllers/user.controller';
import upload from '../config/multer';

const userRoutes = Router();

// Prefix: /api/users

// Add user
// userRoutes.post('/add', addUserHandler)

// Get all users
// userRoutes.get('/', getUsersHandler);


// Get single user
userRoutes.get('/me', getSingleUserHandler);


// Update User
userRoutes.patch('/me', upload.single('file'), editUserHandler);


// Toggle favorite
userRoutes.post('/favorites', toggleFavoriteHandler)


export default userRoutes;