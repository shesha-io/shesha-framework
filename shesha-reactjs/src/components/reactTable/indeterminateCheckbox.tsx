import React, { forwardRef, useEffect, useRef } from 'react';

export const IndeterminateCheckbox = forwardRef(({ indeterminate, ...rest }: any, ref) => {
  const defaultRef = useRef();
  const resolvedRef = ref || defaultRef;

  useEffect(() => {
    // @ts-ignore
    resolvedRef.current.indeterminate = indeterminate;
  }, [resolvedRef, indeterminate]);

  return <input type="checkbox" ref={resolvedRef} {...rest} />;
});
