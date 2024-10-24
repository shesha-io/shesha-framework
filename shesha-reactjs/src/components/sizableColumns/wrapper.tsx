import { useForm } from '@/providers';
import React, { FC, Fragment, useEffect, useState } from 'react';
import { SplitProps } from 'react-split';

// # Resolving react-split exception from size change.
// # Forcing component to mount when size changes in Designer mode.
// # If not in Designer mode, children should render normally.
// # Hide component for 100ms to force re-mount of component.
export const SizableWrapper: FC<SplitProps> = ({ children, sizes: size, ...props }) => {
  const [{ sizes, visible }, setState] = useState({ sizes: size, visible: true });
  const { formMode } = useForm();

  useEffect(() => {
    if (formMode === 'designer' && visible && size.length) {
      setState((prev) => ({ ...prev, sizes: size, visible: false }));
      setTimeout(() => setState((prev) => ({ ...prev, visible: true })), 100);
    }
  }, [formMode, size.length]);

  if (formMode !== 'designer') return <Fragment>{children}</Fragment>;

  if (!visible) return null;

  return React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) {
      return child;
    }

    return React.cloneElement(child, { ...props, sizes } as SplitProps);
  });
};

export default SizableWrapper;
