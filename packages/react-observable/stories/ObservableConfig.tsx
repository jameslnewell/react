import * as React from 'react';
import {ObservableType} from './createObservable';

export interface ObservableConfigProps {
  initialType: ObservableType;
  initialDelay: number;
  onChange: ({type, delay}: {type: ObservableType; delay: number}) => void;
}

export const ObservableConfig: React.FC<ObservableConfigProps> = ({
  initialType,
  initialDelay,
  onChange,
}) => {
  const [type, setType] = React.useState<ObservableType>(initialType);
  const [delay, setDelay] = React.useState(initialDelay);

  const handleTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const value = event.target.value;
    switch (value) {
      case ObservableType.None:
      case ObservableType.Waiting:
      case ObservableType.Recieved:
      case ObservableType.Completed:
      case ObservableType.Errored:
        setType(value);
        break;
      default:
        throw new Error('Invalid observable type');
    }
    onChange({type: value, delay});
  };

  const handleDelayChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const value = parseInt(event.target.value, 10);
    setDelay(value);
    onChange({type, delay: value});
  };

  return (
    <>
      <label className="control">
        <span className="control__label">Observable:</span>
        <label className="radio">
          <input
            type="radio"
            name="observable"
            value={ObservableType.None}
            autoFocus
            checked={type === ObservableType.None}
            onChange={handleTypeChange}
          />{' '}
          None
          <label className="radio">
            <input
              type="radio"
              name="observable"
              value={ObservableType.Waiting}
              checked={type === ObservableType.Waiting}
              onChange={handleTypeChange}
            />{' '}
            Waiting
          </label>
          <label className="radio">
            <input
              type="radio"
              name="observable"
              value={ObservableType.Recieved}
              checked={type === ObservableType.Recieved}
              onChange={handleTypeChange}
            />{' '}
            Recieved
          </label>
        </label>
        <label className="radio">
          <input
            type="radio"
            name="observable"
            value={ObservableType.Completed}
            checked={type === ObservableType.Completed}
            onChange={handleTypeChange}
          />{' '}
          Completed
        </label>
        <label className="radio">
          <input
            type="radio"
            name="observable"
            value={ObservableType.Errored}
            checked={type === ObservableType.Errored}
            onChange={handleTypeChange}
          />{' '}
          Errored
        </label>
      </label>
      <label className="control">
        <span className="control__label">Delay:</span>
        <input value={String(initialDelay)} onChange={handleDelayChange} />
      </label>
    </>
  );
};
