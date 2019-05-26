import * as React from 'react';
import {Status} from '../src';

export interface PromiseStateProps {
  status: Status | undefined;
  error: any | undefined;
  value: any | undefined;
}

export const PromiseState: React.FunctionComponent<PromiseStateProps> = ({
  status,
  error,
  value: data,
}) => {
  switch (status) {
    case Status.Pending:
      return <>{status} 🔄</>;

    case Status.Fulfilled:
      return (
        <>
          {status} ✅ <pre>{JSON.stringify(data)}</pre>
        </>
      );

    case Status.Rejected:
      return (
        <>
          {status} ❌ <pre>{String(error)}</pre>
        </>
      );

    default:
      return <>unknown ?</>;
  }
};
