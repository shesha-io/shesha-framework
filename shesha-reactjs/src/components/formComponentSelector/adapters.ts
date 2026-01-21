import StatusTagComponent from '@/designer-components/statusTag';
import CheckboxComponent from '@/designer-components/checkbox/checkbox';
import DateFieldComponent from '@/designer-components/dateField/dateField';
import DropdownComponent from '@/designer-components/dropdown';
import EntityReferenceComponent from '@/designer-components/entityReference/entityReference';
import HtmlComponent from '@/designer-components/htmlRender';
import NumberComponent from '@/designer-components/numberField/numberField';
import RefListStatusComponent from '@/designer-components/refListStatus/index';
import TextFieldComponent from '@/designer-components/textField/textField';
import { TimeFieldComponent } from '@/designer-components/timeField';
import { IDictionary, IEditorAdapter, PropertyInclusionPredicate } from '@/interfaces';
import AutocompleteComponent from '@/designer-components/autocomplete/autocomplete';

export const updateModelExcludeFiltered = (model: object, updatedModel: object, filter: PropertyInclusionPredicate): any => {
  Object.keys(updatedModel).forEach((key) => {
    if (!filter(key)) {
      model[key] = updatedModel[key];
    }
  });
  return model;
};

export const getAllExceptPredicate = (names: string[]): PropertyInclusionPredicate => {
  return (name: string) => {
    return names.indexOf(name) === -1;
  };
};


const labelProperties = ['label', 'hideLabel', 'labelAlign', 'description'];
const bindingProperties = ['name', 'propertyName', 'defaultValue'];
const visibilityProperties = ['hidden', 'disabled', 'readOnly', 'visibility', 'hideBorder', 'editMode'];
// Note: styleProperties removed from filters to expose Appearance tab for datatable column components
const allBaseProperties = [...labelProperties, ...bindingProperties, ...visibilityProperties];

export const editorAdapters: IDictionary<IEditorAdapter> = {
  [HtmlComponent.type]: {
    propertiesFilter: getAllExceptPredicate([
      ...allBaseProperties,
    ]),
  },
  [DropdownComponent.type]: {
    propertiesFilter: getAllExceptPredicate([
      ...allBaseProperties,
      // 'referenceListId',
      // 'dataSourceType',
      // 'valueFormat',
      'incomeCustomJs',
      'outcomeCustomJs',
      'labelCustomJs',
      // 'values',
    ]),
  },
  [AutocompleteComponent.type]: {
    propertiesFilter: getAllExceptPredicate([
      ...allBaseProperties,
      'dataSourceType',
      'dataSourceUrl',
      'entityType',
      'editMode',
      'description',
      'tooltip',
      'customSourceUrl',
      'disableSearch',
      'required',
    ]),
  },
  [CheckboxComponent.type]: {
    propertiesFilter: getAllExceptPredicate([...allBaseProperties]),
  },
  [TimeFieldComponent.type]: {
    propertiesFilter: getAllExceptPredicate([...allBaseProperties, 'range', 'picker']),
  },
  [DateFieldComponent.type]: {
    propertiesFilter: getAllExceptPredicate([...allBaseProperties, 'range', 'picker']),
  },
  [NumberComponent.type]: {
    propertiesFilter: getAllExceptPredicate([...allBaseProperties]),
  },
  [RefListStatusComponent.type]: {
    propertiesFilter: getAllExceptPredicate([...allBaseProperties, 'referenceListId']),
  },
  [TextFieldComponent.type]: {
    propertiesFilter: getAllExceptPredicate([
      ...allBaseProperties,
      'initialValue',
      'passEmptyStringByDefault',
      'textType',
      'height',
      'width',
      'borderSize',
      'borderRadius',
      'borderColor',
      'backgroundColor',
    ]),
  },
  [EntityReferenceComponent.type]: {
    propertiesFilter: getAllExceptPredicate([...allBaseProperties]),
  },
  [StatusTagComponent.type]: {
    propertiesFilter: getAllExceptPredicate([]),
  },
};
