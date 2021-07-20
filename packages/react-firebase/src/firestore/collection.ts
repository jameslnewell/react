import {
  onSnapshot,
  DocumentData,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';
import {Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';

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

// TODO: add createCollectionResource() and createCollectionSnapshotResource() methods
// but they'll probably only be used in simple use-cases - createObservableResource()
// will be used in more complex cases
