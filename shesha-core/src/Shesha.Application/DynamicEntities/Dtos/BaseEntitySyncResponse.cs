using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace Shesha.DynamicEntities.Dtos
{
    /// <summary>
    /// Base entity sync response
    /// </summary>
    public class BaseEntitySyncResponse
    {
        public string Accessor { get; set; }
        [JsonConverter(typeof(StringEnumConverter))]
        public SyncStatus Status { get; set; }
    }
}
