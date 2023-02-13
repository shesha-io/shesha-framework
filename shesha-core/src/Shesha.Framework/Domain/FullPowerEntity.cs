using System;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;

namespace Shesha.Domain
{
    /// <summary>
    /// Base class to use for entities that need support for most commonly used entity-level framework features:
    ///  * guid as identifier
    ///  * fully auditable
    ///  * multi-tenancy support
    /// Note: discriminator is not included as it's not used in most cases
    /// </summary>
    public abstract class FullPowerEntity: FullAuditedEntity<Guid>, IMayHaveTenant
    {
        /// <summary>
        /// Tenant ID or null for no tenant
        /// </summary>
        public virtual int? TenantId { get; set; }
    }
}
