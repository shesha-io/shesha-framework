import React from 'react';
import { ConfigProvider, Collapse, CollapseProps } from 'antd';
import FontComponent from '../../../styleFont/components/font/fontComponent';
import SizeComponent from '../../../styleDimensions/components/size/sizeComponent';
import BorderComponent from '../../../styleBorder/components/border/borderComponent';
import BackgroundComponent from '../../../styleBackground/components/background/background';
import ShadowComponent from '../../../styleShadow/components/shadow/shadowComponent';
import StyleBox from '../../../styleBox/components/box';
import { SettingInput } from '../utils';
import FormItem from '../formItem';

export type omittedStyleType = 'font' | 'dimensions' | 'border' | 'background' | 'shadow' | 'stylingBox' | 'style';

export interface IStyleGroupType {
    model: any;
    onChange?: (value: any) => void;
    omitted?: omittedStyleType[];
    value?: any;
    readOnly?: boolean;
}

const StyleGroupComponent: React.FC<IStyleGroupType> = ({ omitted = [], model, onChange, value }) => {

    const { readOnly } = model;


    const items: CollapseProps['items'] = [
        {
            key: '1',
            label: 'Font',
            children: <FontComponent readOnly={readOnly} value={value} />
        },
        {
            key: '2',
            label: 'Size',
            children: <SizeComponent noOverflow readOnly={readOnly} value={value} />
        },
        {
            key: '3',
            label: 'Border',
            children: <BorderComponent readOnly={readOnly} value={value} />
        },
        {
            key: '4',
            label: 'Background',
            children: <BackgroundComponent readOnly={readOnly} value={value} />
        },
        {
            key: '5',
            label: 'Shadow',
            children: <ShadowComponent />
        },
        {
            key: '6',
            label: 'Styling',
            children: (
                <>
                    <SettingInput label="Style" property='style' readOnly={readOnly} type='code' description="A script that returns the style of the element as an object. This should conform to CSSProperties" />
                    <FormItem name="stylingBox">
                        <StyleBox />
                    </FormItem>
                </>

            )
        }
    ].filter(item => !omitted.map(s => s.toLocaleLowerCase())?.includes(item.label.toLocaleLowerCase())).map((item, index) => ({ ...item, key: index.toString() }));

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
                        headerPadding: '0px 16px',
                    },
                },
            }}
        >
            <Collapse
                defaultActiveKey={activateAllStylePanels}
                items={items}
                onChange={onChange}
            />
        </ConfigProvider>
    );
};

export default StyleGroupComponent;