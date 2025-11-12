using Abp.Application.Services.Dto;
using System;

namespace Shesha.Web.FormsDesigner.Dtos
{
    /// <summary>
    /// Form configuration DTO
    /// </summary>
    public class UpdateFormConfigurationDto : EntityDto<Guid>
    {
        /// <summary>
        /// Label
        /// </summary>
        public required string Name { get; set; }
        /// <summary>
        /// Label
        /// </summary>
        public string? Label { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Markup in JSON format
        /// </summary>
        public virtual string? Markup { get; set; }

        /// <summary>
        /// Type of the form model
        /// </summary>
        public string? ModelType { get; set; }

        /// <summary>
        /// Form module for getting additional configuration options for template
        /// </summary>
        public string? ConfigurationFormModule { get; set; }

        /// <summary>
        /// Form name for getting additional configuration options for template
        /// </summary>
        public string? ConfigurationFormName { get; set; }

        /// <summary>
        /// The fully qualified name of the class implementing the generation behavior for this template through ITemplateGenerator
        /// </summary>
        public string? GenerationLogicTypeName { get; set; }

        /// <summary>
        /// JSON configuration for extending the generation logic behavior
        /// </summary>
        public string? GenerationLogicExtensionJson { get; set; }

        /// <summary>
        /// Icon to display as a placeholder for the template in the designer
        /// </summary>
        public string? PlaceholderIcon { get; set; }
    }
}
