using Abp.Application.Services.Dto;
using System;

namespace Shesha.Web.FormsDesigner.Dtos
{
    /// <summary>
    /// Configurable Component DTO
    /// </summary>
    public class ConfigurableComponentDto : EntityDto<Guid>
    {
        /// <summary>
        /// Form name
        /// </summary>
        public required string Name { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Settings in JSON format
        /// </summary>
        public string? Settings { get; set; }
    }
}
