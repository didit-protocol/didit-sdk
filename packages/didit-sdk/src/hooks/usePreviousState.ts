import { useEffect, useRef } from 'react';

const usePreviousState = (value: unknown) => {
  const ref = useRef<unknown>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

export default usePreviousState;
