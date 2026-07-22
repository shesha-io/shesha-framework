using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.EntityHistory
{
    public interface IEntityHistoryProvider
    {
        Task<List<EntityHistoryItemDto>> GetAuditTrailAsync(string entityId, string? moduleName, string entityType, bool includeEventsOnChildEntities);
    }
}
