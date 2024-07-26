import ConfigurableButton from './configurableButton';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import React from 'react';
import { BorderOutlined } from '@ant-design/icons';
import { getSettings } from './settingsForm';
import { getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { IButtonComponentProps } from './interfaces';
import { IButtonGroupItemBaseV0, migrateV0toV1 } from './migrations/migrate-v1';
import { IToolboxComponent } from '@/interfaces';
import { makeDefaultActionConfiguration } from '@/interfaces/configurableAction';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateNavigateAction } from '@/designer-components/_common-migrations/migrate-navigate-action';
import { migrateV1toV2 } from './migrations/migrate-v2';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { useForm, useFormData, useSheshaApplication } from '@/providers';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { addPx } from './util';

export type IActionParameters = [{ key: string; value: string }];

const ButtonComponent: IToolboxComponent<IButtonComponentProps> = {
  type: 'button',
  name: 'Button',
  icon: <BorderOutlined />,
  Factory: ({ model, form }) => {
    const { style, ...restProps } = model;
    const { formMode } = useForm();
    const { data } = useFormData();

    const { anyOfPermissionsGranted } = useSheshaApplication();

    const fieldModel = {
      ...restProps,
      label: null,
      tooltip: null,
    };

    const grantedPermission = anyOfPermissionsGranted(restProps?.permissions || []);

    if (!grantedPermission && formMode !== 'designer') {
      return null;
    }

    const newStyles = {
      width: addPx(model.width),
      height: addPx(model.height),
      backgroundColor: model.backgroundColor,
      fontSize: addPx(model.fontSize),
      color: model.color,
      fontWeight: model.fontWeight,
      borderWidth: addPx(model.borderWidth),
      borderColor: model.borderColor,
      borderStyle: model.borderStyle,
      borderRadius: addPx(model.borderRadius)
    };

    return (
      <ConfigurableFormItem model={fieldModel}>
        <ConfigurableButton
          {...restProps}
          readOnly={model.readOnly}
          block={restProps?.block}
          style={{ ...getStyle(style, data), ...newStyles }}
          form={form}
        />
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: data => getSettings(data),
  validateSettings: model => validateConfigurableComponentSettings(getSettings(model), model),
  initModel: model => {
    const buttonModel: IButtonComponentProps = {
      ...model,
      label: 'Submit',
      actionConfiguration: makeDefaultActionConfiguration({ actionName: 'Submit', actionOwner: 'Form' }),
      buttonType: 'default',
    };
    return buttonModel;
  },
  migrator: m =>
    m
      .add<IButtonGroupItemBaseV0>(0, prev => {
        const buttonModel: IButtonGroupItemBaseV0 = {
          ...prev,
          hidden: prev.hidden as boolean,
          label: prev.label ?? 'Submit',
          sortOrder: 0,
          itemType: 'item',
          name: prev['name']
        };
        return buttonModel;
      })
      .add<IButtonComponentProps>(1, migrateV0toV1)
      .add<IButtonComponentProps>(2, migrateV1toV2)
      .add<IButtonComponentProps>(3, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<IButtonComponentProps>(4, (prev) => migrateVisibility(prev))
      .add<IButtonComponentProps>(5, (prev) => ({ ...prev, actionConfiguration: migrateNavigateAction(prev.actionConfiguration) }))
      .add<IButtonComponentProps>(6, (prev) => migrateReadOnly(prev, 'editable'))
      .add<IButtonComponentProps>(7, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))

  ,
};

export default ButtonComponent;