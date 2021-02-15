import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

export const app = firebase.initializeApp({
  apiKey: process.env.STORYBOOK_FIREBASE_API_KEY,
  authDomain: process.env.STORYBOOK_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.STORYBOOK_FIREBASE_DATABASE_URL,
  projectId: process.env.STORYBOOK_FIREBASE_PROJECT_ID,
  storageBucket: process.env.STORYBOOK_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.STORYBOOK_FIREBASE_MESSAGING_SENDER_ID,
});
