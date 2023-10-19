import { useState } from 'react';

export const useBoolean = (initialValue: boolean = false) => {
  const [value, setValue] = useState(initialValue);

  const setTrue = () => setValue(true);
  const setFalse = () => setValue(false);
  const toggle = () => setValue((v) => !v);

  return [value, setTrue, setFalse, toggle];
};
