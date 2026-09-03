import classNames from 'classnames';
import { FC, useLayoutEffect, useRef } from 'react';
import BoxInput from './input';
import { useStyles } from '../styles/styles';
import { StyleBoxValue } from '../../../providers/form/models';
import { getStyleBoxValue } from '../utils';

interface IProps {
  readOnly: boolean;
  value: StyleBoxValue | undefined;
  propertyName: string;
  onChange?: ((newValue: StyleBoxValue | undefined) => void) | undefined;
}

const Box: FC<IProps> = ({ onChange, readOnly, value, propertyName }) => {
  const { styles } = useStyles();

  // need to store the value locally because internal components may not be rendered and will use the old value
  const localValue = useRef<StyleBoxValue | undefined>(value);

  // Sync after commit only — mutating a ref during render is unsafe in concurrent mode
  // because an interrupted render can leave the ref with an uncommitted value.
  useLayoutEffect(() => {
    localValue.current = value;
  }, [value]);

  const onChangeInternal = (val: Partial<StyleBoxValue>): void => {
    const mergedValue = getStyleBoxValue({ ...localValue.current, ...val, _type: 'styleBox' });
    localValue.current = mergedValue; // update immediately so rapid changes merge correctly
    onChange?.(mergedValue);
  };

  const commonProps = { onChange: onChangeInternal, readOnly, value, propertyName };

  return (
    <div className={styles.shaStyleBox}>
      <div className={classNames('sha-style-box-margin', 'sha-style-box-mtb')}>
        <span className="sha-style-box-text">Margin</span>
        <BoxInput {...commonProps} type="margin" direction="top" />
      </div>
      <div className="sha-style-box-center">
        <div className={classNames('sha-style-box-margin', 'sha-style-box-mlr')}>
          <BoxInput {...commonProps} type="margin" direction="left" />
        </div>
        <div className="sha-style-box-padding-container">
          <div className={classNames('sha-style-box-padding', 'sha-style-box-ptb')}>
            <span className="sha-style-box-text">Padding</span>
            <BoxInput {...commonProps} type="padding" direction="top" />
          </div>
          <div className="sha-style-box-padding-center">
            <div className={classNames('sha-style-box-padding', 'sha-style-box-plr')}>
              <BoxInput {...commonProps} type="padding" direction="left" />
            </div>
            <div className={classNames('sha-style-box-margin', 'sha-style-box-inner')} />
            <div className={classNames('sha-style-box-padding', 'sha-style-box-plr')}>
              <BoxInput {...commonProps} type="padding" direction="right" />
            </div>
          </div>
          <div className={classNames('sha-style-box-padding', 'sha-style-box-ptb')}>
            <BoxInput {...commonProps} type="padding" direction="bottom" />
          </div>
        </div>
        <div className={classNames('sha-style-box-margin', 'sha-style-box-mlr')}>
          <BoxInput {...commonProps} type="margin" direction="right" />
        </div>
      </div>
      <div className={classNames('sha-style-box-margin', 'sha-style-box-mtb')}>
        <BoxInput {...commonProps} type="margin" direction="bottom" />
      </div>
    </div>
  );
};

export default Box;
