import Address from '../../../components/formDesigner/components/address/addressComponent';
import Alert from '../../../components/formDesigner/components/alert';
import AttachmentsEditor from '../../../components/formDesigner/components/attachmentsEditor/attachmentsEditor';
import Autocomplete from '../../../components/formDesigner/components/autocomplete/autocomplete';
import AutocompleteTagGroup from '../../../components/formDesigner/components/autocompleteTagGroup';
import DisplayFormItem from '../../../components/formDesigner/components/basicDisplayFormItem';
import Button from '../../../components/formDesigner/components/button/button';
import ButtonGroup from '../../../components/formDesigner/components/button/buttonGroup/buttonGroupComponent';
import Buttons from '../../../components/formDesigner/components/button/buttonGroup/buttonsComponent';
import Checkbox from '../../../components/formDesigner/components/checkbox/checkbox';
import CheckboxGroup from '../../../components/formDesigner/components/checkboxGroup/checkboxGroup';
import ChildDataTable from '../../../components/formDesigner/components/childDataTable/childDataTableComponent';
import ChildEntitiesTagGroup from '../../../components/formDesigner/components/childEntitiesTagGroup';
import CodeEditor from '../../../components/formDesigner/components/codeEditor';
import CollapsiblePanel from '../../../components/formDesigner/components/collapsiblePanel/collapsiblePanelComponent';
import ColorPickerComponent from '../../../components/formDesigner/components/colorPicker';
import Columns from '../../../components/formDesigner/components/columns/columns';
import ConfigurableActionConfigurator from '../../../components/formDesigner/components/configurableActionsConfigurator';
import ContainerComponent from '../../../components/formDesigner/components/container/containerComponent';
import AdvancedFilterButton from '../../../components/formDesigner/components/dataTable/advancedFilterButton/advancedFilterButtonComponent';
import ChildTable from '../../../components/formDesigner/components/dataTable/childTable';
import Filter from '../../../components/formDesigner/components/dataTable/filter/filterComponent';
import Pager from '../../../components/formDesigner/components/dataTable/pager/pagerComponent';
import QuickSearch from '../../../components/formDesigner/components/dataTable/quickSearch/quickSearchComponent';
import SelectColumnsButton from '../../../components/formDesigner/components/dataTable/selectColumnsButton/selectColumnsButtonComponent';
import ColumnsEditor from '../../../components/formDesigner/components/dataTable/table/columnsEditor/columnsEditorComponent';
import EntityPickerColumnsEditor from '../../../components/formDesigner/components/dataTable/table/entityPickerColumnsEditor/entityPickerColumnsEditorComponent';
import DataTable from '../../../components/formDesigner/components/dataTable/table/tableComponent';
import TableTemplate from '../../../components/formDesigner/components/dataTable/table/tableTemplateComponent';
import TableContext from '../../../components/formDesigner/components/dataTable/tableContext/tableContextComponent';
import TableViewSelector from '../../../components/formDesigner/components/dataTable/tableViewSelector/tableViewSelectorComponent';
import Toolbar from '../../../components/formDesigner/components/dataTable/toolbar/toolbarComponent';
import DateField from '../../../components/formDesigner/components/dateField/dateField';
import Divider from '../../../components/formDesigner/components/divider';
import Drawer from '../../../components/formDesigner/components/drawer';
import Dropdown from '../../../components/formDesigner/components/dropdown/dropdown';
import DynamicView from '../../../components/formDesigner/components/dynamicView';
import EditableTagGroup from '../../../components/formDesigner/components/editableTagGroup';
import EndpointsAutocompleteComponent from '../../../components/formDesigner/components/endpointsAutocomplete/endpointsAutocomplete';
import EntityPickerComponent from '../../../components/formDesigner/components/entityPicker';
import EntityReferenceComponent from '../../../components/formDesigner/components/entityReference/entityReference';
import EventNames from '../../../components/formDesigner/components/eventNamesList';
import FileUpload from '../../../components/formDesigner/components/fileUpload';
import FormAutocompleteComponent from '../../../components/formDesigner/components/formAutocomplete';
import HierarchicalChecklistComponent from '../../../components/formDesigner/components/hierarchicalChecklist/hierarchicalChecklistComponent';
import IconPicker from '../../../components/formDesigner/components/iconPicker';
import Image from '../../../components/formDesigner/components/image';
import KeyValueEditor from '../../../components/formDesigner/components/labelValueEditor/labelValueEditorComponent';
import Paragraph from '../../../components/formDesigner/components/legacy/paragraph';
import Title from '../../../components/formDesigner/components/legacy/title';
import Link from '../../../components/formDesigner/components/link';
import List from '../../../components/formDesigner/components/listControl';
import Markdown from '../../../components/formDesigner/components/markdown';
import Notes from '../../../components/formDesigner/components/notes/notesComponent';
import NumberField from '../../../components/formDesigner/components/numberField/numberField';
import PasswordCombo from '../../../components/formDesigner/components/passwordCombo';
import PermissionedObjectsTree from '../../../components/formDesigner/components/permissions/permissionedObjectsTree/permissionedObjectsTree';
import PermissionsTree from '../../../components/formDesigner/components/permissions/permissionsTree/permissionsTree';
import PermissionTagGroup from '../../../components/formDesigner/components/permissions/permissionTagGroup';
import Progress from '../../../components/formDesigner/components/progress';
import PropertyAutocomplete from '../../../components/formDesigner/components/propertyAutocomplete';
import QueryBuilderComponent from '../../../components/formDesigner/components/queryBuilder/queryBuilderComponent';
import Radio from '../../../components/formDesigner/components/radio/radio';
import Rate from '../../../components/formDesigner/components/rate';
import ReferenceListAutocompleteComponent from '../../../components/formDesigner/components/referenceListAutocomplete';
import RichTextEditor from '../../../components/formDesigner/components/richTextEditor';
import ScheduledJobExecutionLog from '../../../components/formDesigner/components/scheduledJobExecutionLog/scheduledJobExecutionLog';
import Section from '../../../components/formDesigner/components/section';
import SectionSeprator from '../../../components/formDesigner/components/sectionSeprator/sectionSeprator';
import Space from '../../../components/formDesigner/components/space';
import Statistic from '../../../components/formDesigner/components/statistic';
import StatusTag from '../../../components/formDesigner/components/statusTag';
import SubForm from '../../../components/formDesigner/components/subForm';
import Switch from '../../../components/formDesigner/components/switch/switch';
import Tabs from '../../../components/formDesigner/components/tabs';
import Text from '../../../components/formDesigner/components/text';
import TextArea from '../../../components/formDesigner/components/textArea/textArea';
import TextField from '../../../components/formDesigner/components/textField/textField';
import TimeField from '../../../components/formDesigner/components/timeField';
import ValidationErrors from '../../../components/formDesigner/components/validationErrors';
import Wizard from '../../../components/formDesigner/components/wizard';
import { IToolboxComponentGroup } from '../../../interfaces/formDesigner';
import TimelineComponent from '../../../components/formDesigner/components/timeline/timeline';

export const ToolboxComponents: IToolboxComponentGroup[] = [
  {
    name: 'Advanced',
    visible: true,
    components: [
      Address,
      AttachmentsEditor,
      AutocompleteTagGroup,
      TimelineComponent,
      ChildDataTable,
      ChildEntitiesTagGroup,
      CodeEditor,
      ColorPickerComponent,
      ConfigurableActionConfigurator,
      DynamicView,
      EditableTagGroup,
      EndpointsAutocompleteComponent,
      EntityPickerComponent,
      EntityReferenceComponent,
      EventNames,
      FileUpload,
      Filter,
      FormAutocompleteComponent,
      IconPicker,
      Image,
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
      NumberField,
      Rate,
      Radio,
      Section,
      Switch,
      TextArea,
      TextField,
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
    name: 'Layout',
    visible: true,
    components: [CollapsiblePanel, Columns, ContainerComponent, Drawer, Divider, SectionSeprator, Space, Tabs, Wizard],
  },
  {
    visible: false,
    name: 'Legacy',
    components: [Paragraph, Title],
  },
];

export default ToolboxComponents;
