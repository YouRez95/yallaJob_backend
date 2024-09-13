import admin, { ServiceAccount } from 'firebase-admin';
import credAccount from '../../storage-firebase.json';
import { STORAGE_BUCKET } from '../constants/env';

admin.initializeApp({
  credential: admin.credential.cert(credAccount as ServiceAccount),
  storageBucket: STORAGE_BUCKET
})

const bucket = admin.storage().bucket();

export default bucket;