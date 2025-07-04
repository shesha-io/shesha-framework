using Abp.Application.Services.Dto;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Dto.Interfaces;
using System;
using System.Collections.Generic;

namespace Shesha.Web.FormsDesigner.Dtos
{
    /// <summary>
    /// Form configuration DTO
    /// </summary>
    public class FormConfigurationDto: EntityDto<Guid>, IConfigurationItemDto
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
        /// Form name
        /// </summary>
        public required string Name { get; set; }

        /// <summary>
        /// Label
        /// </summary>
        public string? Label { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Markup in JSON format
        /// </summary>
        public string? Markup { get; set; }

        /// <summary>
        /// Type of the form model
        /// </summary>
        public string? ModelType { get; set; }

        /// <summary>
        /// Version number
        /// </summary>
        public int VersionNo { get; set; }

        /// <summary>
        /// If true, indicates that this is a last version of the form
        /// </summary>
        public bool IsLastVersion { get; set; }

        public bool Suppress { get; set; }

        public RefListPermissionedAccess? Access { get; set; }

        public List<string>? Permissions { get; set; }

        /// <summary>
        /// Cache MD5, is used for client-side caching
        /// </summary>
        public string? CacheMd5 { get; set; }
    }
}
