import React from 'react';
import { BaseFieldWidget, BasicConfig } from '@react-awesome-query-builder/antd';
import { Typography } from 'antd';
import { FieldWidgetProvider } from './fieldWidgetContext';

type FieldWidgetType = BaseFieldWidget & {
    valueSrc: "field";
};

const FieldWidget: FieldWidgetType = {
    ...BasicConfig.widgets.field,
    //type: 'specification',
    factory: (props, { RCE, W: { ValueFieldWidget } }) => {
        const fieldSelectorProps = {
            ...props,
            isFieldComparison: true,
            mainField: props.fieldDefinition,
        };
        const filterProps = {
            fieldType: props.fieldType,
            field: props.field,
            fieldSrc: props.fieldSrc,
            fieldDefinition: props.fieldDefinition,
        };

        return (
            <>
                { false && <Typography.Paragraph
                    copyable={{
                        text: async () => JSON.stringify(filterProps, null, 2)
                    }}
                >
                    Copy widget props.
                </Typography.Paragraph>
                }
                <FieldWidgetProvider widgetProps={props}>
                    {RCE(ValueFieldWidget, fieldSelectorProps)}
                </FieldWidgetProvider>
            </>
        );
    },
};

export { FieldWidget };