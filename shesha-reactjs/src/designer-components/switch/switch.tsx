import { useEffect, useRef } from 'react';
import { SwitcherOutlined } from '@ant-design/icons';
import { Switch } from 'antd';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';

import { DataTypes } from '@/interfaces/dataTypes';
import { IInputStyles } from '@/providers';
import { ISwitchComponentProps, SwitchComponentDefinition } from './interfaces';
import {
  migratePropertyName,
  migrateCustomFunctions,
  migrateReadOnly,
  migrateHiddenToVisible,
  migrateStylingBoxToJson,
} from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { getSettings } from './settingsForm';
import { useStyles } from './styles';
import { defaultHandleStyles, defaultStyles } from './utils';
import { getComponentEvents } from '../_common/events';
import { useComponentApiProvider } from '@/providers/componentApi/provider';
import { useEffectOnce } from '@/hooks/useEffectOnce';
import { SwitchFieldApi } from '../../componentsApi/componentApi';
import { isDefined } from '@/utils/nullables';

import apiCode from "../../componentsApi/componentApi.ts?raw";

const SwitchComponent: SwitchComponentDefinition = {
  styleGroup: 'common',
  allowInherit: true,
  type: 'switch',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Switch',
  icon: <SwitcherOutlined />,
  /**
   * Switch dimensions apply to the switch track itself via CSS,
   * not to the Form.Item wrapper. The wrapper should fill normally.
   */
  preserveDimensionsInDesigner: true,
  // NB: `dataTypeSupported` is deliberately not declared. Checkbox already claims
  // DataTypes.boolean for metadata-driven editor selection, and Switch is registered
  // ahead of it in the toolbox, so declaring it here would silently make Switch the
  // default editor for every boolean property.
  Factory: ({ model, apiContext }) => {
    const componentApi = useComponentApiProvider();
    const inputRef = useRef<HTMLButtonElement>(null);
    useEffect(() => {
      componentApi?.updateApi<SwitchFieldApi>({
        id: model.id,
        componentName: model.componentName ?? "",
        level: 3,
        typeDefinition: { typeName: 'SwitchFieldApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
        api: { focus: () => inputRef.current?.focus() },
      });
    }, [apiContext, componentApi, model.componentName, model.id]);
    useEffectOnce(() => () => componentApi?.removeApi(model.id));

    const { styles } = useStyles(model);

    return (
      <ConfigurableFormItem<boolean> model={model} valuePropName="checked">
        {(value, onChange, _, ctx) => {
          return (
            <Switch
              ref={inputRef}
              className={styles.switchStyles}
              disabled={model.disabled === true || model.readOnly === true}
              checked={value ?? false}
              {...(isDefined(model.styleCss) ? { style: model.styleCss } : {})}
              onChange={(checked, event) => {
                ctx?.handleEvent(event, { value: checked }, model.onChangeCustom);
                onChange(checked);
              }}
              {...getComponentEvents<boolean>(model, ['onFocus', 'onBlur', 'onMouseEnter', 'onMouseLeave', 'onKeyDown', 'onKeyUp'], ctx, value, DataTypes.boolean)}
              // antd's Switch onClick is `(checked, event)`, not a DOM handler, so it cannot come
              // from `getComponentEvents` like the rest — wire it explicitly with the checked state.
              // Declared after the spread so this signature wins.
              onClick={(checked, event) => ctx?.handleEvent(event, { value: checked }, model.onClickCustom)}
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: getSettings,
  // Two independent style sets: the root styles the track, `handleStyles` the handle.
  getDefaultStyles: () => ({
    ...defaultStyles(),
    handleStyles: defaultHandleStyles(),
  }),

  migrator: (m) =>
    m
      .add<ISwitchComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<ISwitchComponentProps>(1, (prev) => migrateVisibility(prev))
      .add<ISwitchComponentProps>(2, (prev) => migrateReadOnly(prev))
      .add<ISwitchComponentProps>(3, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
      .add<ISwitchComponentProps>(6, (prev, context) => {
        if (context.isNew === true) return prev;

        const styles: IInputStyles = {
          size: prev.size,
          style: prev.style,
        };

        return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
      })
      .add<ISwitchComponentProps>(7, (prev, context) => context.isNew === true
        ? prev
        // Seed the handle style set alongside the track styles, so upgraded forms get a
        // styled handle rather than an unstyled one.
        : { ...migratePrevStyles(prev, defaultStyles(prev)), handleStyles: prev.handleStyles ?? defaultHandleStyles() })
      .add<ISwitchComponentProps>(8, (prev) => migratePermissionsToVisiblePermissions(migrateHiddenToVisible(migrateStylingBoxToJson(prev)))),
  previewConfiguration: {
    type: 'switch',
    id: 'switch',
    propertyName: `switchAppearance`,
    label: `Switch Label`,
    version: 'latest',
  },
};

export default SwitchComponent;
