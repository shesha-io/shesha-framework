using Abp.ObjectMapping;
using AutoMapper;
using Shesha.FormTemplates.FormComponents.Enums;
using Shesha.FormTemplates.FormComponents.Interfaces;
using Shesha.FormTemplates.FormComponents.Interfaces.Checkbox;
using Shesha.FormTemplates.FormComponents.Interfaces.Columns;
using Shesha.FormTemplates.FormComponents.Interfaces.Container;
using Shesha.FormTemplates.FormComponents.Interfaces.Datatable;
using Shesha.FormTemplates.FormComponents.Interfaces.Dropdown;
using Shesha.FormTemplates.FormComponents.Interfaces.File;
using Shesha.FormTemplates.FormComponents.Interfaces.KeyInformationBar;
using Shesha.FormTemplates.FormComponents.Interfaces.NumberField;
using Shesha.FormTemplates.FormComponents.Interfaces.Tabs;
using Shesha.FormTemplates.FormComponents.Interfaces.Text;
using Shesha.FormTemplates.FormComponents.Interfaces.TextArea;
using Shesha.FormTemplates.FormComponents.Interfaces.Textfield;
using Shesha.FormTemplates.FormComponents.Interfaces.TimePicker;
using Shesha.Metadata;
using Shesha.Metadata.Dtos;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.FormTemplates.FormComponents
{
    public class ComponentFactory
    {
        private readonly Dictionary<string, Func<PropertyMetadataDto, bool, bool, dynamic>> _componentCreators;
        private readonly Dictionary<string, Func<List<PropertyMetadataDto>, dynamic>> _advancedComponentCreators;
        private readonly Dictionary<string, Func<List<MetadataDto>, dynamic>> _childTableComponentCreators;
        private readonly IObjectMapper _mapper;
        public ComponentFactory(IObjectMapper mapper)
        {
            _mapper = mapper;
            _componentCreators = new Dictionary<string, Func<PropertyMetadataDto, bool, bool, dynamic>>(StringComparer.OrdinalIgnoreCase)
            {
                // String types
                ["reference-list-item"] = CreateDropdown,
                ["typography"] = CreateTextTypography,
                ["string"] = CreateTextArea,
                ["number"] = CreateNumberField,
                ["boolean"] = CreateCheckbox,
                ["timePicker"] = CreateTimePicker,
                ["fileUpload"] = CreateFileUpload,
                ["string"] = CreateTextField, // check string length,
            };

            _advancedComponentCreators = new Dictionary<string, Func<List<PropertyMetadataDto>, dynamic>>(StringComparer.OrdinalIgnoreCase)
            {
                // advanced types
                ["KeyInformationBar"] = CreateKeyInformationBar,
                ["ColumnedInformationBar"] = CreateColumnedInformationBar,
                ["datatable"] = CreateDatatable,
            };

            _childTableComponentCreators = new Dictionary<string, Func<List<MetadataDto>, dynamic>>(StringComparer.OrdinalIgnoreCase)
            {
                // Child table tabs
                ["tabbedChildTable"] = CreateChildTableTabs,
            };
        }

        public ConfigurableComponent CreateComponent(string dataType, PropertyMetadataDto? metaData = null, bool isReadOnly = false, bool hideLabel = false)
        {
            if (_componentCreators.TryGetValue(dataType, out var creator))
            {
                return creator(metaData ?? new PropertyMetadataDto(), isReadOnly, hideLabel);
            }

            // Default to text field for unknown types
            return CreateTextField(metaData ?? new PropertyMetadataDto(), isReadOnly, hideLabel);
        }
        
        public ConfigurableComponent CreateAdvancedComponent(string dataType, List<PropertyMetadataDto>? metaData = null)
        {
            if (_advancedComponentCreators.TryGetValue(dataType, out var creator))
            {
                return creator(metaData ?? new List<PropertyMetadataDto>());
            }

            throw new NotSupportedException($"Data type '{dataType}' is not supported.");
        }

        public ConfigurableComponent CreateChildTable(string dataType, List<MetadataDto>? metaData = null)
        {
            if (_childTableComponentCreators.TryGetValue(dataType, out var creator))
            {
                return creator(metaData ?? new List<MetadataDto>());
            }

            throw new NotSupportedException($"Data type '{dataType}' is not supported.");
        }

        private DropdownProps CreateDropdown(PropertyMetadataDto metaData, bool isReadOnly = false, bool hideLabel = false)
        {
            if (metaData.ReferenceListModule == null || metaData.ReferenceListName == null)
                throw new ArgumentException($"ReferenceListModule and ReferenceListName are required for property '{metaData.Path}'");

            ConfigurableComponent baseComponent = CreateBaseComponent("dropdown", metaData, isReadOnly, hideLabel);
            DropdownProps props = _mapper.Map<DropdownProps>(baseComponent);
            props.referenceListId = new ReferenceListIdentifier
            {
                module = metaData.ReferenceListModule,
                name = metaData.ReferenceListName
            };
            props.dataSourceType = "referenceList";
            return props;
        }

        private TextFieldProps CreateTextField(PropertyMetadataDto metaData, bool isReadOnly = false,bool hideLabel = false)
        {
            ConfigurableComponent baseComponent = CreateBaseComponent("textField", metaData,isReadOnly, hideLabel);
            TextFieldProps props = _mapper.Map<TextFieldProps>(baseComponent);
            return props;
        }

        private FileUploadProps CreateFileUpload(PropertyMetadataDto metaData, bool isReadOnly = false, bool hideLabel = false)
        {
            ConfigurableComponent baseComponent = CreateBaseComponent("fileUpload", metaData, isReadOnly, hideLabel);
            FileUploadProps props = _mapper.Map<FileUploadProps>(baseComponent);
            props.ownerId = "{data.id}";
            props.ownerType = "{{modelType}}"; // enter entity type name
            return props;
        }

        private TimePickerProps CreateTimePicker(PropertyMetadataDto metaData, bool isReadOnly = false, bool hideLabel = false)
        {
            ConfigurableComponent baseComponent = CreateBaseComponent("timePicker", metaData, isReadOnly, hideLabel);
            TimePickerProps props = _mapper.Map<TimePickerProps>(baseComponent);
            return props;
        }

        private TextAreaProps CreateTextArea(PropertyMetadataDto metaData, bool isReadOnly = false, bool hideLabel = false)
        {
            ConfigurableComponent baseComponent = CreateBaseComponent("textArea", metaData, isReadOnly, hideLabel);
            TextAreaProps props = _mapper.Map<TextAreaProps>(baseComponent);
            return props;
        }

        private NumberFieldProps CreateNumberField(PropertyMetadataDto metaData, bool isReadOnly = false, bool hideLabel = false)
        {
            ConfigurableComponent baseComponent = CreateBaseComponent("numberField", metaData, isReadOnly, hideLabel);
            NumberFieldProps props = _mapper.Map<NumberFieldProps>(baseComponent);
            return props;
        }

        private CheckboxProps CreateCheckbox(PropertyMetadataDto metaData, bool isReadOnly = false, bool hideLabel = false)
        {
            ConfigurableComponent baseComponent = CreateBaseComponent("checkbox", metaData, isReadOnly, hideLabel);
            CheckboxProps props = _mapper.Map<CheckboxProps>(baseComponent);
            return props;
        }

        //private ContainerProps CreateContainer(PropertyMetadataDto metaData, bool isReadOnly = false, bool hideLabel = false)
        //{
        //    ConfigurableComponent baseComponent = CreateBaseComponent("container", new PropertyMetadataDto()
        //    {
        //        Path = "container"
        //    }, isReadOnly, hideLabel);
        //    ContainerProps props = _mapper.Map<ContainerProps>(baseComponent);
        //    return props;
        //}

        //private DatatableContextProps CreateDatatableContext(PropertyMetadataDto metaData, bool isReadOnly = false, bool hideLabel = false)
        //{
        //    ConfigurableComponent baseComponent = CreateBaseComponent("datatableContext", new PropertyMetadataDto()
        //    {
        //        Path = "datatableContext"// consider incrementing to avoid conflicts
        //    }, isReadOnly, hideLabel);
        //    DatatableContextProps props = _mapper.Map<DatatableContextProps>(baseComponent);
        //    return props;
        //}

        private DatatableProps CreateDatatable(List<PropertyMetadataDto> metaData)
        {
            ConfigurableComponent baseComponent = CreateBaseAdvancedComponent("datatable");
            DatatableProps props = _mapper.Map<DatatableProps>(baseComponent);
            props.canAddInline = true;
            props.canEditInline = true;
            props.canDeleteInline = true;
            props.inlineEditMode = "one-by-one";
            props.inlineSaveMode = "manual";

            var columns = new List<DatatableColumnProps>{
                new DatatableColumnProps {
                id = Guid.NewGuid().ToString(),
                caption = "",
                itemType = "item",
                columnType = "crud-operations",
                isVisible = true,
                } 
            };

            foreach (var item in metaData)
            {
                var column = new DatatableColumnProps
                {
                    id = Guid.NewGuid().ToString(),
                    caption = item.Label ?? StringHelper.ToCamelCase(item.Path),
                    columnType = "data",
                    itemType = "item",
                    propertyName = StringHelper.ToCamelCase(item.Path),
                    isVisible = item.IsVisible,
                    description = item.Description ?? string.Empty,
                };

                columns.Add(column);
            }   
            return props;
        }

        private TextTypographyProps CreateTextTypography( PropertyMetadataDto metaData, bool isReadOnly = false, bool hideLabel = false)
        {
            ConfigurableComponent baseComponent = CreateBaseComponent("text", metaData);
            TextTypographyProps props = _mapper.Map<TextTypographyProps>(baseComponent);
            props.content = metaData.Path ?? string.Empty;
            props.textType = "span"; 
            return props;
        }


        private TabsProps CreateChildTableTabs(List<MetadataDto> entities)
        {
            ConfigurableComponent baseComponent = CreateBaseAdvancedComponent("tabs");
            TabsProps props = _mapper.Map<TabsProps>(baseComponent);
            props.tabType = "line";

            var tabPanes = new List<TabPaneProps>();
            var container = CreateBaseAdvancedComponent("container");
            ContainerProps containerProps = _mapper.Map<ContainerProps>(container);
            containerProps.display = "flex";
            containerProps.hidden = false;
            containerProps.direction = "vertical";
            containerProps.justifyContent = "left";
            var pager = CreateBaseAdvancedComponent("datatable.pager");
            var quickSearch = CreateBaseAdvancedComponent("datatable.quickSearch");

            containerProps.components = new List<ConfigurableComponent> { pager, quickSearch };

            foreach (var entity in entities)
            {
                var context = CreateBaseAdvancedComponent("datatableContext");
                DatatableContextProps contextProps = _mapper.Map<DatatableContextProps>(context);
                contextProps.sourceType = "Entity";
                contextProps.defaultPageSize = 10;
                contextProps.sortMode = "standard";
                contextProps.strictSortOrder = "asc";

                contextProps.entityType = entity.TypeAccessor;

                var dataTable = CreateAdvancedComponent("datatable", entity.Properties.Where(x => !x.IsFrameworkRelated).ToList());
                contextProps.components = new List<ConfigurableComponent> { containerProps, dataTable };

                var tabPane = new TabPaneProps
                {
                    id = Guid.NewGuid().ToString(),
                    key = Guid.NewGuid().ToString(),
                    title = entity.TypeAccessor,
                    name = entity.TypeAccessor,
                    editMode = "inherited",
                    selectMode = "editable",
                    components = new List<ConfigurableComponent> { contextProps }
                };
                tabPanes.Add(tabPane);
            }

            props.tabs = tabPanes;

            return props;
        }

        private ColumnProps CreateColumnedInformationBar(List<PropertyMetadataDto> metaData)
        {
            ConfigurableComponent baseComponent = CreateBaseAdvancedComponent("columns");
            ColumnProps props = _mapper.Map<ColumnProps>(baseComponent);
            List<ColumnItemProps> column1 = new List<ColumnItemProps>();
            List<ColumnItemProps> column2 = new List<ColumnItemProps>();

            // Distribute items between columns
            for (int i = 0; i < metaData.Count; i++)
            {
                var item = metaData[i];
                var component = CreateComponent(item.DataType, item, false, false);

                var columnItem = new ColumnItemProps
                {
                    id = Guid.NewGuid().ToString(),
                    components = new List<ConfigurableComponent>
                    {
                        component
                    },
                };

                // Add to column 1 if index is even, column 2 if odd
                if (i % 2 == 0)
                {
                    column1.Add(columnItem);
                }
                else
                {
                    column2.Add(columnItem);
                }
            }

            props.columns = new List<ColumnItemProps>
            {
                new ColumnItemProps
                {
                    id = Guid.NewGuid().ToString(),
                    components = column1.SelectMany(c => c.components).ToList(),
                    flex = 12,
                    offset = 0,
                    push = 0,
                    pull = 0
                },
                new ColumnItemProps
                {
                    id = Guid.NewGuid().ToString(),
                    components = column2.SelectMany(c => c.components).ToList(),
                    flex = 12,
                    offset = 0,
                    push = 0,
                    pull = 0
                }
            };
            props.gutterY = 12;
            props.gutterX = 12;

            return props;
        }

        private KeyInformationBarProps CreateKeyInformationBar(List<PropertyMetadataDto> metaData)
        {                                                                                                                                                                                        
            ConfigurableComponent baseComponent = CreateBaseAdvancedComponent("KeyInformationBar");
            KeyInformationBarProps props = _mapper.Map<KeyInformationBarProps>(baseComponent);
            List<KeyInformationBarItemProps> columns = new List<KeyInformationBarItemProps>();
            
            foreach(var item in metaData)
            {
                var text = CreateComponent("typography", item);
                var component = CreateComponent(item.DataType, item, true, true);
                columns.Add(new KeyInformationBarItemProps
                {
                    id = Guid.NewGuid().ToString(),
                    components = new List<ConfigurableComponent>
                    {
                        text,
                        component
                    },
                });
            }

            props.columns = columns;
            props.orientation = "horizontal";

            return props;
        }
                                                                                                                                                                                 
        public List<ConfigurableComponent> CreateComponentsFromMetadata(List<PropertyMetadataDto> metadata)
        {
            var components = new List<ConfigurableComponent>();
            foreach (var item in metadata)
            {
                if (item.DataType == null)
                    throw new ArgumentException($"DataType is required for property '{item.Path}'");

                components.Add(CreateComponent(item.DataType, item));
            }
            return components;
        }

        private ConfigurableComponent CreateBaseAdvancedComponent (string type)
        {
            ConfigurableComponent component = new ConfigurableComponent
            {
                id = Guid.NewGuid().ToString(),
                hidden = false,
                hideLabel = true,
                editMode = "inherited",
                type = type,
                componentName = type,
                propertyName = type
            };
            return component;
        }

        private ConfigurableComponent CreateBaseComponent(string type, PropertyMetadataDto metadata, bool isReadOnly = false, bool hideLabel = false)
        {
            ConfigurableComponent component = new ConfigurableComponent
            {
                id = Guid.NewGuid().ToString(),
                hidden = !metadata.IsVisible,
                label = metadata.Label,
                description = metadata.Description,
                editMode = metadata.Readonly || isReadOnly ? "readOnly" : "inherited",
                type = type,
                componentName = StringHelper.ToCamelCase(metadata.Path), 
                propertyName = StringHelper.ToCamelCase(metadata.Path),
                hideLabel = hideLabel,                                                                                              
            };
            return component;
        }
    }
}
