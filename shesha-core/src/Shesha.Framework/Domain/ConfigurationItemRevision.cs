using Abp.Domain.Entities.Auditing;
using Shesha.Authorization.Users;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    /// <summary>
    /// Revision of <see cref="ConfigurationItem"/>
    /// </summary>
    [SnakeCaseNaming]
    [Table("configuration_item_revisions", Schema = "frwk")]
    [Entity(GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
    public class ConfigurationItemRevision : FullAuditedEntity<Guid, User>
    {
        /// <summary>
        /// Configuration Item this revision belongs to
        /// </summary>
        public virtual ConfigurationItem ConfigurationItem { get; set; } = default!;

        /// <summary>
        /// Version number
        /// </summary>
        [Display(Name = "Version no")]
        public virtual int VersionNo { get; set; }

        /// <summary>
        /// User friendly alias for the version so that users may be more easily recognized the version.
        /// </summary>
        public virtual string? VersionName { get; set; }

        /// <summary>
        /// Additional supporting comments
        /// </summary>
        public virtual string? Comments { get; set; }

        /// <summary>
        /// Hash of the configuration JSON. Allows for easy comparison and search for versions with the same config.
        /// </summary>
        public virtual string ConfigHash { get; set; } = string.Empty;

        /// <summary>
        /// Indicates if the configuration JSON is compressed.
        /// </summary>
        public virtual bool IsCompressed { get; set; }

        /// <summary>
        /// Import session that created this configuration item
        /// </summary>
        public virtual ImportResult? CreatedByImport { get; set; }

        /// <summary>
        /// Parent revision
        /// </summary>
        public virtual ConfigurationItemRevision? ParentRevision { get; set; }

        /// <summary>
        /// Configuration in JSON format
        /// </summary>
        [StringLength(int.MaxValue)]
        public virtual string ConfigurationJson { get; set; } = string.Empty;

        /// <summary>
        /// Creation method (manual/manual import/migration import)
        /// </summary>
        public virtual ConfigurationItemRevisionCreationMethod CreationMethod { get; set; } = ConfigurationItemRevisionCreationMethod.Manual;
    }
}
