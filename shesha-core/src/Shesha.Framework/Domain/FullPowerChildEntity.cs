using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Enums;

namespace Shesha.Domain
{
    /// <summary>
    /// Base class to use for entities that need support for setting Owner entity as well as most commonly used entity-level framework features:
    ///  * guid as identifier
    ///  * fully auditable
    ///  * multi-tenancy support
    /// Note: discriminator is not included as it's not used in most cases
    /// </summary>
    public abstract class FullPowerChildEntity: FullPowerEntity, IHasOwningEntityLink
    {
        /// <summary>
        /// Owning entity ID. ID is intentionally bigger because in some cases an owner ID is set to a data table ID string
        /// </summary>
        [Column("Frwk_OwnerId"), StringLength(255)]
        public virtual string OwnerId { get; set; }

        /// <summary>
        /// Owning entity type alias
        /// </summary>
        [Column("Frwk_OwnerType"), StringLength(100)]
        public virtual string OwnerType { get; set; }

        /// <summary>
        /// Sets owner with an entity object
        /// </summary>
        public virtual void SetOwner<TId>(IEntity<TId> entity)
        {
            var config = entity.GetType().GetEntityConfiguration();
            if (string.IsNullOrEmpty(config.TypeShortAlias))
                throw new InvalidOperationException(
                    $"Owner cannot be set to entity '{entity.GetType().FullName}' as a TypeShortAlias has not been defined. Tip: Set the TypeShortAlias through the Entity attribute on the entity in question.");

            OwnerType = config.TypeShortAlias;
            OwnerId = entity.Id.ToString();
        }

        /// <summary>
        /// Set owner with type alias and ID
        /// </summary>
        public virtual void SetOwner(string ownerType, string ownerId)
        {
            OwnerType = ownerType;
            OwnerId = ownerId;
        }
    }
}
