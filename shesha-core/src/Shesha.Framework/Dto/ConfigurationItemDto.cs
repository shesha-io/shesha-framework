using Abp.Application.Services.Dto;
using Shesha.Domain;
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

        public string Name { get; set; } = string.Empty;
        public string? Label { get; set; }
        public string? Description { get; set; }
        public bool Suppress { get; set; }
    }
}