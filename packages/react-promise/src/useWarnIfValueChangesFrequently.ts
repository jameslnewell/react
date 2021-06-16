import {useEffect, useRef} from 'react';

export function useWarnIfValueChangesFrequently(
  value: unknown,
  message: string,
): void {
  const previousValue = useRef(value);
  const timesValueWasRendered = useRef(0);
  const timesValueWasChanged = useRef(0);
  useEffect(() => {
    ++timesValueWasRendered.current;
    if (previousValue.current !== value) {
      ++timesValueWasChanged.current;
      if (
        timesValueWasChanged.current === timesValueWasRendered.current - 1 &&
        timesValueWasChanged.current > 2
      ) {
        timesValueWasRendered.current = 1;
        timesValueWasChanged.current = 0;
        console.warn(message);
      }
    }
  }, [value, message]);
}
