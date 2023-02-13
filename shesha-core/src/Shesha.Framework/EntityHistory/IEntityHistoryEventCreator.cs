using EasyNetQ.Events;

namespace Shesha.EntityHistory
{
    public interface IEntityHistoryEventCreator
    {
        EntityHistoryEventInfo CreateEvent(EntityChangesInfo change);
    }
}