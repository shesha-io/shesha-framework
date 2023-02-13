using Abp.Application.Services.Dto;
using System;

namespace Shesha.Web.FormsDesigner.Dtos
{
    /// <summary>
    /// Create configurable component DTO
    /// </summary>
    public class CreateConfigurableComponentDto : EntityDto<Guid>
    {
        /// <summary>
        /// Module id
        /// </summary>
        public Guid? ModuleId { get; set; }

        /// <summary>
        /// Form name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Label
        /// </summary>
        public string Label { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Markup in JSON format
        /// </summary>
        public virtual string Markup { get; set; }

        /// <summary>
        /// Type of the form model
        /// </summary>
        public string ModelType { get; set; }

        /// <summary>
        /// Type of form (index, detail etc)
        /// </summary>
        public string Type { get; set; }

        /// <summary>
        /// Template that is used for the form creation
        /// </summary>
        public Guid? TemplateId { get; set; }

        /// <summary>
        /// If true, indeicates that the form is a template
        /// </summary>
        public bool IsTemplate { get; set; }
    }
}
