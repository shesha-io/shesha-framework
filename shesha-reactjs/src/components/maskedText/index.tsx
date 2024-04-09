import { maskValue, prepareInputMask } from '@/components/maskedText/utils';
import { Input } from 'antd/lib';
import React, { useEffect, useState } from 'react';

export interface IMaskedTextProps {
    value: string
}

const MaskedText: React.FC<IMaskedTextProps> = ({ value}) => {
    const [valid, setValid] = useState<boolean>(false);

    value = '9801155450085';
    const masked = maskValue(value, 3, 7, "*");

    const onChange = (e) => {
        if(e.target.value.length >= 4 && e.target.value === value.slice(3, 8)) {
            console.log("Valid")
            setValid(true);
        }else setValid(false)
    }

    useEffect(() => {
        console.log(valid)
    }, [valid])

    return (
        <>
            <span>{masked}</span>
            <Input onChange={onChange} style={{border: `${valid ? '1px solid green' : '1px solid red'}`}}/>
        </>
    );
};

export default MaskedText;
