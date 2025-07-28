import React from 'react';
import { useStyles } from './styles/styles';

interface IInputFieldProps {
    value: string | number | React.ReactNode;
    style?: React.CSSProperties;
    children?: React.ReactNode;
}

function InputField({ value, style, children }: IInputFieldProps) {

    const { styles } = useStyles();

    const { fontSize, fontWeight, color, fontFamily, textAlign, height, } = style || {};

    return value || children ? (
        <div style={{ ...style, height: height === 'auto' ? '32px' : height, display: 'flex', alignItems: 'center', justifyContent: textAlign }} >
            <div className={styles.inputField} style={{ fontSize, fontWeight, color, fontFamily }}>{value || children}</div>
        </div>
    ) : null;
}

export default InputField;