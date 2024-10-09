import React, { useMemo } from 'react';
import { ConfigProvider, Collapse, CollapseProps } from 'antd';
import BorderComponent from '../../../styleBorder/borderComponent';
import BackgroundComponent from '../../../styleBackground/background';
import StyleBox from '../../../styleBox/components/box';
import { IDropdownOption, SettingInput } from '../utils';
import FormItem from '../formItem';
import { IBorderValue } from '@/designer-components/styleBorder/interfaces';
import { IBackgroundValue } from '@/designer-components/styleBackground/interfaces';
import { IDimensionsValue } from '@/designer-components/styleDimensions/interfaces';
import { IShadowValue } from '@/designer-components/styleShadow/interfaces';
import FontComponent from '@/designer-components/styleFont/fontComponent';
import SizeComponent from '@/designer-components/styleDimensions/sizeComponent';
import ShadowComponent from '@/designer-components/styleShadow/shadowComponent';
import { IFontValue } from '@/designer-components/styleFont/interfaces';

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

const StyleGroupComponent: React.FC<IStyleGroupType> = ({ omitted = [], onChange, value }) => {

    const fontValue: IFontValue = useMemo(() => value?.font, [value?.font]);

    const dimensionsValue: IDimensionsValue = useMemo(() => value?.dimensions, [value?.dimensions]);

    const borderValue: IBorderValue = useMemo(() => value?.border, [value?.border]);

    const backgroundValue: IBackgroundValue = useMemo(() => value?.background, [value?.background]);

    const shadowValue: IShadowValue = useMemo(() => value?.shadow, [value?.shadow]);

    const sizeOptions: IDropdownOption[] = [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
    ];

    const items: CollapseProps['items'] = [
        {
            key: '1',
            label: 'Font',
            children: <FontComponent value={fontValue} onChange={onChange} />
        },
        {
            key: '2',
            label: 'Size',
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
            children: (
                <>
                    <SettingInput label="Size" property='size' readOnly={false} type='dropdown' description="The size of the element" dropdownOptions={sizeOptions} />
                    <SettingInput label="Style" property='style' readOnly={false} type='codeEditor' description="A script that returns the style of the element as an object. This should conform to CSSProperties" jsSetting={false} />
                    <FormItem name="stylingBox" jsSetting={false}>
                        <StyleBox />
                    </FormItem>
                </>
            )
        }
    ].filter(item => !omitted.map(omit => omit.toLocaleLowerCase())?.includes(item.label.toLocaleLowerCase())).map((item, index) => ({ ...item, key: index.toString(), label: <span style={{ fontWeight: 700 }}>{item.label}</span> }));

    const activateAllStylePanels = items.map(panel => panel.key.toString());

    return (
        <ConfigProvider
            theme={{
                components: {
                    Collapse: {
                        contentBg: 'white',
                        contentPadding: 0,
                        colorBgBase: 'white',
                        colorBorder: 'white',
                        headerPadding: 0,
                    },
                    Tag: {
                        padding: 0,
                    }
                },
            }}
        >
            <Collapse
                defaultActiveKey={activateAllStylePanels}
                items={items}
            />
        </ConfigProvider>
    );
};

export default StyleGroupComponent;