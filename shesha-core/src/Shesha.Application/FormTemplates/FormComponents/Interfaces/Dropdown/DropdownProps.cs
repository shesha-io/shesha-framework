using Shesha.FormTemplates.FormComponents.Enums;
namespace Shesha.FormTemplates.FormComponents.Interfaces.Dropdown
{
    public class DropdownProps : ConfigurableComponent
    {
        public string dataSourceType { get; set; }
        public ReferenceListIdentifier referenceListId { get; set; }
    }
}
