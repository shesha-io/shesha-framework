import { AutocompleteDataSourceType } from '@/components/autocomplete';
import { CodeLanguages } from '../codeEditor/types';
import { CodeTemplateSettings, ResultType } from '@/components/codeEditor/models';
import { FormMarkup, IComponentLabelProps, IConfigurableFormComponent, IObjectMetadata } from '@/index';
import { SizeType } from 'antd/es/config-provider/SizeContext';
import { IItemListConfiguratorModalProps } from '../itemListConfigurator/itemListConfiguratorModal';
import { ComponentType } from '@/components/formComponentSelector';
import { IConfigurableActionConfiguratorComponentProps } from '../configurableActionsConfigurator/interfaces';
import { ICodeExposedVariable } from '@/components/codeVariablesTable';
import { GetResultTypeFunc } from '../codeEditor/interfaces';
import { IHttpVerb } from '@/components/endpointsAutocomplete/endpointsAutocomplete';
import { ILabelValueEditorProps } from '@/components/labelValueEditor/labelValueEditor';

export interface IRadioOption {
    value: string | number;
    icon?: string | React.ReactNode;
    title?: string;
    hint?: string;
    disabled?: boolean;
}

export interface IDropdownOption {
    label: string | React.ReactNode;
    value: any;
    icon?: string | React.ReactNode;
}

export interface InputType {
    type: 'colorPicker' | 'dropdown' | 'radio' | 'switch' | 'numberField' | 'button' | 'buttonGroupConfigurator' | 'editableTagGroupProps' | 'dynamicItemsConfigurator' | 'endpointsAutocomplete'
    | 'customDropdown' | 'textArea' | 'codeEditor' | 'iconPicker' | 'contextPropertyAutocomplete' | 'textField' | 'queryBuilder' | 'formAutocomplete' | 'referenceListAutocomplete' | 'filtersList' |
    'autocomplete' | 'imageUploader' | 'editModeSelector' | 'permissions' | 'multiColorPicker' | 'propertyAutocomplete' | 'columnsConfig' | 'columnsList'
    | 'sizableColumnsConfig' | 'labelValueEditor' | 'componentSelector' | 'itemListConfiguratorModal' | 'dataSortingEditor' | 'tooltip' | 'customLabelValueEditor'
    | 'typeAutoComplete' | 'fullIdFormAutocomplete' | 'formTypeAutocomplete' | 'configurableActionConfigurator' | 'RefListItemSelectorSettingsModal'
    | 'keyInformationBarColumnsList' | 'Password';
}

export interface ISettingsInputProps extends IComponentLabelProps, Omit<ILabelValueEditorProps, 'exposedVariables'>, Omit<IConfigurableFormComponent, 'label' | 'layout' | 'readOnly' | 'style' | 'propertyName'> {
    type: InputType['type'];
    label: string;
    propertyName: string;
    variant?: 'borderless' | 'filled' | 'outlined';
    buttonGroupOptions?: IRadioOption[];
    dropdownOptions?: IDropdownOption[] | string;
    readOnly?: boolean;
    onChange?: (value: any) => void;
    editorConfig?: IConfigurableActionConfiguratorComponentProps;
    level?: number;
    allowedActions?: string[];
    hasUnits?: boolean;
    jsSetting?: boolean;
    children?: React.ReactNode;
    tooltip?: string;
    iconSize?: number;
    tooltipAlt?: string;
    customTooltip?: string;
    prefix?: string;
    suffix?: string;
    size?: SizeType;
    width?: string | number;
    hideLabel?: boolean;
    layout?: 'horizontal' | 'vertical';
    language?: CodeLanguages;
    style?: string;
    wrapperCol?: { span: number };
    fileName?: string;
    availableConstantsExpression?: string;
    ignorePrefixesOnNewItems?: boolean;
    resultType?: ResultType;
    labelTitle?: string;
    labelName?: string;
    valueTitle?: string;
    valueName?: string;
    value?: any;
    placeholder?: string;
    mode?: any;
    availableHttpVerbs?: IHttpVerb[];
    /** Can be any valid number e.g.: 1, 0.1, 3, 3.14 */
    step?: number;
    exposedVariables?: string[] | ICodeExposedVariable[];
    dropdownMode?: 'multiple' | 'tags';
    customDropdownMode?: 'single' | 'multiple';
    allowClear?: boolean;
    allowSearch?: boolean;
    className?: string;
    icon?: string | React.ReactNode;
    iconAlt?: string | React.ReactNode;
    inline?: boolean;
    autoSize?: boolean;
    inputType?: InputType['type'];
    referenceList?: any;
    filter?: any;
    dataSourceType?: AutocompleteDataSourceType;
    dataSourceUrl?: string;
    entityType?: string;
    useRawValues?: boolean;
    modelType?: string;
    maxItemsCount?: number;
    httpVerb?: string;
    min?: number;
    max?: number;
    showText?: boolean;
    fieldsUnavailableHint?: string;
    wrapInTemplate?: boolean;
    templateSettings?: CodeTemplateSettings;
    resultTypeExpression?: string | GetResultTypeFunc;
    availableConstants?: IObjectMetadata;
    items?: [];
    onAddNewItem?: IItemListConfiguratorModalProps<any>['initNewItem'];
    listItemSettingsMarkup?: IConfigurableFormComponent[];
    buttonText?: string;
    buttonTextReadOnly?: string;
    modalSettings?: IItemListConfiguratorModalProps<any>['modalSettings'];
    modalReadonlySettings?: IItemListConfiguratorModalProps<any>['modalSettings'];
    settingsMarkupFactory?: FormMarkup;
    _formFields?: string[];
    autoFillProps?: boolean;
    presets?: string[];
    propertyAccessor?: string;
    noSelectionItemText?: string;
    noSelectionItemValue?: string;
    componentType?: ComponentType;
    parentComponentType?: string;
    textType?: string;
    title?: string;
    showSearch?: boolean;
    defaultChecked?: boolean;
};
