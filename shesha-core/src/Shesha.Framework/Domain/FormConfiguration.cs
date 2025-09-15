using Shesha.Domain.Attributes;
using Shesha.Domain.Constants;

namespace Shesha.Domain
{
    [SnakeCaseNaming]
    public abstract class FormConfigurationBase : ConfigurationItem<FormConfigurationRevision> 
    { 
    }

    /// <summary>
    /// Form configuration
    /// </summary>
    [Entity(TypeShortAlias = "Shesha.Core.FormConfiguration", FriendlyName = "Form")]
    [FixedView(ConfigurationItemsViews.Create, SheshaFrameworkModule.ModuleName, "cs-form-create")]
    [FixedView(ConfigurationItemsViews.Rename, SheshaFrameworkModule.ModuleName, "cs-item-rename")]
    [DiscriminatorValue(ItemTypeName)]
    [SnakeCaseNaming]
    public class FormConfiguration : FormConfigurationBase
    {
        public const string ItemTypeName = "form";
        
        public override string ItemType => ItemTypeName;

        public virtual string FullName => Module != null
                ? $"{Module.Name}.{Name}"
                : Name;
    }
}
