import { FormMarkup, IConfigurableFormComponent } from '@/providers/form/models';
import { IToolboxComponent } from '@/interfaces';
import React from 'react';
import { GroupOutlined } from '@ant-design/icons';
import { ConfigurableFormItem } from '@/components/index';
import settingsFormJson from './settingsForm.json';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { evaluateString } from '@/providers/form/utils';
import { SortingEditor } from '@/components/dataTable/sortingConfigurator/index';
import { MetadataProvider, useFormData } from '@/providers/index';
import { migrateReadOnly } from '../_common-migrations/migrateSettings';
import ConditionalWrap from '@/components/conditionalWrapper';

export interface ISortingEditorComponentProps extends IConfigurableFormComponent {
    modelType: string;
    maxItemsCount?: number;
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
        const { modelType: modelTypeExpression, maxItemsCount } = model;

        const modelType = modelTypeExpression ? evaluateString(modelTypeExpression, { data: formData }) : null;
        const readOnly = model.readOnly;

        return (
            <ConditionalWrap
                condition={Boolean(modelType)}
                wrap={content => <MetadataProvider modelType={modelType}>{content}</MetadataProvider>}
            >
                <ConfigurableFormItem model={model}>
                    {(value, onChange) => {
                        // Ensure value is properly initialized even when jsSetting is enabled
                        // This fixes the persistence issue with Sort By and Grouping in dataTableContext
                        const handleChange = (newValue) => {
                            // Make sure we're passing a properly structured value for the jsSetting scenario
                            onChange(newValue);
                        };
                        
                        return <SortingEditor 
                            value={value} 
                            onChange={handleChange} 
                            readOnly={readOnly} 
                            maxItemsCount={maxItemsCount} 
                        />;
                    }}
                </ConfigurableFormItem>
            </ConditionalWrap>
        );
    },
    settingsFormMarkup: settingsForm,
    validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
    migrator: (m) => m
        .add<ISortingEditorComponentProps>(0, (prev) => ({ ...prev, modelType: '' }))
        .add<ISortingEditorComponentProps>(1, (prev) => migrateReadOnly(prev))
    ,
};