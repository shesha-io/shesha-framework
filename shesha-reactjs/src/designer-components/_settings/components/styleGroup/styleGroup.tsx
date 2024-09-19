import React, { useMemo } from 'react';
import { ConfigProvider, Collapse, CollapseProps } from 'antd';
import FontComponent from '../../../styleFont/components/font/fontComponent';
import SizeComponent from '../../../styleDimensions/components/size/sizeComponent';
import BorderComponent from '../../../styleBorder/components/border/borderComponent';
import BackgroundComponent from '../../../styleBackground/components/background/background';
import ShadowComponent from '../../../styleShadow/components/shadow/shadowComponent';
import StyleBox from '../../../styleBox/components/box';
import { SettingInput } from '../utils';
import FormItem from '../formItem';
import { IDimensionsValue } from '@/designer-components/styleDimensions/components/size/interfaces';
import { IBorderValue } from '@/designer-components/styleBorder/components/border/interfaces';
import { IBackgroundValue } from '@/designer-components/styleBackground/components/background/interfaces';
import { IShadowValue } from '@/designer-components/styleShadow/components/shadow/interfaces';

export type omittedStyleType = 'font' | 'dimensions' | 'border' | 'background' | 'shadow' | 'stylingBox' | 'style';

export interface IStyleGroupType {
    onChange?: (value: any) => void;
    omitted?: omittedStyleType[];
    value?: any;
    readOnly?: boolean;
}

const StyleGroupComponent: React.FC<IStyleGroupType> = ({ omitted = [], onChange, value }) => {

    const fontValue = useMemo(() => {
        return value?.font
    }, value?.font);

    const dimensionsValue: IDimensionsValue = useMemo(() => {
        return value?.dimensions
    }, [value?.dimensions]);

    const borderValue: IBorderValue = useMemo(() => {
        return value?.border
    }, [{ ...value?.border }]);

    const backgroundValue: IBackgroundValue = useMemo(() => {
        return value
    }, [{ ...value?.background }]);

    const shadowValue: IShadowValue = useMemo(() => {
        return value?.shadow
    }, [value?.shadow]);

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
            key: '1',
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
                    <SettingInput label="Style" property='style' readOnly={false} type='code' description="A script that returns the style of the element as an object. This should conform to CSSProperties" jsSetting={false} />
                    <FormItem name="stylingBox" jsSetting={false}>
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