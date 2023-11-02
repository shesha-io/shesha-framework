using Abp.Domain.Entities;
using Abp.Events.Bus;
using System;
using System.Collections.Generic;

namespace Shesha.DynamicEntities
{
    /// <summary>
    /// This type of event can be used to notify just after reordering of a list of Entities.
    /// </summary>
    [Serializable]
    public class EntityReorderedEventData<TEntity, TId>: EventData where TEntity: IEntity<TId>
    {
        public Type EntityType { get; private set; }
        public List<TId> Ids { get; private set; }

        public EntityReorderedEventData(List<TId> ids)
        {
            EntityType = typeof(TEntity);
            Ids = ids;
        }
    }
}
