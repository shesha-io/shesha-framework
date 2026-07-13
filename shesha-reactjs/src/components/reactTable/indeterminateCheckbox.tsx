import { isDefined } from '@/utils/nullables';
import React, { FC, useEffect } from 'react';
import { TableToggleRowsSelectedProps } from 'react-table';

type CheckBoxProps = Partial<TableToggleRowsSelectedProps> & { ref?: React.RefObject<HTMLInputElement | null> };

export const IndeterminateCheckbox: FC<CheckBoxProps> = ({ indeterminate, ref, ...rest }) => {
  useEffect(() => {
    if (ref && ref.current && isDefined(indeterminate))
      ref.current.indeterminate = indeterminate;
  }, [ref, indeterminate]);

  return <input type="checkbox" ref={ref} {...rest} />;
};

IndeterminateCheckbox.displayName = "IndeterminateCheckbox";
