import Address from 'components/formDesigner/components/address';
import Alert from 'components/formDesigner/components/alert';
import AttachmentsEditor from 'designer-components/attachmentsEditor/attachmentsEditor';
import Autocomplete from 'designer-components/autocomplete/autocomplete';
import AutocompleteTagGroup from 'components/formDesigner/components/autocompleteTagGroup';
import DisplayFormItem from 'components/formDesigner/components/basicDisplayFormItem';
import Button from 'components/formDesigner/components/button/button';
import ButtonGroup from 'components/formDesigner/components/button/buttonGroup/buttonGroupComponent';
import Buttons from 'components/formDesigner/components/button/buttonGroup/buttonsComponent';
import Checkbox from 'designer-components/checkbox/checkbox';
import CheckboxGroup from 'components/formDesigner/components/checkboxGroup/checkboxGroup';
import ChildEntitiesTagGroup from 'components/formDesigner/components/childEntitiesTagGroup';
import CodeEditor from 'components/formDesigner/components/codeEditor';
import CollapsiblePanel from 'designer-components/collapsiblePanel/collapsiblePanelComponent';
import ColorPickerComponent from 'components/formDesigner/components/colorPicker';
import Columns from 'components/formDesigner/components/columns/columns';
import ConfigurableActionConfigurator from 'designer-components/configurableActionsConfigurator';
import ContainerComponent from 'components/formDesigner/components/container/containerComponent';
import DataList from 'components/formDesigner/components/dataList/dataListComponent';
import AdvancedFilterButton from 'designer-components/dataTable/advancedFilterButton/advancedFilterButtonComponent';
import ChildTable from 'designer-components/dataTable/childTable';
import Filter from 'designer-components/dataTable/filter/filterComponent';
import Pager from 'designer-components/dataTable/pager/pagerComponent';
import QuickSearch from 'designer-components/dataTable/quickSearch/quickSearchComponent';
import SelectColumnsButton from 'designer-components/dataTable/selectColumnsButton/selectColumnsButtonComponent';
import ColumnsEditor from 'designer-components/dataTable/table/columnsEditor/columnsEditorComponent';
import EntityPickerColumnsEditor from 'designer-components/dataTable/table/entityPickerColumnsEditor/entityPickerColumnsEditorComponent';
import DataTable from 'designer-components/dataTable/table/tableComponent';
import TableTemplate from 'designer-components/dataTable/table/tableTemplateComponent';
import TableContext from 'designer-components/dataTable/tableContext/tableContextComponent';
import TableViewSelector from 'designer-components/dataTable/tableViewSelector/tableViewSelectorComponent';
import Toolbar from 'designer-components/dataTable/toolbar/toolbarComponent';
import DateField from 'designer-components/dateField/dateField';
import Divider from 'components/formDesigner/components/divider';
import Drawer from 'components/formDesigner/components/drawer';
import Dropdown from 'designer-components/dropdown/dropdown';
import DynamicView from 'components/formDesigner/components/dynamicView';
import EditableTagGroup from 'components/formDesigner/components/editableTagGroup';
import EndpointsAutocompleteComponent from 'components/formDesigner/components/endpointsAutocomplete/endpointsAutocomplete';
import EntityPickerComponent from 'components/formDesigner/components/entityPicker';
import EntityReferenceComponent from 'designer-components/entityReference/entityReference';
import EventNames from 'components/formDesigner/components/eventNamesList';
import FileUpload from 'designer-components/fileUpload';
import FormAutocompleteComponent from 'components/formDesigner/components/formAutocomplete';
import HierarchicalChecklistComponent from 'components/formDesigner/components/hierarchicalChecklist/hierarchicalChecklistComponent';
import IconPicker from 'components/formDesigner/components/iconPicker';
import Image from 'components/formDesigner/components/image';
import ImageAnnotationComponent from 'components/formDesigner/components/imageAnnotation';
import KeyValueEditor from 'components/formDesigner/components/labelValueEditor/labelValueEditorComponent';
import Paragraph from 'components/formDesigner/components/legacy/paragraph';
import Title from 'components/formDesigner/components/legacy/title';
import Link from 'components/formDesigner/components/link';
import List from 'components/formDesigner/components/listControl';
import Markdown from 'components/formDesigner/components/markdown';
import Notes from 'components/formDesigner/components/notes/notesComponent';
import NumberFieldComponent from 'designer-components/numberField/numberField';
import PasswordCombo from 'components/formDesigner/components/passwordCombo';
import PermissionedObjectsTree from 'components/formDesigner/components/permissions/permissionedObjectsTree/permissionedObjectsTree';
import PermissionsTree from 'components/formDesigner/components/permissions/permissionsTree/permissionsTree';
import PermissionTagGroup from 'components/formDesigner/components/permissions/permissionTagGroup';
import Progress from 'components/formDesigner/components/progress';
import PropertyAutocomplete from 'components/formDesigner/components/propertyAutocomplete';
import QueryBuilderComponent from 'designer-components/queryBuilder/queryBuilderComponent';
import Radio from 'components/formDesigner/components/radio/radio';
import Rate from 'components/formDesigner/components/rate';
import ReferenceListAutocompleteComponent from 'components/formDesigner/components/referenceListAutocomplete';
import RefListStatusComponent from 'designer-components/refListStatus';
import RichTextEditor from 'components/formDesigner/components/richTextEditor';
import ScheduledJobExecutionLog from 'components/formDesigner/components/scheduledJobExecutionLog/scheduledJobExecutionLog';
import Section from 'components/formDesigner/components/section';
import SectionSeprator from 'components/formDesigner/components/sectionSeprator/sectionSeprator';
import Space from 'components/formDesigner/components/space';
import Statistic from 'components/formDesigner/components/statistic';
import StatusTag from 'components/formDesigner/components/statusTag';
import SubForm from 'components/formDesigner/components/subForm';
import Switch from 'components/formDesigner/components/switch/switch';
import Tabs from 'components/formDesigner/components/tabs';
import Text from 'components/formDesigner/components/text';
import TextFieldComponent from 'designer-components/textField/textField';
import TimeField from 'designer-components/timeField';
import ValidationErrors from 'components/formDesigner/components/validationErrors';
import Wizard from 'components/formDesigner/components/wizard';
import { IToolboxComponentGroup } from '../../../interfaces/formDesigner';
import TimelineComponent from 'components/formDesigner/components/timeline/timeline';
import DataSource from 'components/formDesigner/components/dataSource/dataSourceComponent';
import { ComponentSelectorComponent } from 'designer-components';
import SettingsComponent from 'designer-components/_settings/settingsComponent';
import TestComponent from 'designer-components/_test';
import DataContextSelector from 'designer-components/dataContextSelector';
import DataContextComponent from 'designer-components/dataContextComponent';
import ContextPropertyAutocompleteComponent from 'designer-components/contextPropertyAutocomplete';
import TextAreaComponent from 'designer-components/textArea/textArea';

