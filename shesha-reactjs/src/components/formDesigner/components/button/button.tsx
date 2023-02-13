import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../providers/form/models';
import { BorderOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../formItem';
import settingsFormJson from './settingsForm.json';
import { getStyle, validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import ConfigurableButton from './configurableButton';
import { IButtonGroupButton } from '../../../../providers/buttonGroupConfigurator/models';
import { useSheshaApplication, useForm } from '../../../..';
import { IButtonGroupItemBaseV0, migrateV0toV1 } from './migrations/migrate-v1';
import { migrateV1toV2 } from './migrations/migrate-v2';

export type IActionParameters = [{ key: string; value: string }];

export interface IButtonProps extends IButtonGroupButton, IConfigurableFormComponent {}

const settingsForm = settingsFormJson as FormMarkup;

const ButtonField: IToolboxComponent<IButtonProps> = {
  type: 'button',
  name: 'Button',
  icon: <BorderOutlined />,
  factory: ({ style, ...model }: IButtonProps) => {
    const { isComponentDisabled, isComponentHidden, formMode, formData } = useForm();
    const { anyOfPermissionsGranted } = useSheshaApplication();

    const { id, isDynamic, hidden, disabled } = model;

    const fieldModel = {
      ...model,
      label: null,
      tooltip: null,
    };

    const isHidden = isComponentHidden({ id, isDynamic, hidden });

    const isDisabled = isComponentDisabled({ id, isDynamic, disabled });

    const grantedPermission = anyOfPermissionsGranted(model?.permissions || []);

    if (!grantedPermission && formMode !== 'designer') {
      return null;
    }

    return (
      <ConfigurableFormItem model={fieldModel}>
        <ConfigurableButton
          formComponentId={model?.id}
          {...model}
          disabled={isDisabled}
          hidden={isHidden}
          style={getStyle(style, formData)}
        />
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  initModel: model => {
    const buttonModel: IButtonProps = {
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
        };
        return buttonModel;
      })
      .add<IButtonProps>(1, migrateV0toV1)
      .add<IButtonProps>(2, migrateV1toV2),
};

export default ButtonField;
