import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import { CheckSquareOutlined } from '@ant-design/icons';
import { Checkbox, CheckboxProps } from 'antd';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { DataTypes } from '@/interfaces/dataTypes';
import { IInputStyles } from '@/providers';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { ICheckboxComponentProps } from './interfaces';
import {
  migratePropertyName,
  migrateCustomFunctions,
  migrateReadOnly,
} from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { IEventHandlers, getAllEventHandlers } from '@/components/formDesigner/components/utils';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { boxDefaultStyles, defaultStyles } from './utils';
import { useStyles } from './styles';
import { useFormComponentStyles } from '@/hooks/formComponentHooks';

interface ICheckboxComponentCalulatedValues {
  eventHandlers?: IEventHandlers<any>;
}

interface ExtendedCheckboxProps extends CheckboxProps {
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onChange?: (e: CheckboxChangeEvent) => void;
}

const CheckboxComponent: IToolboxComponent<ICheckboxComponentProps, ICheckboxComponentCalulatedValues> = {
  type: 'checkbox',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Checkbox',
  icon: <CheckSquareOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.boolean,
  calculateModel: (model, allData) => ({ eventHandlers: getAllEventHandlers(model, allData) }),
  Factory: ({ model, calculatedModel }) => {
    const boxDimensions = useFormComponentStyles(model.box).dimensionsStyles;
    const {styles} = useStyles({style: {...model.allStyles.fullStyle, ...boxDimensions}});

    return (
      <ConfigurableFormItem model={model} valuePropName="checked" initialValue={model?.defaultValue}>
        {(value, onChange) => {
          const events: ExtendedCheckboxProps = {
            onBlur: calculatedModel.eventHandlers.onBlur,
            onFocus: calculatedModel.eventHandlers.onFocus,
            onChange: (e: CheckboxChangeEvent) => {
              calculatedModel.eventHandlers.onChange({ value: e.target.checked }, e);
              if (typeof onChange === 'function') onChange(e);
            }
          };

          return model.readOnly
            ? <ReadOnlyDisplayFormItem checked={value} type="checkbox" disabled={model.readOnly} style={!model.enableStyleOnReadonly && model.readOnly ? {} : model.allStyles.fullStyle} />
            : <Checkbox className={styles.checkbox} disabled={model.readOnly} style={model.allStyles.jsStyle} checked={value} {...events} />;
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
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
      .add<ICheckboxComponentProps>(7, (prev) => ({ ...prev, desktop: { ...defaultStyles(), box: boxDefaultStyles() }, mobile: { ...defaultStyles() }, tablet: { ...defaultStyles() } })),
};

export default CheckboxComponent;
