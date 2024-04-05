using System.Collections.Generic;

namespace Shesha.DynamicEntities.Dtos
{
    /// <summary>
    /// Sync client configurations response
    /// </summary>
    public class SyncAllResponse
    {
        public List<ModuleSyncResponse> Modules { get; set; } = new List<ModuleSyncResponse>();
    }
}
