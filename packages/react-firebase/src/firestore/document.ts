import {createResource, Resource} from '@jameslnewell/react-observable';
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
import {useCallback} from 'react';
import {Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';

export function getDocumentSnapshot<Data>(
  documentReference: DocumentReference<Data>,
): Observable<DocumentSnapshot<Data>> {
  return new Observable<DocumentSnapshot<Data>>((subscriber) =>
    onSnapshot(documentReference, subscriber),
  ).pipe(shareReplay(1));
}

export interface GetDocumentOptions {
  throwIfDoesNotExist?: boolean;
}

export function getDocument<Data>(
  documentReference: DocumentReference<Data>,
  options?: GetDocumentOptions & {throwIfDoesNotExist?: true},
): Observable<Data>;
export function getDocument<Data>(
  documentReference: DocumentReference<Data>,
  options: GetDocumentOptions & {throwIfDoesNotExist: false},
): Observable<Data | undefined>;
export function getDocument<Data>(
  documentReference: DocumentReference<Data>,
  options: GetDocumentOptions = {throwIfDoesNotExist: true},
): Observable<Data | undefined> {
  return getDocumentSnapshot(documentReference).pipe(
    map((snapshot) => {
      if (!snapshot.exists && options?.throwIfDoesNotExist) {
        throw new Error('DoesNotExist');
      }
      return snapshot.data();
    }),
  );
}

export function createDocumentSnapshotResource<Data>(
  documentReference: DocumentReference<Data>,
): Resource<DocumentSnapshot<Data>> {
  return createResource(getDocumentSnapshot(documentReference));
}

export interface CreateDocumentResourceOptions extends GetDocumentOptions {}

export function createDocumentResource<Data>(
  documentReference: DocumentReference<Data>,
  options?: CreateDocumentResourceOptions & {throwIfDoesNotExist?: true},
): Resource<Data>;
export function createDocumentResource<Data>(
  documentReference: DocumentReference<Data>,
  options: CreateDocumentResourceOptions & {throwIfDoesNotExist: false},
): Resource<Data | undefined>;
export function createDocumentResource<Data>(
  documentReference: DocumentReference<Data>,
  options?: CreateDocumentResourceOptions,
): Resource<Data | undefined> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createResource(getDocument(documentReference, options as any));
}

export function useAddDocument<DocumentData>(
  collectionReference: CollectionReference<DocumentData> | undefined,
): UseInvokablePromiseResult<
  [data: DocumentData],
  DocumentReference<DocumentData>
> {
  return useInvokablePromise(
    useCallback(
      (data: DocumentData) =>
        collectionReference
          ? addDoc<DocumentData>(collectionReference, data)
          : undefined,
      [collectionReference],
    ),
  );
}

export function useUpdateDocument<DocumentData>(
  documentReference: DocumentReference<DocumentData> | undefined,
): UseInvokablePromiseResult<[data: DocumentData], void> {
  return useInvokablePromise(
    useCallback(
      (data: DocumentData) =>
        documentReference ? updateDoc(documentReference, data) : undefined,
      [documentReference],
    ),
  );
}

export function useSetDocument<DocumentData>(
  documentReference: DocumentReference<DocumentData> | undefined,
): UseInvokablePromiseResult<[data: DocumentData], void> {
  return useInvokablePromise(
    useCallback(
      (data: DocumentData) =>
        documentReference ? setDoc(documentReference, data) : undefined,
      [documentReference],
    ),
  );
}

export function useDeleteDocument<DocumentData>(
  documentReference: DocumentReference<DocumentData> | undefined,
): UseInvokablePromiseResult<[], void> {
  return useInvokablePromise(
    useCallback(
      () => (documentReference ? deleteDoc(documentReference) : undefined),
      [documentReference],
    ),
  );
}
