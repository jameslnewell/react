import {useRef, useEffect, RefObject} from 'react';

export function useMounted(): RefObject<boolean> {
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  return isMounted;
}
