import mongoose from 'mongoose';
import { hashValue } from '../utils/bcrypt';

// Type of the user schema
export interface UserDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  user_name: string;
  user_email: string;
  password: string;
  user_mobile: string;
  user_role: string;
  user_photo: string;
  user_rating: number;
  favorites: mongoose.Types.Array<mongoose.Types.ObjectId>;
  user_device?: string;
  verified: boolean;
  omitPassword(): Pick<UserDocument, 'user_name' | 'user_email' | 'user_mobile' | 'user_role' | '_id' | 'user_photo' | 'verified'>;
}

// User Schema
const userSchema = new mongoose.Schema<UserDocument>({
  user_name: {
    type: String,
    required: true
  },
  user_email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  user_mobile: {
    type: String,
    required: true
  },
  user_role: {
    type: String,
    required: true
  },
  user_photo: {
    type: String,
    default: "default.png"
  },
  user_rating: {
    type: Number,
    default: 0
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    default: []
  }],
  user_device: {
    type: String,
  },
  verified: {
    type: Boolean,
    default: false
  }
},  { timestamps: true })


userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await hashValue(this.password);
  next();
})

userSchema.methods.omitPassword = function () {
  const user = this.toObject();
  delete user.password;
  return user;
}


const UserModel = mongoose.model<UserDocument>('User', userSchema)

export default UserModel;