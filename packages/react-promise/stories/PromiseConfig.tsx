import * as React from 'react';
import {PromiseType} from './createPromise';

export interface PromiseConfigProps {
  initialType: PromiseType;
  initialDelay: number;
  onChange: ({type, delay}: {type: PromiseType; delay: number}) => void;
}

export const PromiseConfig: React.FC<PromiseConfigProps> = ({
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
