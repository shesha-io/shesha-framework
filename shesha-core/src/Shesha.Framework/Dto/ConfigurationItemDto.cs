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
        /// Origin id
        /// </summary>
        public Guid? OriginId { get; set; }

        /// <summary>
        /// Module name
        /// </summary>
        public string? Module { get; set; }

        /// <summary>
        /// Version number
        /// </summary>
        public int VersionNo { get; set; }

        /// <summary>
        /// If true, indicates that this is a last version of the form
        /// </summary>
        public bool IsLastVersion { get; set; }

        /// <summary>
        /// Version status
        /// </summary>
        public ConfigurationItemVersionStatus VersionStatus { get; set; }

        public string Name { get; set; } = string.Empty;
        public string? Label { get; set; }
        public string? Description { get; set; }
        public bool Suppress { get; set; }
    }
}