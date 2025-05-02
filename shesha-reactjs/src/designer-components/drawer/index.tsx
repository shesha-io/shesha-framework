import { migrateNavigateAction } from '@/designer-components/_common-migrations/migrate-navigate-action';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { useFormComponentStyles } from '@/hooks/formComponentHooks';
import { IToolboxComponent } from '@/interfaces';
import { IInputStyles } from '@/providers';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { removeUndefinedProps } from '@/utils/object';
import { SwapOutlined } from '@ant-design/icons';
import React, { CSSProperties } from 'react';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import ShaDrawer from './drawer';
import { IDrawerProps } from './models';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';

const DrawerComponent: IToolboxComponent<IDrawerProps> = {
  type: 'drawer',
  isInput: false,
  name: 'Drawer',
  icon: <SwapOutlined />,
  Factory: ({ model }) => {
    const { allStyles, style, headerStyles, footerStyles, ...props } = model;

    const {
      backgroundStyles: headerBackgroundStyles,
      shadowStyles: headerShadowStyles,
      jsStyle: headerJsStyle,
    } = useFormComponentStyles(headerStyles);
    const {
      backgroundStyles: footerBackgroundStyles,
      shadowStyles: footerShadowStyles,
      jsStyle: footerJsStyle,
    } = useFormComponentStyles(footerStyles);
    const jsStyle = allStyles?.jsStyle;
    const stylingBoxAsCSS = allStyles?.stylingBoxAsCSS;

    const borderStyles = allStyles?.borderStyles;
    const shadowStyles = allStyles?.shadowStyles;

    const additionalStyles: CSSProperties = removeUndefinedProps({
      ...shadowStyles,
      ...borderStyles,
      stylingBoxAsCSS,
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
        stylingBoxAsCSS={stylingBoxAsCSS}
        backgroundStyles={allStyles?.backgroundStyles}
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
        desktop: {
          ...migratePrevStyles(prev, defaultStyles()).desktop,
          headerStyles: defaultStyles(),
          footerStyles: defaultStyles(),
        },
        tablet: {
          ...migratePrevStyles(prev, defaultStyles()).tablet,
          headerStyles: defaultStyles(),
          footerStyles: defaultStyles(),
        },
        mobile: {
          ...migratePrevStyles(prev, defaultStyles()).mobile,
          headerStyles: defaultStyles(),
          footerStyles: defaultStyles(),
        },
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
