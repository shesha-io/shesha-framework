using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.Text;
using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    [Entity(GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
    public class DeviceForceUpdate : FullAuditedEntity<Guid>
    {
        public virtual string Name { get; set; }
        public virtual string Description { get; set; }
        public virtual string AppStoreUrl { get; set; }
        public virtual int? OSType { get; set; }
        public virtual double? VersionNo { get; set; }
    }
}
