import React from 'react';
import { useStyles } from './styles/styles';

function InputField({ value, style, children }: { value: string | number | React.ReactNode; style?: React.CSSProperties; enableStyleOnReadonly?: boolean; children?: React.ReactNode }) {

    const { styles } = useStyles();

    const { fontSize, fontWeight, color, fontFamily, textAlign, height, } = style || {};

    return value || children ? (
        <div style={{ ...style, height: height === 'auto' ? '32px' : height, display: 'flex', alignItems: 'center', justifyContent: textAlign }} >
            <div className={styles.inputField} style={{ fontSize, fontWeight, color, fontFamily }}>{value || children}</div>
        </div>
    ) : null;
}

export default InputField;