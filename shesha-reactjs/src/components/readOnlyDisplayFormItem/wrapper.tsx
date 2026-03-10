import React, { FC, Fragment, PropsWithChildren } from 'react';
import ReadOnlyDisplayFormItem from '.';
import { IReadOnlyDisplayFormItemProps } from './models';

interface IProps extends IReadOnlyDisplayFormItemProps {
  readOnly: boolean;
}

const ReadOnlyDisplayFormItemWrapper: FC<PropsWithChildren<IProps>> = ({ children, readOnly, ...props }) => {
  if (readOnly) {
    return <ReadOnlyDisplayFormItem {...props} />;
  }

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child);
    }

    return child;
  });

  return <Fragment>{childrenWithProps}</Fragment>;
};

export default ReadOnlyDisplayFormItemWrapper;
