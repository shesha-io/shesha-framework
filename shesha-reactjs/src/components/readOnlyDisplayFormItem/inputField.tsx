import React from 'react';
import { useStyles } from './styles/styles';

interface IInputFieldProps {
  value?: string | number | React.ReactNode;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

function InputField({ value, style, children }: IInputFieldProps): JSX.Element {
  const { styles } = useStyles();

  const { fontSize, fontWeight, color, fontFamily, textAlign, height } = style || {};

  return value || children ? (
    <div style={{ padding: '4px', ...style, height: height, display: 'flex', alignItems: 'center', justifyContent: textAlign }}>
      <div className={styles.inputField} style={{ fontSize, fontWeight, color, fontFamily, whiteSpace: height === 'auto' ? 'pre-wrap' : 'nowrap', flex: 'none' }}>{value || children}</div>
    </div>
  ) : null;
}

export default InputField;
