using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using System.Collections.Generic;

namespace Shesha.DynamicEntities.Dtos
{
    /// <summary>
    /// Modules sync response
    /// </summary>
    public class ModuleSyncResponse
    {
        public string Accessor { get; set; }
        [JsonConverter(typeof(StringEnumConverter))]
        public SyncStatus Status { get; set; }
        public List<BaseEntitySyncResponse> Entities { get; set; } = new List<BaseEntitySyncResponse>();
    }
}
