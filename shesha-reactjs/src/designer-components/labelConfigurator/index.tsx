import { ColumnWidthOutlined } from '@ant-design/icons';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import LabelConfiguratorComponent from './labelConfigurator';
import { LabelConfiguratorDefinition } from './interfaces';
import { getSettings } from './settings';
import { useStyles } from './styles';

const LabelConfigurator: LabelConfiguratorDefinition = {
  type: 'labelConfigurator',
  name: 'Label Configurator',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  icon: <ColumnWidthOutlined />,
  Factory: ({ model }) => {
    const { styles } = useStyles();

    return (
      <div className={styles.formItem}>
        <ConfigurableFormItem<boolean | undefined> model={model}>
          {(value) => (
            <LabelConfiguratorComponent
              labelAlignOptions={model.labelAlignOptions}
              readOnly={model.readOnly ?? false}
              label={model.label}
              placeholder={model.placeholder}
              hideLabel={value ?? false}
            />
          )}
        </ConfigurableFormItem>
      </div>
    );
  },
  settingsFormMarkup: getSettings,
};

export default LabelConfigurator;
