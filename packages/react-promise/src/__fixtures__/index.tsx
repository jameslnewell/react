import React from 'react';
import {
  FulfilledState,
  PendingState,
  RejectedState,
  Status,
  UnknownState,
} from '../Resource';

export const value = 'Hello World!';
export const error = 'Uh oh!';

export const unknownState: UnknownState = {
  status: undefined,
  value: undefined,
  error: undefined,
};

export const pendingState: PendingState = {
  status: Status.Pending,
  value: undefined,
  error: undefined,
};

export const fulfilledState: FulfilledState<typeof value> = {
  status: Status.Fulfilled,
  value,
  error: undefined,
};

export const rejectedState: RejectedState<typeof error> = {
  status: Status.Rejected,
  value: undefined,
  error,
};

export const noop = (): void => {
  /* do nothing */
};

export function createDelay(factory: Factory, ms: number): Factory {
  return () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => factory().then(resolve, reject), ms);
    });
  };
}

export async function createPendingPromise(): Promise<unknown> {
  return new Promise(() => {
    /* do nothing */
  });
}

export async function createFulfilledPromise(): Promise<unknown> {
  return new Promise((resolve) => resolve(value));
}

export async function createRejectedPromise(): Promise<unknown> {
  return new Promise((_unused_resolve, reject) => reject(error));
}

export async function createEventuallyFulfilledPromise(
  ms = 3000,
): Promise<unknown> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function createEventuallyRejectedPromise(
  ms = 3000,
): Promise<unknown> {
  return new Promise((_unused_resolve, reject) =>
    setTimeout(() => reject(error), ms),
  );
}

export interface ErrorBoundaryProps {}

export interface ErrorBoundaryState {
  error: unknown | undefined;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public state = {error: undefined};

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {error};
  }

  public componentDidCatch(): void {
    /* do nothing */
  }

  public render(): React.ReactElement {
    if (this.state.error) {
      return <>Thrown</>;
    }
    return <>{this.props.children}</>;
  }
}

export const Fallback: React.FC = () => {
  return <p>Loading...</p>;
};

export interface RenderJSONProps {
  value: unknown;
}

export const RenderJSON: React.FC<RenderJSONProps> = ({value}) => {
  return (
    <code>
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </code>
  );
};

export interface FactoryConfiguratorProps {
  initialType: PromiseType;
  initialDelay: number;
  onChange: ({type, delay}: {type: PromiseType; delay: number}) => void;
}

export const FactoryConfigurator: React.FC<FactoryConfiguratorProps> = ({
  initialType,
  initialDelay,
  onChange,
}) => {
  const [type, setType] = React.useState<PromiseType>(initialType);
  const [delay, setDelay] = React.useState(initialDelay);

  const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    switch (value) {
      case 'none':
      case 'resolve':
      case 'reject':
        setType(value);
        break;
      default:
        throw new Error('Invalid promise type');
    }
    onChange({type: value, delay});
  };

  const handleDelayChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    setDelay(value);
    onChange({type, delay: value});
  };

  return (
    <>
      <label className="control">
        <span className="control__label">Promise:</span>
        <label className="radio">
          <input
            type="radio"
            name="promise"
            value="none"
            autoFocus
            checked={type === 'none'}
            onChange={handleTypeChange}
          />{' '}
          None
        </label>
        <label className="radio">
          <input
            type="radio"
            name="promise"
            value="resolve"
            checked={type === 'resolve'}
            onChange={handleTypeChange}
          />{' '}
          Resolve
        </label>
        <label className="radio">
          <input
            type="radio"
            name="promise"
            value="reject"
            checked={type === 'reject'}
            onChange={handleTypeChange}
          />{' '}
          Reject
        </label>
      </label>
      <label className="control">
        <span className="control__label">Delay:</span>
        <input value={String(initialDelay)} onChange={handleDelayChange} />
      </label>
    </>
  );
};
