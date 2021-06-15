export enum Status {
  Loading = 'loading',
  Loaded = 'loaded',
  Errored = 'errored',
}

export type EmptyState = {
  status: undefined;
  value: undefined;
  error: undefined;
};

export type LoadingState = {
  status: Status.Loading;
  value: undefined;
  error: undefined;
};

export type LoadedState<Value> = {
  status: Status.Loaded;
  value: Value;
  error: undefined;
};

export type ErroredState = {
  status: Status.Errored;
  value: undefined;
  error: unknown;
};
