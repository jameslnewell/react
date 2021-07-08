import {FirebaseFirestore, getFirestore} from 'firebase/firestore';
import {useApp} from '../app';

export function useFirestore(): FirebaseFirestore {
  return getFirestore(useApp());
}
