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
        public string Name { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Settings in JSON format
        /// </summary>
        public string Settings { get; set; }

        /// <summary>
        /// Cache MD5, is used for client-side caching
        /// </summary>
        public string CacheMd5 { get; set; }
    }
}
