using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    /// <summary>
    /// Version of the <see cref="StoredFile"/>
    /// </summary>
    [SnakeCaseNaming]
    [Table("stored_file_versions", Schema = "frwk")]
    [Entity(TypeShortAlias = "Shesha.Framework.StoredFileVersion", GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
    public class StoredFileVersion : FullAuditedEntity<Guid>, IMayHaveTenant
    {

        /// <summary>
        /// Stored file
        /// </summary>
        [Required]
        public virtual StoredFile File { get; set; }

        /// <summary>
        /// Version number
        /// </summary>
        public virtual int VersionNo { get; set; }

        /// <summary>
        /// File size
        /// </summary>
        public virtual Int64 FileSize { get; set; }

        /// <summary>
        /// File name
        /// </summary>
        public virtual string FileName { get; set; }

        /// <summary>
        /// File type (extension)
        /// </summary>
        [MaxLength(50)]
        public virtual string FileType { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public virtual string? Description { get; set; }

        /// <summary>
        /// Indicated is version signed or not
        /// </summary>
        public virtual bool IsSigned { get; set; }

        /// <summary>
        /// Tenant Id
        /// </summary>
        public virtual int? TenantId { get; set; }

        /// <summary>
        /// Is true for last version of the file
        /// Note: updated by triggers in sql server side
        /// </summary>
        public virtual bool IsLast { get; set; }
    }
}
