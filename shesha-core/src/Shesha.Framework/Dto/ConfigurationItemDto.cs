using Abp.Application.Services.Dto;
using Shesha.Dto.Interfaces;
using System;

namespace Shesha.Dto
{
    /// <summary>
    /// Base class of ConfigurationItem DTO
    /// </summary>
    public class ConfigurationItemDto : EntityDto<Guid>, IConfigurationItemDto
    {
        /// <summary>
        /// Module Id
        /// </summary>
        public Guid? ModuleId { get; set; }

        /// <summary>
        /// Module name
        /// </summary>
        public string? Module { get; set; }
        /// <summary>
        /// Front-end application id
        /// </summary>
        public Guid? ApplicationId { get; set; }

        /// <summary>
        /// Front-end application
        /// </summary>
        public string? Application { get; set; }

        public string Name { get; set; } = string.Empty;
        public string? Label { get; set; }
        public string? Description { get; set; }
        public bool Suppress { get; set; }
    }
}