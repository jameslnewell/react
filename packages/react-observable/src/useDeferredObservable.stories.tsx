import * as React from 'react';
import {useDeferredObservable} from '.';
import {ObservableType, createObservable} from '../stories/createObservable';
import {ObservableState} from '../stories/ObservableState';
import {ObservableConfig} from '../stories/ObservableConfig';
import './styles.css';

export default {
  title: 'useDeferredObservable',
};

export const Demo = () => {
  const [type, setType] = React.useState<ObservableType>(
    ObservableType.Completed,
  );
  const [delay, setDelay] = React.useState(1000);
  const {invoke, status, error, value} = useDeferredObservable(
    createObservable(type, delay),
    [type, delay],
  );

  const handleChange = ({
    type,
    delay,
  }: {
    type: ObservableType;
    delay: number;
  }): void => {
    setType(type);
    setDelay(delay);
  };

  return (
    <>
      <button onClick={() => invoke()}>Invoke</button>
      <ObservableState status={status} error={error} value={value} />
      <ObservableConfig
        initialType={type}
        initialDelay={delay}
        onChange={handleChange}
      />
    </>
  );
};
