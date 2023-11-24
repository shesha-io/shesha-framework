import { Collapse } from 'antd';
import { ICodeExposedVariable } from '@/components/codeVariablesTable';
import React, { useMemo } from 'react';
import { FC } from 'react';
import { FormMarkupFactory, IConfigurableActionArgumentsFormFactory, IConfigurableActionDescriptor } from '@/interfaces/configurableAction';
import { FormMarkup } from '@/providers/form/models';
import GenericArgumentsEditor from './genericArgumentsEditor';

const { Panel } = Collapse;

export interface IActionArgumentsEditorProps {
    action: IConfigurableActionDescriptor;
    value?: any;
    onChange?: (value: any) => void;
    readOnly?: boolean;
    exposedVariables?: ICodeExposedVariable[];
}

const getDefaultFactory = (markup: FormMarkup | FormMarkupFactory, readOnly: boolean): IConfigurableActionArgumentsFormFactory => {
    return ({
        model,
        onSave,
        onCancel,
        onValuesChange,
        exposedVariables,
    }) => {
        const markupFactory = typeof(markup) === 'function'
            ? markup as FormMarkupFactory
            : () => markup as FormMarkup;
        
        const formMarkup = markupFactory({ exposedVariables });
        return (
            <GenericArgumentsEditor
                model={model}
                onSave={onSave}
                onCancel={onCancel}
                markup={formMarkup}
                onValuesChange={onValuesChange}
                readOnly={readOnly}
            />
        );
    };
};

export const ActionArgumentsEditor: FC<IActionArgumentsEditorProps> = ({ action, value, onChange, readOnly = false, exposedVariables }) => {

    const argumentsEditor = useMemo(() => {
        const settingsFormFactory = action.argumentsFormFactory
            ? action.argumentsFormFactory
            : action.argumentsFormMarkup
                ? getDefaultFactory(action.argumentsFormMarkup, readOnly)
                : null;

        const onCancel = () => {
            //
        };

        const onSave = values => {
            if (onChange)
                onChange(values);
        };

        const onValuesChange = (_changedValues, values) => {
            if (onChange)
                onChange(values);
        };

        return settingsFormFactory
            ? settingsFormFactory({
                model: value,
                onSave,
                onCancel,
                onValuesChange,
                readOnly,
                exposedVariables,
            })
            : null;
    }, [action]);

    if (!argumentsEditor)
        return null;

    return (
        <Collapse defaultActiveKey={['1']}>
            <Panel header="Arguments" key="1">
                {argumentsEditor}
            </Panel>
        </Collapse>
    );
};

export default ActionArgumentsEditor;