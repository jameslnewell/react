import * as React from 'react';
import {Status} from '../src';

export interface ObservableStateProps {
  status: Status | undefined;
  error: any | undefined;
  value: any | undefined;
}

export const ObservableState: React.FunctionComponent<ObservableStateProps> = ({
  status,
  error,
  value: data,
}) => {
  switch (status) {
    case Status.Waiting:
      return <>{status} ⏳</>;

    case Status.Receieved:
      return (
        <>
          {status} ⏺ <pre>{JSON.stringify(data)}</pre>
        </>
      );

    case Status.Completed:
      return (
        <>
          {status} ✅ <pre>{JSON.stringify(data)}</pre>
        </>
      );

    case Status.Errored:
      return (
        <>
          {status} ❌ <pre>{String(error)}</pre>
        </>
      );

    default:
      return <>unknown 🤷‍♂️</>;
  }
};
