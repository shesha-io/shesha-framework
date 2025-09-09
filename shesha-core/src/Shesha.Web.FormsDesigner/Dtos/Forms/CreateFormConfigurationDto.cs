using Abp.Application.Services.Dto;
using System;

namespace Shesha.Web.FormsDesigner.Dtos
{
    /// <summary>
    /// Form configuration DTO
    /// </summary>
    public class CreateFormConfigurationDto : EntityDto<Guid>
    {
        /// <summary>
        /// Module id
        /// </summary>
        public Guid ModuleId { get; set; }

        /// <summary>
        /// Form name
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
        public string? Markup { get; set; }

        /// <summary>
        /// Type of the form model
        /// </summary>
        public string? ModelType { get; set; }

        /// <summary>
        /// Type of form (index, detail etc)
        /// </summary>
        public string? Type { get; set; }

        /// <summary>
        /// Template that is used for the form creation
        /// </summary>
        public Guid? TemplateId { get; set; }

        /// <summary>
        /// If true, indeicates that the form is a template
        /// </summary>
        public bool IsTemplate { get; set; }

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
        /// 
        /// </summary>
        public string? GenerationLogicExtensionJson { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public string? PlaceholderIcon { get; set; }
    }
}
