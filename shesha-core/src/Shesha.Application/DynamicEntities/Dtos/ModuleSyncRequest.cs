using System.Collections.Generic;

namespace Shesha.DynamicEntities.Dtos
{
    /// <summary>
    /// Modules sync request
    /// </summary>
    public class ModuleSyncRequest
    {
        public string Accessor { get; set; }
        public List<EntitySyncRequest> Entities { get; set; } = new List<EntitySyncRequest>();
    }
}
