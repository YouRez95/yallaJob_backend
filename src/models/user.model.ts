import mongoose from 'mongoose';

// Type of the user schema
export interface UserDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  user_id: string;
  user_name: string;
  user_email: string;
  user_mobile: string;
  user_role: string;
  user_photo: string;
  user_rating: number;
  favorites: mongoose.Types.Array<string>;
}

// User Schema
const userSchema = new mongoose.Schema<UserDocument>({
  user_id: {
    type: String,
    required: true,
    unique: true
  },
  user_name: {
    type: String,
    required: true
  },
  user_email: {
    type: String,
    required: true,
    unique: true
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
  favorites: {
    type: [String],
    default: []
  }
},  { timestamps: true })


const UserModel = mongoose.model<UserDocument>('User', userSchema)

export default UserModel;