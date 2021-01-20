import * as React from 'react';
import {storiesOf} from '@storybook/react';
import usePromise, {Status} from '../src/usePromise';
import './usePromise.style.css';

type PromiseType = 'none' | 'resolve' | 'reject';

function createPromise(
  type: PromiseType,
  delay: number,
): Promise<{type: PromiseType; delay: number}> | undefined {
  if (type === 'none') {
    return undefined;
  }
  return new Promise(
    (resolve, reject): void => {
      setTimeout((): void => {
        if (type === 'resolve') {
          resolve({type, delay});
        } else if (type === 'reject') {
          reject(new Error('Rejected!'));
        }
      }, delay);
    },
  );
}

interface PromiseStateProps {
  status: Status | undefined;
  error: Error | undefined;
  data: any | undefined;
}

const PromiseState: React.FunctionComponent<PromiseStateProps> = ({
  status,
  error,
  data,
}) => {
  switch (status) {
    case Status.Resolving:
      return <>{Status.Resolving} 🔄</>;

    case Status.Resolved:
      return (
        <>
          {Status.Resolved} ✅ <pre>{JSON.stringify(data)}</pre>
        </>
      );

    case Status.Rejected:
      return (
        <>
          {Status.Rejected} ❌ <pre>{String(error)}</pre>
        </>
      );

    default:
      return <>unknown ?</>;
  }
};

const Example: React.FunctionComponent = () => {
  const delayInput = React.useRef<HTMLInputElement>(null);
  const promiseNoneInput = React.useRef<HTMLInputElement>(null);
  const promiseResolveInput = React.useRef<HTMLInputElement>(null);
  const promiseRejectInput = React.useRef<HTMLInputElement>(null);
  const [type, setType] = React.useState<PromiseType>('none');
  const [delay, setDelay] = React.useState(1000);
  const [status, error, data] = usePromise(() => createPromise(type, delay), [
    type,
    delay,
  ]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (delayInput.current) {
      setDelay(parseInt(delayInput.current.value, 10));
    }
    if (promiseNoneInput.current && promiseNoneInput.current.checked) {
      setType('none');
    }
    if (promiseResolveInput.current && promiseResolveInput.current.checked) {
      setType('resolve');
    }
    if (promiseRejectInput.current && promiseRejectInput.current.checked) {
      setType('reject');
    }
  };

  return (
    <>
      <PromiseState status={status} error={error} data={data} />
      <form className="form" onSubmit={handleSubmit}>
        <label className="control">
          <span className="control__label">Promise:</span>
          <label className="radio">
            <input
              type="radio"
              name="promise"
              value="none"
              autoFocus
              ref={promiseNoneInput}
              defaultChecked={type === 'none'}
            />{' '}
            None
          </label>
          <label className="radio">
            <input
              type="radio"
              name="promise"
              value="resolve"
              ref={promiseResolveInput}
              defaultChecked={type === 'resolve'}
            />{' '}
            Resolve
          </label>
          <label className="radio">
            <input
              type="radio"
              name="promise"
              value="reject"
              ref={promiseRejectInput}
              defaultChecked={type === 'reject'}
            />{' '}
            Reject
          </label>
        </label>
        <label className="control">
          <span className="control__label">Delay:</span>
          <input ref={delayInput} defaultValue={String(delay)} />
        </label>
        <button className="form__submit">Save</button>
      </form>
    </>
  );
};

storiesOf('@jameslnewell/react-promise', module).add('usePromise()', () => (
  <Example />
));
