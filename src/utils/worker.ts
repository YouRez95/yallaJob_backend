import 'dotenv/config';
import jobQueue from "../config/jobQueue";
import { removeImageFromFirebase, uploadImageToFirebase } from "./handleImages";
import { sendPasswordReset, sendVerificationEmail } from './sendVerificationCode';
import mongoose from 'mongoose';
import connectToDatabase from '../config/db';
import JobModel from '../models/job.model';
import { modelMap } from '../constants/modelMap';


connectToDatabase();

jobQueue.process(async (job) => {
  const { type } = job.data;

  switch (type) {
    case 'deleteImage':
      await imageDeletionJobHandler(job.data);
      break;

    case 'uploadImage':
      await uploadImageJobHandler(job.data);
      break;

    case 'sendMail':
      await sendMailJobHandler(job.data)
      break;

    case 'reviewActions':
      await updateReviewJobHandler(job.data)
      break;

  default:
    console.log('unknown job type ' + {type});
  }
})


const uploadImageJobHandler = async ({
  image,
  folder,
  documentId
}: {
  image: Express.Multer.File,
  folder: 'jobs' | 'users',
  documentId: mongoose.Types.ObjectId}) => {

    const model = modelMap[folder];
    if (!model) {
      throw new Error(`Invalid folder: ${folder}`);
    }

  // Rebuild the buffer and create image
  try {
    const rebuiltImage = {
      ...image,
      buffer: Buffer.from(image.buffer)
    };
    const imageUrl = await uploadImageToFirebase(rebuiltImage, folder);
    await model.findByIdAndUpdate(documentId, {
      [folder === 'jobs' ? 'job_image' : 'user_photo']: imageUrl
    });
  } catch (error) {
    await model.findByIdAndUpdate(documentId, {
      [folder === 'jobs' ? 'job_image' : 'user_photo']: 'Failed...'
    });
  }
}


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

const updateReviewJobHandler = async ({
  jobId,
  newRating,
  oldRating,
  action
}: {
  jobId: mongoose.Types.ObjectId,
  newRating: number,
  oldRating: number,
  action: ReviewActionType
}) => {

  const job = await JobModel.findById(jobId);
  if (!job) {
    throw new Error('Job not found');
  }

  switch (action) {
    case ReviewActionType.AddNewReview:
      // Add new review
      job.totalReviews += 1;
      job.totalRatingSum += newRating;
      job.averageRating = job.totalRatingSum / job.totalReviews;
      break;

    case ReviewActionType.UpdateOldReview:
      // Update old review
      job.totalRatingSum = job.totalRatingSum - oldRating + newRating;
      job.averageRating = job.totalRatingSum / job.totalReviews;
      break;

      case ReviewActionType.DeleteOldReview:
        // Delete old review
        job.totalReviews -= 1;
        job.totalRatingSum -= oldRating;
        job.averageRating = job.totalReviews === 0 ? 0 : job.totalRatingSum / job.totalReviews;
        break;
  }

  await job.save();

}