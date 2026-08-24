import { ButtonGroup } from './buttonGroup';
import { ButtonGroupItemProps, isGroup, isItem } from '@/providers/buttonGroupConfigurator/models';
import { GroupOutlined } from '@ant-design/icons';
import { IButtonGroupComponentProps, isButtonGroupComponent } from './models';
import { IToolboxComponent } from '@/interfaces';
import { migrateButtonsNavigateAction } from './migrations/migrateButtonsNavigateAction';
import { migrateCustomFunctions, migrateHiddenToVisible, migratePropertyName, migrateReadOnly, migrateStylingBoxToJson } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateV0toV1 } from './migrations/migrate-v1';
import { migrateV1toV2 } from './migrations/migrate-v2';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '@/designer-components/_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { migratePrevStyles, migrateStyles } from '@/designer-components/_common-migrations/migrateStyles';
import { defaultContainerStyles, defaultStyles, getDefaultItems } from './utils';
import { migrateButtonGroupDynamicItems } from '@/designer-components/_common-migrations/migrateButtonGroupDynamicItems';
import { isDefined } from '@/utils/nullables';
import { getFullSizeWrapperDesignerStyle } from '@/components/formDesigner/utils/stylingUtils';
import { IApplicationContext, standardActualModelPropertyFilter } from '@/providers/form/utils';
import { DynamicActionsEvaluator } from '@/providers/dynamicActions/evaluator';
import { unwrapModel } from '@/hooks/formComponentHooks';
import { TypedProxy } from '@/providers/form/observableProxy';
import { migratePermissionsToVisiblePermissions } from '@/designer-components/_common-migrations/migratePermissionsToVisiblePermissions';

const ButtonGroupComponent: IToolboxComponent<IButtonGroupComponentProps> = {
  allowInherit: true,
  type: 'buttonGroup',
  isInput: false,
  name: 'Button Group',
  icon: <GroupOutlined />,
  // Button Group preserves its original dimensions in designer mode (like image component)
  preserveDimensionsInDesigner: true,
  getWrapperStyle: (model) => getFullSizeWrapperDesignerStyle(model),
  Factory: ({ model }) => {
    return model.hidden === true ? null : (
      <DynamicActionsEvaluator items={model.items}>
        {(items) => <ButtonGroup {...model} items={items} />}
      </DynamicActionsEvaluator>
    );
  },
  // handle items later to use buttonGroup's readOnly setting
  actualModelPropertyFilter: (name) => name !== 'items',
  // handle items to use buttonGroup's readOnly setting
  actualModelFilteredPropertyProcessor: (model, propertyName, value, allData) => {
    if (propertyName === 'items') {
      if (isButtonGroupComponent(model)) {
        const items: ButtonGroupItemProps[] = Array.isArray(value) ? value as ButtonGroupItemProps[] : [];
        const preparedItems = items.map((item) => ({ ...item, size: item.size ?? model.size ?? 'middle' }));
        return unwrapModel(preparedItems, allData as TypedProxy<IApplicationContext<object>>, standardActualModelPropertyFilter, undefined, { readOnly: model.readOnly, disabled: model.disabled });
      }
      return value;
    }
    return value;
  },
  getDefaultStyles: defaultContainerStyles,
  migrator: (m) => m
    .add<IButtonGroupComponentProps>(0, (prev) => ({ ...prev, items: "items" in prev && Array.isArray(prev.items) ? prev.items as ButtonGroupItemProps[] : [] }))
    .add<IButtonGroupComponentProps>(1, migrateV0toV1)
    .add<IButtonGroupComponentProps>(2, migrateV1toV2)
    .add<IButtonGroupComponentProps>(3, (prev) => ({ ...prev, isInline: prev['isInline'] ?? true })) /* default isInline to true if not specified */
    .add<IButtonGroupComponentProps>(4, (prev) => {
      const newModel = { ...prev };
      newModel.items = (isDefined(prev.items) ? prev.items : []).map((item) => migrateCustomFunctions(item));
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

      newModel.items = prev.items.map(updateItemDefaults);
      return newModel;
    })
    .add<IButtonGroupComponentProps>(6, (prev) => migrateVisibility(prev))
    .add<IButtonGroupComponentProps>(7, (prev) => migrateButtonsNavigateAction(prev))
    .add<IButtonGroupComponentProps>(8, (prev) => {
      const newModel = { ...prev, editMode: 'inherited' } as IButtonGroupComponentProps;
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
          item.downIcon = !isDefined(item.downIcon) ? "DownOutlined" : item.downIcon;
          item.childItems = (item.childItems ?? []).map(setDownIcon);
        }
        return item;
      };
      return { ...prev, items: prev.items.map(setDownIcon) };
    })
    .add<IButtonGroupComponentProps>(11, (prev, ctx) => ctx.isNew === true ? prev : { ...migratePrevStyles(prev, defaultContainerStyles()) })
    .add<IButtonGroupComponentProps>(12, (prev, ctx) => {
      if (ctx.isNew === true) return prev;
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
    .add<IButtonGroupComponentProps>(13, (prev) => prev) // There was wrong migration, leave it for compatibility (versioning issue)
    .add<IButtonGroupComponentProps>(14, (prev, ctx) => {
      // Add default buttons with proper styling for new button groups
      return ctx.isNew === true ? { ...prev, items: getDefaultItems() } : prev;
    })
    .add<IButtonGroupComponentProps>(15, (prev) => ({ ...prev, items: migrateButtonGroupDynamicItems(prev.items) }))
    .add<IButtonGroupComponentProps>(16, (prev, ctx) => {
      const newModel = ctx.isNew === true || prev.isInline === true ? { ...prev } : { ...prev, desktop: { ...prev.desktop, buttonGroupStyle: 'menu' } };
      const updateItems = (item: ButtonGroupItemProps): ButtonGroupItemProps => {
        const newItem = migratePermissionsToVisiblePermissions(migrateHiddenToVisible(migrateStylingBoxToJson(item), true));
        if (Array.isArray(newItem['childItems']))
          newItem['childItems'] = newItem['childItems'].map(updateItems);
        return newItem;
      };

      newModel.items = newModel.items.map(updateItems);
      return migratePermissionsToVisiblePermissions(migrateHiddenToVisible(migrateStylingBoxToJson(newModel)));
    }),
  settingsFormMarkup: getSettings,
};

export default ButtonGroupComponent;
