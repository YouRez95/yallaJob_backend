import { Router } from 'express';
import { addUserHandler, getUsersHandler } from '../controllers/user.controller';

const userRoutes = Router();

// Prefix: /api/users

// add user
userRoutes.post('/add', addUserHandler)

// get all users
userRoutes.get('/', getUsersHandler);

export default userRoutes;