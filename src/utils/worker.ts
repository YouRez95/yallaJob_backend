import 'dotenv/config';
import jobQueue from "../config/jobQueue";
import { removeImageFromFirebase } from "./handleImages";
import { sendPasswordReset, sendVerificationEmail } from './sendVerificationCode';
import mongoose from 'mongoose';
import connectToDatabase from '../config/db';


connectToDatabase();

jobQueue.process(async (job) => {
  const { type } = job.data;

  switch (type) {
    case 'deleteImage':
      await imageDeletionJobHandler(job.data);
      break;

    case 'sendMail':
      await sendMailJobHandler(job.data)
      break;
  default:
    console.log('unknown job type ' + {type});
  }
})


const sendMailJobHandler = async ({key, id, email}: {key: string, id: mongoose.Types.ObjectId, email: string}) => {
  if (key === "email") {
    await sendVerificationEmail(id, email);
  } else if (key === "password") {
    await sendPasswordReset(id, email);
  }
}


const imageDeletionJobHandler = async ({imageUrl}: {imageUrl: string[] | string}) => {
  if (typeof imageUrl === 'string') {
    await removeImageFromFirebase(imageUrl);
    return;
  }
  for (const image of imageUrl) {
    await removeImageFromFirebase(image);
  }
}