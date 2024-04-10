import StatusTagComponent from '@/components/formDesigner/components/statusTag';
import AutocompleteComponent from '@/designer-components/autocomplete/autocomplete';
import CheckboxComponent from '@/designer-components/checkbox/checkbox';
import DateFieldComponent from '@/designer-components/dateField/dateField';
import DropdownComponent from '@/designer-components/dropdown';
import EntityReferenceComponent from '@/designer-components/entityReference/entityReference';
import HtmlComponent from '@/designer-components/htmlRender';
import NumberComponent from '@/designer-components/numberField/numberField';
import RefListStatusComponent from '@/designer-components/refListStatus/index';
import TextFieldComponent from '@/designer-components/textField/textField';
import { TimeFieldComponent } from '@/designer-components/timeField';
import { IDictionary } from '@/interfaces';

/*
export interface IEditorAdapter<T extends IConfigurableFormComponent = IConfigurableFormComponent> {
    fillSettings: (customSettings: Partial<T>) => T;
    settingsFormFactory?: ISettingsFormFactory<T>;
  };
*/

type PropertyInclusionPredicate = (name: string) => boolean;

export interface IEditorAdapter {
  propertiesFilter: PropertyInclusionPredicate;
}

const getAllExceptPredicate = (names: string[]): PropertyInclusionPredicate => {
  return (name: string) => {
    return names.indexOf(name) === -1;
  };
};

const labelProperties = ['label', 'hideLabel', 'labelAlign', 'description'];
const bindingProperties = ['name', 'propertyName', 'defaultValue'];
const visibilityProperties = ['hidden', 'disabled', 'readOnly', 'visibility', 'hideBorder', 'editMode'];
const styleProperties = ['style', 'size'];
const allBaseProperties = [...labelProperties, ...bindingProperties, ...visibilityProperties, ...styleProperties];

export const editorAdapters: IDictionary<IEditorAdapter> = {
  [HtmlComponent.type]: {
    propertiesFilter: getAllExceptPredicate([
      ...allBaseProperties
    ]),
  },
  [DropdownComponent.type]: {
    propertiesFilter: getAllExceptPredicate([
      ...allBaseProperties,
      'mode',
      'referenceListId',
      'dataSourceType',
      'valueFormat',
      'incomeCustomJs',
      'outcomeCustomJs',
      'labelCustomJs',
      'values',
    ]),
  },
  [AutocompleteComponent.type]: {
    propertiesFilter: getAllExceptPredicate([
      ...allBaseProperties,
      'mode',
      'dataSourceType',
      'dataSourceUrl',
      'entityTypeShortAlias',
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
    ]),
  },
  [EntityReferenceComponent.type]: {
    propertiesFilter: getAllExceptPredicate([...allBaseProperties]),
  },
  [StatusTagComponent.type]: {
    propertiesFilter: getAllExceptPredicate([]),
  },
};
