using Shesha.ConfigurationItems.Models;
using System;

namespace Shesha.Web.FormsDesigner.Models
{
    /// <summary>
    /// Create form input
    /// </summary>
    public class CreateFormInput : CreateItemInput
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