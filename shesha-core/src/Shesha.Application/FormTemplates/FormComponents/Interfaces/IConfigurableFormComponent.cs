using Shesha.FormTemplates.FormComponents.Enums;

namespace Shesha.FormTemplates.FormComponents.Interfaces
{
    public interface IConfigurableFormComponent: IFormComponentContainer, IComponentLabelProps, IComponentVisibilityProps, IComponentBindingProps
    {
        string type { get; set; }
        string? description { get; set; }
        string editMode { get; set; }
        bool jsSetting { get; set; }
    }
}
