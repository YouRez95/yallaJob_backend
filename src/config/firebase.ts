import admin, { ServiceAccount } from 'firebase-admin';
import credAccount from '../../storage-firebase.json';

admin.initializeApp({
  credential: admin.credential.cert(credAccount as ServiceAccount),
  storageBucket: 'gs://yalla-job-storage.appspot.com'
})

const bucket = admin.storage().bucket();

export default bucket;