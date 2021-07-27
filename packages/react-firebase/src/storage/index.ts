import {
  uploadBytes,
  StorageReference,
  UploadResult,
  uploadString,
  UploadMetadata,
  getDownloadURL,
  getMetadata,
  updateMetadata,
  FullMetadata,
  SettableMetadata,
  deleteObject,
  list,
  ListResult,
  ListOptions,
  listAll,
} from 'firebase/storage';
import {
  createResource,
  Resource,
  useInvokablePromise,
  UseInvokablePromiseResult,
} from '@jameslnewell/react-promise';
import {useCallback} from 'react';

export function createListResource(
  storageReference: StorageReference,
  options?: ListOptions,
): Resource<ListResult> {
  return createResource(
    options ? list(storageReference, options) : listAll(storageReference),
  );
}

export function createURLResource(
  storageReference: StorageReference,
): Resource<string> {
  return createResource(getDownloadURL(storageReference));
}

export function createMetadataResource(
  storageReference: StorageReference,
): Resource<FullMetadata> {
  return createResource(getMetadata(storageReference));
}

// TODO: support progress
// @see https://firebase.google.com/docs/storage/web/upload-files
export function useUploadBytes(
  storageReference: StorageReference | undefined,
): UseInvokablePromiseResult<
  [data: Blob, meta: UploadMetadata | undefined],
  UploadResult
> {
  return useInvokablePromise(
    useCallback(
      (data: Blob, meta?: UploadMetadata) =>
        storageReference
          ? uploadBytes(storageReference, data, meta)
          : undefined,
      [storageReference],
    ),
  );
}

// TODO: support progress
export function useUploadString(
  storageReference: StorageReference | undefined,
): UseInvokablePromiseResult<
  [data: string, format: string, meta: UploadMetadata | undefined],
  UploadResult
> {
  return useInvokablePromise(
    useCallback(
      (data: string, format?: string, meta?: UploadMetadata) =>
        storageReference
          ? uploadString(storageReference, data, format, meta)
          : undefined,
      [storageReference],
    ),
  );
}

export function useUpdateMetadata(
  storageReference: StorageReference | undefined,
): UseInvokablePromiseResult<[SettableMetadata], FullMetadata> {
  return useInvokablePromise(
    useCallback(
      (metadata) =>
        storageReference
          ? updateMetadata(storageReference, metadata)
          : undefined,
      [storageReference],
    ),
  );
}

export function useDelete(
  storageReference: StorageReference | undefined,
): UseInvokablePromiseResult<[], void> {
  return useInvokablePromise(
    useCallback(
      () => (storageReference ? deleteObject(storageReference) : undefined),
      [storageReference],
    ),
  );
}
