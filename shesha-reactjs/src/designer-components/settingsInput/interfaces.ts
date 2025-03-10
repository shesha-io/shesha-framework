import { AutocompleteDataSourceType } from '@/components/autocomplete';
import { CodeLanguages } from '../codeEditor/types';
import { ResultType } from '@/components/codeEditor/models';
import { FormMarkup, IComponentLabelProps, IConfigurableFormComponent } from '@/index';
import { SizeType } from 'antd/es/config-provider/SizeContext';
import { IItemListConfiguratorModalProps } from '../itemListConfigurator/itemListConfiguratorModal';
import { ComponentType } from '@/components/formComponentSelector';

export interface IRadioOption {
    value: string | number;
    icon?: string | React.ReactNode;
    title?: string;
    hint?: string;
    disabled?: boolean;
}

export interface IDropdownOption {
    label: string | React.ReactNode;
    value: string;
}

export interface InputType {
    type: 'colorPicker' | 'dropdown' | 'radio' | 'switch' | 'numberField' | 'button' | 'buttonGroupConfigurator' | 'editableTagGroupProps' | 'dynamicItemsConfigurator' | 'endpointsAutocomplete'
    | 'customDropdown' | 'textArea' | 'codeEditor' | 'iconPicker' | 'contextPropertyAutocomplete' | 'textField' | 'queryBuilder' | 'formAutocomplete' | 'referenceListAutocomplete' | 'filtersList' |
    'autocomplete' | 'imageUploader' | 'editModeSelector' | 'permissions' | 'multiColorPicker' | 'propertyAutocomplete' | 'columnsConfig' | 'columnsList'
    | 'sizableColumnsConfig' | 'labelValueEditor' | 'componentSelector' | 'itemListConfiguratorModal' | 'dataSortingEditor' | 'tooltip'
    | 'typeAutoComplete' | 'fullIdFormAutocomplete' | 'endpointsAutoComplete' | 'formTypeAutocomplete' | 'configurableActionConfigurator';
}

export interface ISettingsInputProps extends IComponentLabelProps, Omit<IConfigurableFormComponent, 'label' | 'layout' | 'readOnly' | 'style' | 'propertyName'> {
    type: InputType['type'];
    label: string;
    propertyName: string;
    variant?: 'borderless' | 'filled' | 'outlined';
    buttonGroupOptions?: IRadioOption[];
    dropdownOptions?: IDropdownOption[];
    readOnly?: boolean;
    onChange?: (value: any) => void;
    hasUnits?: boolean;
    hidden?: boolean;
    jsSetting?: boolean;
    children?: React.ReactNode;
    tooltip?: string;
    customTooltip?: string;
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
    resultType?: ResultType;
    labelTitle?: string;
    labelName?: string;
    valueTitle?: string;
    valueName?: string;
    value?: any;
    placeholder?: string;
    mode?: any;
    /** Can be any valid number e.g.: 1, 0.1, 3, 3.14 */
    step?: number;
    exposedVariables?: string[];
    dropdownMode?: 'multiple' | 'tags';
    customDropdownMode?: 'single' | 'multiple';
    allowClear?: boolean;
    className?: string;
    icon?: string | React.ReactNode;
    iconAlt?: string | React.ReactNode;
    inline?: boolean;
    inputType?: InputType['type'];
    dataSourceType?: AutocompleteDataSourceType;
    dataSourceUrl?: string;
    entityType?: string;
    useRawValues?: boolean;
    modelType?: string;
    httpVerb?: string;
    min?: number;
    max?: number;
    showText?: boolean;
    fieldsUnavailableHint?: string;
    items?: [];
    onAddNewItem?: IItemListConfiguratorModalProps<any>['initNewItem'];
    listItemSettingsMarkup?: IConfigurableFormComponent[];
    buttonText?: string;
    modalProps?: IItemListConfiguratorModalProps<any>['modalSettings'];
    settingsMarkupFactory?: FormMarkup;
    _formFields?: string[];
    autoFillProps?: boolean;
    propertyAccessor?: string;
    noSelectionItemText?: string;
    noSelectionItemValue?: string;
    componentType?: ComponentType;
    parentComponentType?: string;
};
