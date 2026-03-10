using Abp.Application.Services.Dto;
using Shesha.Domain;
using Shesha.Domain.Enums;
using System;

namespace Shesha.ConfigurationStudio.Dtos
{
    /// <summary>
    /// DTO of the <see cref="ConfigurationItemRevision"/>
    /// </summary>
    public class ConfigurationItemRevisionDto: EntityDto<Guid>
    {
        /// <summary>
        /// Module name
        /// </summary>
        public string ModuleName { get; set; }

        /// <summary>
        /// If true, indicates that revision is editable 
        /// </summary>
        public bool IsEditable { get; set; }        

        /// <summary>
        /// Version number
        /// </summary>
        public int VersionNo { get; set; }

        /// <summary>
        /// User friendly alias for the version so that users may be more easily recognized the version.
        /// </summary>
        public string? VersionName { get; set; }

        /// <summary>
        /// Additional supporting comments
        /// </summary>
        public string? Comments { get; set; }

        /// <summary>
        /// Hash of the configuration JSON.Allows for easy comparison and search for versions with the same config.
        /// </summary>
        public string ConfigHash { get; set; } = string.Empty;

        /// <summary>
        /// Indicates if the configuration JSON is compressed.
        /// </summary>
        public bool IsCompressed { get; set; }
        
        /// <summary>
        /// Creation date and time
        /// </summary>
        public DateTime CreationTime { get; set; }

        /// <summary>
        /// Creator user id
        /// </summary>
        public long? CreatorUserId { get; set; }

        /// <summary>
        /// Creator user name
        /// </summary>
        public string CreatorUserName { get; set; }

        /// <summary>
        /// Creation method (manual/manual import/migration import)
        /// </summary>
        public ConfigurationItemRevisionCreationMethod CreationMethod { get; set; }

        /// <summary>
        /// Version number of the DLL. Applicable when <see cref="CreationMethod"/> is <see cref="ConfigurationItemRevisionCreationMethod.MigrationImport"/>
        /// </summary>
        public string? DllVersionNo { get; set; }
    }
}
