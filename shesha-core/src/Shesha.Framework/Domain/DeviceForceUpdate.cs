using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
using System;

namespace Shesha.Domain
{
    [Discriminator]
    [Entity(GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
    public class DeviceForceUpdate : FullAuditedEntity<Guid>
    {
        public virtual string? Name { get; set; }
        public virtual string? Description { get; set; }
        public virtual string? AppStoreUrl { get; set; }
        public virtual int? OSType { get; set; }
        public virtual double? VersionNo { get; set; }
    }
}
