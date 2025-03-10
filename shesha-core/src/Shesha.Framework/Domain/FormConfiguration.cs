using Shesha.Domain.Attributes;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Domain
{
    /// <summary>
    /// Form configuration
    /// </summary>
    [Entity(TypeShortAlias = "Shesha.Core.FormConfiguration")]
    [JoinedProperty("Frwk_FormConfigurations")]
    [DiscriminatorValue(ItemTypeName)]
    public class FormConfiguration : ConfigurationItemBase
    {
        public const string ItemTypeName = "form";

        /// <summary>
        /// Form markup
        /// </summary>
        [StringLength(int.MaxValue)]
        [LazyLoad]
        public virtual string? Markup { get; set; }

        /// <summary>
        /// ModelType
        /// </summary>
        [StringLength(int.MaxValue)]
        public virtual string? ModelType { get; set; }

        public override string ItemType => ItemTypeName;

        /// <summary>
        /// If true, indeicates that the form is a template
        /// </summary>
        public virtual bool IsTemplate { get; set; }

        /// <summary>
        /// Template that was used for the form creation
        /// </summary>
        public virtual FormConfiguration? Template { get; set; }

        public virtual string FullName => Module != null
                ? $"{Module.Name}.{Name}"
                : Name;
    }
}
