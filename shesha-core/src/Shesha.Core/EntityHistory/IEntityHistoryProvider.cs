using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.EntityHistory
{
    public interface IEntityHistoryProvider
    {
        List<EntityHistoryItemDto> GetAuditTrail(string entityId, string entityTypeFullName);
    }
}