export const ToolboxComponents: IToolboxComponentGroup[] = [
  {
    name: 'Advanced',
    visible: true,
    components: [
      Address,
      AutocompleteTagGroup,
      TimelineComponent,
      ChildEntitiesTagGroup,
      CodeEditor,
      ColorPickerComponent,
      ComponentSelectorComponent,
      ConfigurableActionConfigurator,
      DynamicView,
      EditableTagGroup,
      EndpointsAutocompleteComponent,
      EntityPickerComponent,
      EntityReferenceComponent,
      EventNames,
      FileUpload,
      AttachmentsEditor,
      Filter,
      FormAutocompleteComponent,
      IconPicker,
      Image,
      ImageAnnotationComponent,
      HierarchicalChecklistComponent,
      KeyValueEditor,
      List,
      Markdown,
      Notes,
      PasswordCombo,
      PermissionedObjectsTree,
      PermissionsTree,
      PermissionTagGroup,
      Progress,
      PropertyAutocomplete,
      QueryBuilderComponent,
      ReferenceListAutocompleteComponent,
      RefListStatusComponent,
      RichTextEditor,
      ScheduledJobExecutionLog,
      StatusTag,
      SubForm,
    ],
  },
  {
    name: 'Basic',
    visible: true,
    components: [
      Alert,
      Autocomplete,
      Button,
      Buttons,
      ButtonGroup,
      Checkbox,
      CheckboxGroup,
      DateField,
      DisplayFormItem,
      Dropdown,
      Link,
      NumberFieldComponent,
      Rate,
      Radio,
      Section,
      Switch,
      TextAreaComponent,
      TextFieldComponent,
      Statistic,
      Text,
      TimeField,
      ValidationErrors,
    ],
  },
  {
    name: 'Datatable',
    visible: true,
    components: [
      AdvancedFilterButton,
      ChildTable,
      ColumnsEditor, // Hidden
      DataTable,
      EntityPickerColumnsEditor,
      Pager,
      QuickSearch,
      SelectColumnsButton,
      TableContext,
      TableTemplate,
      TableViewSelector,
      Toolbar,
    ],
  },
  {
    name: 'DataList',
    visible: true,
    components: [DataList, DataSource],
  },
  {
    name: 'Layout',
    visible: true,
    components: [CollapsiblePanel, Columns, ContainerComponent, Drawer, Divider, SectionSeprator, Space, Tabs, Wizard],
  },
  {
    visible: false,
    name: 'Legacy',
    components: [Paragraph, Title],
  },
  {
    visible: true,
    name: 'Settings',
    components: [SettingsComponent, TestComponent, DataContextSelector, DataContextComponent, ContextPropertyAutocompleteComponent]
  }
];

export default ToolboxComponents;
