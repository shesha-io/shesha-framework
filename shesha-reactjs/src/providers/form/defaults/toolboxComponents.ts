import Address from '@/designer-components/address';
import Alert from '@/designer-components/alert';
import AutocompleteTagGroup from '@/designer-components/autocompleteTagGroup';
import Button from '@/designer-components/button/button';
import ButtonGroup from '@/designer-components/button/buttonGroup/buttonGroupComponent';
import Buttons from '@/designer-components/button/buttonGroup/buttonsComponent';
import CheckboxGroup from '@/designer-components/checkboxGroup/checkboxGroup';
import ChildEntitiesTagGroup from '@/designer-components/childEntitiesTagGroup';
import CodeEditor from '@/designer-components/codeEditor';
import ColorPickerComponent from '@/designer-components/colorPicker';
import Columns from '@/designer-components/columns/columns';
import DataList from '@/designer-components/dataList/dataListComponent';
import DataSource from '@/designer-components/dataSource/dataSourceComponent';
import Drawer from '@/designer-components/drawer';
import DynamicView from '@/designer-components/dynamicView';
import EditableTagGroup from '@/designer-components/editableTagGroup';
import EndpointsAutocompleteComponent from '@/designer-components/endpointsAutocomplete/endpointsAutocomplete';
import EntityPickerComponent from '@/designer-components/entityPicker';
import FormAutocompleteComponent from '@/designer-components/formAutocomplete';
import NotificationAutocompleteComponent from '@/designer-components/notificationAutocomplete';
import IconPicker from '@/designer-components/iconPicker';
import ImagePickerComponent from '@/designer-components/imagePicker';
import Image from '@/designer-components/image';
import ImageAnnotationComponent from '@/designer-components/imageAnnotation';
import KeyInformationBarComponent from '@/designer-components/keyInformationBar';
import Paragraph from '@/designer-components/_legacyComponents/paragraph';
import Title from '@/designer-components/_legacyComponents/title';
import Link from '@/designer-components/link';
import List from '@/designer-components/_legacyComponents/listControl';
import Markdown from '@/designer-components/markdown';
import Notes from '@/designer-components/notes/notesComponent';
import PasswordCombo from '@/designer-components/passwordCombo';
import PermissionTagGroup from '@/designer-components/permissions/permissionTagGroup';
import PermissionedObjectsTree from '@/designer-components/permissions/permissionedObjectsTree/permissionedObjectsTree';
import PermissionsTree from '@/designer-components/permissions/permissionsTree/permissionsTree';
import Progress from '@/designer-components/progress';
import { PropertyAutocompleteComponent } from '@/designer-components/propertyAutocomplete';
import Radio from '@/designer-components/radio/radio';
import Rate from '@/designer-components/rate';
import ReferenceListAutocompleteComponent from '@/designer-components/referenceListAutocomplete';
import RichTextEditor from '@/designer-components/richTextEditor';
import ScheduledJobExecutionLog from '@/designer-components/scheduledJobExecutionLog/scheduledJobExecutionLog';
import Section from '@/designer-components/section';
import SectionSeprator from '@/designer-components/sectionSeprator';
import SizableColumnsComponent from '@/designer-components/sizableColumns/sizableColumns';
import Space from '@/designer-components/space';
import Statistic from '@/designer-components/statistic';
import StatusTag from '@/designer-components/statusTag';
import StyleBox from '@/designer-components/styleBox';
import SubForm from '@/designer-components/subForm';
import Slider from '@/designer-components/slider';
import Switch from '@/designer-components/switch/switch';
import Tabs from '@/designer-components/tabs';
import Text from '@/designer-components/text';
import ValidationErrors from '@/designer-components/validationErrors';
import Wizard from '@/designer-components/wizard';
import { ComponentSelectorComponent } from '@/designer-components';
import SettingsComponent from '@/designer-components/_settings/settingsComponent';
import AttachmentsEditor from '@/designer-components/attachmentsEditor/attachmentsEditor';
import Autocomplete from '@/designer-components/autocomplete/autocomplete';
import Card from '@/designer-components/card';
import Checkbox from '@/designer-components/checkbox/checkbox';
import CollapsiblePanel from '@/designer-components/collapsiblePanel/collapsiblePanelComponent';
import ConfigurableActionConfigurator from '@/designer-components/configurableActionsConfigurator';
import ContainerComponent from '@/designer-components/container/containerComponent';
import ContextPropertyAutocompleteComponent from '@/designer-components/contextPropertyAutocomplete';
import DataContextComponent from '@/designer-components/dataContextComponent';
import DataContextSelector from '@/designer-components/dataContextSelector';
import ChildTable from '@/designer-components/dataTable/childTable';
import Pager from '@/designer-components/dataTable/pager/pagerComponent';
import QuickSearch from '@/designer-components/dataTable/quickSearch/quickSearchComponent';
import SelectColumnsButton from '@/designer-components/dataTable/selectColumnsButton/selectColumnsButtonComponent';
import { ColumnsEditorComponent } from '@/designer-components/dataTable/table/columnsEditor';
import DataTable from '@/designer-components/dataTable/table/tableComponent';
import TableTemplate from '@/designer-components/dataTable/table/tableTemplateComponent';
import TableContext from '@/designer-components/dataTable/tableContext/tableContextComponent';
import TableViewSelector from '@/designer-components/dataTable/tableViewSelector/tableViewSelectorComponent';
import Toolbar from '@/designer-components/_legacyComponents/toolbar/toolbarComponent';
import DateField from '@/designer-components/dateField/dateField';
import Dropdown from '@/designer-components/dropdown';
import { DynamicActionsConfiguratorComponent } from '@/designer-components/dynamicActionsConfigurator/index';
import EditModeSelectorComponent from '@/designer-components/editModeSelector/editModeSelector';
import EntityReferenceComponent from '@/designer-components/entityReference/entityReference';
import FileUpload from '@/designer-components/fileUpload';
import HtmlRender from '@/designer-components/htmlRender';
import { LabelValueEditorComponent } from '@/designer-components/labelValueEditor/labelValueEditorComponent';
import { MetadataEditorComponent } from '@/designer-components/metadataEditor';
import NumberFieldComponent from '@/designer-components/numberField/numberField';
import QueryBuilderComponent from '@/designer-components/queryBuilder/queryBuilderComponent';
import RefListStatusComponent from '@/designer-components/refListStatus';
import { SortingEditorComponent } from '@/designer-components/sortingEditor/index';
import TextAreaComponent from '@/designer-components/textArea/textArea';
import TextFieldComponent from '@/designer-components/textField/textField';
import { TimeFieldComponent } from '@/designer-components/timeField';
import { IToolboxComponentGroup } from '@/interfaces/formDesigner';
import PermissionAutocompleteComponent from '@/designer-components/permissions/permissionAutocomplete';
import EditModeToggler from '@/designer-components/editModeToggler';
import ProfileDropdown from '@/designer-components/profileDropdown';
import { IFormPersisterStateContext } from '@/providers/formPersisterProvider/contexts';
import { HEADER_CONFIGURATION, HEADER_PUB_PORTAL_CONFIGURATION } from '@/components/mainLayout/constant';
import AdvancedFilterButton from '@/designer-components/dataTable/advancedFilterButton/advancedFilterButtonComponent';
import { getToolboxComponentsVisibility } from '@/utils';
import ThemeEditorComponent from '@/designer-components/settingsEditor/themeEditor';
import MainMenuEditorComponent from '@/designer-components/settingsEditor/mainMenuEditor';
import LabelConfigurator from '@/designer-components/styleLabel';
import SearchableTabs from '@/designer-components/propertiesTabs';
import PropertyRouterComponent from '@/designer-components/propertyRouter';
import ChevronComponent from '@/designer-components/chevron/chevron';
import SettingsInput from '@/designer-components/settingsInput';
import SettingsInputRow from '@/designer-components/settingsInputRow';
import KanbanComponent from '@/designer-components/kanban';
import BarChartComponent from '@/designer-components/charts/bar';
import LineChartComponent from '@/designer-components/charts/line';
import PieChartComponent from '@/designer-components/charts/pie';
import PolarAreaChartComponent from '@/designer-components/charts/polarArea';
import { ConfigurableItemAutocompleteComponent } from '@/designer-components/configurableItemAutocomplete';
import DividerComponent from '@/designer-components/_legacyComponents/divider';

