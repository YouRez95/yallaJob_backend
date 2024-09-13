import bucket from "../config/firebase"
import {} from 'firebase-admin';

export const uploadImageToFirebase = (file: Express.Multer.File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileName = `${new Date().toISOString().replace(/:/g, '-')}-${file.originalname.replace(/\s+/g, '')}`
    const blob = bucket.file(fileName);

    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      }
    });

    blobStream.on('finish', () => {
      const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${blob.name}?alt=media`
      resolve(imageUrl);
    });

    blobStream.on('error', (error) => {
      reject(error);
    });

    blobStream.end(file.buffer);
  })
}


export const removeImageFromFirebase = async (filePath: string) => {
  try {
    await bucket.file(filePath.split('/o/')[1].split('?')[0]).delete();
  } catch (error: any) {
    console.log(error);
    throw new Error(`Error in deleting profile image ` + error.message)
  }
}