using Abp.Domain.Entities;

namespace Shesha.Domain
{
    /// <summary>
    /// Interface to be implemented by Entities which typically
    /// are child entities of an aggregate and may have different types of 
    /// 'owners/parent'.
    /// For supporting more than one owner per entity, this interface can be implemented on a many-to-many link table, please see EntityVisibility.cs for an example
    /// </summary>
    public interface IHasOwningEntityLink
    {
        /// <summary>
        /// Owning entity ID
        /// </summary>
        string OwnerId { get; }

        /// <summary>
        /// Owning entity type alias
        /// </summary>
        string OwnerType { get; }

        /*/// <summary>
        /// Gets the owning entity object
        /// </summary>
        IEntity<TId> GetOwner<TId>();
        */

        /// <summary>
        /// Sets the owners of the entity.
        /// </summary>
        /// <param name="owner">The entity which owns the entity implementing this interface.</param>
        void SetOwner<TId>(IEntity<TId> owner);

        /// <summary>
        /// Sets the owners of the entity.
        /// </summary>
        /// <param name="ownerId">Id of the entity which owns this entity implementing the interface.</param>
        /// <param name="ownerType">The 'TypeShortAlias' of the entity which owns this entity implementing the interface.</param>
        void SetOwner(string ownerType, string ownerId);
    }
}
