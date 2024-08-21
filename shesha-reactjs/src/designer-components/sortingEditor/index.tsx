import { FormMarkup, IConfigurableFormComponent } from '@/providers/form/models';
import { IToolboxComponent } from '@/interfaces';
import React from 'react';
import { GroupOutlined } from '@ant-design/icons';
import { ConfigurableFormItem } from '@/components/index';
import settingsFormJson from './settingsForm.json';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { evaluateString } from '@/providers/form/utils';
import { SortingEditor } from '@/components/dataTable/sortingConfigurator/index';
import { useFormData } from '@/providers/index';
import { migrateReadOnly } from '../_common-migrations/migrateSettings';

export interface ISortingEditorComponentProps extends IConfigurableFormComponent {
    modelType: string;
}

const settingsForm = settingsFormJson as FormMarkup;

export const SortingEditorComponent: IToolboxComponent<ISortingEditorComponentProps> = {
    type: 'dataSortingEditor',
    name: 'Data Sorting Editor',
    isInput: true,
    isOutput: true,
    canBeJsSetting: true,
    icon: <GroupOutlined />,
    Factory: ({ model }) => {
        const { data: formData } = useFormData();
        const { modelType: modelTypeExpression } = model;

        const modelType = modelTypeExpression ? evaluateString(modelTypeExpression, { data: formData }) : null;
        const readOnly = model.readOnly;
        
        return (
            <ConfigurableFormItem model={model}>
                {(value, onChange) => <SortingEditor value={value} onChange={onChange} modelType={modelType} readOnly={readOnly}/>}
            </ConfigurableFormItem>
        );
    },
    settingsFormMarkup: settingsForm,
    validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
    migrator: (m) => m
        .add<ISortingEditorComponentProps>(0, (prev) => ({ ...prev, modelType: '' }))
        .add<ISortingEditorComponentProps>(1, (prev) => migrateReadOnly(prev))
    ,
};