import React from 'react';
import {
  usePromise,
  UsePromiseDependencies,
  UsePromiseFactory,
  UsePromiseOptions,
} from './usePromise';
import {
  createEventuallyFulfilledPromise,
  createEventuallyRejectedPromise,
  createFulfilledPromise,
  createPendingPromise,
  createRejectedPromise,
  RenderJSON,
} from './__fixtures__';

export default {
  title: 'react-promise/usePromise',
};
interface UsePromiseProps {
  fn?: UsePromiseFactory;
  deps?: UsePromiseDependencies;
  opts?: UsePromiseOptions;
}

const UsePromise: React.FC<UsePromiseProps> = ({fn, deps, opts}) => {
  const result = usePromise(fn, deps, opts);
  console.log('Story', result.status);
  return <RenderJSON value={result} />;
};

export const NoFactory: React.FC = () => {
  return <UsePromise fn={undefined} />;
};

export const Pending: React.FC = () => {
  return <UsePromise fn={createPendingPromise} />;
};

export const Fulfilled: React.FC = () => {
  return <UsePromise fn={createFulfilledPromise} />;
};

export const Rejected: React.FC = () => {
  return <UsePromise fn={createRejectedPromise} />;
};

export const EventuallyFulfilled: React.FC = () => {
  return <UsePromise fn={createEventuallyFulfilledPromise} />;
};

export const EventuallyRejected: React.FC = () => {
  return <UsePromise fn={createEventuallyRejectedPromise} />;
};
