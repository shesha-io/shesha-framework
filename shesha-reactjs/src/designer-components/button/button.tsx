import ConfigurableButton from './configurableButton';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import React, { useEffect, useMemo, useState } from 'react';
import { BorderOutlined } from '@ant-design/icons';
import { getSettings } from './settingsForm';
import { getStyle, pickStyleFromModel, validateConfigurableComponentSettings } from '@/providers/form/utils';
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
import { removeNullUndefined } from '@/providers/utils';
import { getSizeStyle } from '../_settings/utils/dimensions/utils';
import { getFontStyle } from '../_settings/utils/font/utils';
import { getShadowStyle } from '../_settings/utils/shadow/utils';
import { getBorderStyle } from '../_settings/utils/border/utils';
import { getBackgroundStyle } from '../_settings/utils/background/utils';
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
    const { formMode } = useForm();
    const { data } = useFormData();
    const { backendUrl, httpHeaders } = useSheshaApplication();
    const { anyOfPermissionsGranted } = useSheshaApplication();

    const fieldModel = {
      ...restProps,
      label: null,
      tooltip: null,
    };

    const grantedPermission = anyOfPermissionsGranted(restProps?.permissions || []);

    const dimensions = model?.dimensions;
    const border = model?.border;
    const font = model?.font;
    const shadow = model?.shadow;
    const background = model?.background;

    const jsStyle = useMemo(() => getStyle(model.style, data), [model.styles]);
    const dimensionsStyles = useMemo(() => getSizeStyle(dimensions), [dimensions]);
    const borderStyles = useMemo(() => getBorderStyle(border, jsStyle), [border, jsStyle]);
    const fontStyles = useMemo(() => getFontStyle(font), [font]);
    const [backgroundStyles, setBackgroundStyles] = useState({});
    const shadowStyles = useMemo(() => getShadowStyle(shadow), [shadow]);
    const styling = JSON.parse(model.stylingBox || '{}');
    const stylingBoxAsCSS = pickStyleFromModel(styling);

    useEffect(() => {
      const fetchStyles = async () => {

        const storedImageUrl = background?.storedFile?.id && background?.type === 'storedFile'
          ? await fetch(`${backendUrl}/api/StoredFile/Download?id=${background?.storedFile?.id}`,
            { headers: { ...httpHeaders, "Content-Type": "application/octet-stream" } })
            .then((response) => {
              return response.blob();
            })
            .then((blob) => {
              return URL.createObjectURL(blob);
            }) : '';

        const style = await getBackgroundStyle(background, jsStyle, storedImageUrl);
        setBackgroundStyles(style);
      };

      fetchStyles();
    }, [background, background?.gradient?.colors, backendUrl, httpHeaders, jsStyle]);


    if (!grantedPermission && formMode !== 'designer') {
      return null;
    }

    const newStyles = {
      ...dimensionsStyles,
      ...(['primary', 'default'].includes(model.buttonType) && borderStyles),
      ...fontStyles,
      ...(['primary', 'default'].includes(model.buttonType) && backgroundStyles),
      ...(['primary', 'default'].includes(model.buttonType) && shadowStyles),
      ...stylingBoxAsCSS,
      ...jsStyle
    };

    return (
      <ConfigurableFormItem model={fieldModel}>
        <ConfigurableButton
          {...restProps}
          readOnly={model.readOnly}
          block={restProps?.block}
          style={{ ...removeNullUndefined(newStyles), ...getStyle(style, data) }}
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
      .add<IButtonComponentProps>(8, (prev) => ({ ...migratePrevStyles(prev, defaultStyles(prev)) })),
};

export default ButtonComponent;