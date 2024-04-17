import { IToolboxComponent } from '@/interfaces';
import { LineOutlined } from '@ant-design/icons';
import React from 'react';
import { getStyle, getLayoutStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { useFormData, useGlobalState } from '@/providers';
import SectionSeparator from '@/components/sectionSeparator';
import { ISectionSeparatorComponentProps } from './interfaces';
import { getSettings } from './settings';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';

const SectionSeparatorComponent: IToolboxComponent<ISectionSeparatorComponentProps> = {
  type: 'sectionSeparator',
  name: 'Section Separator',
  icon: <LineOutlined />,
  Factory: ({ model }) => {
    const { data: formData } = useFormData();
    const { globalState } = useGlobalState();

    if (model.hidden) return null;

    return (
      <SectionSeparator
        title={model.label}
        containerStyle={getLayoutStyle({ ...model, style: model?.containerStyle }, { data: formData, globalState })}
        titleStyle={getStyle(model?.titleStyle, formData)}
        tooltip={model?.description}
      />
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  initModel: (model) => {
    return {
      ...model,
      label: 'Section',
    };
  },
  migrator: (m) =>
    m.add<ISectionSeparatorComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev))),
};

export default SectionSeparatorComponent;
