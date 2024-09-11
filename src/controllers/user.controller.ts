
import catchErrors from '../utils/catchErrors';
import appAssert from '../utils/appAssert';
import { CONFLICT, CREATED, NOT_FOUND, OK } from '../constants/http';
import { userDetailSchema, userIdSchema, userMobileSchema, userNameSchema } from '../utils/zod';
import UserModel from '../models/user.model';
import { uploadImageToFirebase } from '../utils/handleImages';



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

  return res.status(CREATED).json({message: 'Register successfully'})
})



export const getUsersHandler = catchErrors(async (req, res) => {
  const users = await UserModel.find();
  return res.status(OK).json(users);
})


export const getSingleUserHandler = catchErrors(async (req, res) => {
  const userId = userIdSchema.parse(req.params.user_id);

  const user = await UserModel.findOne({user_id: userId});
  appAssert(user, NOT_FOUND, 'User not found');

  return res.status(OK).json(user);
})


export const editUserHandler = catchErrors(async (req, res) => {
  // validate the user_id 
  const userId = userIdSchema.parse(req.params.user_id);
  let imageUrl;
  let user_name;
  let user_mobile;

  const user = await UserModel.findOne({user_id: userId});
  appAssert(user, NOT_FOUND, 'User not found');

  // upload image to firebase
  if (req.file) {
    imageUrl = await uploadImageToFirebase(req.file) as string; 
  }

  if (req.body.user_name) {
    user_name = userNameSchema.parse(req.body.user_name)
  }

  if (req.body.user_mobile) {
    user_mobile = userMobileSchema.parse(req.body.user_mobile)
  }
  user.user_name = user_name || user.user_name;
  user.user_mobile = user_mobile || user.user_mobile;
  user.user_photo = imageUrl || user.user_photo;
  await user.save()

  return res.status(OK).json({message: 'Account updated'});
})