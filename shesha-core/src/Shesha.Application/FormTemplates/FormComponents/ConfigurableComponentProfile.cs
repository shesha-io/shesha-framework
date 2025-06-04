using AutoMapper;
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

namespace Shesha.FormTemplates.FormComponents
{
    public class ConfigurableComponentProfile: Profile
    {
        public ConfigurableComponentProfile()
        {
            CreateMap<ConfigurableComponent, DropdownProps>();
            CreateMap<ConfigurableComponent, TextFieldProps>();
            CreateMap<ConfigurableComponent, KeyInformationBarProps>();
            CreateMap<ConfigurableComponent, TextTypographyProps>();
            CreateMap<ConfigurableComponent, ColumnProps>();
            CreateMap<ConfigurableComponent, NumberFieldProps>();
            CreateMap<ConfigurableComponent, CheckboxProps>();
            CreateMap<ConfigurableComponent, TextAreaProps>();
            CreateMap<ConfigurableComponent, TimePickerProps>();
            CreateMap<ConfigurableComponent, FileUploadProps>();
            CreateMap<ConfigurableComponent, TabsProps>();
            CreateMap<ConfigurableComponent, PagerProps>();
            CreateMap<ConfigurableComponent, QuickSearchProps>();
            CreateMap<ConfigurableComponent, ContainerProps>();
            CreateMap<ConfigurableComponent, DatatableContextProps>();
            CreateMap<ConfigurableComponent, DatatableProps>();
        }
    }
}
