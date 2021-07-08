import {
  onSnapshot,
  DocumentSnapshot,
  DocumentReference,
} from 'firebase/firestore';
import {Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';

export function getDocumentSnapshot<Data>(
  reference: DocumentReference<Data>,
): Observable<DocumentSnapshot<Data>> {
  return new Observable<DocumentSnapshot<Data>>((subscriber) =>
    onSnapshot(reference, subscriber),
  ).pipe(shareReplay(1));
}

export function getDocument<Data>(
  reference: DocumentReference<Data>,
): Observable<Data | undefined> {
  return getDocumentSnapshot(reference).pipe(
    map((snapshot) => {
      return snapshot.data();
    }),
  );
}
