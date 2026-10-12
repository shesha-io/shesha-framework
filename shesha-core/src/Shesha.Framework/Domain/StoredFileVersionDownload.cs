using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Framework.StoredFileVersionDownload", CrudActions = CrudActions.None, IsConfigurable = false)]    
    public class StoredFileVersionDownload : FullAuditedEntity<Guid>
    {
        public virtual StoredFileVersion FileVersion { get; set; }
    }
}
