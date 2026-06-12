import React, { ReactNode, useMemo } from 'react';
import SettingsControl from './settingsControl';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { getSettings } from './settings';
import { IConfigurableFormComponent, IPropertySetting, ShaForm, UnwrapCodeEvaluators } from '@/providers';
import { IToolboxComponent } from '@/interfaces';
import { migrateReadOnly } from '../_common-migrations/migrateSettings';
import { SettingOutlined } from '@ant-design/icons';
import { SettingComponentContainer } from './settingContainer/settingComponentContainer';
import { useActualContextData } from '@/hooks';
import { GetAvailableConstantsFunc } from "@/designer-components/codeEditor/interfaces";
import { isNonEmptyArray } from '@/utils/array';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';

export interface ISettingsComponentProps extends IConfigurableFormComponent {
  availableConstantsExpression?: string | GetAvailableConstantsFunc | undefined;
  components?: IConfigurableFormComponent[] | undefined;
  lazy?: boolean | undefined;
}

type SettingsComponentInnerProps = {
  model: UnwrapCodeEvaluators<ISettingsComponentProps>;
  nestedComponent: IConfigurableFormComponent;
};
const SettingsComponentInner = <TValue = unknown>({ model, nestedComponent }: SettingsComponentInnerProps): ReactNode => {
  const actualSourceComponent = useActualContextData(nestedComponent, model.readOnly);

  const component: IConfigurableFormComponent = useMemo(() => {
    return {
      ...actualSourceComponent,
      hideLabel: true,
      readOnly: model.readOnly,
      editMode: model.editMode,
      hidden: model.hidden,
    };
  }, [actualSourceComponent, model.readOnly, model.editMode, model.hidden]);

  return (
    <ConfigurableFormItem<TValue | IPropertySetting<TValue>> model={model} className="sha-js-label" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
      {(value, onChange) => (
        <SettingsControl<TValue>
          readOnly={model.readOnly}
          propertyName={model.propertyName ?? ""}
          mode="value"
          onChange={onChange}
          value={value ?? undefined}
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
};

const SettingsComponent: IToolboxComponent<ISettingsComponentProps> = {
  type: 'setting',
  isInput: true,
  isOutput: true,
  name: 'Setting',
  icon: <SettingOutlined />,
  Factory: ({ model }) => {
    const childComponents = ShaForm.useChildComponents(model.id);
    const firstChild = isNonEmptyArray(childComponents) ? childComponents[0] : undefined;

    return isDefined(firstChild) && !model.hidden && !isNullOrWhiteSpace(model.propertyName)
      ? <SettingsComponentInner model={model} nestedComponent={firstChild} />
      : undefined;
  },
  settingsFormMarkup: getSettings,
  migrator: (m) => m
    .add<ISettingsComponentProps>(0, (prev) => migrateReadOnly(prev)),
};

export default SettingsComponent;
