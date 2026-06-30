import classNames from 'classnames';
import React, { FC, useRef } from 'react';
import BoxInput from './input';
import { useStyles } from '../styles/styles';
import { StyleBoxValue } from '../../../providers/form/models';
import { getStyleBoxValue } from '../utils';

interface IProps {
  className?: string | undefined;
  readOnly: boolean;
  value: StyleBoxValue | undefined;
  propertyName: string;
  onChange?: ((newValue: StyleBoxValue | undefined) => void) | undefined;
}

const Box: FC<IProps> = ({ className, onChange, readOnly, value, propertyName }) => {
  const { styles } = useStyles();

  // need to store the value locally because internal components may not be rendered and will use the old value
  const localValue = useRef<StyleBoxValue | undefined>(value);
  localValue.current = value; // keep in sync with prop on every render

  const onChangeInternal = (val: Partial<StyleBoxValue>): void => {
    const mergedValue = getStyleBoxValue({ ...localValue.current, ...val, _type: 'styleBox' });
    localValue.current = mergedValue; // update immediately so rapid changes merge correctly
    onChange?.(mergedValue);
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
