import classNames from 'classnames';
import React, { FC, useRef } from 'react';
import BoxInput from './input';
import { useStyles } from '../styles/styles';
import { StyleBoxValue } from '../../../providers/form/models';
import { getStyleBoxValue } from '../utils';

interface IProps {
  className?: string;
  onChange?: (value: StyleBoxValue) => void;
  readOnly?: boolean;
  value?: StyleBoxValue;
  propertyName?: string;
}

const Box: FC<IProps> = ({ className, onChange, readOnly, value, propertyName }) => {
  const { styles } = useStyles();

  // need to store the value locally because internal components may not be rendered and will use the old value
  const localValue = useRef(value);
  localValue.current = value;

  const onChangeInternal = (val: Partial<StyleBoxValue>): void => {
    // ensure the value is a valid style box
    onChange?.(getStyleBoxValue({ ...localValue.current, ...val }));
  };

  const commonProps = { onChange: onChangeInternal, readOnly, value, propertyName };

  return (
    <div className={classNames(styles.shaStyleBox, className)}>
      <div className={styles.margin}>
        <span className={styles.title}>Margin</span>

        <BoxInput {...commonProps} type="margin" direction="top" />
        <BoxInput {...commonProps} type="margin" direction="left" />
        <BoxInput {...commonProps} type="margin" direction="bottom" />
        <BoxInput {...commonProps} type="margin" direction="right" />

        <div className={styles.padding}>
          <span className={styles.title}>Padding</span>

          <BoxInput {...commonProps} type="padding" direction="top" />
          <BoxInput {...commonProps} type="padding" direction="left" />
          <BoxInput {...commonProps} type="padding" direction="bottom" />
          <BoxInput {...commonProps} type="padding" direction="right" />

          <div className="center" />
        </div>
      </div>
    </div>
  );
};

export default Box;
