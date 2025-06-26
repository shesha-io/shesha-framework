import ConfigurableButton from './configurableButton';
import React from 'react';
import { BorderOutlined } from '@ant-design/icons';
import { getSettings } from './settingsForm';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { IButtonComponentProps } from './interfaces';
import { IButtonGroupItemBaseV0, migrateV0toV1 } from './migrations/migrate-v1';
import { IToolboxComponent } from '@/interfaces';
import { makeDefaultActionConfiguration } from '@/interfaces/configurableAction';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateNavigateAction } from '@/designer-components/_common-migrations/migrate-navigate-action';
import { migrateV1toV2 } from './migrations/migrate-v2';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { defaultStyles } from './util';

export type IActionParameters = [{ key: string; value: string }];

const ButtonComponent: IToolboxComponent<IButtonComponentProps> = {
  type: 'button',
  isInput: false,
  name: 'Button',
  icon: <BorderOutlined />,
  Factory: ({ model, form }) => {
    const { style, ...restProps } = model;

    const finalStyle = {
      ...model.allStyles.dimensionsStyles,
      ...(['primary', 'default'].includes(model.buttonType) && model.allStyles.borderStyles),
      ...model.allStyles.fontStyles,
      ...(['dashed', 'default'].includes(model.buttonType) && model.allStyles.backgroundStyles),
      ...(['primary', 'default'].includes(model.buttonType) && model.allStyles.shadowStyles),
      ...model.allStyles.stylingBoxAsCSS,
      ...model.allStyles.jsStyle,
      justifyContent: model.font?.align
    };
    
    return (
      <ConfigurableButton
        {...restProps}
        readOnly={model.readOnly}
        block={restProps?.block}
        style={finalStyle}
        form={form}
      />
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
          hidden: prev.hidden,
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
      .add<IButtonComponentProps>(8, (prev) => ({
        ...prev,
        desktop: { ...prev.desktop, buttonType: prev.buttonType || 'default' },
        mobile: { ...prev.mobile, buttonType: prev.buttonType || 'default' },
        tablet: { ...prev.tablet, buttonType: prev.buttonType || 'default' }
      }))
      .add<IButtonComponentProps>(9, (prev) => ({ ...migratePrevStyles(prev, defaultStyles(prev)) })),
};

export default ButtonComponent;