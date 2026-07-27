import React, { useEffect, useRef } from 'react';
import { CheckSquareOutlined } from '@ant-design/icons';
import { Checkbox, CheckboxRef } from 'antd';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { DataTypes } from '@/interfaces/dataTypes';
import { IInputStyles } from '@/providers';
import { CheckboxComponentDefinition, ICheckboxComponentProps } from './interfaces';
import {
  migratePropertyName,
  migrateCustomFunctions,
  migrateReadOnly,
  migrateHiddenToVisible,
} from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { migratePrevStyles } from '../_common-migrations';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { getSettings } from './settingsForm';
import { useStyles } from './styles';
import { defaultStyles } from './utils';
import { getComponentEvents } from '../_common/events';
import { useComponentApi } from '@/providers/componentApi/provider';
import { useEffectOnce } from '@/hooks/useEffectOnce';
import { CheckboxFieldApi } from '../../componentsApi/componentApi';
import { isDefined } from '@/utils/nullables';

import apiCode from "../../componentsApi/componentApi.ts?raw";

const CheckboxComponent: CheckboxComponentDefinition = {
  allowInherit: true,
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
  Factory: ({ model, apiContext }) => {
    const componentApi = useComponentApi();
    const inputRef = useRef<CheckboxRef>(null);
    useEffect(() => {
      componentApi?.updateApi<CheckboxFieldApi>({
        id: model.id,
        componentName: model.componentName ?? "",
        level: 3,
        typeDefinition: { typeName: 'CheckboxFieldApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
        api: { focus: () => inputRef.current?.focus() },
      });
    }, [apiContext, componentApi, model.componentName, model.id]);
    useEffectOnce(() => () => componentApi?.removeApi(model.id));

    const { styles } = useStyles(model);

    return (
      <ConfigurableFormItem<boolean> model={model} valuePropName="checked">
        {(value, onChange, _, ctx) => {
          return (
            <Checkbox
              ref={inputRef}
              className={styles.checkbox}
              disabled={model.disabled === true || model.readOnly === true}
              checked={value ?? false}
              {...(isDefined(model.styleJson) ? { style: model.styleJson } : {})}
              onChange={(event) => {
                ctx?.handleEvent(event, { value: event.target.checked }, model.onChangeCustom);
                onChange(event.target.checked);
              }}
              {...getComponentEvents<boolean>(model, ['onFocus', 'onBlur', 'onClick', 'onMouseEnter', 'onMouseLeave', 'onKeyDown', 'onKeyUp'], ctx, value, DataTypes.boolean)}
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: getSettings,
  getDefaultStyles: () => defaultStyles(),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  migrator: (m) =>
    m
      .add<ICheckboxComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<ICheckboxComponentProps>(1, (prev) => migrateVisibility(prev))
      .add<ICheckboxComponentProps>(2, (prev) => migrateReadOnly(prev))
      .add<ICheckboxComponentProps>(3, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
      .add<ICheckboxComponentProps>(4, (prev, context) => {
        if (context.isNew === true) return prev;

        const styles: IInputStyles = {
          style: prev.style,
        };

        return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
      })
      .add<ICheckboxComponentProps>(5, (prev, context) => context.isNew === true
        ? prev
        : migratePrevStyles(prev, defaultStyles(prev)))
      .add<ICheckboxComponentProps>(6, (prev) => migrateHiddenToVisible(prev))
      .add<ICheckboxComponentProps>(7, (prev) => migratePermissionsToVisiblePermissions(prev)),
};

export default CheckboxComponent;
