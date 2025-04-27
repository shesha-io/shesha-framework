import { FormMarkup, IConfigurableFormComponent } from '@/providers/form/models';
import { IToolboxComponent } from '@/interfaces';
import React, { useEffect, useState } from 'react';
import { GroupOutlined } from '@ant-design/icons';
import { ConfigurableFormItem } from '@/components/index';
import settingsFormJson from './settingsForm.json';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { evaluateString } from '@/providers/form/utils';
import { SortingEditor } from '@/components/dataTable/sortingConfigurator/index';
import { MetadataProvider, useFormData } from '@/providers/index';
import { migrateReadOnly } from '../_common-migrations/migrateSettings';
import ConditionalWrap from '@/components/conditionalWrapper';
import { GroupingItem as SortingItem } from '@/providers/dataTable/interfaces';

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
        
        // Track initialization state
        const [isInitialized, setIsInitialized] = useState(false);

        return (
            <ConditionalWrap
                condition={Boolean(modelType)}
                wrap={content => <MetadataProvider modelType={modelType}>{content}</MetadataProvider>}
            >
                <ConfigurableFormItem model={model}>
                    {(value, onChange) => {
                        // Handle initialization and value updates in one place
                        useEffect(() => {
                            if (!isInitialized) {
                                // Initialize if value is null, undefined or not an array
                                if (!value || !Array.isArray(value)) {
                                    onChange([]);
                                }
                                setIsInitialized(true);
                            }
                        }, [value, isInitialized]);
                        
                        // Custom change handler to ensure proper value updates
                        const handleChange = (newValue?: SortingItem[]) => {
                            // Ensure newValue is always an array (or undefined if intentionally clearing)
                            if (newValue === null) newValue = [];
                            
                            // Update the form value - this ensures proper persistence with jsSetting
                            onChange(newValue);
                        };
                        
                        return <SortingEditor 
                            value={Array.isArray(value) ? value : []} 
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