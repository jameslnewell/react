import React from 'react';
import {ErrorBoundary} from 'react-error-boundary';

export const SuspenseFallback: React.FC = () => {
  return <p>Loading...</p>;
};

export const withSuspense = (fallback?: React.ReactNode) => (
  Component: React.ComponentType,
): React.FC => {
  return function WithSuspense() {
    return (
      <React.Suspense fallback={fallback || <SuspenseFallback />}>
        <Component />
      </React.Suspense>
    );
  };
};

export const ErrorBoundaryFallback: React.FC = () => {
  return <p>Error!</p>;
};

export const withErrorBoundary = (fallback?: React.ReactNode) => (
  Component: React.ComponentType,
): React.FC => {
  return function WithErrorBoundary() {
    return (
      <ErrorBoundary
        fallback={fallback ? <>{fallback}</> : <ErrorBoundaryFallback />}
      >
        <Component />
      </ErrorBoundary>
    );
  };
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
