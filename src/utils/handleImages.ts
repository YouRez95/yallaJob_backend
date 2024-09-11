import bucket from "../config/firebase"

export const uploadImageToFirebase = (file: Express.Multer.File) => {
  return new Promise((resolve, reject) => {
    const blob = bucket.file(file.originalname);

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