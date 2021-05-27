import {delay, fromArray} from '@jameslnewell/observable';
import React, {useRef, useState} from 'react';
import {RenderJSON, withErrorBoundary, withSuspense} from 'testing-utilities';
import {Factory} from './types';
import {useObservable, UseObservableOptions} from './useObservable';
import {
  createEventuallyCompletedObservable,
  createEventuallyErroredObservable,
  createCompletedObservable,
  createWaitingObservable,
  createErroredObservable,
  createReceivedObservable,
  createReceivingObservable,
} from './__fixtures__';

export default {
  title: 'react-observable/useObservable',
};

interface UseObservableProps {
  keys: unknown[];
  factory: Factory<unknown[], unknown> | undefined;
  options?: UseObservableOptions;
}

const UseObservable: React.FC<UseObservableProps> = ({
  keys,
  factory,
  options,
}) => {
  const result = useObservable(keys, factory, options);
  return <RenderJSON value={result} />;
};

export const WithoutAFactory: React.FC = () => {
  return <UseObservable keys={['WithoutAFactory']} factory={undefined} />;
};

export const Waiting: React.FC = () => {
  return <UseObservable keys={['Waiting']} factory={createWaitingObservable} />;
};

export const Received: React.FC = () => {
  return (
    <UseObservable keys={['Received']} factory={createReceivedObservable} />
  );
};

export const Completed: React.FC = () => {
  return (
    <UseObservable keys={['Completed']} factory={createCompletedObservable} />
  );
};

export const Errored: React.FC = () => {
  return <UseObservable keys={['Errored']} factory={createErroredObservable} />;
};

export const EventuallyCompleted: React.FC = () => {
  return (
    <UseObservable
      keys={['EventuallyCompleted']}
      factory={createEventuallyCompletedObservable}
    />
  );
};

export const EventuallyErrored: React.FC = () => {
  return (
    <UseObservable
      keys={['EventuallyErrored']}
      factory={createEventuallyErroredObservable}
    />
  );
};

export const Suspended: React.FC = withSuspense()(() => {
  return (
    <UseObservable
      keys={['Suspended']}
      factory={createWaitingObservable}
      options={{suspendWhenWaiting: true}}
    />
  );
});

export const Thrown: React.FC = withErrorBoundary()(() => {
  return (
    <UseObservable
      keys={['Thrown']}
      factory={createErroredObservable}
      options={{throwWhenErrored: true}}
    />
  );
});

export const SuspendedEventuallyCompleted: React.FC = withSuspense()(() => {
  return (
    <UseObservable
      keys={['SuspendedEventuallyCompleted']}
      factory={createEventuallyCompletedObservable}
      options={{suspendWhenWaiting: true}}
    />
  );
});

export const ThrownEventuallyErrored: React.FC = withErrorBoundary()(() => {
  return (
    <UseObservable
      keys={['ThrownEventuallyErrored']}
      factory={createEventuallyErroredObservable}
      options={{throwWhenErrored: true}}
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
      <UseObservable
        keys={[key]}
        factory={createEventuallyCompletedObservable}
      />
    </>
  );
};

const ScreenOne: React.FC = () => {
  const {value} = useObservable(['common'], createReceivingObservable);
  return (
    <>
      <RenderJSON value={value} />
    </>
  );
};

const ScreenTwo: React.FC = () => {
  const {value} = useObservable(['common'], createReceivingObservable);
  return (
    <>
      <RenderJSON value={value} />
    </>
  );
};

export const UnmountAndMount: React.FC = () => {
  const [screen, setScreen] = React.useState<1 | 2>(1);
  return (
    <>
      When a hook with the same parameters is unmounted with one component and
      mounted with another component, the subscription should remain active.
      {screen === 1 ? <ScreenOne /> : <ScreenTwo />}
      <button disabled={screen === 1} onClick={() => setScreen(1)}>
        Screen One
      </button>
      <button disabled={screen === 2} onClick={() => setScreen(2)}>
        Screen Two
      </button>
    </>
  );
};

export const Dependent: React.FC = withErrorBoundary()(
  withSuspense()(() => {
    const {value: value0} = useObservable<number>(
      [0],
      () => delay(1000)(fromArray([Math.random()])),
      {suspendWhenWaiting: true, throwWhenErrored: true},
    );
    const {value: value1} = useObservable<number>(
      [value0],
      value0
        ? () => delay(1000)(fromArray([Math.round(value0 * 100)]))
        : undefined,
      {suspendWhenWaiting: true, throwWhenErrored: true},
    );
    return (
      <>
        The input to the second hook relies on the output of the first hook.
        <RenderJSON
          value={{
            value0,
            value1,
          }}
        />
      </>
    );
  }),
);
