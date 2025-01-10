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
import { getBackgroundImageUrl, getBackgroundStyle } from '../_settings/utils/background/utils';
import { ValidationErrors } from '@/components';
import { isValidGuid } from '@/components/formDesigner/components/utils';
import { getBorderStyle } from '../_settings/utils/border/utils';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { getShadowStyle } from '../_settings/utils/shadow/utils';
import { defaultStyles, initialStyle } from './utils';

const DrawerComponent: IToolboxComponent<IDrawerProps> = {
  type: 'drawer',
  isInput: false,
  name: 'Drawer',
  icon: <SwapOutlined />,
  Factory: ({ model }) => {
    const { data } = useFormData();
    const { backendUrl, httpHeaders } = useSheshaApplication();
    const {
      size,
      border,
      background,
      headerBackground,
      style,
      shadow,
      headerShadow,
      headerStyle,
      footerStyle,
      footerBackground,
      footerShadow,
      ...props
    } = model;

    const jsStyle = getStyle(style, data);
    const [backgroundStyles, setBackgroundStyles] = useState({});
    const borderStyles = useMemo(() => getBorderStyle(border, jsStyle), [border]);
    const shadowStyles = useMemo(() => getShadowStyle(shadow), [shadow]);

    const headerJsStyle = getStyle(headerStyle, data);
    const [headerBackgroundStyles, setHeaderBackgroundStyles] = useState({});
    const headerShadowStyles = useMemo(() => getShadowStyle(headerShadow), [headerShadow]);

    const footerJsStyle = getStyle(footerStyle, data);
    const footerShadowStyles = useMemo(() => getShadowStyle(footerShadow), [footerShadow]);
    const [footerBackgroundStyles, setFooterBackgroundStyles] = useState({});

    useEffect(() => {
      const fetchStyles = async () => {
        getBackgroundImageUrl(background, backendUrl, httpHeaders)
          .then(async (url) => {
            return await getBackgroundStyle(background, jsStyle, url);
          })
          .then((style) => {
            setBackgroundStyles(style);
          });
      };
      fetchStyles();
    }, [background, backendUrl, httpHeaders]);

    useEffect(() => {
      const fetchStyles = async () => {
        getBackgroundImageUrl(headerBackground, backendUrl, httpHeaders)
          .then(async (url) => {
            return await getBackgroundStyle(headerBackground, headerJsStyle, url);
          })
          .then((style) => {
            setHeaderBackgroundStyles(style);
          });
      };
      fetchStyles();
    }, [headerBackground, backendUrl, httpHeaders]);

    useEffect(() => {
      const fetchStyles = async () => {
        getBackgroundImageUrl(footerBackground, backendUrl, httpHeaders)
          .then(async (url) => {
            return await getBackgroundStyle(footerBackground, footerJsStyle, url);
          })
          .then((style) => {
            setFooterBackgroundStyles(style);
          });
      };
      fetchStyles();
    }, [footerBackground, backendUrl, httpHeaders]);

    if (
      (model?.background?.type === 'storedFile' &&
        model?.background.storedFile?.id &&
        !isValidGuid(model?.background.storedFile.id)) ||
      (model?.headerBackground?.type === 'storedFile' &&
        model?.headerBackground.storedFile?.id &&
        !isValidGuid(model?.headerBackground.storedFile.id)) ||
      (model?.footerBackground?.type === 'storedFile' &&
        model?.footerBackground.storedFile?.id &&
        !isValidGuid(model?.footerBackground.storedFile.id))
    ) {
      return <ValidationErrors error="The provided StoredFileId is invalid" />;
    }

    const styling = JSON.parse(model.stylingBox || '{}');
    const stylingBoxAsCSS = pickStyleFromModel(styling);

    const additionalStyles: CSSProperties = removeUndefinedProps({
      ...shadowStyles,
      ...stylingBoxAsCSS,
      ...borderStyles,
      ...backgroundStyles,
      ...jsStyle,
    });

    const additionalHeaderStyles: CSSProperties = removeUndefinedProps({
      ...headerShadowStyles,
      ...headerBackgroundStyles,
      ...headerJsStyle,
    });

    const additionalFooterStyles: CSSProperties = removeUndefinedProps({
      ...footerShadowStyles,
      ...footerBackgroundStyles,
      ...footerJsStyle,
    });

    return (
      <ShaDrawer
        style={additionalStyles}
        headerStyle={additionalHeaderStyles}
        footerStyle={additionalFooterStyles}
        {...props}
      />
    );
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
      .add<IDrawerProps>(3, (prev) => {
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
      .add<IDrawerProps>(4, (prev) => ({
        ...migratePrevStyles(prev, defaultStyles()),
        desktop: { ...migratePrevStyles(prev, defaultStyles()).desktop, ...initialStyle },
        tablet: { ...migratePrevStyles(prev, defaultStyles()).tablet, ...initialStyle },
        mobile: { ...migratePrevStyles(prev, defaultStyles()).mobile, ...initialStyle },
      })),
  initModel: (model) => {
    const customProps: IDrawerProps = {
      ...model,
    };
    return customProps;
  },
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
};

export default DrawerComponent;
