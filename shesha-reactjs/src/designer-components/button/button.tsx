import ConfigurableButton from './configurableButton';
import { useEffect, useRef } from 'react';
import { BorderOutlined } from '@ant-design/icons';
import { getSettings } from './settingsForm';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { IButtonComponentProps } from './interfaces';
import { IButtonGroupItemBaseV0, migrateV0toV1 } from './migrations/migrate-v1';
import { IToolboxComponent } from '@/interfaces';
import { makeDefaultActionConfiguration } from '@/interfaces/configurableAction';
import { migrateCustomFunctions, migrateHiddenToVisible, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateNavigateAction } from '@/designer-components/_common-migrations/migrate-navigate-action';
import { migrateV1toV2 } from './migrations/migrate-v2';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { defaultStyles } from './util';
import { getStringPropertyOrUndefined } from '@/utils/object';
import { getFullSizeWrapperDesignerStyle } from '@/components/formDesigner/utils/stylingUtils';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { useComponentApi } from '@/providers/componentApi/provider';
import { useEffectOnce } from '@/hooks/useEffectOnce';
import { useEvents } from '@/components/formDesigner/components/eventsAndApiValueProcessor';

import apiCode from "../../componentsApi/componentApi.ts?raw";
import { ButtonApi } from '@/componentsApi/componentApi';
import { getComponentEvents } from '../_common/events';

export type IActionParameters = [{ key: string; value: string }];

const ButtonComponent: IToolboxComponent<IButtonComponentProps> = {
  allowInherit: true,
  type: 'button',
  isInput: false,
  name: 'Button',
  getWrapperStyle: (model) => getFullSizeWrapperDesignerStyle(model),
  icon: <BorderOutlined />,
  Factory: ({ model }) => {
    const { style, ...restProps } = model;

    const inputRef = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
    const componentApi = useComponentApi();
    useEffect(() => {
      componentApi?.updateApi<ButtonApi>({
        id: model.id,
        componentName: model.componentName ?? "",
        level: 3,
        typeDefinition: { typeName: 'ButtonApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
        api: { focus: () => inputRef.current?.focus(), click: () => inputRef.current?.click() },
      });
    }, [componentApi, model.componentName, model.id]);
    useEffectOnce(() => () => componentApi?.removeApi(model.id));
    const handleEvent = useEvents<void>(model.componentName);

    return model.hidden === true ? null : (
      <ConfigurableButton
        {...restProps}
        ref={inputRef}
        additionalDomProperties={getComponentEvents<void, IButtonComponentProps>(model, ['onMouseEnter', 'onMouseMove', 'onMouseLeave'], { handleEvent })}
      />
    );
  },
  getDefaultStyles: () => defaultStyles({} as IButtonComponentProps),
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  initModel: (model) => {
    const buttonModel: IButtonComponentProps = {
      ...model,
      label: 'Submit',
      actionConfiguration: makeDefaultActionConfiguration({ actionName: 'Submit', actionOwner: 'Form' }),
      buttonType: 'default',
    };
    return buttonModel;
  },
  migrator: (m) =>
    m
      .add<IButtonGroupItemBaseV0>(0, (prev) => {
        const buttonModel: IButtonGroupItemBaseV0 = {
          ...prev,
          size: prev.size as IButtonGroupItemBaseV0['size'],
          hidden: prev.hidden ?? false,
          label: prev.label ?? 'Submit',
          sortOrder: 0,
          itemType: 'item',
          name: getStringPropertyOrUndefined(prev, "name") ?? "",
        };
        return buttonModel;
      })
      .add<IButtonComponentProps>(1, (p, c) => migrateV0toV1(p, c))
      .add<IButtonComponentProps>(2, migrateV1toV2)
      .add<IButtonComponentProps>(3, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<IButtonComponentProps>(4, (prev) => migrateVisibility(prev))
      .add<IButtonComponentProps>(5, (prev) => ({ ...prev, actionConfiguration: migrateNavigateAction(prev.actionConfiguration) }))
      .add<IButtonComponentProps>(6, (prev) => migrateReadOnly(prev, 'inherited'))
      .add<IButtonComponentProps>(7, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
      .add<IButtonComponentProps>(8, (prev, ctx) => ctx.isNew === true ? prev : {
        ...prev,
        desktop: { ...prev.desktop, buttonType: prev.buttonType || 'default' },
        mobile: { ...prev.mobile, buttonType: prev.buttonType || 'default' },
        tablet: { ...prev.tablet, buttonType: prev.buttonType || 'default' },
      })
      .add<IButtonComponentProps>(9, (prev, ctx) => ctx.isNew === true ? prev : { ...migratePrevStyles(prev, defaultStyles(prev)) })
      .add<IButtonComponentProps>(10, (prev) => migratePermissionsToVisiblePermissions(migrateHiddenToVisible(prev))),
};

export default ButtonComponent;
