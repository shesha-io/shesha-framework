import { HeartOutlined } from '@ant-design/icons';
import { useEffect, useRef } from 'react';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { DataTypes } from '@/interfaces/dataTypes';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { IconPickerWrapper } from './iconPickerWrapper';
import { IconPickerComponentDefinition, IIconPickerComponentProps, IIconPickerComponentPropsV1 } from './interfaces';
import {
  migrateCustomFunctions,
  migrateHiddenToVisible,
  migratePropertyName,
  migrateReadOnly,
  migrateStylingBoxToJson,
} from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { legacyColor2Hex } from '@/designer-components/_common-migrations/migrateColor';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';
import { useStyles } from '@/components/iconPicker/styles/styles';
import { useComponentApi } from '@/providers/componentApi/provider';
import { useEffectOnce } from '@/hooks/useEffectOnce';
import { IconPickerApi } from '../../componentsApi/componentApi';
import { ALL_INPUT_EVENTS_WITHOUT_CHANGE_AND_DOUBLE_CLICK, getComponentEvents } from '../_common/events';

import apiCode from "../../componentsApi/componentApi.ts?raw";

const IconPickerComponent: IconPickerComponentDefinition = {
  allowInherit: true,
  type: 'iconPicker',
  name: 'Icon',
  icon: <HeartOutlined />,
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  preserveDimensionsInDesigner: true,
  Factory: ({ model }) => {
    const componentApi = useComponentApi();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      componentApi?.updateApi<IconPickerApi>({
        id: model.id,
        componentName: model.componentName ?? "",
        level: 3,
        typeDefinition: { typeName: 'IconPickerApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
        // The picker has no component-specific API members beyond the standard input set, and it
        // renders no natively focusable control — `focus` moves focus to the trigger container.
        api: { focus: () => containerRef.current?.focus() },
      });
    }, [componentApi, model.componentName, model.id]);
    useEffectOnce(() => () => componentApi?.removeApi(model.id));

    const { styles, cx } = useStyles(model);

    return (
      <ConfigurableFormItem<string> model={model}>
        {(value, onChange, _, ctx) => (
          <div
            ref={containerRef}
            tabIndex={model.readOnly === true || model.disabled === true ? -1 : 0}
            {...getComponentEvents<string>(model, ALL_INPUT_EVENTS_WITHOUT_CHANGE_AND_DOUBLE_CLICK, ctx, value, DataTypes.string)}
          >
            <IconPickerWrapper
              className={cx(styles.iconPickerStyles, { [styles.disabled]: model.disabled === true })}
              value={value}
              defaultValue={model.defaultIcon}
              description={model.description}
              readOnly={model.readOnly}
              disabled={model.disabled}
              selectBtnSize={model.size}
              onChange={(newValue) => {
                const newIcon = newValue ?? undefined;
                ctx?.handleEvent(undefined, { value: newIcon }, model.onChangeCustom);
                onChange(newIcon);
              }}
            />
          </div>
        )}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: getSettings,
  getDefaultStyles: () => defaultStyles(),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  migrator: (m) =>
    m
      .add<IIconPickerComponentPropsV1>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<IIconPickerComponentPropsV1>(1, (prev) => migrateVisibility(prev))
      .add<IIconPickerComponentPropsV1>(2, (prev) => ({ ...prev, color: legacyColor2Hex(prev.color) }))
      .add<IIconPickerComponentPropsV1>(3, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
      .add<IIconPickerComponentPropsV1>(4, (prev, context) => context.isNew === true
        ? prev
        : { ...migratePrevStyles(prev, defaultStyles()) })
      .add<IIconPickerComponentPropsV1>(5, (prev) => {
        prev.hideLabel = true;
        return prev;
      })
      .add<IIconPickerComponentPropsV1>(6, (prev) => migrateReadOnly(prev))
      .add<IIconPickerComponentProps>(7, (prev) => migratePermissionsToVisiblePermissions(migrateHiddenToVisible(migrateStylingBoxToJson(prev)))),
  previewConfiguration: {
    type: 'iconPicker',
    id: 'iconPicker',
    propertyName: `iconPickerAppearance`,
    label: `Icon Label`,
    defaultIcon: 'HeartOutlined',
    version: 'latest',
  },
};

export default IconPickerComponent;
