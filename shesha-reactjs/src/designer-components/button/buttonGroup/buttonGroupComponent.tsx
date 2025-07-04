import React from 'react';
import { ButtonGroup } from './buttonGroup';
import { ButtonGroupItemProps, isGroup, isItem } from '@/providers/buttonGroupConfigurator/models';
import { GroupOutlined } from '@ant-design/icons';
import { IButtonGroupComponentProps } from './models';
import { IToolboxComponent } from '@/interfaces';
import { migrateButtonsNavigateAction } from './migrations/migrateButtonsNavigateAction';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateV0toV1 } from './migrations/migrate-v1';
import { migrateV1toV2 } from './migrations/migrate-v2';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '@/designer-components/_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { migratePrevStyles, migrateStyles } from '@/designer-components/_common-migrations/migrateStyles';
import { defaultContainerStyles, defaultStyles } from './utils';

const ButtonGroupComponent: IToolboxComponent<IButtonGroupComponentProps> = {
  type: 'buttonGroup',
  isInput: false,
  name: 'Button Group',
  icon: <GroupOutlined />,
  Factory: ({ model, form }) => {
    return model.hidden ? null : <ButtonGroup {...model} styles={model.allStyles.fullStyle} form={form} />;
  },
  actualModelPropertyFilter: (name) => name !== 'items', // handle items later to use buttonGroup's readOnly setting
  migrator: (m) => m
    .add<IButtonGroupComponentProps>(0, (prev) => {
      return {
        ...prev,
        items: prev['items'] ?? [],
      };
    })
    .add<IButtonGroupComponentProps>(1, migrateV0toV1)
    .add<IButtonGroupComponentProps>(2, migrateV1toV2)
    .add<IButtonGroupComponentProps>(3, (prev) => ({ ...prev, isInline: prev['isInline'] ?? true, })) /* default isInline to true if not specified */
    .add<IButtonGroupComponentProps>(4, (prev) => {
      const newModel = { ...prev };
      newModel.items = prev.items?.map((item) => migrateCustomFunctions(item as any));
      return migratePropertyName(migrateCustomFunctions(newModel));
    })
    .add<IButtonGroupComponentProps>(5, (prev) => {
      const newModel = { ...prev };

      const updateItemDefaults = (item: ButtonGroupItemProps): ButtonGroupItemProps => {
        if (isItem(item) && item.itemSubType === 'line')
          return { ...item, itemSubType: 'separator', buttonType: item.buttonType ?? 'link' }; // remove `line`, it works by the same way as `separator`

        if (isGroup(item) && typeof (item.hideWhenEmpty) === 'undefined')
          return {
            ...item,
            buttonType: item.buttonType ?? 'link',
            hideWhenEmpty: true, // set default `hideWhenEmpty` to true by default
            childItems: (item.childItems ?? []).map(updateItemDefaults),
          };

        return { ...item };
      };

      newModel.items = prev.items?.map(updateItemDefaults);
      return newModel;
    })
    .add<IButtonGroupComponentProps>(6, (prev) => migrateVisibility(prev))
    .add<IButtonGroupComponentProps>(7, (prev) => migrateButtonsNavigateAction(prev))
    .add<IButtonGroupComponentProps>(8, (prev) => {
      const newModel = { ...prev, editMode: 'editable' } as IButtonGroupComponentProps;

      const updateItems = (item: ButtonGroupItemProps): ButtonGroupItemProps => {
        const newItem = migrateReadOnly(item, 'inherited');
        if (Array.isArray(newItem['childItems']))
          newItem['childItems'] = newItem['childItems'].map(updateItems);
        return newItem;
      };

      newModel.items = newModel.items.map(updateItems);
      return newModel;
    })
    .add<IButtonGroupComponentProps>(9, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
    .add<IButtonGroupComponentProps>(10, (prev) => {
      const setDownIcon = (item: ButtonGroupItemProps): ButtonGroupItemProps => {
        if (isGroup(item)) {
          item.downIcon = !item.downIcon ? "DownOutlined" : item.downIcon;
          item.childItems = (item.childItems ?? []).map(setDownIcon);
        }
        return item;
      };
      return {
        ...prev,
        items: prev.items.map(setDownIcon),
      };
    })
    .add<IButtonGroupComponentProps>(11, (prev) => ({ ...migratePrevStyles(prev, defaultContainerStyles()) }))
    .add<IButtonGroupComponentProps>(12, (prev) => {
      const newModel = { ...prev, gap: prev.spaceSize ?? 'middle' };
      const updateItems = (item: ButtonGroupItemProps): ButtonGroupItemProps => {
        const newItem = { ...item, ...migrateStyles({ ...item, size: item.size ?? prev.size }, defaultStyles({ ...item, size: item.size ?? prev.size })) };
        if (Array.isArray(newItem['childItems']))
          newItem['childItems'] = newItem['childItems'].map(updateItems);
        return newItem;
      };

      newModel.items = newModel.items.map(updateItems);
      return newModel;
    })
    .add<IButtonGroupComponentProps>(13, (prev) => {
      const newModel = { ...prev };
      newModel.items = prev.items;
      return newModel;
    }),
  settingsFormMarkup: (props) => getSettings(props),
};

export default ButtonGroupComponent;