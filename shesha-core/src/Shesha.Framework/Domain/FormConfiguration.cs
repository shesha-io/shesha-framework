using Shesha.Domain.Attributes;
using Shesha.Domain.Constants;
using System;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Domain
{
    /// <summary>
    /// Form configuration
    /// </summary>
    [Entity(TypeShortAlias = "Shesha.Core.FormConfiguration", FriendlyName = "Form")]
    [FixedView(ConfigurationItemsViews.Create, SheshaFrameworkModule.ModuleName, "cs-form-create")]
    [FixedView(ConfigurationItemsViews.Rename, SheshaFrameworkModule.ModuleName, "cs-item-rename")]
    [DiscriminatorValue(ItemTypeName)]
    [JoinedProperty("form_configurations", Schema = "frwk")]
    [SnakeCaseNaming]
    public class FormConfiguration : ConfigurationItem
    {
        public const string ItemTypeName = "form";
        
        public override string ItemType => ItemTypeName;

        public virtual string FullName => Module != null
                ? $"{Module.Name}.{Name}"
                : Name;

        /// <summary>
        /// Form markup
        /// </summary>
        [MaxLength(int.MaxValue)]
        [LazyLoad]
        public virtual string? Markup { get; set; }

        /// <summary>
        /// ModelType
        /// </summary>
        [MaxLength(int.MaxValue)]
        public virtual string? ModelType { get; set; }

        /// <summary>
        /// If true, indeicates that the form is a template
        /// </summary>
        [Obsolete("To be removed, discriminator shoul dbe used instead of this property")]
        public virtual bool IsTemplate { get; set; }
    }
}
