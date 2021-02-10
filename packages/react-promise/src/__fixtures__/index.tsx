import React from 'react';
import {
  UnknownState,
  PendingState,
  FulfilledState,
  RejectedState,
  Status,
  Factory,
} from '../types';

export const value = 'Hello World!';
export const error = 'Uh oh!';

export const unknownState: UnknownState = {
  status: undefined,
  value: undefined,
  error: undefined,
};

export const pendingState: PendingState = {
  status: Status.Pending,
  value: undefined,
  error: undefined,
};

export const fulfilledState: FulfilledState<typeof value> = {
  status: Status.Fulfilled,
  value,
  error: undefined,
};

export const rejectedState: RejectedState = {
  status: Status.Rejected,
  value: undefined,
  error,
};

export const noop = (): void => {
  /* do nothing */
};

export function createDelay(
  factory: Factory<unknown[], unknown>,
  ms: number,
): Factory<unknown[], unknown> {
  return () =>
    new Promise((resolve, reject) => {
      setTimeout(() => factory().then(resolve, reject), ms);
    });
}

export async function createPendingPromise(): Promise<unknown> {
  return new Promise(() => {
    /* do nothing */
  });
}

export async function createFulfilledPromise(): Promise<unknown> {
  return new Promise((resolve) => resolve(value));
}

export async function createRejectedPromise(): Promise<unknown> {
  return new Promise((_unused_resolve, reject) => reject(error));
}

export async function createEventuallyFulfilledPromise(): Promise<unknown> {
  return new Promise((resolve) => setTimeout(() => resolve(value), 3000));
}

export async function createEventuallyRejectedPromise(): Promise<unknown> {
  return new Promise((_unused_resolve, reject) =>
    setTimeout(() => reject(error), 3000),
  );
}

export interface ErrorBoundaryProps {}

export interface ErrorBoundaryState {
  error: unknown | undefined;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public state = {error: undefined};

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {error};
  }

  public componentDidCatch(): void {
    /* do nothing */
  }

  public render(): React.ReactElement {
    if (this.state.error) {
      return <>Thrown</>;
    }
    return <>{this.props.children}</>;
  }
}

export const Fallback: React.FC = () => {
  return <p>Loading...</p>;
};

export interface RenderJSONProps {
  value: unknown;
}

export const RenderJSON: React.FC<RenderJSONProps> = ({value}) => {
  return (
    <code>
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </code>
  );
};
