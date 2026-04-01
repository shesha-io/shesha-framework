import { ColumnWidthOutlined } from '@ant-design/icons';
import React from 'react';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import LabelConfiguratorComponent from './labelConfigurator';
import { LabelConfiguratorDefinition } from './interfaces';
import { getSettings } from './settings';
import { useStyles } from './styles';
import { IConfigurableFormComponent } from '@/providers';

const LabelConfigurator: LabelConfiguratorDefinition = {
  type: 'labelConfigurator',
  name: 'Label Configurator',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  icon: <ColumnWidthOutlined />,
  calculateModel: (_, allData) => ({ hideLabel: (allData.data as IConfigurableFormComponent)?.hideLabel }),
  Factory: ({ model, calculatedModel }) => {
    const { styles } = useStyles();

    return (
      <div className={styles.formItem}>
        <ConfigurableFormItem model={model}>
          {() => (
            <LabelConfiguratorComponent
              hideLabel={Boolean(calculatedModel.hideLabel)}
              labelAlignOptions={model.labelAlignOptions}
              readOnly={model.readOnly}
              label={model.label}
              placeholder={model.placeholder}
            />
          )}
        </ConfigurableFormItem>
      </div>
    );
  },
  settingsFormMarkup: getSettings,
};

export default LabelConfigurator;
