import { Collapse } from 'antd';
import React, { useMemo } from 'react';
import { FC } from 'react';
import { IConfigurableActionArgumentsFormFactory, IConfigurableActionDescriptor } from '../../../../interfaces/configurableAction';
import { FormMarkup } from '../../../../providers/form/models';
import GenericArgumentsEditor from './genericArgumentsEditor';

const { Panel } = Collapse;

export interface IActionArgumentsEditorProps {
    action: IConfigurableActionDescriptor;
    value?: any;
    onChange?: (value: any) => void;
    readOnly?: boolean;
}

const getDefaultFactory = (markup: FormMarkup, readOnly: boolean): IConfigurableActionArgumentsFormFactory => {
    return ({
        model,
        onSave,
        onCancel,
        onValuesChange,
    }) => {
        return (
            <GenericArgumentsEditor
                model={model}
                onSave={onSave}
                onCancel={onCancel}
                markup={markup}
                onValuesChange={onValuesChange}
                readOnly={readOnly}
            />
        );
    };
};

export const ActionArgumentsEditor: FC<IActionArgumentsEditorProps> = ({ action, value, onChange, readOnly = false }) => {

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
}

export default ActionArgumentsEditor;