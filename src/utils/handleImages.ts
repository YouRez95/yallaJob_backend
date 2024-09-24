import bucket from "../config/firebase"

export const uploadImageToFirebase = (file: Express.Multer.File, folder: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const filePath = `${folder}/${new Date().toISOString().replace(/:/g, '-')}-${file.originalname.replace(/\s+/g, '')}`
    const blob = bucket.file(filePath);

    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      }
    });

    blobStream.on('finish', () => {
      const encodedFilePath = encodeURIComponent(filePath);
      const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedFilePath}?alt=media`;
      resolve(imageUrl);
    });

    blobStream.on('error', (error) => {
      reject(error);
    });

    blobStream.end(file.buffer);
  })
}


export const removeImageFromFirebase = async (filePath: string) => {
  filePath = decodeURIComponent(filePath);
  try {
    await bucket.file(filePath.split('/o/')[1].split('?')[0]).delete();
  } catch (error: any) {
    console.log(error);
    throw new Error(`Error in deleting profile image ` + error.message);
  }
}