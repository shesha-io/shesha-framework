using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    /// <summary>
    /// Tracks when a user downloads a specific file version
    /// </summary>
    [SnakeCaseNaming]
    [Table("stored_file_version_downloads", Schema = "frwk")]
    [Entity(TypeShortAlias = "Shesha.Framework.StoredFileVersionDownload", CrudActions = CrudActions.None, IsConfigurable = false)]
    public class StoredFileVersionDownload : FullAuditedEntity<Guid>, IMayHaveTenant
    {
        /// <summary>Tenant Id</summary>
        public virtual int? TenantId { get; set; }
        /// <summary>
        /// The file version that was downloaded
        /// </summary>
        [Required]
        public virtual StoredFileVersion FileVersion { get; set; }
    }
}
