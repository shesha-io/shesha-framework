import { FormMarkup, IConfigurableFormComponent } from 'providers/form/models';
import { IToolboxComponent } from 'interfaces';
import React from 'react';
import { GroupOutlined } from '@ant-design/icons';
import { ConfigurableFormItem } from 'components/index';
import settingsFormJson from './settingsForm.json';
import { evaluateString, validateConfigurableComponentSettings } from 'utils/publicUtils';
import { GroupingEditor } from 'components/dataTable/groupingConfigurator/index';
import { useForm, useFormData } from 'providers/index';

export interface IGroupingEditorComponentProps extends IConfigurableFormComponent {
    modelType: string;
}

const settingsForm = settingsFormJson as FormMarkup;

export const GroupingEditorComponent: IToolboxComponent<IGroupingEditorComponentProps> = {
    type: 'dataGroupingEditor',
    name: 'Data Grouping Editor',
    isInput: true,
    isOutput: true,
    canBeJsSetting: true,
    icon: <GroupOutlined />,
    isHidden: true,
    factory: (model: IGroupingEditorComponentProps, _c, _form) => {
        const { formMode } = useForm();
        const { data: formData } = useFormData();
        const { modelType: modelTypeExpression } = model;

        const modelType = modelTypeExpression ? evaluateString(modelTypeExpression, { data: formData }) : null;
        const readOnly = model.readOnly || formMode === 'readonly';
        
        return (
            <ConfigurableFormItem model={model}>
                {(value, onChange) => <GroupingEditor value={value} onChange={onChange} modelType={modelType} readOnly={readOnly}/>}
            </ConfigurableFormItem>
        );
    },
    settingsFormMarkup: settingsForm,
    validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
    migrator: (m) => m
        .add<IGroupingEditorComponentProps>(0, (prev) => ({ ...prev, modelType: '' }))
    ,
};