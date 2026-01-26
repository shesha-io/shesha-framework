import React from 'react';
import { useStyles } from './styles/styles';

interface IInputFieldProps {
  value?: string | number | React.ReactNode;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

function InputField({ value, style, children }: IInputFieldProps): JSX.Element {
  const { styles } = useStyles({ textAlign: style?.textAlign || 'left' });

  const { height } = style || {};

  // Apply all styles to single container to avoid double borders
  return value || children ? (
    <div
      className={styles.inputField}
      style={{
        ...style,
        whiteSpace: height === 'auto' ? 'pre-wrap' : 'nowrap',
        display: 'flex',
        alignItems: 'center',
        boxSizing: 'border-box',
      }}
    >
      {value || children}
    </div>
  ) : null;
}

export default InputField;
