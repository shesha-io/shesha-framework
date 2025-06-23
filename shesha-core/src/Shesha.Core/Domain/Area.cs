using System;
using System.ComponentModel.DataAnnotations;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;

namespace Shesha.Domain
{
    /// <summary>
    /// This class is supposed to be replaced by the Site entity
    /// </summary>
    [Obsolete]
    [Entity(TypeShortAlias = "Shesha.Core.Area", GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
    [Discriminator]
    public class Area : FullAuditedEntity<Guid>, IMayHaveTenant
    {
        [Required(AllowEmptyStrings = false), MaxLength(100)]
        public virtual string Name { get; set; }

        [Required(AllowEmptyStrings = false), MaxLength(10)]
        public virtual string ShortName { get; set; }

        [MaxLength(200)]
        public virtual string Comments { get; set; }

        public virtual Area? ParentArea { get; set; }
        
        public virtual int? TenantId { get; set; }

        public virtual RefListAreaType? AreaType { get; set; }

        public virtual RefListAreaSubType? AreaSubType { get; set; }

        public virtual decimal? AreaSize { get; set; }

        public virtual decimal? Latitude { get; set; }

        public virtual decimal? Longitude { get; set; }
    }
}
