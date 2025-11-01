using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Domain
{
    /// <summary>
    /// Tracks when a user downloads a specific file version
    /// </summary>
    [Entity(TypeShortAlias = "Shesha.Framework.StoredFileVersionDownload")]
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
