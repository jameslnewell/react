import React from 'react';
export const value = 'Hello World!';
export const error = 'Uh oh!';

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

export async function createEventuallyFulfilledPromise(
  ms = 3000,
): Promise<unknown> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function createEventuallyRejectedPromise(
  ms = 3000,
): Promise<unknown> {
  return new Promise((_unused_resolve, reject) =>
    setTimeout(() => reject(error), ms),
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

export const Fallback: React.FC = () => {
  return <p>Loading...</p>;
};