export const getToolboxComponents = (
  devMode: boolean,
  formMetadata: Pick<IFormPersisterStateContext, 'formId' | 'formProps'>
): IToolboxComponentGroup[] => {
  return [
    {
      name: 'Data entry',
      visible: true,
      components: [
        Button,
        ButtonGroup,
        Dropdown,
        NumberFieldComponent,
        TextFieldComponent,
        TextAreaComponent,
        Checkbox,
        CheckboxGroup,
        Radio,
        Slider,
        Switch,
        DateField,
        TimeFieldComponent,
        Rate,
      ],
    },
    {
      name: 'Data display',
      visible: true,
      components: [Alert, Link, Statistic, Text, ValidationErrors, BarChartComponent, LineChartComponent, PieChartComponent, PolarAreaChartComponent],
    },
    {
      name: 'Advanced',
      visible: true,
      components: [
        Address,
        Autocomplete,
        ColorPickerComponent,
        IconPicker,
        HtmlRender,
        Image,
        ImageAnnotationComponent,
        RichTextEditor,
        Markdown,
        PasswordCombo,
        Progress,
        RefListStatusComponent,
        StatusTag,
        ChevronComponent,
        KanbanComponent
      ],
    },
    {
      name: 'Entity references',
      visible: true,
      components: [
        EntityPickerComponent,
        EntityReferenceComponent,
        FileUpload,
        AttachmentsEditor,
        Notes,
        ChildEntitiesTagGroup,
      ],
    },
    {
      name: 'Tables and Lists',
      visible: true,
      components: [
        TableContext,
        DataTable,
        DataList,
        AdvancedFilterButton,
        Pager,
        QuickSearch,
        SelectColumnsButton,
        TableViewSelector,
        ChildTable,
      ],
    },
    {
      name: 'Data Access',
      visible: false,
      components: [DataSource, DataContextComponent],
    },
    {
      name: 'Layout',
      visible: true,
      components: [
        Card,
        CollapsiblePanel,
        Columns,
        ContainerComponent,
        Drawer,
        KeyInformationBarComponent,
        SectionSeprator,
        SizableColumnsComponent,
        Space,
        Tabs,
        Wizard,
        SubForm,
      ],
    },
    {
      visible: false,
      name: 'Legacy',
      components: [
        Paragraph,
        Title,
        Toolbar,
        List,
        EditableTagGroup,
        FormAutocompleteComponent,
        ReferenceListAutocompleteComponent,
        NotificationAutocompleteComponent,
        TableTemplate,
        DividerComponent,
        DynamicView,
        AutocompleteTagGroup,
      ],
    },
    {
      visible: devMode,
      name: 'Dev',
      components: [
        PropertyRouterComponent,
        ThemeEditorComponent,
        MainMenuEditorComponent,
        PermissionAutocompleteComponent,
        ColumnsEditorComponent, // Hidden
        PropertyAutocompleteComponent,
        SortingEditorComponent,
        EditModeSelectorComponent,
        ConfigurableActionConfigurator,
        DynamicActionsConfiguratorComponent,
        PermissionedObjectsTree,
        PermissionsTree,
        LabelValueEditorComponent,
        DataContextSelector,
        ContextPropertyAutocompleteComponent,
        SettingsComponent,
        MetadataEditorComponent,
        Buttons,
        Section,
        StyleBox,
        LabelConfigurator,
        SearchableTabs,
        SettingsInput,
        SettingsInputRow,
        CodeEditor,
        ImagePickerComponent,
        ComponentSelectorComponent,
        EndpointsAutocompleteComponent,
        ConfigurableItemAutocompleteComponent,
        PermissionTagGroup,
        QueryBuilderComponent,
        ScheduledJobExecutionLog,
      ],
    },
    {
      name: 'Header Components',
      visible: getToolboxComponentsVisibility(formMetadata?.formProps, [
        HEADER_CONFIGURATION,
        HEADER_PUB_PORTAL_CONFIGURATION,
      ]),
      components: [EditModeToggler, ProfileDropdown],
    },
  ];
};
