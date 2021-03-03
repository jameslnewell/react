import {create, delay} from '@jameslnewell/observable';
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
  const {value} = useObservable(['common'], createReceivedObservable);
  return (
    <>
      <RenderJSON value={value} />
    </>
  );
};

const ScreenTwo: React.FC = () => {
  const {value} = useObservable(['common'], createReceivedObservable);
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

export const TriggerOnKeyChange: React.FC = () => {
  const [count, setCount] = React.useState<number>(0);
  const {value} = useObservable<number>([count], () =>
    delay(1000)(create((o) => o.next(count))),
  );
  return (
    <>
      <RenderJSON value={value} />
      <button onClick={() => setCount((count) => count + 1)}>Increment</button>
    </>
  );
};
