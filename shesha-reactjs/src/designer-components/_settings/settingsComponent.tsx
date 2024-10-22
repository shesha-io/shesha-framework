import React, { useMemo } from 'react';
import SettingsControl from './settingsControl';
import { ConfigurableFormItem } from '@/components';
import { getSettings } from './settings';
import { IConfigurableFormComponent, ShaForm } from '@/providers';
import { IToolboxComponent } from '@/interfaces';
import { migrateReadOnly } from '../_common-migrations/migrateSettings';
import { SettingOutlined } from '@ant-design/icons';
import { SettingComponentContainer } from './settingContainer/settingComponentContainer';
import { getActualModel, useAvailableConstantsData, useDeepCompareMemo } from '@/index';

export interface ISettingsComponentProps extends IConfigurableFormComponent {
  components?: IConfigurableFormComponent[];
  availableConstantsExpression?: string;
  resultTypeExpression?: string;
  useAsyncEvaluation?: boolean;
}

const SettingsComponent: IToolboxComponent<ISettingsComponentProps> = {
  type: 'setting',
  isInput: true,
  isOutput: true,
  name: 'Setting',
  icon: <SettingOutlined />,
  Factory: ({ model }) => {

    const sourceComponent = ShaForm.useChildComponents(model.id)[0];

    const allData = useAvailableConstantsData();

    const actualSourceComponent = useDeepCompareMemo(() => {
      return getActualModel(sourceComponent, allData, model.readOnly);
    }, [sourceComponent, allData.lastUpdated]);

    const component: IConfigurableFormComponent = useMemo(() => {
      return {
        ...actualSourceComponent,
        hideLabel: true,
        readOnly: model?.readOnly,
        editMode: model.editMode,
        hidden: model.hidden
      };
    }, [model.hidden, model?.readOnly, model?.id, actualSourceComponent]);

    if (model.hidden) return null;
    
    return (
        <ConfigurableFormItem model={model} className='sha-js-label' >
            {(value, onChange) => (
                <SettingsControl
                    readOnly={model.readOnly}
                    propertyName={model.propertyName}
                    mode={'value'}
                    onChange={onChange}
                    value={value}
                    availableConstantsExpression={model.availableConstantsExpression}
                    resultTypeExpression={model.resultTypeExpression}
                    useAsyncEvaluation={model.useAsyncEvaluation}
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
  settingsFormMarkup: getSettings(),
  migrator: (m) => m
    .add<ISettingsComponentProps>(0, (prev) => migrateReadOnly(prev))
  ,
};

export default SettingsComponent;
