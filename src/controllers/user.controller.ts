
import catchErrors from '../utils/catchErrors';
import appAssert from '../utils/appAssert';
import { CONFLICT, CREATED, NOT_FOUND, OK } from '../constants/http';
import { userDetailSchema } from '../utils/zod';
import UserModel from '../models/user.model';



export const addUserHandler = catchErrors(async (req, res) => {
  // Validate the body
  const userDetail = userDetailSchema.parse(req.body)

  // checking of existing user
  const existingUser = await UserModel.findOne({
    $or: [{ user_id: userDetail.user_id }, { user_email: userDetail.user_email }]
  });

  appAssert(!existingUser, CONFLICT, 'Email already in use');

  // Create user
  const new_user = await UserModel.create({
    "user_id": userDetail.user_id,
    "user_name": userDetail.user_name,
    "user_email": userDetail.user_email,
    "user_mobile": userDetail.user_mobile,
    "user_role": userDetail.user_role,
  })

  res.status(CREATED).json({message: 'Register successfully'})
})

export const getUsersHandler = catchErrors(async (req, res) => {
  
})