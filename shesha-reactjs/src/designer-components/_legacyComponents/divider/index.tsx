import { LineOutlined } from '@ant-design/icons';
import { Divider, DividerProps } from 'antd';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import React from 'react';
import { validateConfigurableComponentSettings } from '@/formDesignerUtils';
import { IConfigurableFormComponent, IToolboxComponent } from '@/interfaces/formDesigner';
import { FormMarkup } from '@/providers/form/models';
import settingsFormJson from './settingsForm.json';
import { useFormData, useGlobalState } from '@/providers';
import { getLayoutStyle } from '@/providers/form/utils';
import { migrateFormApi } from '../../_common-migrations/migrateFormApi1';

export interface IDividerProps extends IConfigurableFormComponent {
  dividerType?: 'horizontal' | 'vertical';
  dashed?: boolean;
}

const settingsForm = settingsFormJson as FormMarkup;

/** @deprecated: Use Section Separator instead */
const DividerComponent: IToolboxComponent<IDividerProps> = {
  type: 'divider',
  isInput: false,
  name: 'Divider',
  icon: <LineOutlined />,
  tooltip: "Deprecated! Please use 'Section Separator' instead.",
  Factory: ({ model }) => {
    const { data } = useFormData();
    const { globalState } = useGlobalState();

    const props: DividerProps = {
      type: model?.dividerType,
      dashed: model?.dashed,
    };

    return (
      <Divider style={getLayoutStyle(model, { data, globalState })} {...props} />
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
  migrator: (m) => m
    .add<IDividerProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IDividerProps>(3, (prev) => ({ ...migrateFormApi.properties(prev) })),
  initModel: (model) => ({
    dividerType: 'horizontal',
    dashed: false,
    ...model,
  }),
};

export default DividerComponent;
