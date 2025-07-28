import React from 'react';
import { useStyles } from './styles/styles';

function InputField({ value, style, disabledStyleOnReadonly = true, children }: { value: string | number | React.ReactNode; style?: React.CSSProperties; disabledStyleOnReadonly?: boolean; children?: React.ReactNode }) {

    const { styles } = useStyles();

    const { fontSize, fontWeight, color, fontFamily, textAlign, width, height = '32px', minWidth, maxWidth, minHeight, maxHeight } = style || {};

    return (
        <div style={disabledStyleOnReadonly ? { width, height, minWidth, maxWidth, minHeight, maxHeight, display: 'flex', alignItems: 'center', justifyContent: textAlign } :
            { ...style, display: 'flex', alignItems: 'center', justifyContent: textAlign }} >
            <div className={styles.inputField} style={{ fontSize, fontWeight, color, fontFamily }}>{value || children}</div>
        </div>
    );
}

export default InputField;