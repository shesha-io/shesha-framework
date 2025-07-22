import React from 'react';
import { useStyles } from './styles/styles';

function InputField({ value, style }: { value: string; style?: React.CSSProperties }) {

    const { styles } = useStyles();

    const { fontSize, fontWeight, color, fontFamily, textAlign } = style || {};

    return (
        <div style={style} >
            <div className={styles.inputField} style={{ fontSize, fontWeight, color, fontFamily, textAlign }}>{value}</div>
        </div>
    );
}

export default InputField;