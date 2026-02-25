import React, { useMemo } from 'react';
import SettingsControl from './settingsControl';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { getSettings } from './settings';
import { IConfigurableFormComponent, ShaForm } from '@/providers';
import { IToolboxComponent } from '@/interfaces';
import { migrateReadOnly } from '../_common-migrations/migrateSettings';
import { SettingOutlined } from '@ant-design/icons';
import { SettingComponentContainer } from './settingContainer/settingComponentContainer';
import { useActualContextData } from '@/hooks';
import { GetAvailableConstantsFunc } from "@/designer-components/codeEditor/interfaces";

export interface ISettingsComponentProps extends IConfigurableFormComponent {
  availableConstantsExpression?: string | GetAvailableConstantsFunc;
  components?: IConfigurableFormComponent[];
  lazy?: boolean;
}

const SettingsComponent: IToolboxComponent<ISettingsComponentProps> = {
  type: 'setting',
  isInput: true,
  isOutput: true,
  name: 'Setting',
  icon: <SettingOutlined />,
  Factory: ({ model }) => {
    const actualSourceComponent = useActualContextData(ShaForm.useChildComponents(model.id)[0], model.readOnly);

    const component: IConfigurableFormComponent = useMemo(() => {
      return {
        ...actualSourceComponent,
        hideLabel: true,
        readOnly: model.readOnly,
        editMode: model.editMode,
        hidden: model.hidden,
      };
    }, [model.hidden, model.readOnly, model.id, actualSourceComponent]);

    if (model.hidden) return null;

    return (
      <ConfigurableFormItem model={model} className="sha-js-label" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
        {(value, onChange) => (
          <SettingsControl
            readOnly={model.readOnly}
            propertyName={model.propertyName}
            mode="value"
            onChange={onChange}
            value={value}
            lazy={model.lazy}
            availableConstantsExpression={model.availableConstantsExpression}
          >
            {(_valueValue, _onChangeValue, propertyName) => {
              return (
                <SettingComponentContainer containerId={model.id} propertyName={propertyName} component={component} />
              );
            }}
          </SettingsControl>
        )}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: getSettings,
  migrator: (m) => m
    .add<ISettingsComponentProps>(0, (prev) => migrateReadOnly(prev)),
};

export default SettingsComponent;
