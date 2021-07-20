import {
  useInvokablePromise,
  UseInvokablePromiseResult,
} from '@jameslnewell/react-promise';
import {
  onSnapshot,
  DocumentSnapshot,
  DocumentReference,
  CollectionReference,
  addDoc,
  deleteDoc,
  updateDoc,
  setDoc,
} from 'firebase/firestore';
import {Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';

export function getDocumentSnapshot<Data>(
  documentReference: DocumentReference<Data>,
): Observable<DocumentSnapshot<Data>> {
  return new Observable<DocumentSnapshot<Data>>((subscriber) =>
    onSnapshot(documentReference, subscriber),
  ).pipe(shareReplay(1));
}

export function getDocument<Data>(
  documentReference: DocumentReference<Data>,
): Observable<Data | undefined> {
  return getDocumentSnapshot(documentReference).pipe(
    map((snapshot) => {
      return snapshot.data();
    }),
  );
}

// TODO: add createDocumentResource() and createDocumentSnapshotResource() methods
// but they'll probably only be used in simple use-cases - createObservableResource()
// will be used in more complex cases

export function useAddDocument<DocumentData>(
  collectionReference: CollectionReference<DocumentData> | undefined,
): UseInvokablePromiseResult<
  [data: DocumentData],
  DocumentReference<DocumentData>
> {
  return useInvokablePromise(
    collectionReference
      ? (data: DocumentData) => addDoc<DocumentData>(collectionReference, data)
      : undefined,
    [collectionReference],
  );
}

export function useUpdateDocument<DocumentData>(
  documentReference: DocumentReference<DocumentData> | undefined,
): UseInvokablePromiseResult<[data: DocumentData], void> {
  return useInvokablePromise(
    documentReference
      ? (data: DocumentData) => updateDoc(documentReference, data)
      : undefined,
    [documentReference],
  );
}

export function useSetDocument<DocumentData>(
  documentReference: DocumentReference<DocumentData> | undefined,
): UseInvokablePromiseResult<[data: DocumentData], void> {
  return useInvokablePromise(
    documentReference
      ? (data: DocumentData) => setDoc(documentReference, data)
      : undefined,
    [documentReference],
  );
}

export function useDeleteDocument<DocumentData>(
  documentReference: DocumentReference<DocumentData> | undefined,
): UseInvokablePromiseResult<[], void> {
  return useInvokablePromise(
    documentReference ? () => deleteDoc(documentReference) : undefined,
    [documentReference],
  );
}
