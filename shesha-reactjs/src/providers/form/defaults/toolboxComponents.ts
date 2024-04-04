import Address from '@/components/formDesigner/components/address';
import Alert from '@/components/formDesigner/components/alert';
import AutocompleteTagGroup from '@/components/formDesigner/components/autocompleteTagGroup';
import Button from '@/components/formDesigner/components/button/button';
import ButtonGroup from '@/components/formDesigner/components/button/buttonGroup/buttonGroupComponent';
import Buttons from '@/components/formDesigner/components/button/buttonGroup/buttonsComponent';
import CheckboxGroup from '@/components/formDesigner/components/checkboxGroup/checkboxGroup';
import ChildEntitiesTagGroup from '@/components/formDesigner/components/childEntitiesTagGroup';
import CodeEditor from '@/components/formDesigner/components/codeEditor';
import ColorPickerComponent from '@/components/formDesigner/components/colorPicker';
import Columns from '@/components/formDesigner/components/columns/columns';
import DataList from '@/components/formDesigner/components/dataList/dataListComponent';
import DataSource from '@/components/formDesigner/components/dataSource/dataSourceComponent';
import Divider from '@/components/formDesigner/components/divider';
import Drawer from '@/components/formDesigner/components/drawer';
import DynamicView from '@/components/formDesigner/components/dynamicView';
import EditableTagGroup from '@/components/formDesigner/components/editableTagGroup';
import EndpointsAutocompleteComponent from '@/components/formDesigner/components/endpointsAutocomplete/endpointsAutocomplete';
import EntityPickerComponent from '@/components/formDesigner/components/entityPicker';
import FormAutocompleteComponent from '@/components/formDesigner/components/formAutocomplete';
import IconPicker from '@/components/formDesigner/components/iconPicker';
import Image from '@/components/formDesigner/components/image';
import ImageAnnotationComponent from '@/components/formDesigner/components/imageAnnotation';
import Paragraph from '@/components/formDesigner/components/legacy/paragraph';
import Title from '@/components/formDesigner/components/legacy/title';
import Link from '@/components/formDesigner/components/link';
import List from '@/components/formDesigner/components/listControl';
import Markdown from '@/components/formDesigner/components/markdown';
import Notes from '@/components/formDesigner/components/notes/notesComponent';
import PasswordCombo from '@/components/formDesigner/components/passwordCombo';
import PermissionTagGroup from '@/components/formDesigner/components/permissions/permissionTagGroup';
import PermissionedObjectsTree from '@/components/formDesigner/components/permissions/permissionedObjectsTree/permissionedObjectsTree';
import PermissionsTree from '@/components/formDesigner/components/permissions/permissionsTree/permissionsTree';
import Progress from '@/components/formDesigner/components/progress';
import { PropertyAutocompleteComponent } from '@/components/formDesigner/components/propertyAutocomplete';
import Radio from '@/components/formDesigner/components/radio/radio';
import Rate from '@/components/formDesigner/components/rate';
import ReferenceListAutocompleteComponent from '@/components/formDesigner/components/referenceListAutocomplete';
import RichTextEditor from '@/components/formDesigner/components/richTextEditor';
import ScheduledJobExecutionLog from '@/components/formDesigner/components/scheduledJobExecutionLog/scheduledJobExecutionLog';
import Section from '@/components/formDesigner/components/section';
import SectionSeprator from '@/components/formDesigner/components/sectionSeprator';
import SizableColumnsComponent from '@/components/formDesigner/components/sizableColumns/sizableColumns';
import Space from '@/components/formDesigner/components/space';
import Statistic from '@/components/formDesigner/components/statistic';
import StatusTag from '@/components/formDesigner/components/statusTag';
import StyleBox from '@/components/formDesigner/components/styleBox';
import SubForm from '@/components/formDesigner/components/subForm';
import Switch from '@/components/formDesigner/components/switch/switch';
import Tabs from '@/components/formDesigner/components/tabs';
import Text from '@/components/formDesigner/components/text';
import ValidationErrors from '@/components/formDesigner/components/validationErrors';
import Wizard from '@/components/formDesigner/components/wizard';
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
import AdvancedFilterButton from '@/designer-components/dataTable/advancedFilterButton/advancedFilterButtonComponent';
import ChildTable from '@/designer-components/dataTable/childTable';
import Filter from '@/designer-components/dataTable/filter/filterComponent';
import Pager from '@/designer-components/dataTable/pager/pagerComponent';
import QuickSearch from '@/designer-components/dataTable/quickSearch/quickSearchComponent';
import SelectColumnsButton from '@/designer-components/dataTable/selectColumnsButton/selectColumnsButtonComponent';
import ColumnsEditor from '@/designer-components/dataTable/table/columnsEditor';
import EntityPickerColumnsEditor from '@/designer-components/dataTable/table/entityPickerColumnsEditor';
import DataTable from '@/designer-components/dataTable/table/tableComponent';
import TableTemplate from '@/designer-components/dataTable/table/tableTemplateComponent';
import TableContext from '@/designer-components/dataTable/tableContext/tableContextComponent';
import TableViewSelector from '@/designer-components/dataTable/tableViewSelector/tableViewSelectorComponent';
import Toolbar from '@/designer-components/dataTable/toolbar/toolbarComponent';
import DateField from '@/designer-components/dateField/dateField';
import Dropdown from '@/designer-components/dropdown';
import { DynamicActionsConfiguratorComponent } from '@/designer-components/dynamicActionsConfigurator/index';
import EditModeSelectorComponent from '@/designer-components/editModeSelector/editModeSelector';
import EntityReferenceComponent from '@/designer-components/entityReference/entityReference';
import FileUpload from '@/designer-components/fileUpload';
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

export const getToolboxComponents = (devMode: boolean): IToolboxComponentGroup[] => {
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
        Switch,
        DateField,
        TimeFieldComponent,
        Rate,
      ],
    },
    {
      name: 'Data display',
      visible: true,
      components: [Alert, Link, Statistic, Text, ValidationErrors],
    },
    {
      name: 'Advanced',
      visible: true,
      components: [
        Address,
        Autocomplete,
        AutocompleteTagGroup,
        ColorPickerComponent,
        IconPicker,
        EditableTagGroup,
        Image,
        ImageAnnotationComponent,
        RichTextEditor,
        Markdown,
        PasswordCombo,
        Progress,
        RefListStatusComponent,
        StatusTag,
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
        DynamicView,
      ],
    },
    {
      name: 'Tables and Lists',
      visible: true,
      components: [
        TableTemplate,
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
      visible: true,
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
        Divider,
        Drawer,
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
      components: [Paragraph, Title, Toolbar, List],
    },
    {
      visible: devMode,
      name: 'Dev',
      components: [
        EntityPickerColumnsEditor,
        ColumnsEditor, // Hidden
        ReferenceListAutocompleteComponent,
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
        CodeEditor,
        ComponentSelectorComponent,
        EndpointsAutocompleteComponent,
        Filter,
        FormAutocompleteComponent,
        PermissionTagGroup,
        QueryBuilderComponent,
        ScheduledJobExecutionLog,
      ],
    },
  ];
};

export default getToolboxComponents;
