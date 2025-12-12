import React from 'react';
import { useStyles } from './styles/styles';

interface IInputFieldProps {
    value?: string | number | React.ReactNode;
    style?: React.CSSProperties;
    children?: React.ReactNode;
}

function InputField({ value, style, children }: IInputFieldProps): JSX.Element {
  const { styles } = useStyles({ textAlign: style?.textAlign || 'left' });

  const { fontSize, fontWeight, color, fontFamily, height } = style || {};

  return value || children ? (
    <div style={{ ...style }} className={styles.wrapper}>
      <div className={styles.inputField} style={{ fontSize, fontWeight, color, fontFamily, whiteSpace: height === 'auto' ? 'pre-wrap' : 'nowrap', flex: 'none' }}>{value || children}</div>
    </div>
  ) : null;
}

export default InputField;