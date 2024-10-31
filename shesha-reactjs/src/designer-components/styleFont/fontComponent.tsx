import React, { FC, memo } from 'react';
import { alignOptions, fontTypes, fontWeights } from './utils';
import { InputRow } from '@/designer-components/_settings/components/utils';

export interface IFontType {
    readOnly?: boolean;
}



const FontComponent: FC<IFontType> = memo((props) => {
    const { readOnly } = props;

    return <InputRow inline={true} readOnly={readOnly} inputs={[]} />
});

export default FontComponent;