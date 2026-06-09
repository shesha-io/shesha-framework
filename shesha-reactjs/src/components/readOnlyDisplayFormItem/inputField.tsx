import React from 'react';

interface IInputFieldProps {
  value?: string | number | React.ReactNode;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  className?: string;
}

function InputField({ value, style, children, className }: IInputFieldProps): React.JSX.Element {
  const { height } = style || {};

  const strValue = String(value ?? '');

  // Apply all styles to single container to avoid double borders
  return (
    <div
      className={className}
      style={{
        ...style,
        whiteSpace: height === 'auto' ? 'pre-wrap' : 'nowrap',
        display: 'flex',
        alignItems: 'center',
        boxSizing: 'border-box',
      }}
    >
      {
        (!strValue ? ' ' : value) || // add space if value is empty to keep base comopnent style
        children ||
        null
      }
    </div>
  );
}

export default InputField;
