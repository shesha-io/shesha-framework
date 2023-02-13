using System;
using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Dto.Interfaces;

namespace Shesha.Services.ReferenceLists.Dto
{
    /// <summary>
    /// Dto of the <see cref="ReferenceList"/>
    /// </summary>
    public class ReferenceListDto: EntityDto<Guid>, IConfigurationItemDto
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
        public bool HardLinkToApplication { get; set; }
        public string Namespace { get; set; }
        public int? NoSelectionValue { get; set; }
        public bool Suppress { get; set; }
    }
}
