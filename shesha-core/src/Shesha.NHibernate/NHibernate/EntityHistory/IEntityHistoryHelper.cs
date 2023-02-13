using System.Collections.Generic;
using Abp.EntityHistory;
using Shesha.Domain;

namespace Shesha.NHibernate.EntityHistory
{
    public interface IEntityHistoryHelper
    {
        /// <summary>
        /// Set of entity changes
        /// </summary>
        EntityChangeSet EntityChangeSet { get; set; }

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
        /// Create EntityChange item for the Entity
        /// </summary>
        /// <param name="entity">Entity</param>
        /// <returns>EntityChange object</returns>
        EntityChange CreateEntityChange(object entity);

        /// <summary>
        /// Create entity changes set
        /// </summary>
        /// <returns></returns>
        EntityChangeSet CreateEntityChangeSet();

        //Task SaveAsync(DbContext context, EntityChangeSet changeSet);

        void Save(EntityChangeSet changeSet);

        void SaveAndClear();

    }
}