using Abp.Domain.Entities;

namespace Shesha.Domain
{
    /// <summary>
    /// Interface to be implemented by Entities that have a link to other entity.
    /// For allowing multiple links, please add this interface to a many-to-many link table such as EntityVisibility
    /// </summary>
    public interface IHasEntityLink
    {
        /// <summary>
        /// ID of Entity (entity ID or data table ID)
        /// </summary>
        string EntityId { get; }

        /// <summary>
        /// Entity type alias
        /// </summary>
        string EntityType { get; }

        /// <summary>
        /// Sets the owners of the entity.
        /// </summary>
        /// <param name="entity">The entity which can be used as a Entity for the entity implementing this interface.</param>
        void SetEntity<TId>(IEntity<TId> entity);

        /// <summary>
        /// Sets the Entity of the entity.
        /// </summary>
        /// <param name="entityId">Id of the entity which can be used as a Entity for the entity implementing this interface.</param>
        /// <param name="entityType">The 'TypeShortAlias' of the entity which can be used as a Entity for the entity implementing this interface.</param>
        void SetEntity(string entityType, string entityId);
    }
}
