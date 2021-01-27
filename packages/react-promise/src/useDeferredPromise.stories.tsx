import React from 'react';
import {
  useDeferredPromise,
  UseDeferredPromiseDependencies,
  UseDeferredPromiseFactoryFunction,
} from './useDeferredPromise';
import {
  createEventuallyFulfilledPromise,
  createEventuallyRejectedPromise,
  createFulfilledPromise,
  createPendingPromise,
  createRejectedPromise,
  RenderJSON,
} from './__fixtures__';

export default {
  title: 'react-promise/useDeferredPromise',
};
interface UsePromiseProps {
  fn?: UseDeferredPromiseFactoryFunction;
  deps?: UseDeferredPromiseDependencies;
}

const UseDeferredPromise: React.FC<UsePromiseProps> = ({fn, deps, opts}) => {
  const result = useDeferredPromise(fn, deps);
  console.log('Story', result.status);
  return <RenderJSON value={result} />;
};

export const NoFactory: React.FC = () => {
  return <UseDeferredPromise fn={undefined} />;
};

export const Pending: React.FC = () => {
  return <UseDeferredPromise fn={createPendingPromise} />;
};

export const Fulfilled: React.FC = () => {
  return <UseDeferredPromise fn={createFulfilledPromise} />;
};

export const Rejected: React.FC = () => {
  return <UseDeferredPromise fn={createRejectedPromise} />;
};

export const EventuallyFulfilled: React.FC = () => {
  return <UseDeferredPromise fn={createEventuallyFulfilledPromise} />;
};

export const EventuallyRejected: React.FC = () => {
  return <UseDeferredPromise fn={createEventuallyRejectedPromise} />;
};
