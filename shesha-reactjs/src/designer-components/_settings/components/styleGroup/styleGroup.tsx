import React, { useMemo } from 'react';
import { CollapseProps } from 'antd';
import BorderComponent from '../../../styleBorder/borderComponent';
import BackgroundComponent from '../../../styleBackground/background';
import StyleBox from '../../../styleBox/components/box';
import { IBorderValue } from '@/designer-components/styleBorder/interfaces';
import { IBackgroundValue } from '@/designer-components/styleBackground/interfaces';
import { IDimensionsValue } from '@/designer-components/styleDimensions/interfaces';
import { IShadowValue } from '@/designer-components/styleShadow/interfaces';
import FontComponent from '@/designer-components/styleFont/fontComponent';
import SizeComponent from '@/designer-components/styleDimensions/sizeComponent';
import ShadowComponent from '@/designer-components/styleShadow/shadowComponent';
import { IFontValue } from '@/designer-components/styleFont/interfaces';
import { CollapsiblePanel } from '@/components';
import { useStyles } from './styles/styles';
import { SettingInput } from '../settingsInput';

export type omittedStyleType = 'font' | 'dimensions' | 'border' | 'background' | 'shadow' | 'stylingBox' | 'style';

interface IStyleGroupValueType {
    background: IBackgroundValue;
    border: IBorderValue;
    dimensions: IDimensionsValue;
    font: IFontValue;
    shadow: IShadowValue;
    stylingBox: any;
    style: any;
};
export interface IStyleGroupType {
    onChange?: (value: any) => void;
    omitted?: omittedStyleType[];
    value?: IStyleGroupValueType;
    readOnly?: boolean;
}

const StyleGroupComponent: React.FC<IStyleGroupType> = ({ omitted = [], onChange, value, readOnly }) => {
    const { styles } = useStyles();

    const fontValue: IFontValue = useMemo(() => value?.font, [value?.font]);

    const dimensionsValue: IDimensionsValue = useMemo(() => value?.dimensions, [value?.dimensions]);

    const borderValue: IBorderValue = useMemo(() => value?.border, [value?.border]);

    const backgroundValue: IBackgroundValue = useMemo(() => value?.background, [value?.background]);

    const shadowValue: IShadowValue = useMemo(() => value?.shadow, [value?.shadow]);

    const items: CollapseProps['items'] = [
        {
            key: '1',
            label: 'Font',
            children: <FontComponent value={fontValue} />
        },
        {
            key: '2',
            label: 'Dimensions',
            children: <SizeComponent noOverflow value={dimensionsValue} onChange={onChange} />
        },
        {
            key: '3',
            label: 'Border',
            children: <BorderComponent value={borderValue} onChange={onChange} />
        },
        {
            key: '4',
            label: 'Background',
            children: <BackgroundComponent value={backgroundValue} onChange={onChange} />
        },
        {
            key: '5',
            label: 'Shadow',
            children: <ShadowComponent value={shadowValue} onChange={onChange} />
        },
        {
            key: '6',
            label: 'Styling',
            children: <>
                <SettingInput label="Style" propertyName='style' readOnly={false} inputType='codeEditor' description="A script that returns the style of the element as an object. This should conform to CSSProperties" jsSetting={false} />
                <SettingInput propertyName="stylingBox" jsSetting={false} label="margin padding" hideLabel readOnly={readOnly}>
                    <StyleBox />
                </SettingInput>
            </>

        }
    ].filter(item => {
        return !omitted.map(omit => omit.toLocaleLowerCase())?.includes(item.label.toLocaleLowerCase());
    }).map((item, index) => ({ ...item, key: index.toString(), label: <span style={{ fontWeight: 700 }}>{item.label}</span> }));

    return (
        <>
            {items.map(item => {
                return <CollapsiblePanel className={styles.collapseHeader} ghost={true} accordion={true} hideWhenEmpty={true} key={item.key} header={item.label} expandIconPosition='start'>
                    {item.children}
                </CollapsiblePanel>;
            })}
        </>
    );
};

export default StyleGroupComponent;