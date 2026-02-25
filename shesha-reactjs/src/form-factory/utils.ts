import { IPropertyMetadata } from "@/interfaces";

import { IAlertComponentProps } from "@/designer-components/alert/interfaces";
import { IAutocompleteComponentProps } from "@/designer-components/autocomplete/interfaces";
import { IButtonsProps } from "@/designer-components/button/buttonGroup/buttonsComponent/interfaces";
import { ICheckboxComponentProps } from "@/designer-components/checkbox/interfaces";
import { ICodeEditorComponentProps } from "@/designer-components/codeEditor/interfaces";
import { INumberFieldComponentProps } from "@/designer-components/numberField/interfaces";

/* import { ICollapsiblePanelComponentProps } from "@/designer-components/collapsiblePanel/interfaces";
import { IColorPickerComponentProps } from "@/designer-components/colorPicker/interfaces";
import { IColumnsComponentProps } from "@/designer-components/columns/interfaces";
import { IConfigurableActionConfiguratorComponentProps } from "@/designer-components/configurableActionsConfigurator/interfaces";
import { IEntityTypeAutocompleteComponentProps } from "@/designer-components/configurableItemAutocomplete/entityTypeAutocomplete/interfaces";
import { IContextPropertyAutocompleteComponentProps } from "@/designer-components/contextPropertyAutocomplete/interfaces";
import { IDataContextComponentProps } from "@/designer-components/dataContextComponent/interfaces";
import { IPagerComponentProps } from "@/designer-components/dataTable/pager/interfaces";
import { IQuickSearchComponentProps } from "@/designer-components/dataTable/quickSearch/interfaces";
import { ITableComponentProps } from "@/designer-components/dataTable/table/models";
import { IColumnsEditorComponentProps } from "@/designer-components/dataTable/table/columnsEditor/interfaces";
import { ITableContextComponentProps } from "@/designer-components/dataTable/tableContext/models";
import { ITableViewSelectorComponentProps } from "@/designer-components/dataTable/tableViewSelector/models";
import { IDateFieldProps } from "@/designer-components/dateField/interfaces";
import { IDropdownComponentProps } from "@/designer-components/dropdown/model";
import { IEditableTagGroupComponentProps } from "@/designer-components/editableTagGroup/interfaces";
import { IEndpointsAutocompleteComponentProps } from "@/designer-components/endpointsAutocomplete/interfaces";
import { IFileUploadProps } from "@/designer-components/fileUpload/interfaces";
import { IFormAutocompleteComponentProps } from "@/designer-components/formAutocomplete/interfaces";
import { IIconPickerComponentProps } from "@/designer-components/iconPicker/interfaces";
import { ILabelValueEditorComponentProps } from "@/designer-components/labelValueEditor/interfaces";
import { IPermissionAutocompleteComponentProps } from "@/designer-components/permissions/permissionAutocomplete/interfaces";
import { IPropertyAutocompleteComponentProps } from "@/designer-components/propertyAutocomplete/interfaces";
import { IPropertyRouterComponentProps } from "@/designer-components/propertyRouter/interfaces";
import { IQueryBuilderComponentProps } from "@/designer-components/queryBuilder/interfaces";
import { IRadioComponentProps } from "@/designer-components/radio/interfaces";
import { IReferenceListAutocompleteComponentProps } from "@/designer-components/referenceListAutocomplete/interfaces";
import { ISectionSeparatorComponentProps } from "@/designer-components/sectionSeprator/interfaces";
import { ISettingsInputProps } from "@/designer-components/settingsInput/interfaces";
import { ISettingsInputRowProps } from "@/designer-components/settingsInputRow/interfaces";
import { ISliderComponentProps } from "@/designer-components/slider/interfaces";
import { IStyleBoxComponentProps } from "@/designer-components/styleBox/interfaces";
import { ISwitchComponentProps } from "@/designer-components/switch/interfaces";
import { ITabsComponentProps } from "@/designer-components/tabs/models";
import { ITextComponentProps } from "@/designer-components/text/models";
import { ITextAreaComponentProps } from "@/designer-components/textArea/interfaces";
import { ITextFieldComponentProps } from "@/designer-components/textField/interfaces";
import { ITimePickerComponentProps } from "@/designer-components/timeField/models";
import { ILinkComponentProps } from "@/designer-components/link/interfaces";
import { IKeyInformationBarComponentProps } from "@/designer-components/keyInformationBar/interfaces"; */

type AllComponentProps =
  ICodeEditorComponentProps |
  IAlertComponentProps |
  IAutocompleteComponentProps |
  IButtonsProps |
  ICheckboxComponentProps |
  INumberFieldComponentProps; /* |
  ICollapsiblePanelComponentProps |
  IColorPickerComponentProps |
  IColumnsComponentProps |
  IConfigurableActionConfiguratorComponentProps |
  IEntityTypeAutocompleteComponentProps |
  IContainerComponentProps |
  IContextPropertyAutocompleteComponentProps |
  IDataContextComponentProps |
  IPagerComponentProps |
  IQuickSearchComponentProps |
  ITableComponentProps |
  IColumnsEditorComponentProps |
  ITableContextComponentProps |
  ITableViewSelectorComponentProps |
  IDateFieldProps |
  IDropdownComponentProps |
  IEditableTagGroupComponentProps |
  IEndpointsAutocompleteComponentProps |
  IFileUploadProps |
  IFormAutocompleteComponentProps |
  IIconPickerComponentProps |
  ILabelValueEditorComponentProps |
  INumberFieldComponentProps |
  IPermissionAutocompleteComponentProps |
  IPropertyAutocompleteComponentProps |
  IPropertyRouterComponentProps |
  IQueryBuilderComponentProps |
  IRadioComponentProps |
  IReferenceListAutocompleteComponentProps |
  ISectionSeparatorComponentProps |
  ISettingsInputProps |
  ISettingsInputRowProps |
  ISliderComponentProps |
  IStyleBoxComponentProps |
  ISwitchComponentProps |
  ITabsComponentProps |
  ITextComponentProps |
  ITextAreaComponentProps |
  ITextFieldComponentProps |
  ITimePickerComponentProps |
  ILinkComponentProps |
  IKeyInformationBarComponentProps;*/

type props = keyof AllComponentProps | `${keyof AllComponentProps}.${string}`;
type metaProps = keyof IPropertyMetadata | `${keyof IPropertyMetadata}.${string}` | { code: string };

const metadataToPropertyMap: { prop: props; metaProp: metaProps }[] = [
  { prop: 'label', metaProp: 'label' },
  { prop: 'description', metaProp: 'description' },
  { prop: 'editMode', metaProp: { code: '@metadata@.readonly ? "readOnly" : undefined' } },
  { prop: 'validate.required', metaProp: 'required' },
  { prop: 'validate.minValue', metaProp: 'min' },
  { prop: 'validate.maxValue', metaProp: 'max' },
  { prop: 'validate.minLength', metaProp: 'minLength' },
  { prop: 'validate.maxLength', metaProp: 'maxLength' },
];

export const getMetadataPropertyByProperty = (propertyName: string | undefined): string | undefined => {
  if (!propertyName) return undefined;
  const metaProp = metadataToPropertyMap.find((m) => m.prop === propertyName)?.metaProp;
  if (typeof metaProp === 'object' && 'code' in metaProp) return metaProp.code.replace('@metadata@.', '');
  return metaProp;
};
