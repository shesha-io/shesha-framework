using Abp.Application.Services.Dto;
using System;

namespace Shesha.Web.FormsDesigner.Dtos
{
    /// <summary>
    /// Update Configurable Component DTO
    /// </summary>
    public class UpdateConfigurableComponentDto : EntityDto<Guid>
    {
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
    }
}
