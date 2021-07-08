import {
  collection,
  onSnapshot,
  FirebaseFirestore,
  DocumentData,
  getFirestore,
  QuerySnapshot,
} from 'firebase/firestore';
import {Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';

type GetCollectionSnapshotOptions = {
  path: string;
  firestore?: FirebaseFirestore;
};

export function getCollectionSnapshot({
  firestore = getFirestore(),
  path,
}: GetCollectionSnapshotOptions): Observable<QuerySnapshot<DocumentData>> {
  return new Observable<QuerySnapshot<DocumentData>>((subscriber) =>
    onSnapshot(collection(firestore, path), subscriber),
  ).pipe(shareReplay(1));
}

type GetCollectionOptions = GetCollectionSnapshotOptions;

export function getCollection(
  options: GetCollectionOptions,
): Observable<[string, DocumentData][]> {
  return getCollectionSnapshot(options).pipe(
    map((snapshot) => snapshot.docs.map((doc) => [doc.id, doc.data()])),
  );
}
