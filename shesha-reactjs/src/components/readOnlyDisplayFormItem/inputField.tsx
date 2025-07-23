import React from 'react';
import { useStyles } from './styles/styles';

function InputField({ value, style, children }: { value: string | number | React.ReactNode; style?: React.CSSProperties; children?: React.ReactNode }) {

    const { styles } = useStyles();

    const { fontSize, fontWeight, color, fontFamily, textAlign } = style || {};

    return (
        <div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: textAlign }} >
            <div className={styles.inputField} style={{ fontSize, fontWeight, color, fontFamily }}>{value || children}</div>
        </div>
    );
}

export default InputField;