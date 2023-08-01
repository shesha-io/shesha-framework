import React, { FC, Fragment, PropsWithChildren } from 'react';
import { ProperyDataType } from 'interfaces/metadata';
import { useMetaProperties } from 'providers';
import { getPropertyMetadata } from 'utils/date';
import { getNumberFormat } from 'utils/string';

interface IFormItemWrapper {
  readonly mutate: boolean;
  readonly formType: ProperyDataType;
  readonly overrideValue?: any;
}

const FormItemWrapper: FC<PropsWithChildren<IFormItemWrapper>> = ({ children, mutate, formType, ...props }) => {
  const properties = useMetaProperties([formType]);

  const { value, id } = props as any;

  const getValue = () => {
    switch (formType) {
      case 'number':
        return getNumberFormat(value, getPropertyMetadata(properties, id));

      case 'reference-list-item':
        return props?.overrideValue ?? value;

      default:
        return value;
    }
  };

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      const payload = mutate ? { ...props, value: getValue() } : { ...props };
      return React.cloneElement(child, payload);
    }

    return child;
  });

  return <Fragment>{childrenWithProps}</Fragment>;
};

export default FormItemWrapper;
