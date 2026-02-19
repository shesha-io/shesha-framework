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
import { useShaFormInstance } from '@/providers';
import { dimensionUtils } from '@/components/formDesigner/utils/dimensionUtils';

export type IActionParameters = [{ key: string; value: string }];

const ButtonComponent: IToolboxComponent<IButtonComponentProps> = {
  type: 'button',
  isInput: false,
  name: 'Button',
  /**
   * Custom dimension calculation for designer mode.
   * - Buttons with 'auto' width -> wrapper uses 'max-content' (shrinks to fit), button fills 100%
   * - Buttons with absolute/relative width -> wrapper gets that width, button fills 100%
   */
  getDesignerDimensions: (originalDims, deviceDims) => {
    const isAutoWidth = originalDims?.width === 'auto';
    if (isAutoWidth) {
      // WYSIWYG: Wrapper shrinks to fit content, button fills wrapper
      return { ...deviceDims, width: 'max-content' };
    }

    // Default: fill the wrapper
    return deviceDims;
  },
  icon: <BorderOutlined />,
  Factory: ({ model, form }) => {
    const shaForm = useShaFormInstance();
    const { style, ...restProps } = model;

    const isDesignerMode = shaForm?.formMode === 'designer';

    // Merge base styles with designer dimensions
    // Button preserves its original dimensions in designer mode
    const finalStyle = dimensionUtils.mergeWithDesignerDimensions(
      {
        ...model.allStyles?.dimensionsStyles,
        ...(['primary', 'default'].includes(model.buttonType) && !model.readOnly && model.allStyles?.borderStyles),
        ...model.allStyles?.fontStyles,
        ...(['dashed', 'default'].includes(model.buttonType) && !model.readOnly && model.allStyles?.backgroundStyles),
        ...(['primary', 'default'].includes(model.buttonType) && model.allStyles?.shadowStyles),
        ...model.allStyles?.stylingBoxAsCSS,
        ...model.allStyles?.jsStyle,
        justifyContent: model.font?.align,
      },
      isDesignerMode,
      true, // Preserve original dimensions in designer mode
    );

    return model.hidden ? null : (
      <ConfigurableButton
        {...restProps}
        readOnly={model.readOnly}
        block={restProps?.block}
        style={finalStyle}
        form={form}
      />
    );
  },
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
          hidden: prev.hidden,
          label: prev.label ?? 'Submit',
          sortOrder: 0,
          itemType: 'item',
          name: prev['name'],
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
        tablet: { ...prev.tablet, buttonType: prev.buttonType || 'default' },
      }))
      .add<IButtonComponentProps>(9, (prev) => ({ ...migratePrevStyles(prev, defaultStyles(prev)) })),
};

export default ButtonComponent;
