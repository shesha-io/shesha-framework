using System;
using System.ComponentModel.DataAnnotations;
using Abp.Domain.Entities;

namespace Shesha.Domain
{
    /// <summary>
    /// Base class to use for entities that represent a many-to-many link between entities and need support for most commonly used entity-level framework features:
    ///  * guid as identifier
    ///  * fully auditable
    ///  * multi-tenancy support
    /// Note: discriminator is not included as it's not used in most cases
    /// </summary>
    public abstract class FullPowerManyToManyLinkEntity : FullPowerChildEntity, IHasEntityLink
    {
        /// <summary>
        /// Entity ID. ID is intentionally bigger because in some cases an owner ID is set to a data table ID string
        /// </summary>
        [StringLength(40)]
        public virtual string EntityId { get; set; }

        /// <summary>
        /// Entity type alias
        /// </summary>
        [StringLength(100)]
        public virtual string EntityType { get; set; }

        /// <summary>
        /// Sets Entity from an entity object
        /// </summary>
        public virtual void SetEntity<TId>(IEntity<TId> entity)
        {
            var config = entity.GetType().GetEntityConfiguration();
            if (string.IsNullOrEmpty(config.TypeShortAlias))
                throw new InvalidOperationException(
                    $"Owner cannot be set to entity '{entity.GetType().FullName}' as a TypeShortAlias has not been defined. Tip: Set the TypeShortAlias through the Entity attribute on the entity in question.");

            OwnerType = config.TypeShortAlias;
            OwnerId = entity.Id.ToString();
        }

        /// <summary>
        /// Set Entity from type alias and ID
        /// </summary>
        public virtual void SetEntity(string ownerType, string ownerId)
        {
            OwnerType = ownerType;
            OwnerId = ownerId;
        }
    }
}
