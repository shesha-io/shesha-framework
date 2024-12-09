import React, { CSSProperties, useEffect, useMemo, useState } from 'react';
import { IToolboxComponent } from '@/interfaces';
import { SwapOutlined } from '@ant-design/icons';
import ShaDrawer from './drawer';
import { IDrawerProps } from './models';
import { getStyle, pickStyleFromModel, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { IInputStyles, useFormData, useSheshaApplication } from '@/providers';
import { migrateNavigateAction } from '@/designer-components/_common-migrations/migrate-navigate-action';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { removeUndefinedProps } from '@/utils/object';
import { getBackgroundStyle } from '../_settings/utils/background/utils';
import { ValidationErrors } from '@/components';
import { isValidGuid } from '@/components/formDesigner/components/utils';
import { getBorderStyle } from '../_settings/utils/border/utils';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { defaultStyles } from '../textField/utils';

const DrawerComponent: IToolboxComponent<IDrawerProps> = {
  type: 'drawer',
  isInput: false,
  name: 'Drawer',
  icon: <SwapOutlined />,
  Factory: ({ model }) => {
    const { data } = useFormData();
    const { backendUrl, httpHeaders } = useSheshaApplication();
    const { size, border, background, style, ...props } = model;
    const jsStyle = getStyle(style, data);
    const [backgroundStyles, setBackgroundStyles] = useState({});
    const borderStyles = useMemo(() => getBorderStyle(border, jsStyle), [border]);

    useEffect(() => {
      const fetchStyles = async () => {
        const storedImageUrl =
          background?.storedFile?.id && background?.type === 'storedFile'
            ? await fetch(`${backendUrl}/api/StoredFile/Download?id=${background?.storedFile?.id}`, {
                headers: { ...httpHeaders, 'Content-Type': 'application/octet-stream' },
              })
                .then((response) => {
                  return response.blob();
                })
                .then((blob) => {
                  return URL.createObjectURL(blob);
                })
            : '';

        const style = await getBackgroundStyle(background, jsStyle, storedImageUrl);
        setBackgroundStyles(style);
      };

      fetchStyles();
    }, [background, background?.gradient?.colors, backendUrl, httpHeaders]);

    if (
      model?.background?.type === 'storedFile' &&
      model?.background.storedFile?.id &&
      !isValidGuid(model?.background.storedFile.id)
    ) {
      return <ValidationErrors error="The provided StoredFileId is invalid" />;
    }

    const styling = JSON.parse(model.stylingBox || '{}');
    const stylingBoxAsCSS = pickStyleFromModel(styling);

    const additionalStyles: CSSProperties = removeUndefinedProps({
      ...stylingBoxAsCSS,
      ...borderStyles,
      // ...fontStyles,
      ...backgroundStyles,
    });

    return <ShaDrawer style={additionalStyles} {...props} />;
  },
  settingsFormMarkup: (data) => getSettings(data),
  migrator: (m) =>
    m
      .add<IDrawerProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<IDrawerProps>(1, (prev) => ({
        ...prev,
        onOkAction: migrateNavigateAction(prev.onOkAction),
        onCancelAction: migrateNavigateAction(prev.onCancelAction),
      }))
      .add<IDrawerProps>(2, (prev) => ({ ...migrateFormApi.properties(prev) }))
      .add<IDrawerProps>(5, (prev) => {
        const styles: IInputStyles = {
          size: prev.size,
          width: prev.width,
          height: prev.height,
          hideBorder: prev.hideBorder,
          borderSize: prev.borderSize,
          borderRadius: prev.borderRadius,
          borderColor: prev.borderColor,
          fontSize: prev.fontSize,
          fontColor: prev.fontColor,
          backgroundColor: prev.backgroundColor,
          stylingBox: prev.stylingBox,
        };
        return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
      })
      .add<IDrawerProps>(6, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) })),
  initModel: (model) => {
    const customProps: IDrawerProps = {
      ...model,
    };
    return customProps;
  },
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
};

export default DrawerComponent;
