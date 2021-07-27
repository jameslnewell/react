import {
  onSnapshot,
  DocumentData,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';
import {Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';
import {Resource, createResource} from '@jameslnewell/react-observable';

export function getCollectionSnapshot(
  reference: CollectionReference,
): Observable<QuerySnapshot<DocumentData>> {
  return new Observable<QuerySnapshot<DocumentData>>((subscriber) =>
    onSnapshot(reference, subscriber),
  ).pipe(shareReplay(1));
}

export function getCollection(
  reference: CollectionReference,
): Observable<[string, DocumentData][]> {
  return getCollectionSnapshot(reference).pipe(
    map((snapshot) => snapshot.docs.map((doc) => [doc.id, doc.data()])),
  );
}

export function createCollectionSnapshotResource<Data>(
  collectionReference: CollectionReference<Data>,
): Resource<QuerySnapshot<DocumentData>> {
  return createResource(getCollectionSnapshot(collectionReference));
}

export function createCollectionResource<Data>(
  collectionReference: CollectionReference<Data>,
): Resource<[string, DocumentData][]> {
  return createResource(getCollection(collectionReference));
}
