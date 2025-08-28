using JetBrains.Annotations;
using Shesha.Domain.Attributes;
using System;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Domain
{
    [JoinedProperty("form_configuration_revisions", Schema = "frwk")]
    [SnakeCaseNaming]
    [DiscriminatorValue(FormConfiguration.ItemTypeName)]
    public class FormConfigurationRevision : ConfigurationItemRevision
    {
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
        /// If true, indicates that the form is a template
        /// </summary>
        [Obsolete("To be removed, discriminator shoul dbe used instead of this property")]
        public virtual bool IsTemplate { get; set; }

        /// <summary>
        /// Template that was used for the form creation
        /// </summary>
        public virtual FormConfigurationRevision? Template { get; set; }

        /// <summary>
        /// Form for getting additional configuration options for template
        /// </summary>
        [CanBeNull]
        public virtual FormIdentifier? ConfigurationForm { get; set; }

        /// <summary>
        /// The fully qualified name of the class implementing the generation behavior for this template through ITemplateGenerator
        /// </summary>
        public virtual string? GenerationLogicTypeName { get; set; }

        /// <summary>
        /// 
        /// </summary>
        public virtual string? GenerationLogicExtensionJson { get; set; }

        /// <summary>
        /// 
        /// </summary>
        public virtual string? PlaceholderIcon { get; set; }
    }
}
