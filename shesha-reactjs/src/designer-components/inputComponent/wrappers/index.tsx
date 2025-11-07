import { BaseInputProps, ISettingsInputProps } from "@/designer-components/settingsInput/interfaces";
import { FC } from "react";
import { CodeEditorWrapper } from "./codeEditor";
import { TooltipWrapper } from "./tooltip";
import { PermissionsEditorWrapper } from "./permissionsEditor";
import { ColorPickerWrapper } from "./colorPicker";
import { DropDownWrapper } from "./dropDown";
import { CustomDropdownWrapper } from "./customDropdown";
import { RadioWrapper } from "./radio";
import { SwithcWrapper } from "./switch";
import { NumberFieldWrapper } from "./numberField";
import { TextFieldWrapper } from "./textField";
import { TextAreaWrapper } from "./textArea";
import { ButtonWrapper } from "./button";
import { ButtonGroupConfiguratorWrapper } from "./buttonGroupConfigurator";
import { EditableTagGroupWrapper } from "./editableTagGroup";
import { DynamicItemsConfiguratorWrapper } from "./dynamicItemsConfigurator";
import { AutocompleteWrapper } from "./autocomplete";
import { EntityTypeAutocompleteWrapper } from "./entityTypeAutocomplete";
import { FormTypeAutocompleteWrapper } from "./formTypeAutocomplete";
import { ImageUploaderWrapper } from "./imageUploader";
import { IconPickerWrapper } from "./iconPicker";
import { MultiColorPickerWrapper } from "./multiColorPicker";
import { ColumnsConfigWrapper } from "./columnsConfig";
import { ColumnsListWrapper } from "./columnsList";
import { LabelValueEditorWrapper } from "./labelValueEditor";
import { ComponentSelectorWrapper } from "./componentSelector";
import { ItemListConfiguratorModalWrapper } from "./itemListConfiguratorModal";
import { DataSortingEditorWrapper } from "./dataSortingEditor";
import { QueryBuilderWrapper } from "./queryBuilder";
import { FiltersListWrapper } from "./filtersListWrapper";
import { EditModeSelectorWrapper } from "./editModeSelector";
import { ConfigurableActionConfiguratorWrapper } from "./configurableActionConfigurator";
import { RefListItemSelectorSettingsModalWrapper } from "./refListItemSelectorSettingsModal";
import { PasswordWrapper } from "./password";
import { DateWrapper } from "./date";
import { EndpointsAutocompleteWrapper } from "./endpointsAutocomplete";
import { PropertyAutocompleteWrapper } from "./propertyAutocomplete";
import { ReferenceListAutocompleteWrapper } from "./referenceListAutocomplete";
import { FormAutocompleteWrapper } from "./formAutocomplete";
import { CustomLabelValueEditorWrapper } from "./customLabelValueEditor";
import { KeyInformationBarColumnsWrapper } from "./keyInformationBarColumns";
import { SizableColumnsConfigWrapper } from "./sizableColumnsConfig";


type InputType = ISettingsInputProps['type'];

export type EditorComponent = FC<ISettingsInputProps>;

type EditorDictionary = {
  [K in InputType]: FC<BaseInputProps & { type: K }>;
};

export const editorRegistry: EditorDictionary = {
  codeEditor: CodeEditorWrapper,
  tooltip: TooltipWrapper,

  permissions: PermissionsEditorWrapper,
  colorPicker: ColorPickerWrapper,
  dropdown: DropDownWrapper,
  customDropdown: CustomDropdownWrapper,
  radio: RadioWrapper,
  switch: SwithcWrapper,
  numberField: NumberFieldWrapper,
  textField: TextFieldWrapper,
  textArea: TextAreaWrapper,
  button: ButtonWrapper,
  buttonGroupConfigurator: ButtonGroupConfiguratorWrapper,
  editableTagGroupProps: EditableTagGroupWrapper,
  dynamicItemsConfigurator: DynamicItemsConfiguratorWrapper,
  autocomplete: AutocompleteWrapper,
  entityTypeAutocomplete: EntityTypeAutocompleteWrapper,
  formTypeAutocomplete: FormTypeAutocompleteWrapper,
  imageUploader: ImageUploaderWrapper,
  iconPicker: IconPickerWrapper,
  multiColorPicker: MultiColorPickerWrapper,
  columnsConfig: ColumnsConfigWrapper,
  columnsList: ColumnsListWrapper,
  labelValueEditor: LabelValueEditorWrapper,
  componentSelector: ComponentSelectorWrapper,
  itemListConfiguratorModal: ItemListConfiguratorModalWrapper,
  dataSortingEditor: DataSortingEditorWrapper,
  queryBuilder: QueryBuilderWrapper,
  filtersList: FiltersListWrapper,
  editModeSelector: EditModeSelectorWrapper,
  configurableActionConfigurator: ConfigurableActionConfiguratorWrapper,
  RefListItemSelectorSettingsModal: RefListItemSelectorSettingsModalWrapper,
  Password: PasswordWrapper,
  date: DateWrapper,
  // TODO: check usages and remove or implement wrapper
  settingsInput: undefined,
  endpointsAutocomplete: EndpointsAutocompleteWrapper,
  propertyAutocomplete: PropertyAutocompleteWrapper,
  referenceListAutocomplete: ReferenceListAutocompleteWrapper,
  formAutocomplete: FormAutocompleteWrapper,
  customLabelValueEditor: CustomLabelValueEditorWrapper,
  keyInformationBarColumnsList: KeyInformationBarColumnsWrapper,
  sizableColumnsConfig: SizableColumnsConfigWrapper,
};
