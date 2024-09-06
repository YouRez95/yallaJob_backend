import mongoose from 'mongoose';
import { NODE_ENV, MONGO_LOCAL, MONGO_CLOUD } from '../constants/env';

const MONGO_URI = NODE_ENV === 'development' ? MONGO_LOCAL : MONGO_CLOUD

const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.info('mongodb connected successfully')
  } catch (err) {
    console.error('Could not connect to databse', err);
    process.exit(1);
  }
}

export default connectToDatabase;