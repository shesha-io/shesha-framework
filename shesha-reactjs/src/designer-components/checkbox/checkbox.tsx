import React, { CSSProperties, useMemo } from 'react';
import { CheckSquareOutlined } from '@ant-design/icons';
import { Checkbox } from 'antd';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { DataTypes } from '@/interfaces/dataTypes';
import { IInputStyles } from '@/providers';
import { CheckboxComponentDefinition, ICheckboxComponentProps } from './interfaces';
import {
  migratePropertyName,
  migrateCustomFunctions,
  migrateReadOnly,
} from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { useStyles } from './styles';
import { migratePrevStyles } from '../_common-migrations';
import { defaultStyles } from './utils';

const CheckboxComponent: CheckboxComponentDefinition = {
  type: 'checkbox',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Checkbox',
  icon: <CheckSquareOutlined />,
  /**
   * Checkbox dimensions apply to the checkbox element itself via CSS,
   * not to the Form.Item wrapper. The wrapper should fill normally.
   */
  preserveDimensionsInDesigner: true,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.boolean,
  Factory: ({ model }) => {
    const finalStyle = useMemo<CSSProperties>(() => !model.enableStyleOnReadonly && model.readOnly
      ? {
        ...model.allStyles?.fontStyles,
        ...model.allStyles?.dimensionsStyles,
      }
      : model.allStyles?.fullStyle ?? {}, [model.enableStyleOnReadonly, model.readOnly, model.allStyles]);

    const { styles } = useStyles({ style: finalStyle });

    return (
      <ConfigurableFormItem<boolean> model={model} valuePropName="checked">
        {(value, onChange, _, ctx) => {
          return (
            <Checkbox
              className={styles.checkbox}
              disabled={model.readOnly ?? false}
              checked={value ?? false}
              onChange={(event) => {
                ctx?.handleEvent(event, event.target.checked, model.onChangeCustom);
                onChange(event.target.checked);
              }}
              onFocus={(event) => ctx?.handleEvent(event, event.target.checked, model.onFocusCustom)}
              onBlur={(event) => ctx?.handleEvent(event, event.target.checked, model.onBlurCustom)}
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  migrator: (m) =>
    m
      .add<ICheckboxComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<ICheckboxComponentProps>(1, (prev) => migrateVisibility(prev))
      .add<ICheckboxComponentProps>(2, (prev) => migrateReadOnly(prev))
      .add<ICheckboxComponentProps>(3, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
      .add<ICheckboxComponentProps>(4, (prev) => {
        const styles: IInputStyles = {
          style: prev.style,
        };

        return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
      })
      .add<ICheckboxComponentProps>(5, (prev) => (migratePrevStyles(prev, defaultStyles(prev)))),
};

export default CheckboxComponent;
