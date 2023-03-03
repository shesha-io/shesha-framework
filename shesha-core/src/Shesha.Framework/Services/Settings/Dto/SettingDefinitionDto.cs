using Abp.Application.Services.Dto;
using Shesha.Domain.ConfigurationItems;
using Shesha.Dto.Interfaces;
using System;

namespace Shesha.Services.Settings.Dto
{
    /// <summary>
    /// Setting definition DTO
    /// </summary>
    public class SettingDefinitionDto : EntityDto<Guid>, IConfigurationItemDto
    {
        /// <summary>
        /// Module Id
        /// </summary>
        public Guid? ModuleId { get; set; }

        /// <summary>
        /// Module name
        /// </summary>
        public string Module { get; set; }

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

        public string Name { get; set; }
        public string Label { get; set; }
        public string Description { get; set; }
        public bool Suppress { get; set; }
    }
}
