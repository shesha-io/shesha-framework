using JetBrains.Annotations;
using Shesha.Domain.Attributes;
using Shesha.Domain.Constants;
using System;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Domain
{
    /// <summary>
    /// Form configuration
    /// </summary>
    [Entity(TypeShortAlias = "Shesha.Core.FormConfiguration", FriendlyName = "Form", GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
    [FixedView(ConfigurationItemsViews.Create, SheshaFrameworkModule.ModuleName, "cs-form-create")]
    [FixedView(ConfigurationItemsViews.Rename, SheshaFrameworkModule.ModuleName, "cs-item-rename")]
    [DiscriminatorValue(ItemTypeName)]
    [JoinedProperty("form_configurations", Schema = "frwk")]
    [SnakeCaseNaming]
    public class FormConfiguration : ConfigurationItem
    {
        public const string ItemTypeName = "form";
        
        public override string ItemType => ItemTypeName;

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

        /// <summary>
        /// Template that was used for the form creation
        /// </summary>
        public virtual FormConfiguration? Template { get; set; }

        /// <summary>
        /// Form for getting additional configuration options for template
        /// </summary>
        [CanBeNull]
        public virtual FormIdentifier? ConfigurationForm { get; set; }

        /// <summary>
        /// The fully qualified name of the class implementing the generation behavior for this template through ITemplateGenerator
        /// </summary>
        [MaxLength(200)]
        public virtual string? GenerationLogicTypeName { get; set; }

        /// <summary>
        /// 
        /// </summary>
        [MaxLength(int.MaxValue)]
        public virtual string? GenerationLogicExtensionJson { get; set; }

        /// <summary>
        /// 
        /// </summary>
        [MaxLength(100)]
        public virtual string? PlaceholderIcon { get; set; }
    }
}
