using System.Collections.Generic;

namespace Shesha.EntityHistory
{
    public interface IEntityHistoryEventCreator
    {
        EntityHistoryEventInfo CreateEvent(EntityChangesInfo change);

        EntityHistoryEventInfo? CreateManyToManyEvent(EntityChangesInfo change);

        EntityHistoryEventInfo? CreateManyToManyRelationEvent(EntityChangesInfo change);

        (IEnumerable<object> addedValues, IEnumerable<object> removedValues) GetListNewAndRemoved(EntityChangesInfo change);
    }
}