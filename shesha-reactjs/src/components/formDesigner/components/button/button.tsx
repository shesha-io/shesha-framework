import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { BorderOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../formItem';
import { getStyle, validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import ConfigurableButton from './configurableButton';
import { useSheshaApplication, useForm, useFormData } from '../../../../providers';
import { IButtonGroupItemBaseV0, migrateV0toV1 } from './migrations/migrate-v1';
import { migrateV1toV2 } from './migrations/migrate-v2';
import { getSettings } from './settingsForm';
import { IButtonComponentProps } from './interfaces';
import { migratePropertyName, migrateCustomFunctions } from '../../../../designer-components/_common-migrations/migrateSettings';

export type IActionParameters = [{ key: string; value: string }];

const ButtonComponent: IToolboxComponent<IButtonComponentProps> = {
  type: 'button',
  name: 'Button',
  icon: <BorderOutlined />,
  factory: ({ style, ...model }: IButtonComponentProps) => {
    const { formMode } = useForm();
    const { data } = useFormData();

    const { anyOfPermissionsGranted } = useSheshaApplication();

    const fieldModel = {
      ...model,
      label: null,
      tooltip: null,
    };

    const grantedPermission = anyOfPermissionsGranted(model?.permissions || []);

    if (!grantedPermission && formMode !== 'designer') {
      return null;
    }

    return (
      <ConfigurableFormItem model={fieldModel}>
        <ConfigurableButton
          {...model}
          block={model?.block}
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
  ,
};

export default ButtonComponent;
