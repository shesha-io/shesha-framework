import { FormMarkup, IConfigurableFormComponent } from '@/providers/form/models';
import { IToolboxComponent } from '@/interfaces';
import React from 'react';
import { GroupOutlined } from '@ant-design/icons';
import { ConfigurableFormItem } from '@/components/index';
import settingsFormJson from './settingsForm.json';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { evaluateString } from '@/providers/form/utils';
import { SortingEditor } from '@/components/dataTable/sortingConfigurator/index';
import { MetadataProvider } from '@/providers/index';
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
    calculateModel: (model, allData) => ({ modelType: model.modelType ? evaluateString(model.modelType, { data: allData.data }) : null }),
    Factory: ({ model, calculatedModel }) => {
        return (
            <ConditionalWrap
                condition={Boolean(calculatedModel.modelType)}
                wrap={content => <MetadataProvider modelType={calculatedModel.modelType}>{content}</MetadataProvider>}
            >
                <ConfigurableFormItem model={model}>
                    {(value, onChange) => <SortingEditor value={value} onChange={onChange} readOnly={model.readOnly} maxItemsCount={model.maxItemsCount} />}
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