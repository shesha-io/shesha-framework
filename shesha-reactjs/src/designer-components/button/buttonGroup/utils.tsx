import { ButtonGroupItemProps, IButtonGroupItem, isGroup, isItem } from '@/providers/buttonGroupConfigurator/models';
import { IStyleValue } from '@/providers/form/models';
import { deepMergeValues, getStringPropertyOrUndefined } from '@/utils/object';
import * as React from 'react';
import { MenuButton, MenuItem, VisibilityEvaluator } from './models';
import { IApplicationContext } from '@/providers/form/utils';
import { addPx } from '@/utils/style';
import { RenderButton } from './renderButton';
import { nanoid } from '@/utils/uuid';
import { isDefined, isNullOrWhiteSpace } from '@/utils';
import { IToolboxComponent } from '@/interfaces';

export const createMenuItem = (
  props: MenuButton,
  getIsVisible: VisibilityEvaluator,
  appContext: IApplicationContext,
  buttonComponent: IToolboxComponent,
): MenuItem => {
  const isDivider = isItem(props) && (props.itemSubType === 'line' || props.itemSubType === 'separator');

  const childItems = props.childItems && props.childItems.length > 0
    ? props.childItems.filter(getIsVisible).map((props) => createMenuItem(props, getIsVisible, appContext, buttonComponent))
    : undefined;

  // for backward compatibility
  const defaultStyledItem = isGroup(props) ? deepMergeValues(defaultGroupStyles(), props) : props;

  return isDivider === true
    ? { key: props.id, type: 'divider', style: { height: addPx(props.dividerWidth, appContext), backgroundColor: props.dividerColor } }
    : getButtonGroupMenuItem(
      <RenderButton props={defaultStyledItem} uuid={props.id} buttonComponent={buttonComponent} />,
      props.id,
      props.readOnly,
      childItems,
    );
};


export function getButtonGroupMenuItem(
  label: React.ReactNode,
  key: React.Key,
  disabled = false,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    children,
    label,
    className: 'sha-button-menu',
    disabled,
  } as MenuItem;
};

export const getDefaultItems = (): IButtonGroupItem[] => ([
  {
    id: nanoid(), itemType: 'item', sortOrder: 0, name: 'button1', label: 'Button 1', itemSubType: 'button', buttonType: 'primary', editMode: 'inherited',
    background: { type: 'color', repeat: 'no-repeat', size: 'cover', position: 'center', gradient: { direction: 'to right', colors: [] } },
    font: { weight: '400', size: 14, align: 'center', type: 'Segoe UI' },
    dimensions: { width: 'auto', height: '32px', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
    border: { radiusType: 'all', borderType: 'all', hideBorder: false, border: { all: { width: '1px', style: 'solid' } }, radius: { all: 8 } },
    shadow: { spreadRadius: 0, blurRadius: 0, color: '#000', offsetX: 0, offsetY: 0 },
  },
  {
    id: nanoid(), itemType: 'item', sortOrder: 1, name: 'button2', label: 'Button 2', itemSubType: 'button', buttonType: 'default', editMode: 'inherited',
    background: { type: 'color', repeat: 'no-repeat', size: 'cover', position: 'center', gradient: { direction: 'to right', colors: [] } },
    font: { weight: '400', size: 14, align: 'center', type: 'Segoe UI' },
    dimensions: { width: 'auto', height: '32px', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
    border: { radiusType: 'all', borderType: 'all', hideBorder: false, border: { all: { width: '1px', style: 'solid' } }, radius: { all: 8 } },
    shadow: { spreadRadius: 0, blurRadius: 0, color: '#000', offsetX: 0, offsetY: 0 },
  },
]);

export const defaultStyles = (prev: ButtonGroupItemProps): IStyleValue => {
  return {
    background: { type: 'color', color: prev.backgroundColor },
    font: {
      color: prev.buttonType === 'primary'
        ? '#fff'
        : getStringPropertyOrUndefined(prev, "fontColor") ?? '',
      weight: prev.fontWeight ?? '400',
      size: prev.fontSize ?? 14,
      type: getStringPropertyOrUndefined(prev, "fontFamily") ?? 'Segoe UI',
      align: 'center',
    },
    border: {
      borderType: 'all',
      radiusType: 'all',
      border: {
        all: {
          width: prev.borderWidth ?? '1px',
          style: prev.borderStyle ?? 'solid',
          color: prev.borderColor ?? '#d9d9d9',
        },
      },
      radius: { all: isDefined(prev.borderRadius) ? prev.borderRadius : prev.size === 'small' ? 4 : 8 },
    },
    shadow: { spreadRadius: 0, blurRadius: 0, color: '#000', offsetX: 0, offsetY: 0 },
    dimensions: {
      width: prev.block === true ? '100%' : 'auto',
      height: !isNullOrWhiteSpace(prev.height) ? prev.height : prev.size === 'small' ? '24px' : prev.size === 'large' ? '40px' : '32px',
      minHeight: '0px',
      maxHeight: 'auto',
      minWidth: '0px',
      maxWidth: 'auto',
    },
    style: prev.style ?? '',
  };
};

export const defaultGroupStyles = (): IStyleValue => {
  return {
    background: { type: 'color' },
    font: { weight: '400', size: 14, type: 'Segoe UI', align: 'center' },
    border: { borderType: 'all', radiusType: 'all', border: { all: { width: '1px', style: 'solid', color: '#d9d9d9' } }, radius: { all: 8 } },
    shadow: { spreadRadius: 0, blurRadius: 0, color: '#000', offsetX: 0, offsetY: 0 },
    dimensions: { width: 'auto', height: '32px', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
  };
};

export const defaultContainerStyles = (): IStyleValue & { buttonGroupStyle: 'horizontal' | 'menu' } => {
  return {
    buttonGroupStyle: 'horizontal',
    background: { type: 'color' },
    border: {
      border: { all: { width: '1px', style: 'none', color: '#d9d9d9' } },
      radius: { all: 8 },
      hideBorder: false,
      borderType: 'all',
    },
    shadow: { spreadRadius: 0, blurRadius: 0, color: '#000', offsetX: 0, offsetY: 0 },
    dimensions: { width: 'auto', height: 'auto', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
  };
};
