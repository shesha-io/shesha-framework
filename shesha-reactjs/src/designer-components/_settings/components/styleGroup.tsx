import React from 'react';
import { ConfigProvider, Collapse } from 'antd';
import FontComponent from '../../styleFont/components/font/fontComponent';
import SizeComponent from '../../styleDimensions/components/size/sizeComponent';
import BorderComponent from '../../styleBorder/components/border/borderComponent';
import BackgroundComponent from '../../styleBackground/components/background/background';
import ShadowComponent from '../../styleShadow/components/shadow/shadowComponent';
import SettingsFormItem from '../settingsFormItem';
import { CodeEditor } from '@/components';
import StyleBox from '../../styleBox/components/box';
interface StyleGroupProps {
    readOnly: boolean;
    onValuesChange: (values: any) => void;
    model: any;
}

const StyleGroup: React.FC<StyleGroupProps> = ({ readOnly, onValuesChange, model }) => {

    const stylePanels = (omitted) => [
        {
            key: '1',
            label: 'Font',
            children: <FontComponent readOnly={readOnly} onChange={onValuesChange} value={model.font} />
        },
        {
            key: '2',
            label: 'Size',
            children: <SizeComponent readOnly={readOnly} onChange={onValuesChange} value={model.dimensions} noOverflow />
        },
        {
            key: '3',
            label: 'Border',
            children: <BorderComponent readOnly={readOnly} onChange={onValuesChange} value={model.border} model={model} />
        },
        {
            key: '4',
            label: 'Background',
            children: <BackgroundComponent readOnly={readOnly} onValuesChange={onValuesChange} value={model.background} model={model} />
        },
        {
            key: '5',
            label: 'Shadow',
            children: <ShadowComponent readOnly={readOnly} value={model.shadow} />
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
    ].filter(panel => !omitted?.includes(panel.label)).map((panel, i) => ({ ...panel, key: `${i + 1}` }));

    const activateAllStylePanels = () => stylePanels([]).map(panel => panel.key);

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
            <Collapse activeKey={activateAllStylePanels()} style={{ paddingLeft: 0 }}>
                <Collapse
                    items={stylePanels([])}
                />
            </Collapse>
        </ConfigProvider>
    );
};

export default StyleGroup;