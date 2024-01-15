import { nanoid } from 'nanoid/non-secure';
import { handleActions } from 'redux-actions';
import { ColumnsActionEnums } from './actions';
import {
  IColumnsConfiguratorStateContext,
  IUpdateChildItemsPayload,
  IUpdateItemSettingsPayload,
  TOOLBAR_CONTEXT_INITIAL_STATE,
} from './contexts';
import { IConfigurableColumnGroup, IDataColumnsProps, standardCellComponentTypes } from './models';
import { getItemById, getItemPositionById } from './utils';

const toolbarReducer = handleActions<IColumnsConfiguratorStateContext, any>(
  {


    [ColumnsActionEnums.AddColumn]: (state: IColumnsConfiguratorStateContext) => {
      const buttonsCount = state.items.filter((i) => i.itemType === 'item').length;
      const columnProps: IDataColumnsProps = {
        id: nanoid(),
        itemType: 'item',
        sortOrder: state.items.length,
        caption: `Column ${buttonsCount + 1}`,
        minWidth: 100,
        columnType: 'data',
        isVisible: true,
        propertyName: '',
        displayComponent: { type: standardCellComponentTypes.defaultDisplay },
        editComponent: { type: standardCellComponentTypes.notEditable },
        createComponent: { type: standardCellComponentTypes.notEditable },
        allowSorting: true,
      };

      const newItems = [...state.items];
      const parent = state.selectedItemId
        ? (getItemById(newItems, state.selectedItemId) as IConfigurableColumnGroup)
        : null;
      if (parent && parent.itemType === 'group') {
        parent.childItems = [...parent.childItems, columnProps];
      } else newItems.push(columnProps);

      return {
        ...state,
        items: newItems,
        selectedItemId: columnProps.id,
      };
    },

    [ColumnsActionEnums.DeleteColumn]: (
      state: IColumnsConfiguratorStateContext,
      action: ReduxActions.Action<string>
    ) => {
      const { payload } = action;

      const newItems = state.items.filter((item) => item.id !== payload);

      return {
        ...state,
        items: [...newItems],
        selectedItemId: state.selectedItemId === payload ? null : state.selectedItemId,
      };
    },

    [ColumnsActionEnums.AddGroup]: (state: IColumnsConfiguratorStateContext) => {
      const groupsCount = state.items.filter((i) => i.itemType === 'group').length;
      const groupProps: IConfigurableColumnGroup = {
        id: nanoid(),
        itemType: 'group',
        sortOrder: state.items.length,
        caption: `Group ${groupsCount + 1}`,
        childItems: [],
        isVisible: true,
      };
      return {
        ...state,
        items: [...state.items, groupProps],
        selectedItemId: groupProps.id,
      };
    },

    [ColumnsActionEnums.DeleteGroup]: (
      state: IColumnsConfiguratorStateContext,
      action: ReduxActions.Action<string>
    ) => {
      const { payload } = action;

      const newItems = state.items.filter((item) => item.id !== payload);

      return {
        ...state,
        items: [...newItems],
        selectedItemId: state.selectedItemId === payload ? null : state.selectedItemId,
      };
    },

    [ColumnsActionEnums.SelectItem]: (state: IColumnsConfiguratorStateContext, action: ReduxActions.Action<string>) => {
      const { payload } = action;

      return {
        ...state,
        selectedItemId: payload,
      };
    },

    [ColumnsActionEnums.UpdateItem]: (
      state: IColumnsConfiguratorStateContext,
      action: ReduxActions.Action<IUpdateItemSettingsPayload>
    ) => {
      const { payload } = action;

      const {
        settings: { columnType },
      } = payload;

      const newItems = [...state.items];
      
      const position = getItemPositionById(newItems, payload.id);

      const currentVersion = newItems[position.index];


      if (!!columnType) {

        const fromDataToAction=!['action', 'crud-operations'].includes(currentVersion?.columnType) && ['action', 'crud-operations'].includes(columnType);

        const fromActionToData=['action', 'crud-operations'].includes(currentVersion?.columnType) && !['action', 'crud-operations'].includes(columnType);

        if(fromDataToAction){
          payload.settings.minWidth = 35;
          payload.settings.maxWidth = 35;
        }else if(fromActionToData){
          payload.settings.minWidth = 100;
          payload.settings.maxWidth = null;
    
        }
 
      }
      
      if (!position) return state;

      const newArray = position.ownerArray;
      newItems[position.index] = {
        ...newArray[position.index],
        ...payload.settings,
      };

      return {
        ...state,
        items: newItems,
      };
    },

    [ColumnsActionEnums.UpdateChildItems]: (
      state: IColumnsConfiguratorStateContext,
      action: ReduxActions.Action<IUpdateChildItemsPayload>
    ) => {
      const {
        payload: { index, childs: childIds },
      } = action;

      if (!Boolean(index) || index.length === 0) {
        return {
          ...state,
          items: childIds,
        };
      }
      // copy all items
      const newItems = [...state.items];
      // blockIndex - full index of the current container
      const blockIndex = [...index];
      // lastIndex - index of the current element in its' parent
      const lastIndex = blockIndex.pop();

      // search for a parent item
      const lastArr = blockIndex.reduce((arr, i) => arr[i]['childItems'], newItems);

      // and set a list of childs
      lastArr[lastIndex]['childItems'] = childIds;

      return {
        ...state,
        items: newItems,
      };
    },
  },

  TOOLBAR_CONTEXT_INITIAL_STATE
);

export default toolbarReducer;
