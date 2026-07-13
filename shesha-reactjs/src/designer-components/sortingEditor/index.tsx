import { FormMarkup, IConfigurableFormComponent } from '@/providers/form/models';
import { IToolboxComponent } from '@/interfaces';
import React from 'react';
import { GroupOutlined } from '@ant-design/icons';
import { ConfigurableFormItem } from '@/components/index';
import settingsFormJson from './settingsForm.json';
import { validateConfigurableComponentSettings, evaluateString } from '@/providers/form/utils';
import { SortingEditor } from '@/components/dataTable/sortingConfigurator/index';
import { ConditionalMetadataProvider } from '@/providers/index';
import { migrateReadOnly } from '../_common-migrations/migrateSettings';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';
import { ISortingItem } from '@/providers/dataTable/interfaces';

export interface ISortingEditorComponentProps extends IConfigurableFormComponent {
  modelType: string | IEntityTypeIdentifier;
  maxItemsCount?: number;
}

const settingsForm = settingsFormJson as FormMarkup;

export type SortingEditorCalculatedProps = {
  modelType: string | IEntityTypeIdentifier | undefined;
};

export const SortingEditorComponent: IToolboxComponent<ISortingEditorComponentProps, SortingEditorCalculatedProps> = {
  type: 'dataSortingEditor',
  name: 'Data Sorting Editor',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  icon: <GroupOutlined />,
  preserveDimensionsInDesigner: true,
  calculateModel: (model, allData) => ({ modelType: typeof model.modelType === 'string' ? evaluateString(model.modelType, { data: allData.data }) : model.modelType }),
  Factory: ({ model, calculatedModel }) => {
    return (
      <ConditionalMetadataProvider modelType={calculatedModel.modelType}>
        <ConfigurableFormItem<ISortingItem[]> model={model}>
          {(value, onChange) => <SortingEditor value={value} onChange={onChange} readOnly={model.readOnly} maxItemsCount={model.maxItemsCount} />}
        </ConfigurableFormItem>
      </ConditionalMetadataProvider>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
  migrator: (m) => m
    .add<ISortingEditorComponentProps>(0, (prev) => ({ ...prev, modelType: '' }))
    .add<ISortingEditorComponentProps>(1, (prev) => migrateReadOnly(prev)),
};
