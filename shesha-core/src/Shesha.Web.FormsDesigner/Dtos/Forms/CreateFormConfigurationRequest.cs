using Shesha.Dto;
using System;

namespace Shesha.Web.FormsDesigner.Dtos.Forms
{
    /// <summary>
    /// Create form configuration request
    /// </summary>
    public class CreateFormConfigurationRequest : CreateConfigurationItemRequest
    {
        /// <summary>
        /// Markup in JSON format
        /// </summary>
        public string? Markup { get; set; }
        
        /// <summary>
        /// Generation logic extension JSON
        /// </summary>
        public string? GenerationLogicExtensionJson { get; set; }
        
        /// <summary>
        /// Type of the form model
        /// </summary>
        public string? ModelType { get; set; }
        
        /// <summary>
        /// Template that is used for the form creation
        /// </summary>
        public Guid? TemplateId { get; set; }
    }
}