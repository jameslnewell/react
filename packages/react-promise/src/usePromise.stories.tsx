import React, {useRef, useState} from 'react';
import {RenderJSON, withErrorBoundary, withSuspense} from 'testing-utilities';
import {Factory} from './types';
import {usePromise, UsePromiseOptions} from './usePromise';
import {
  createEventuallyFulfilledPromise,
  createEventuallyRejectedPromise,
  createFulfilledPromise,
  createPendingPromise,
  createRejectedPromise,
} from './__fixtures__';

export default {
  title: 'react-promise/usePromise',
};

interface UsePromiseProps {
  keys: unknown[];
  factory: Factory<unknown[], unknown>;
  options?: UsePromiseOptions;
}

const UsePromise: React.FC<UsePromiseProps> = ({keys, factory, options}) => {
  const result = usePromise(keys, factory, options);
  return <RenderJSON value={result} />;
};

export const Pending: React.FC = () => {
  return <UsePromise keys={['Pending']} factory={createPendingPromise} />;
};

export const Fulfilled: React.FC = () => {
  return <UsePromise keys={['Fulfilled']} factory={createFulfilledPromise} />;
};

export const Rejected: React.FC = () => {
  return <UsePromise keys={['Rejected']} factory={createRejectedPromise} />;
};

export const EventuallyFulfilled: React.FC = () => {
  return (
    <UsePromise
      keys={['EventuallyFulfilled']}
      factory={createEventuallyFulfilledPromise}
    />
  );
};

export const EventuallyRejected: React.FC = () => {
  return (
    <UsePromise
      keys={['EventuallyRejected']}
      factory={createEventuallyRejectedPromise}
    />
  );
};

export const Suspended: React.FC = withSuspense()(() => {
  return (
    <UsePromise
      keys={['Suspended']}
      factory={createPendingPromise}
      options={{suspendWhenPending: true}}
    />
  );
});

export const Thrown: React.FC = withErrorBoundary()(() => {
  return (
    <UsePromise
      keys={['Thrown']}
      factory={createRejectedPromise}
      options={{throwWhenRejected: true}}
    />
  );
});

export const SuspendedEventuallyFulfilled: React.FC = withSuspense()(() => {
  return (
    <UsePromise
      keys={['SuspendedEventuallyFulfilled']}
      factory={createEventuallyFulfilledPromise}
      options={{suspendWhenPending: true}}
    />
  );
});

export const ThrownEventuallyRejected: React.FC = withErrorBoundary()(() => {
  return (
    <UsePromise
      keys={['ThrownEventuallyRejected']}
      factory={createEventuallyRejectedPromise}
      options={{throwWhenRejected: true}}
    />
  );
});

export const KeyChange: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [key, setKey] = useState('foobar');
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (inputRef.current) {
      setKey(inputRef.current.value);
    }
  };
  return (
    <>
      <form onSubmit={handleSubmit}>
        <label>
          Key
          <input ref={inputRef} defaultValue="foobar" />
        </label>
        <button>Change</button>
      </form>
      <UsePromise keys={[key]} factory={createEventuallyFulfilledPromise} />
    </>
  );
};

const common = 'key';

const ScreenOne: React.FC = () => {
  const {value} = usePromise([common], createFulfilledPromise);
  return (
    <>
      <RenderJSON value={value} />
    </>
  );
};

const ScreenTwo: React.FC = () => {
  const {value} = usePromise([common], createFulfilledPromise);
  return (
    <>
      <RenderJSON value={value} />
    </>
  );
};

export const SwitchingScreensUsingTheSameKey: React.FC = () => {
  const [screen, setScreen] = React.useState<1 | 2>(1);
  return (
    <>
      {screen === 1 ? <ScreenOne /> : <ScreenTwo />}
      <button onClick={() => setScreen(1)}>Screen One</button>
      <button onClick={() => setScreen(2)}>Screen Two</button>
    </>
  );
};
