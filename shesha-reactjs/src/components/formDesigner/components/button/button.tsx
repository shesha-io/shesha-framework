import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { BorderOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../formItem';
import { getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import ConfigurableButton from './configurableButton';
import { useSheshaApplication, useForm, useFormData } from '../../../../providers';
import { IButtonGroupItemBaseV0, migrateV0toV1 } from './migrations/migrate-v1';
import { migrateV1toV2 } from './migrations/migrate-v2';
import { getSettings } from './settingsForm';
import { IButtonComponentProps } from './interfaces';
import { migratePropertyName, migrateCustomFunctions } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';

export type IActionParameters = [{ key: string; value: string }];

const ButtonComponent: IToolboxComponent<IButtonComponentProps> = {
  type: 'button',
  name: 'Button',
  icon: <BorderOutlined />,
  Factory: ({ model }) => {
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

    return (
      <ConfigurableFormItem model={fieldModel}>
        <ConfigurableButton
          {...restProps}
          block={restProps?.block}
          style={getStyle(style, data)}
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
      actionConfiguration: {
        actionName: 'Submit',
        actionOwner: 'Form',
        handleFail: false,
        handleSuccess: false,
      },
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
  ,
};

export default ButtonComponent;
