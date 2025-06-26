using Abp.EntityHistory;
using System.Collections.Generic;
using System.Reflection;

namespace Shesha.NHibernate.EntityHistory
{
    public interface IEntityHistoryHelper
    {
        /// <summary>
        /// List of entity changes
        /// </summary>
        List<EntityChange> EntityChanges { get; set; }


        /// <summary>
        /// Add changes of Entity to the EntityChanges list
        /// </summary>
        /// <param name="entity">Entity</param>
        /// <returns>EntityChange object</returns>
        void AddEntityChange(object entity);

        /// <summary>
        /// Add a collection changing event for an entity property
        /// </summary>
        /// <param name="entity">Entity</param>
        /// <param name="propInfo">Changed collection property</param>
        /// <param name="oldValue">Old collection</param>
        /// <param name="newValue">New collection</param>
        bool AddAuditedAsManyToMany(object entity, PropertyInfo propInfo, object? oldValue, object? newValue);

        /// <summary>
        /// Create EntityChange item for the Entity
        /// </summary>
        /// <param name="entity">Entity</param>
        /// <returns>EntityChange object</returns>
        EntityChange? CreateEntityChange(object entity);

        /// <summary>
        /// Create entity changes set
        /// </summary>
        /// <returns></returns>
        EntityChangeSet? CreateEntityChangeSet();

        //Task SaveAsync(DbContext context, EntityChangeSet changeSet);

        void Save(EntityChangeSet changeSet);

        void SaveAndClear();

    }
}