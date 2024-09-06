import React from 'react';
import { ConfigProvider, Collapse, CollapseProps } from 'antd';
import FontComponent from '../../styleFont/components/font/fontComponent';
import SizeComponent from '../../styleDimensions/components/size/sizeComponent';
import BorderComponent from '../../styleBorder/components/border/borderComponent';
import BackgroundComponent from '../../styleBackground/components/background/background';
import ShadowComponent from '../../styleShadow/components/shadow/shadowComponent';
import SettingsFormItem from '../settingsFormItem';
import { CodeEditor } from '@/components';
import StyleBox from '../../styleBox/components/box';

type omittedStyleType = 'font' | 'dimensions' | 'border' | 'background' | 'shadow' | 'stylingBox' | 'style';

interface StyleGroupProps {
    model: any;
    omitted?: omittedStyleType[];
}

const StyleGroup: React.FC<StyleGroupProps> = ({ model, omitted = [] }) => {

    const readOnly = model?.readOnly;

    const items: CollapseProps['items'] = [
        {
            key: '1',
            label: 'Font',
            children: <FontComponent readOnly={readOnly} model={model} />
        },
        {
            key: '2',
            label: 'Size',
            children: <SizeComponent model={model} noOverflow />
        },
        {
            key: '3',
            label: 'Border',
            children: <BorderComponent model={model} />
        },
        {
            key: '4',
            label: 'Background',
            children: <BackgroundComponent model={model} />
        },
        {
            key: '5',
            label: 'Shadow',
            children: <ShadowComponent model={model} />
        },
        {
            key: '6',
            label: 'Styling',
            children: (
                <>
                    <SettingsFormItem name="style" label="Style">
                        <CodeEditor
                            propertyName="style"
                            readOnly={readOnly}
                            mode="dialog"
                            label="Style"
                            description="A script that returns the style of the element as an object. This should conform to CSSProperties"
                        />

                    </SettingsFormItem>
                    <SettingsFormItem name="stylingBox">
                        <StyleBox />
                    </SettingsFormItem>
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
            />
        </ConfigProvider>
    );
};

export default StyleGroup;