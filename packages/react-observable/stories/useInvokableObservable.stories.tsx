import * as React from 'react';
import {useInvokableObservable} from '../src';
import {ObservableType, createObservable} from './createObservable';
import {ObservableState} from './ObservableState';
import {ObservableConfig} from './ObservableConfig';
import './styles.css';

export default {
  title: 'useInvokableObservable',
};

export const Demo = () => {
  const [type, setType] = React.useState<ObservableType>(
    ObservableType.Completed,
  );
  const [delay, setDelay] = React.useState(1000);
  const {invoke, status, error, value} = useInvokableObservable(
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
