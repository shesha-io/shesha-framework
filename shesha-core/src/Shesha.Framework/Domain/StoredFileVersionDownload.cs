using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Framework.StoredFileVersionDownload")]
    public class StoredFileVersionDownload : FullAuditedEntity<Guid>
    {
        public virtual StoredFileVersion FileVersion { get; set; }
    }
}
