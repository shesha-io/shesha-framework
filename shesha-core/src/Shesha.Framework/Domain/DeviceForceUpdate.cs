using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    [Discriminator]
    [SnakeCaseNaming]
    [Table("device_force_updates", Schema = "frwk")]
    [Entity(GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
    public class DeviceForceUpdate : FullAuditedEntity<Guid>
    {
        [MaxLength(300)]
        public virtual string Name { get; set; }
        [MaxLength(1000)]
        public virtual string? Description { get; set; }
        [MaxLength(255)]
        public virtual string? AppStoreUrl { get; set; }
        public virtual int? OSType { get; set; }
        public virtual double? VersionNo { get; set; }
    }
}
