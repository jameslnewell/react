import React from 'react';
import {ErrorBoundary} from 'react-error-boundary';

export const SuspenseFallback: React.FC = () => {
  return <p>Loading...</p>;
};

export function withSuspense(fallback?: React.ReactNode) {
  return function <Props>(
    Component: React.ComponentType<Props>,
  ): React.FC<Props> {
    return function WithSuspense(props) {
      return (
        <React.Suspense fallback={fallback || <SuspenseFallback />}>
          <Component {...props} />
        </React.Suspense>
      );
    };
  };
}

export const ErrorBoundaryFallback: React.FC = () => {
  return <p>Error!</p>;
};

export function withErrorBoundary(fallback?: React.ReactNode) {
  return function <Props>(
    Component: React.ComponentType<Props>,
  ): React.FC<Props> {
    return function WithErrorBoundary(props) {
      return (
        <ErrorBoundary
          fallback={fallback ? <>{fallback}</> : <ErrorBoundaryFallback />}
        >
          <Component {...props} />
        </ErrorBoundary>
      );
    };
  };
}

export interface RenderJSONProps {
  value: unknown;
}

export const RenderJSON: React.FC<RenderJSONProps> = ({value}) => {
  return (
    <code aria-label="json">
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </code>
  );
};
