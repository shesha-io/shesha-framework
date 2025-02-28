import { AutocompleteDataSourceType } from '@/components/autocomplete';
import { CodeLanguages } from '../codeEditor/types';
import { ResultType } from '@/components/codeEditor/models';
import { IComponentLabelProps, IConfigurableFormComponent } from '@/index';
import { SizeType } from 'antd/es/config-provider/SizeContext';
import { IItemListConfiguratorModalProps } from '../itemListConfigurator/itemListConfiguratorModal';

export interface IRadioOption {
    value: string | number;
    icon?: string | React.ReactNode;
    title?: string;
    hint?: string;
}

export interface IDropdownOption {
    label: string | React.ReactNode;
    value: string | number;
}

export interface InputType {
    type: 'color' | 'dropdown' | 'radio' | 'switch' | 'number' | 'button' | 'buttonGroupConfigurator' | 'editableTagGroupProps' | 'dynamicItemsConfigurator' | 'endpointsAutocomplete' | "dataSortingEditor"
    | 'customDropdown' | 'textArea' | 'codeEditor' | 'iconPicker' | 'contextPropertyAutocomplete' | 'text' | 'queryBuilder' | 'formAutocomplete' | 'referenceListAutocomplete' | 'filtersList' |
    'autocomplete' | 'imageUploader' | 'editModeSelector' | 'permissions' | 'multiColorPicker' | 'propertyAutocomplete' | 'columnsConfig' | 'columnsList'
    | 'sizableColumnsConfig' | 'labelValueEditor' | 'columnsList' | 'sizableColumnsConfig' | 'itemListConfiguratorModal'
    | 'typeAutoComplete' | 'fullIdFormAutocomplete' | 'endpointsAutoComplete' | 'formTypeAutocomplete' | 'configurableActionConfig';
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
    useRawValues?: boolean;
    modelType?: string;
    httpVerb?: string;
    min?: number;
    max?: number;
    fieldsUnavailableHint?: string;
    items?: [];
    onAddNewItem?: IItemListConfiguratorModalProps<any>['initNewItem'];
    listItemSettingsMarkup?: IConfigurableFormComponent[];
    buttonText?: string;
    modalProps?: IItemListConfiguratorModalProps<any>['modalSettings'];
    _formFields?: string[];
    autoFillProps?: boolean;
};
