import React, { FC } from 'react';
import Split, { SplitProps } from 'react-split';
import { useStyles } from './styles';
import classNames from 'classnames';
import SizableWrapper from './wrapper';

const SizableSplit: FC<SplitProps> = ({ children, ...props }) => {
  const { styles } = useStyles();

  return (
    <SizableWrapper {...props}>
      <Split {...props} className={classNames(props.className, styles.split)}>
        {children}
      </Split>
    </SizableWrapper>
  );
};

export const SizableColumns = React.memo(SizableSplit);
