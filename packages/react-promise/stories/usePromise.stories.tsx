import * as React from 'react';
import {storiesOf} from '@storybook/react';
import {usePromise} from '../src';
import {PromiseType, createPromise} from './createPromise';
import {PromiseState} from './PromiseState';
import {PromiseConfig} from './PromiseConfig';
import './styles.css';

const Example: React.FunctionComponent = () => {
  const [type, setType] = React.useState<PromiseType>('resolve');
  const [delay, setDelay] = React.useState(1000);
  const [value, {status, error}] = usePromise(createPromise(type, delay), [
    type,
    delay,
  ]);

  const handleChange = ({type, delay}: {type: PromiseType; delay: number}) => {
    setType(type);
    setDelay(delay);
  };

  return (
    <>
      <PromiseState status={status} error={error} value={value} />
      <PromiseConfig
        initialType={type}
        initialDelay={delay}
        onChange={handleChange}
      />
    </>
  );
};

storiesOf('@jameslnewell/react-promise', module).add('usePromise()', () => (
  <Example />
));
